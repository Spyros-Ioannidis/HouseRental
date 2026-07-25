<?php

namespace App\Services\House\Management;

use App\Models\City;
use App\Models\House;
use App\Models\User;

class HouseDataNormalizer
{
    public function forStore(array $validated, User $user): array
    {
        $attributes = $validated;
        unset($attributes['creation_token'], $attributes['features']);

        $attributes['user_id'] = $user->role === 'agent'
            ? $user->id
            : $attributes['agent'];
        unset($attributes['agent']);

        if ($user->role === 'agent') {
            $attributes['status'] = House::STATUS_PENDING_REVIEW;
        } else {
            $attributes['status'] = $attributes['status'] ?? House::STATUS_ACTIVE;
        }

        return $this->syncLegacyHouseTranslations($this->syncCityRelationship($attributes));
    }

    public function forUpdate(array $validated, User $user, House $house): array
    {
        $attributes = $validated;

        if ($user->role === 'agent') {
            unset($attributes['agent']);
        } elseif (isset($attributes['agent'])) {
            $attributes['user_id'] = $attributes['agent'];
            unset($attributes['agent']);
        }

        unset($attributes['features']);

        return $this->syncLegacyHouseTranslations($this->syncCityRelationship($attributes), $house);
    }

    public function featureIdsForStore(array $validated): array
    {
        return $validated['features'] ?? [];
    }

    public function featureIdsForUpdate(array $validated): ?array
    {
        return $validated['features'] ?? null;
    }

    private function syncLegacyHouseTranslations(array $attributes, ?House $house = null): array
    {
        foreach (['title_en', 'title_el', 'description_en', 'description_el'] as $field) {
            if (array_key_exists($field, $attributes)) {
                $attributes[$field] = filled($attributes[$field])
                    ? trim($attributes[$field])
                    : null;
            }
        }

        $attributes['title'] = $attributes['title_en']
            ?? $house?->title_en
            ?? $attributes['title_el']
            ?? $house?->title_el
            ?? $house?->title
            ?? '';

        $attributes['description'] = $attributes['description_en']
            ?? $house?->description_en
            ?? $attributes['description_el']
            ?? $house?->description_el
            ?? $house?->description
            ?? '';

        return $attributes;
    }

    private function syncCityRelationship(array $attributes): array
    {
        if (! array_key_exists('city', $attributes)) {
            return $attributes;
        }

        $cityName = trim((string) $attributes['city']);
        $city = City::where('name', $cityName)->first();

        $attributes['city'] = $city?->name ?? $cityName;
        $attributes['city_id'] = $city?->id;

        return $attributes;
    }
}
