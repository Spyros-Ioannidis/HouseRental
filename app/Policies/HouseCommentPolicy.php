<?php

namespace App\Policies;

use App\Models\House;
use App\Models\HouseComment;
use App\Models\User;

class HouseCommentPolicy
{
    public function create(User $user, House $house): bool
    {
        if ($house->trashed()) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'agent') {
            return $house->isOwnedBy($user);
        }

        return $user->role === 'user' && $house->hasConfirmedRenter($user);
    }

    public function update(User $user, HouseComment $comment): bool
    {
        return (int) $comment->user_id === (int) $user->id;
    }

    public function delete(User $user, HouseComment $comment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return (int) $comment->user_id === (int) $user->id;
    }
}
