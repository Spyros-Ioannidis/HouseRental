<?php

namespace App\Services\Admin;

use App\Models\City;
use App\Models\ContactMessage;
use App\Models\Feature;
use App\Models\House;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardMetricsService
{
    public function forUser(User $user): array
    {
        $isAdmin = $user->role === 'admin';

        $houseScope = function () use ($isAdmin, $user) {
            $query = House::query();

            if ($isAdmin) {
                return $query->withTrashed();
            }

            return $query->where('user_id', $user->id);
        };

        $activeHouseScope = fn () => House::query()
            ->where('status', House::STATUS_ACTIVE)
            ->when(! $isAdmin, fn ($query) => $query->where('user_id', $user->id));

        $contactScope = function () use ($isAdmin, $user) {
            return ContactMessage::query()
                ->when(! $isAdmin, function ($query) use ($user) {
                    $query->where(function ($visible) use ($user) {
                        $visible->where('agent_id', $user->id)
                            ->orWhereHas('house', function ($houseQuery) use ($user) {
                                $houseQuery->where('user_id', $user->id);
                            });
                    });
                });
        };

        $priceStats = $activeHouseScope()
            ->selectRaw('
                COUNT(*) as active_count,
                AVG(price) as average_price,
                MIN(price) as minimum_price,
                MAX(price) as maximum_price,
                SUM(price) as total_price
            ')
            ->first();

        $statusCounts = $houseScope()
            ->select('status', DB::raw('COUNT(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $cityStats = $activeHouseScope()
            ->with('cityRecord:id,name,name_en,name_el')
            ->select('city_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('city_id')
            ->groupBy('city_id')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn (House $house) => [
                'city' => $house->cityRecord?->localizedName() ?? '',
                'city_name' => $house->cityRecord?->name ?? '',
                'total' => (int) $house->total,
            ]);

        $recentHouses = $houseScope()
            ->with(['user:id,first_name,last_name', 'cityRecord:id,name,name_en,name_el'])
            ->latest()
            ->limit(5)
            ->get(['id', 'title', 'status', 'city', 'city_id', 'price', 'user_id', 'created_at'])
            ->each(function (House $house): void {
                $house->setAttribute('city', $house->cityRecord?->name ?: $house->city);
                $house->setAttribute('city_label', $house->cityRecord?->localizedName() ?: $house->city);
            });

        $recentContacts = $contactScope()
            ->with(['agent:id,first_name,last_name', 'house:id,title'])
            ->latest()
            ->limit(5)
            ->get(['id', 'agent_id', 'house_id', 'name', 'subject', 'source', 'read_at', 'created_at']);

        $favoriteCount = $isAdmin
            ? DB::table('favorite_house')->count()
            : DB::table('favorite_house')
                ->join('houses', 'houses.id', '=', 'favorite_house.house_id')
                ->where('houses.user_id', $user->id)
                ->count();

        $topAgents = $isAdmin
            ? User::query()
                ->where('role', 'agent')
                ->withCount('houses')
                ->orderByDesc('houses_count')
                ->limit(5)
                ->get(['id', 'first_name', 'last_name', 'email'])
            : collect([
                $user->loadCount('houses')->only(['id', 'first_name', 'last_name', 'name', 'email', 'houses_count']),
            ]);

        return [
            'scope' => $isAdmin ? 'platform' : 'agent',
            'isAdmin' => $isAdmin,
            'totalUsers' => $isAdmin ? User::count() : null,
            'totalAgents' => $isAdmin ? User::where('role', 'agent')->count() : null,
            'totalCustomers' => $isAdmin ? User::where('role', 'user')->count() : null,
            'totalHouses' => $houseScope()->count(),
            'activeHouses' => (int) ($priceStats->active_count ?? 0),
            'deletedHouses' => $isAdmin ? House::onlyTrashed()->count() : 0,
            'totalContacts' => $contactScope()->count(),
            'unreadContacts' => $contactScope()->whereNull('read_at')->count(),
            'favoriteCount' => $favoriteCount,
            'cityCount' => City::count(),
            'featureCount' => Feature::count(),
            'averagePrice' => $priceStats->average_price,
            'minimumPrice' => $priceStats->minimum_price,
            'maximumPrice' => $priceStats->maximum_price,
            'totalInventoryValue' => $priceStats->total_price,
            'houseStatus' => collect(House::STATUSES)
                ->map(fn ($status) => [
                    'status' => $status,
                    'label' => str_replace('_', ' ', $status),
                    'total' => (int) ($statusCounts[$status] ?? 0),
                ])
                ->values(),
            'cityStats' => $cityStats,
            'recentHouses' => $recentHouses,
            'recentContacts' => $recentContacts,
            'topAgents' => $topAgents,
        ];
    }
}
