<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function view(?User $viewer, User $user): bool
    {
        return true;
    }

    public function update(User $actor, User $user): bool
    {
        return (int) $actor->id === (int) $user->id || $actor->role === 'admin';
    }

    public function delete(User $actor, User $user): bool
    {
        if ($actor->role !== 'admin') {
            return false;
        }

        return (int) $actor->id !== (int) $user->id;
    }

    public function viewDashboard(User $actor, User $user): bool
    {
        return (int) $actor->id === (int) $user->id;
    }

    public function viewContact(?User $viewer, User $user, string $type): bool
    {
        $value = match ($type) {
            'phone' => $user->contact_phone,
            'email' => $user->contact_email ?? $user->email,
            default => null,
        };

        return filled($value);
    }
}
