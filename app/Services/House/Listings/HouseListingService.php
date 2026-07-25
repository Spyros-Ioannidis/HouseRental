<?php

namespace App\Services\House\Listings;

use App\Models\City;
use App\Models\House;
use App\Models\User;
use App\Services\House\Management\HouseStatusService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class HouseListingService
{
    private const PUBLIC_SORT_COLUMNS = [
        'price' => 'price',
        'area' => 'area',
        'year_built' => 'year_built',
    ];

    public function __construct(
        private HousePresenter $presenter,
        private HouseStatusService $statuses,
    ) {
    }

    public function publicIndex(Request $request, HouseFilterService $houseFilters): array
    {
        $query = House::query()
            ->where('status', House::STATUS_ACTIVE)
            ->with(['user:id,first_name,last_name', 'cityRecord:id,name,name_en,name_el', 'features:id,name,name_en,name_el', 'thumbnail']);

        if ($request->user()) {
            $query->withExists([
                'favoritedByUsers as is_favorited' => fn ($q) => $q->where('users.id', $request->user()->id),
            ]);
        }

        $houseFilters->apply($query, $request);
        $this->applyPublicOrdering($query, $request);

        $houses = $query
            ->paginate(5)
            ->withQueryString();

        $stats = House::query()
            ->where('status', House::STATUS_ACTIVE)
            ->selectRaw('
            MIN(price) as min_price,
            MAX(price) as max_price,
            MIN(area) as min_area,
            MAX(area) as max_area,
            MIN(year_built) as min_year,
            MAX(year_built) as max_year
        ')
            ->first();

        $houses->getCollection()->each(fn (House $house) => $this->presenter->prepareForDisplay($house));

        return [$houses, $stats];
    }

    public function publicOrderKeys(): array
    {
        return ['order_by', 'order_dir'];
    }

    public function adminIndex(Request $request)
    {
        $query = $this->adminVisibleHouseQuery($request)
            ->with(['thumbnail', 'user:id,first_name,last_name', 'cityRecord:id,name,name_en,name_el']);

        if ($request->filled('search')) {
            $search = trim((string) $request->input('search'));

            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhereHas('cityRecord', function (Builder $cityQuery) use ($search) {
                        $cityQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('name_en', 'like', "%{$search}%")
                            ->orWhere('name_el', 'like', "%{$search}%");
                    });
            });
        }

        $this->applyAdminFilters($query, $request);

        $sortKey = $request->input('sortKey');
        $sortDirection = $request->input('sortDirection');
        $sortableColumns = ['title', 'status', 'city', 'price', 'floor', 'created_at'];

        if (
            in_array($sortKey, $sortableColumns, true)
            && in_array($sortDirection, ['asc', 'desc'], true)
        ) {
            if ($sortKey === 'city') {
                $this->orderByCityName($query, $sortDirection);
            } else {
                $query->orderBy($sortKey, $sortDirection);
            }
        } else {
            $query->latest();
        }

        $houses = $query->paginate(10)->withQueryString();
        $houses->getCollection()->each(fn (House $house) => $this->presenter->prepareForAdmin($house));

        return $houses;
    }

    public function adminFilters(Request $request): array
    {
        $stats = $this->adminVisibleHouseQuery($request)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        return [
            'city_filter' => [
                'key' => 'city',
                'label' => __('ui.filters.city'),
                'placeholder' => __('ui.filters.all_cities'),
                'active_label' => __('ui.filters.active.city'),
                'options' => $this->adminCityOptions(),
            ],
            'range_filters' => [
                [
                    'key_min' => 'price_min',
                    'key_max' => 'price_max',
                    'label' => __('ui.filters.price'),
                    'prefix' => 'EUR ',
                    'step' => 1,
                    'active_min_label' => __('ui.filters.active.price_min'),
                    'active_max_label' => __('ui.filters.active.price_max'),
                    'bounds' => [
                        'min' => $stats->min_price ?? 0,
                        'max' => $stats->max_price ?? 0,
                    ],
                ],
            ],
            'multi_filters' => [
                [
                    'key' => 'status',
                    'label' => __('ui.tables.status'),
                    'item_class_name' => 'px-3 py-1 text-sm justify-center',
                    'active_label' => __('ui.tables.status') . ': :value',
                    'options' => $this->adminStatusOptions($request->user()),
                ],
                [
                    'key' => 'agent',
                    'label' => __('ui.tables.agent'),
                    'item_class_name' => 'px-2 py-1 text-sm justify-center',
                    'active_label' => __('ui.tables.agent') . ': :value',
                    'options' => $this->adminAgentOptions($request->user()),
                ],
                [
                    'key' => 'floor',
                    'label' => __('ui.filters.floor'),
                    'item_class_name' => 'px-3 py-1 text-sm justify-center',
                    'active_label' => __('ui.filters.active.floor'),
                    'options' => $this->adminFloorOptions($request),
                ],
            ],
        ];
    }

    public function adminQueryKeys(): array
    {
        return [
            'search',
            'sortKey',
            'sortDirection',
            'city',
            'price_min',
            'price_max',
            'status',
            'agent',
            'floor',
        ];
    }

    private function adminVisibleHouseQuery(Request $request): Builder
    {
        $user = $request->user();
        $query = House::query();

        if ($user->role === 'admin') {
            return $query->withTrashed();
        }

        return $query->where('user_id', $user->id);
    }

    private function applyPublicOrdering(Builder $query, Request $request): void
    {
        $orderBy = $request->input('order_by');
        $direction = $request->input('order_dir', 'asc');

        if (
            array_key_exists($orderBy, self::PUBLIC_SORT_COLUMNS)
            && in_array($direction, ['asc', 'desc'], true)
        ) {
            $query->orderBy(self::PUBLIC_SORT_COLUMNS[$orderBy], $direction)
                ->orderByDesc('created_at');

            return;
        }

        $query->latest();
    }

    private function applyAdminFilters(Builder $query, Request $request): void
    {
        if ($request->filled('city')) {
            $this->whereCityName($query, $request->input('city'));
        }

        if ($request->filled('price_min')) {
            $query->where('price', '>=', $request->input('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', $request->input('price_max'));
        }

        $statusValues = $this->filledArray($request->input('status', []));
        if ($statusValues !== []) {
            $query->whereIn('status', $statusValues);
        }

        $agentValues = $this->filledArray($request->input('agent', []));
        if ($agentValues !== []) {
            $query->whereIn('user_id', $agentValues);
        }

        $floorValues = $this->filledArray($request->input('floor', []));
        if ($floorValues !== []) {
            $query->whereIn('floor', $floorValues);
        }
    }

    private function adminStatusOptions(User $user): array
    {
        $statuses = $user->role === 'admin'
            ? House::STATUSES
            : array_values(array_filter(
                House::STATUSES,
                fn (string $status) => $status !== House::STATUS_DELETED,
            ));
        $labels = $this->statuses->labels();

        return collect($statuses)
            ->map(fn (string $status) => [
                'label' => $labels[$status] ?? $status,
                'value' => $status,
            ])
            ->values()
            ->all();
    }

    private function adminCityOptions()
    {
        return City::orderBy('name')
            ->get()
            ->map(fn (City $city) => [
                'label' => $city->localizedName(),
                'value' => $city->name,
            ])
            ->values();
    }

    private function adminAgentOptions(User $user)
    {
        return User::query()
            ->when($user->role === 'agent', fn ($query) => $query->whereKey($user->id))
            ->where('role', 'agent')
            ->orderByName()
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (User $agent) => [
                'label' => $agent->name,
                'value' => (string) $agent->id,
            ])
            ->values();
    }

    private function adminFloorOptions(Request $request)
    {
        return $this->optionList(
            $this->adminVisibleHouseQuery($request)
                ->whereNotNull('floor')
                ->select('floor')
                ->distinct()
                ->orderBy('floor')
                ->pluck('floor'),
        );
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

    private function orderByCityName(Builder $query, string $direction): void
    {
        $query
            ->orderBy(
                City::select('name')
                    ->whereColumn('cities.id', 'houses.city_id')
                    ->limit(1),
                $direction,
            )
            ->orderBy('city', $direction);
    }
}
