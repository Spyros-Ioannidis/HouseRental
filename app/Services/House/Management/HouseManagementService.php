<?php

namespace App\Services\House\Management;

use App\Models\House;
use App\Models\User;
use App\Services\House\Images\HouseImageManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HouseManagementService
{
    public function __construct(
        private HouseImageManager $images,
        private HouseDataNormalizer $normalizer,
    ) {
    }

    public function create(array $validated, User $user, Request $request): House
    {
        $draftToken = $validated['creation_token'];
        $features = $this->normalizer->featureIdsForStore($validated);
        $attributes = $this->normalizer->forStore($validated, $user);

        return DB::transaction(function () use ($draftToken, $features, $attributes, $request) {
            $house = House::create($attributes);

            $house->features()->sync($features);
            $this->images->finalizeDraftImages($draftToken, $house, $request);

            return $house;
        });
    }

    public function update(House $house, array $validated, User $user): void
    {
        $features = $this->normalizer->featureIdsForUpdate($validated);
        $attributes = $this->normalizer->forUpdate($validated, $user, $house);

        $house->update($attributes);

        if ($features !== null) {
            $house->features()->sync($features);
        }
    }

    public function moveToDeleted(House $house): void
    {
        $house->forceFill(['status' => House::STATUS_DELETED])->save();
        $house->delete();
    }

    public function restore(House $house): void
    {
        $house->restore();
        $house->forceFill(['status' => House::STATUS_ARCHIVED])->save();
    }

    public function forceDestroy(House $house): void
    {
        $imagePaths = $house->images()
            ->get(['path', 'thumbnail_path'])
            ->flatMap(fn ($image) => [$image->path, $image->thumbnail_path])
            ->filter(fn ($path) => is_string($path) && $path !== '' && ! $this->isRemotePath($path))
            ->unique()
            ->values()
            ->all();

        $house->forceDelete();

        Storage::disk('public')->delete($imagePaths);
    }

    private function isRemotePath(?string $path): bool
    {
        return is_string($path)
            && (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'));
    }
}
