<?php

namespace App\Services\House\Management;

use App\Models\City;
use App\Models\Feature;
use App\Models\User;

class HouseFormOptions
{
    public function agentsFor(User $user)
    {
        return User::query()
            ->when($user->role === 'agent', fn ($query) => $query->whereKey($user->id))
            ->where('role', 'agent')
            ->orderByName()
            ->select(['id', 'first_name', 'last_name'])
            ->get()
            ->values();
    }

    public function cities()
    {
        return City::orderBy('name')
            ->get()
            ->map(fn (City $city) => [
                'value' => $city->name,
                'label' => $city->localizedName(),
                'name' => $city->name,
                'name_en' => $city->name_en,
                'name_el' => $city->name_el,
            ])
            ->values();
    }

    public function features()
    {
        return Feature::orderBy('name')
            ->get()
            ->map(fn (Feature $feature) => [
                'id' => $feature->id,
                'name' => $feature->localizedName(),
                'name_en' => $feature->name_en,
                'name_el' => $feature->name_el,
            ])
            ->values();
    }
}
