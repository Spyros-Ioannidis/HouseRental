<?php

namespace App\Services\House\Listings;

use App\Models\City;
use App\Models\Feature;
use App\Models\House;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class HouseFilterService
{
    public function apply(Builder $query, Request $request): void
    {
        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            if ($search !== '') {
                $query->where(function (Builder $q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('title_en', 'like', "%{$search}%")
                        ->orWhere('title_el', 'like', "%{$search}%")
                        ->orWhere('address', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%")
                        ->orWhereHas('cityRecord', function (Builder $cityQuery) use ($search) {
                            $cityQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('name_en', 'like', "%{$search}%")
                                ->orWhere('name_el', 'like', "%{$search}%");
                        })
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('description_en', 'like', "%{$search}%")
                        ->orWhere('description_el', 'like', "%{$search}%")
                        ->orWhereHas('user', fn (Builder $userQuery) => $userQuery->whereNameLike($search));
                });
            }
        }

        foreach ($this->rangeFilterDefinitions() as $range) {
            if ($request->filled($range['min'])) {
                $query->where($range['column'], '>=', $request->input($range['min']));
            }

            if ($request->filled($range['max'])) {
                $query->where($range['column'], '<=', $request->input($range['max']));
            }
        }

        if ($request->filled('city')) {
            $this->whereCityName($query, $request->input('city'));
        }

        foreach ($this->multiFilterDefinitions() as $filter) {
            $values = $this->filledArray($request->input($filter['key'], []));

            if ($values === []) {
                continue;
            }

            if ($filter['source'] === 'features') {
                $query->whereHas('features', fn ($q) => $q->whereIn('features.id', $values));

                continue;
            }

            $query->whereIn($filter['column'], $values);
        }
    }

    public function filters(?object $stats): array
    {
        return [
            'city_filter' => [
                'key' => 'city',
                'label_key' => 'filters.city',
                'placeholder_key' => 'filters.all_cities',
                'active_label' => 'City: :value',
                'active_label_key' => 'filters.active.city',
                'options' => $this->cityOptions(),
            ],
            'range_filters' => collect($this->rangeFilterDefinitions())
                ->map(fn (array $filter) => [
                    'key_min' => $filter['min'],
                    'key_max' => $filter['max'],
                    'label_key' => $filter['label_key'],
                    'prefix' => $filter['prefix'] ?? null,
                    'step' => $filter['step'],
                    'active_min_label' => $filter['active_min_label'],
                    'active_min_label_key' => $filter['active_min_label_key'],
                    'active_max_label' => $filter['active_max_label'],
                    'active_max_label_key' => $filter['active_max_label_key'],
                    'bounds' => [
                        'min' => $stats->{$filter['stat_min']} ?? 0,
                        'max' => $stats->{$filter['stat_max']} ?? 0,
                    ],
                ])
                ->values(),
            'multi_filters' => collect($this->multiFilterDefinitions())
                ->map(fn (array $filter) => [
                    'key' => $filter['key'],
                    'label' => $filter['label'],
                    'label_key' => $filter['label_key'],
                    'item_class_name' => $filter['item_class_name'],
                    'active_label' => $filter['active_label'],
                    'active_label_key' => $filter['active_label_key'],
                    'options' => $this->multiFilterOptions($filter),
                ])
                ->values(),
        ];
    }

    public function keys(): array
    {
        $rangeKeys = collect($this->rangeFilterDefinitions())
            ->flatMap(fn (array $filter) => [$filter['min'], $filter['max']]);
        $multiKeys = collect($this->multiFilterDefinitions())
            ->pluck('key');

        return collect(['search', 'city'])
            ->merge($rangeKeys)
            ->merge($multiKeys)
            ->values()
            ->all();
    }

    private function rangeFilterDefinitions(): array
    {
        return [
            [
                'column' => 'price',
                'min' => 'price_min',
                'max' => 'price_max',
                'stat_min' => 'min_price',
                'stat_max' => 'max_price',
                'label_key' => 'filters.price',
                'prefix' => '€',
                'step' => 1,
                'active_min_label' => 'Price from €:value',
                'active_min_label_key' => 'filters.active.price_min',
                'active_max_label' => 'Price up to €:value',
                'active_max_label_key' => 'filters.active.price_max',
            ],
            [
                'column' => 'area',
                'min' => 'area_min',
                'max' => 'area_max',
                'stat_min' => 'min_area',
                'stat_max' => 'max_area',
                'label_key' => 'filters.area',
                'step' => 1,
                'active_min_label' => 'Area from :value',
                'active_min_label_key' => 'filters.active.area_min',
                'active_max_label' => 'Area up to :value',
                'active_max_label_key' => 'filters.active.area_max',
            ],
            [
                'column' => 'year_built',
                'min' => 'year_min',
                'max' => 'year_max',
                'stat_min' => 'min_year',
                'stat_max' => 'max_year',
                'label_key' => 'filters.year_built',
                'step' => 1,
                'active_min_label' => 'Built from :value',
                'active_min_label_key' => 'filters.active.year_min',
                'active_max_label' => 'Built up to :value',
                'active_max_label_key' => 'filters.active.year_max',
            ],
        ];
    }

    private function multiFilterDefinitions(): array
    {
        return [
            [
                'key' => 'floor',
                'column' => 'floor',
                'source' => 'house_column',
                'label' => 'Floor',
                'label_key' => 'filters.floor',
                'item_class_name' => 'px-3 py-1 text-sm justify-center',
                'active_label' => 'Floor: :value',
                'active_label_key' => 'filters.active.floor',
            ],
            [
                'key' => 'bedroom',
                'column' => 'bedroom',
                'source' => 'house_column',
                'label' => 'Bedroom',
                'label_key' => 'filters.bedroom',
                'item_class_name' => 'px-3 py-1 text-sm justify-center',
                'active_label' => 'Bedroom: :value',
                'active_label_key' => 'filters.active.bedroom',
            ],
            [
                'key' => 'bathroom',
                'column' => 'bathroom',
                'source' => 'house_column',
                'label' => 'Bathroom',
                'label_key' => 'filters.bathroom',
                'item_class_name' => 'px-3 py-1 text-sm justify-center',
                'active_label' => 'Bathroom: :value',
                'active_label_key' => 'filters.active.bathroom',
            ],
            [
                'key' => 'living_room',
                'column' => 'living_room',
                'source' => 'house_column',
                'label' => 'Living Room',
                'label_key' => 'filters.living_room',
                'item_class_name' => 'px-3 py-1 text-sm justify-center',
                'active_label' => 'Living Room: :value',
                'active_label_key' => 'filters.active.living_room',
            ],
            [
                'key' => 'features',
                'source' => 'features',
                'label' => 'Feature',
                'label_key' => 'filters.features',
                'item_class_name' => 'px-2 py-1 text-sm justify-center',
                'active_label' => 'Feature: :value',
                'active_label_key' => 'filters.active.feature',
            ],
        ];
    }

    private function multiFilterOptions(array $filter)
    {
        if ($filter['source'] === 'features') {
            return Feature::select('id', 'name', 'name_en', 'name_el')
                ->get()
                ->map(fn (Feature $feature) => [
                    'label' => $feature->localizedName(),
                    'value' => (string) $feature->id,
                ])
                ->values();
        }

        return $this->optionList($this->distinctHouseValues($filter['column']));
    }

    private function optionList($values)
    {
        return collect($values)
            ->map(fn ($value) => [
                'label' => (string) $value,
                'value' => (string) $value,
            ])
            ->values();
    }

    private function cityOptions()
    {
        return City::orderBy('name')
            ->get()
            ->map(fn (City $city) => [
                'label' => $city->localizedName(),
                'value' => $city->name,
            ])
            ->values();
    }

    private function distinctHouseValues(string $column, bool $stringColumn = false)
    {
        $query = House::query()
            ->where('status', House::STATUS_ACTIVE)
            ->whereNotNull($column);

        if ($stringColumn) {
            $query->where($column, '!=', '');
        }

        return $query
            ->select($column)
            ->distinct()
            ->orderBy($column, 'asc')
            ->pluck($column)
            ->values();
    }

    private function filledArray($value): array
    {
        return collect((array) $value)
            ->filter(fn ($item) => $item !== null && $item !== '')
            ->values()
            ->all();
    }

    private function whereCityName(Builder $query, string $cityName): void
    {
        $query->where(function (Builder $cityFilter) use ($cityName) {
            $cityFilter->whereHas('cityRecord', fn (Builder $cityQuery) => $cityQuery->where('name', $cityName))
                ->orWhere(function (Builder $legacyQuery) use ($cityName) {
                    $legacyQuery->whereNull('city_id')->where('city', $cityName);
                });
        });
    }
}
