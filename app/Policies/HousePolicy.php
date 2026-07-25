<?php

namespace App\Policies;

use App\Models\House;
use App\Models\User;

class HousePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'agent';
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(?User $user, House $house): bool
    {
        if ($house->isPubliclyVisible()) {
            return true;
        }

        if (! $user || $house->trashed()) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'agent' && $house->isOwnedBy($user)) {
            return true;
        }

        return $user->role === 'user' && $house->hasConfirmedRenter($user);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'admin' || $user->role === 'agent';
    }

    public function changeAgent(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function manageDeletedHouses(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, House $house): bool
    {
        return $this->manage($user, $house);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, House $house): bool
    {
        return $this->manage($user, $house);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user): bool
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function manage(User $user, House $house): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($house->trashed() || $house->status === House::STATUS_DELETED) {
            return false;
        }

        return $user->role === 'agent' && $house->isOwnedBy($user);
    }

    public function manageImages(User $user, House $house): bool
    {
        if ($house->trashed()) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'agent' && $house->isOwnedBy($user);
    }

    public function favorite(User $user, House $house): bool
    {
        return $house->isPubliclyVisible();
    }

    public function unfavorite(User $user, House $house): bool
    {
        return true;
    }
}
