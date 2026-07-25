<?php

namespace App\Services\House\Listings;

use App\Models\House;
use App\Models\HouseImage;
use App\Services\House\Management\HouseStatusService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HousePresenter
{
    public function __construct(private HouseStatusService $statuses)
    {
    }

    public function payload(House $house, ?Request $request = null, bool $localized = false): array
    {
        $house->loadMissing('cityRecord');

        if ($localized) {
            $house->applyLocalizedAttributes();
        }

        $payload = $house->toArray();
        $payload['city'] = $this->cityValue($house);
        $payload['city_label'] = $this->cityLabel($house);
        $payload['images'] = $this->images($house);
        $payload['is_favorited'] = $request?->user()
            ? $request->user()->favoriteHouses()->whereKey($house->id)->exists()
            : false;

        return $payload;
    }

    public function prepareForDisplay(House $house): void
    {
        $house->loadMissing('cityRecord');
        $house->thumbnail?->setAppends([]);
        $house->applyLocalizedAttributes();
        $house->setAttribute('city', $this->cityValue($house));
        $house->setAttribute('city_label', $this->cityLabel($house));
        $house->setAttribute('is_favorited', (bool) ($house->is_favorited ?? false));
    }

    public function prepareForAdmin(House $house): void
    {
        $house->loadMissing('cityRecord');
        $house->thumbnail?->setAppends([]);
        $house->setAttribute('status', $house->trashed() ? House::STATUS_DELETED : $house->status);
        $house->setAttribute('status_label', $this->statuses->labels()[$house->status] ?? $house->status);
        $house->setAttribute('city', $this->cityValue($house));
        $house->setAttribute('city_label', $this->cityLabel($house));
    }

    private function images(House $house): array
    {
        return HouseImage::where('house_id', $house->id)
            ->orderBy('order', 'ASC')
            ->get()
            ->filter(fn (HouseImage $image) => $this->imageExists($image))
            ->values()
            ->map(fn (HouseImage $image) => [
                'id' => $image->id,
                'url' => $image->url,
                'name' => $image->name,
                'size' => $image->size,
            ])
            ->all();
    }

    private function imageExists(HouseImage $image): bool
    {
        return str_starts_with($image->path, 'http://')
            || str_starts_with($image->path, 'https://')
            || Storage::disk('public')->exists($image->path);
    }

    private function cityValue(House $house): string
    {
        return $house->cityRecord?->name
            ?: $house->getRawOriginal('city')
            ?: '';
    }

    private function cityLabel(House $house): string
    {
        return $house->cityRecord?->localizedName()
            ?: $house->getRawOriginal('city')
            ?: '';
    }
}
