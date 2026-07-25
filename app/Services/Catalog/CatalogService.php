<?php

namespace App\Services\Catalog;

use App\Models\City;
use App\Models\Feature;
use App\Models\House;
use Illuminate\Database\QueryException;

class CatalogService
{
    public function settingsPayload(): array
    {
        return [
            'cities' => City::orderBy('name')
                ->get()
                ->map(fn (City $city) => $this->cityResource($city))
                ->values()
                ->all(),
            'features' => Feature::orderBy('name')
                ->get()
                ->map(fn (Feature $feature) => $this->featureResource($feature))
                ->values()
                ->all(),
            'catalogRoutes' => [
                'cities' => [
                    'store' => route('admin.settings.cities.store'),
                ],
                'features' => [
                    'store' => route('admin.settings.features.store'),
                ],
            ],
        ];
    }

    public function createCity(array $attributes): void
    {
        City::create($this->normalizeTranslatedName($attributes));
    }

    public function updateCity(City $city, array $attributes): void
    {
        $city->update($this->normalizeTranslatedName($attributes));
    }

    public function deleteCity(City $city): bool
    {
        if (House::where('city_id', $city->id)->orWhere(function ($query) use ($city) {
            $query->whereNull('city_id')->where('city', $city->name);
        })->exists()) {
            return false;
        }

        try {
            $city->delete();
        } catch (QueryException) {
            return false;
        }

        return true;
    }

    public function createFeature(array $attributes): void
    {
        Feature::create($this->normalizeTranslatedName($attributes));
    }

    public function updateFeature(Feature $feature, array $attributes): void
    {
        $feature->update($this->normalizeTranslatedName($attributes));
    }

    public function deleteFeature(Feature $feature): void
    {
        $feature->delete();
    }

    private function cityResource(City $city): array
    {
        return [
            'id' => $city->id,
            'name' => $city->name,
            'name_en' => $city->name_en,
            'name_el' => $city->name_el,
            'routes' => [
                'update' => route('admin.settings.cities.update', $city),
                'destroy' => route('admin.settings.cities.destroy', $city),
            ],
        ];
    }

    private function featureResource(Feature $feature): array
    {
        return [
            'id' => $feature->id,
            'name' => $feature->name,
            'name_en' => $feature->name_en,
            'name_el' => $feature->name_el,
            'routes' => [
                'update' => route('admin.settings.features.update', $feature),
                'destroy' => route('admin.settings.features.destroy', $feature),
            ],
        ];
    }

    private function normalizeTranslatedName(array $attributes): array
    {
        $attributes['name'] = trim($attributes['name']);
        $attributes['name_en'] = filled($attributes['name_en'] ?? null)
            ? trim($attributes['name_en'])
            : $attributes['name'];
        $attributes['name_el'] = filled($attributes['name_el'] ?? null)
            ? trim($attributes['name_el'])
            : null;

        return $attributes;
    }
}
