<?php

namespace App\Services\House\Favorites;

use App\Models\House;
use App\Models\User;

class FavoriteHouseService
{
    public function add(User $user, House $house): void
    {
        $user->favoriteHouses()->syncWithoutDetaching([$house->id]);
    }

    public function remove(User $user, House $house): void
    {
        $user->favoriteHouses()->detach($house->id);
    }
}
