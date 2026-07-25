<?php

namespace App\Policies;

use App\Models\House;
use App\Models\HouseRental;
use App\Models\User;

class HouseRentalPolicy
{
    public function create(User $user, House $house): bool
    {
        return $this->manage($user, $house);
    }

    public function update(User $user, HouseRental $rental): bool
    {
        return $this->manage($user, $rental->house);
    }

    public function delete(User $user, HouseRental $rental): bool
    {
        return $this->manage($user, $rental->house);
    }

    private function manage(User $user, House $house): bool
    {
        if ($house->trashed() || $house->status === House::STATUS_DELETED) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'agent' && $house->isOwnedBy($user);
    }
}
