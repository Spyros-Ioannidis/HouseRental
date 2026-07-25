<?php

namespace App\Services\User;

use App\Models\House;
use App\Models\User;
use App\Services\House\Listings\HousePresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserListingService
{
    public function __construct(private HousePresenter $presenter) {}

    public function adminIndex(Request $request)
    {
        $query = User::query()
            ->withCount(['houses', 'favoriteHouses', 'contactMessages']);

        if ($request->search) {
            $search = trim((string) $request->search);

            if ($search !== '') {
                $query->where(function ($q) use ($search) {
                    $q->whereNameLike($search)
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }
        }

        if (in_array($request->role, ['user', 'agent', 'admin'], true)) {
            $query->where('role', $request->role);
        }

        if ($request->sortKey && in_array($request->sortDirection, ['asc', 'desc'], true)) {
            if ($request->sortKey === 'name') {
                $query->orderByName($request->sortDirection);
            } elseif (in_array($request->sortKey, [
                'first_name',
                'last_name',
                'email',
                'role',
                'email_verified_at',
                'created_at',
                'houses_count',
            ], true)) {
                $query->orderBy($request->sortKey, $request->sortDirection);
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        return $query
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => $this->adminResource($user, $request->user()));
    }

    public function adminRoleOptions(): array
    {
        return [
            ['value' => 'user', 'label' => 'User'],
            ['value' => 'agent', 'label' => 'Agent'],
            ['value' => 'admin', 'label' => 'Admin'],
        ];
    }

    public function adminDetail(User $user, ?User $actor): array
    {
        $user->loadCount(['houses', 'favoriteHouses', 'contactMessages']);

        return $this->adminResource($user, $actor);
    }

    public function sellerPage(User $user, Request $request): array
    {
        $query = House::query()
            ->where('user_id', $user->id)
            ->where('status', House::STATUS_ACTIVE)
            ->with(['user:id,first_name,last_name', 'cityRecord:id,name,name_en,name_el', 'features:id,name,name_en,name_el', 'thumbnail'])
            ->latest();

        if ($request->user()) {
            $query->withExists([
                'favoritedByUsers as is_favorited' => fn ($q) => $q->where('users.id', $request->user()->id),
            ]);
        }

        $houses = $query
            ->paginate(6)
            ->withQueryString();

        $houses->getCollection()->each(fn (House $house) => $this->presenter->prepareForDisplay($house));

        $stats = House::query()
            ->where('user_id', $user->id)
            ->where('status', House::STATUS_ACTIVE)
            ->selectRaw('
                COUNT(*) as total_listings,
                MIN(price) as min_price,
                MAX(price) as max_price,
                AVG(price) as avg_price
            ')
            ->first();

        return [
            'houses' => $houses,
            'stats' => [
                'total_listings' => (int) ($stats->total_listings ?? 0),
                'min_price' => $stats->min_price,
                'max_price' => $stats->max_price,
                'avg_price' => $stats->avg_price,
            ],
        ];
    }

    private function adminResource(User $user, ?User $actor): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_picture' => $user->profile_picture,
            'contact_phone' => $user->contact_phone,
            'contact_email' => $user->contact_email,
            'email_verified_at' => $user->email_verified_at?->toDateTimeString(),
            'created_at' => $user->created_at?->toDateTimeString(),
            'houses_count' => $user->houses_count,
            'favorite_houses_count' => $user->favorite_houses_count,
            'contact_messages_count' => $user->contact_messages_count,
            'can_update' => $actor
                ? Gate::forUser($actor)->allows('update', $user)
                : false,
            'can_delete' => $actor
                ? Gate::forUser($actor)->allows('delete', $user)
                : false,
            'routes' => [
                'edit' => route('admin.users.edit', $user),
                'update' => route('admin.users.update', $user),
                'profile_picture_update' => route('admin.users.profile-picture.update', $user),
                'destroy' => route('admin.users.destroy', $user),
            ],
        ];
    }
}
