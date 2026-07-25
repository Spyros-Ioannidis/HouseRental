<?php

namespace App\Services\House\Images;

use App\Models\House;
use App\Models\HouseImage;
use App\Models\PendingHouseImage;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class HouseImageManager
{
    private const MAX_IMAGES_PER_HOUSE = 20;
    private const DRAFT_SESSION_KEY = 'house_create';

    public function __construct(private ImageCompressionService $compression)
    {
    }

    public function startOrResumeDraft(Request $request): array
    {
        $this->cleanupExpiredDraftImages();

        $draft = $request->session()->get(self::DRAFT_SESSION_KEY . '.draft_token');
        $ownsDraft = is_string($draft) && $this->sessionOwnsDraft($request, $draft);
        $startedNewDraft = false;

        if (! Str::isUuid($draft) || ! $ownsDraft || $this->draftExpired($draft, $request)) {
            if (Str::isUuid($draft) && $ownsDraft) {
                $this->deleteDraftImages($draft, $request);
                Cache::forget($this->draftCacheKey($draft, $request));
            }

            $draft = (string) Str::uuid();
            $startedNewDraft = true;
        }

        $expiresAt = now()->addHour();
        $sessionId = $startedNewDraft
            ? (string) Str::uuid()
            : (string) $request->session()->get(self::DRAFT_SESSION_KEY . '.session_id');

        $request->session()->put(self::DRAFT_SESSION_KEY, [
            'draft_token' => $draft,
            'expires_at' => $expiresAt->toIso8601String(),
            'user_id' => $request->user()?->id,
            'session_id' => $sessionId,
        ]);

        Cache::put($this->draftCacheKey($draft, $request), $expiresAt, $expiresAt);
        $this->extendDraft($draft, $expiresAt, $request);

        return [
            'token' => $draft,
            'expires_at' => $expiresAt,
            'images' => $this->draftImagesPayload($draft, $request),
        ];
    }

    public function store(Request $request, $house = null)
    {
        $target = $this->imageTarget($request, $house);
        $file = $request->file('file');

        return Cache::lock($target['lock'], 10)->block(5, function () use ($file, $target) {
            abort_if(
                $this->existingImages($target)->count() >= self::MAX_IMAGES_PER_HOUSE,
                422,
                sprintf('This house can have up to %d images.', self::MAX_IMAGES_PER_HOUSE)
            );

            $storedImage = $this->compression->store($file, $target['folder']);

            return DB::transaction(function () use ($file, $storedImage, $target) {
                return $target['model']::create($this->createAttributes($target, $file, $storedImage));
            });
        });
    }

    public function reorder(Request $request, $house, array $ids): void
    {
        $target = $this->imageTarget($request, $house);
        $ids = array_values(array_unique($ids));

        $matchingImageCount = $this->scopedImageQuery($target)
            ->whereIn('id', $ids)
            ->count();

        abort_if($matchingImageCount !== count($ids), 422, $target['invalid_order_message']);

        DB::transaction(function () use ($ids, $target) {
            foreach ($ids as $index => $id) {
                $this->scopedImageQuery($target)
                    ->where('id', $id)
                    ->update(['order' => $index]);
            }
        });
    }

    public function destroy(Request $request, $house, $imageId): void
    {
        $target = $this->imageTarget($request, $house);
        $image = $this->resolveImage($target, $imageId);

        $this->deleteStoredImages(collect([$image]));
        $image->delete();
    }

    public function destroyBatch(Request $request, $house, array $ids): void
    {
        if (count($ids) === 0) {
            return;
        }

        $target = $this->imageTarget($request, $house);
        $images = $this->scopedImageQuery($target)
            ->whereIn('id', $ids)
            ->get();

        abort_if($images->count() !== count($ids), 422, $target['invalid_images_message']);

        $this->deleteStoredImages($images);

        $this->scopedImageQuery($target)
            ->whereIn('id', $ids)
            ->delete();
    }

    public function cancelDraft(Request $request, string $draft): void
    {
        $this->assertDraftOwnedByRequest($draft, $request);

        $this->deleteDraftImages($draft, $request);
        $this->forgetDraft($request, $draft);
    }

    public function forgetDraft(Request $request, string $draft): void
    {
        Cache::forget($this->draftCacheKey($draft, $request));

        if ($request->session()->get(self::DRAFT_SESSION_KEY . '.draft_token') === $draft) {
            $request->session()->forget(self::DRAFT_SESSION_KEY);
        }
    }

    public function cleanupExpiredDraftImages(): void
    {
        PendingHouseImage::where('expires_at', '<=', now())
            ->select(['id', 'path', 'thumbnail_path'])
            ->chunkById(100, function ($images) {
                $this->deleteStoredImages($images);

                PendingHouseImage::whereIn('id', $images->pluck('id'))->delete();
            });
    }

    public function deleteDraftImages(string $draft, ?Request $request = null): void
    {
        if (! Str::isUuid($draft)) {
            return;
        }

        $this->pendingDraftQuery($draft, $request)
            ->select(['id', 'path', 'thumbnail_path'])
            ->chunkById(100, function ($images) {
                $this->deleteStoredImages($images);

                PendingHouseImage::whereIn('id', $images->pluck('id'))->delete();
            });
    }

    public function extendDraft(string $draft, Carbon $expiresAt, ?Request $request = null): void
    {
        if (! Str::isUuid($draft)) {
            return;
        }

        $this->pendingDraftQuery($draft, $request)
            ->update(['expires_at' => $expiresAt]);
    }

    public function draftImagesPayload(string $draft, ?Request $request = null): array
    {
        if (! Str::isUuid($draft)) {
            return [];
        }

        if ($request) {
            $this->assertDraftOwnedByRequest($draft, $request);
        }

        return $this->existingImages([
            'model' => PendingHouseImage::class,
            'scope' => $this->draftScopeForQuery($draft, $request),
        ])
            ->map(fn ($image) => $this->imagePayload($image))
            ->all();
    }

    public function finalizeDraftImages(string $draft, House $house, Request $request): void
    {
        $this->validDraftExpiresAt($draft, $request);

        $pendingImages = $this->pendingDraftQuery($draft, $request)
            ->orderBy('order')
            ->lockForUpdate()
            ->get();

        $finalizedImages = $pendingImages->map(fn (PendingHouseImage $image) => [
            'image' => $image,
            'path' => $this->finalizedDraftPath($image->path, $house, 'images'),
            'thumbnail_path' => $this->finalizedDraftPath($image->thumbnail_path, $house, 'thumbnails'),
        ]);

        $this->ensureFinalizableDraftImages($finalizedImages);

        foreach ($finalizedImages as $index => $finalizedImage) {
            $image = $finalizedImage['image'];

            $this->moveDraftFile($image->path, $finalizedImage['path']);
            $this->moveDraftFile($image->thumbnail_path, $finalizedImage['thumbnail_path']);

            HouseImage::create([
                'house_id' => $house->id,
                'path' => $finalizedImage['path'],
                'thumbnail_path' => $finalizedImage['thumbnail_path'],
                'original_name' => $image->original_name,
                'size' => $image->size,
                'thumbnail_size' => $image->thumbnail_size,
                'mime_type' => $image->mime_type,
                'thumbnail_mime_type' => $image->thumbnail_mime_type,
                'order' => $index,
            ]);
        }

        PendingHouseImage::whereIn('id', $pendingImages->pluck('id'))->delete();
    }

    public function draftExpired(string $draft, ?Request $request = null): bool
    {
        if (! Str::isUuid($draft)) {
            return true;
        }

        if ($request) {
            $this->assertDraftOwnedByRequest($draft, $request);
        }

        $expiresAt = Cache::get($this->draftCacheKey($draft, $request))
            ?: $this->pendingDraftQuery($draft, $request)->max('expires_at')
            ?: $this->sessionExpiresAt($request, $draft);

        if (! $expiresAt) {
            return true;
        }

        $expiresAt = $expiresAt instanceof \DateTimeInterface
            ? Carbon::instance($expiresAt)
            : Carbon::parse($expiresAt);

        return now()->greaterThanOrEqualTo($expiresAt);
    }

    public function imagePayload($image): array
    {
        return [
            'id' => $image->id,
            'url' => $image->url,
            'name' => $image->name,
            'size' => $image->size,
        ];
    }

    private function imageTarget(Request $request, $house = null): array
    {
        $draft = $request->route('draft');

        if ($draft !== null) {
            $this->cleanupExpiredDraftImages();
            $expiresAt = $this->validDraftExpiresAt((string) $draft, $request);

            return [
                'type' => 'draft',
                'model' => PendingHouseImage::class,
                'scope' => $this->draftScopeForQuery((string) $draft, $request),
                'folder' => "houses/_drafts/{$draft}/images",
                'lock' => "house-create:{$draft}:images:order",
                'expires_at' => $expiresAt,
                'invalid_order_message' => 'Invalid image order for this house draft.',
                'invalid_images_message' => 'Invalid images for this house draft.',
            ];
        }

        $routeHouse = $request->route('house') ?? $house;
        $house = $routeHouse instanceof House
            ? $routeHouse
            : House::findOrFail($routeHouse);

        return [
            'type' => 'house',
            'model' => HouseImage::class,
            'scope' => ['house_id' => $house->id],
            'folder' => "houses/{$house->id}/images",
            'lock' => "house:{$house->id}:images:order",
            'invalid_order_message' => 'Invalid image order for this house.',
            'invalid_images_message' => 'Invalid images for this house.',
        ];
    }

    private function createAttributes(array $target, $file, array $storedImage): array
    {
        $attributes = [
            'path' => $storedImage['path'],
            'thumbnail_path' => $storedImage['thumbnail_path'],
            'original_name' => $file->getClientOriginalName(),
            'size' => $storedImage['size'],
            'thumbnail_size' => $storedImage['thumbnail_size'],
            'mime_type' => $storedImage['mime_type'],
            'thumbnail_mime_type' => $storedImage['thumbnail_mime_type'],
            'order' => ($this->scopedImageQuery($target)->max('order') ?? -1) + 1,
        ];

        if ($target['type'] === 'draft') {
            return array_merge($attributes, [
                'creation_token' => $target['scope']['creation_token'],
                'user_id' => $target['scope']['user_id'],
                'session_id' => $target['scope']['session_id'],
                'expires_at' => $target['expires_at'],
            ]);
        }

        return array_merge($attributes, [
            'house_id' => $target['scope']['house_id'],
        ]);
    }

    private function scopedImageQuery(array $target)
    {
        $query = $target['model']::query();

        foreach ($target['scope'] as $column => $value) {
            $query->where($column, $value);
        }

        return $query;
    }

    private function resolveImage(array $target, $imageId)
    {
        return $this->scopedImageQuery($target)
            ->where('id', $imageId)
            ->firstOrFail();
    }

    private function existingImages(array $target)
    {
        return $this->scopedImageQuery($target)
            ->orderBy('order')
            ->get()
            ->filter(fn ($image) => $this->imageExists($image))
            ->values();
    }

    private function imageExists($image): bool
    {
        return $this->isRemotePath($image->path)
            || Storage::disk('public')->exists($image->path);
    }

    private function finalizedDraftPath(?string $path, House $house, string $folder): ?string
    {
        if (! is_string($path) || $path === '' || $this->isRemotePath($path)) {
            return $path;
        }

        return "houses/{$house->id}/{$folder}/" . basename($path);
    }

    private function ensureFinalizableDraftImages($images): void
    {
        foreach ($images as $image) {
            $this->ensureFinalizableDraftFile($image['image']->path, $image['path']);
            $this->ensureFinalizableDraftFile($image['image']->thumbnail_path, $image['thumbnail_path']);
        }
    }

    private function ensureFinalizableDraftFile(?string $from, ?string $to): void
    {
        if (! is_string($from) || $from === '' || $this->isRemotePath($from) || $from === $to) {
            return;
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($from)) {
            throw new RuntimeException("Draft image file [{$from}] does not exist.");
        }

        if (is_string($to) && $to !== '' && $disk->exists($to)) {
            throw new RuntimeException("Final house image file [{$to}] already exists.");
        }
    }

    private function moveDraftFile(?string $from, ?string $to): void
    {
        if (! is_string($from) || ! is_string($to) || $from === '' || $to === '' || $this->isRemotePath($from) || $from === $to) {
            return;
        }

        if (! Storage::disk('public')->move($from, $to)) {
            throw new RuntimeException("Draft image file [{$from}] could not be moved to [{$to}].");
        }
    }

    private function deleteStoredImages($images): void
    {
        $paths = $images
            ->flatMap(fn ($image) => [$image->path, $image->thumbnail_path])
            ->filter(fn ($path) => is_string($path) && $path !== '' && ! $this->isRemotePath($path))
            ->unique()
            ->values()
            ->all();

        Storage::disk('public')->delete($paths);
    }

    private function isRemotePath(?string $path): bool
    {
        return is_string($path)
            && (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'));
    }

    private function validDraftExpiresAt(string $draft, Request $request): Carbon
    {
        $this->assertDraftOwnedByRequest($draft, $request);

        $expiresAt = Cache::get($this->draftCacheKey($draft, $request))
            ?: $this->pendingDraftQuery($draft, $request)->max('expires_at')
            ?: $this->sessionExpiresAt($request, $draft);

        abort_if(! $expiresAt, 419, 'This house creation session has expired.');

        $expiresAt = $expiresAt instanceof \DateTimeInterface
            ? Carbon::instance($expiresAt)
            : Carbon::parse($expiresAt);

        abort_if(now()->greaterThanOrEqualTo($expiresAt), 419, 'This house creation session has expired.');

        return $expiresAt;
    }

    private function sessionExpiresAt(?Request $request, string $draft)
    {
        if (! $request || ! $this->sessionOwnsDraft($request, $draft)) {
            return null;
        }

        return $request->session()->get(self::DRAFT_SESSION_KEY . '.expires_at');
    }

    private function pendingDraftQuery(string $draft, ?Request $request = null)
    {
        return PendingHouseImage::query()
            ->where($this->draftScopeForQuery($draft, $request));
    }

    private function draftScopeForQuery(string $draft, ?Request $request = null): array
    {
        $scope = ['creation_token' => $draft];

        if (! $request) {
            return $scope;
        }

        return array_merge($scope, $this->draftOwnerScope($request));
    }

    private function draftOwnerScope(Request $request): array
    {
        return [
            'user_id' => $request->user()?->id,
            'session_id' => $request->session()->get(self::DRAFT_SESSION_KEY . '.session_id'),
        ];
    }

    private function assertDraftOwnedByRequest(string $draft, Request $request): void
    {
        abort_unless(Str::isUuid($draft), 404);
        abort_unless($this->sessionOwnsDraft($request, $draft), 404);
    }

    private function sessionOwnsDraft(Request $request, ?string $draft): bool
    {
        if (! is_string($draft) || ! Str::isUuid($draft) || ! $request->user()) {
            return false;
        }

        $sessionId = $request->session()->get(self::DRAFT_SESSION_KEY . '.session_id');

        return is_string($sessionId)
            && $sessionId !== ''
            && $request->session()->get(self::DRAFT_SESSION_KEY . '.draft_token') === $draft
            && $request->session()->get(self::DRAFT_SESSION_KEY . '.user_id') === $request->user()->id;
    }

    private function draftCacheKey(string $draft, ?Request $request = null): string
    {
        if ($request) {
            $scope = $this->draftOwnerScope($request);

            return "house:create:{$draft}:user:{$scope['user_id']}:session:{$scope['session_id']}:expires_at";
        }

        return "house:create:{$draft}:expires_at";
    }
}
