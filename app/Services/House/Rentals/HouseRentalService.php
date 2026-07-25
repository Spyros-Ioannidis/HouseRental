<?php

namespace App\Services\House\Rentals;

use App\Models\House;
use App\Models\HouseRental;
use App\Models\User;

class HouseRentalService
{
    public function adminPayload(House $house): array
    {
        return [
            'rentals' => $this->rentalsFor($house),
            'candidates' => $this->candidateUsers(),
        ];
    }

    public function rentalsFor(House $house): array
    {
        return $house->rentals()
            ->with([
                'user:id,first_name,last_name,email',
                'confirmedBy:id,first_name,last_name,email',
            ])
            ->latest()
            ->get()
            ->map(fn (HouseRental $rental) => $this->format($rental))
            ->all();
    }

    public function candidateUsers(): array
    {
        return User::query()
            ->where('role', 'user')
            ->orderByName()
            ->get(['id', 'first_name', 'last_name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'label' => trim("{$user->name} ({$user->email})"),
            ])
            ->values()
            ->all();
    }

    public function create(House $house, User $actor, array $attributes): HouseRental
    {
        return $house->rentals()->create([
            'user_id' => $attributes['user_id'],
            'starts_on' => $attributes['starts_on'] ?? null,
            'ends_on' => $attributes['ends_on'] ?? null,
            'confirmed_at' => now(),
            'confirmed_by_id' => $actor->id,
        ])->load([
            'user:id,first_name,last_name,email',
            'confirmedBy:id,first_name,last_name,email',
        ]);
    }

    public function update(HouseRental $rental, array $attributes): HouseRental
    {
        $rental->update([
            'starts_on' => $attributes['starts_on'] ?? null,
            'ends_on' => $attributes['ends_on'] ?? null,
        ]);

        return $rental->refresh()->load([
            'user:id,first_name,last_name,email',
            'confirmedBy:id,first_name,last_name,email',
        ]);
    }

    public function revoke(HouseRental $rental): HouseRental
    {
        $rental->forceFill(['revoked_at' => now()])->save();

        return $rental->refresh()->load([
            'user:id,first_name,last_name,email',
            'confirmedBy:id,first_name,last_name,email',
        ]);
    }

    public function format(HouseRental $rental): array
    {
        return [
            'id' => $rental->id,
            'starts_on' => $rental->starts_on?->toDateString(),
            'ends_on' => $rental->ends_on?->toDateString(),
            'confirmed_at' => $rental->confirmed_at?->toIso8601String(),
            'revoked_at' => $rental->revoked_at?->toIso8601String(),
            'user' => $this->userPayload($rental->user),
            'confirmed_by' => $this->userPayload($rental->confirmedBy),
        ];
    }

    private function userPayload(?User $user): ?array
    {
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
