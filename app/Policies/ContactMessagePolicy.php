<?php

namespace App\Policies;

use App\Models\ContactMessage;
use App\Models\User;

class ContactMessagePolicy
{
    public function viewAny(?User $user): bool
    {
        return $user && in_array($user->role, ['admin', 'agent'], true);
    }

    public function view(User $user, ContactMessage $contact): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ((int) $contact->agent_id === (int) $user->id) {
            return true;
        }

        return $contact->house()
            ->where('user_id', $user->id)
            ->exists();
    }

    public function delete(User $user, ContactMessage $contact): bool
    {
        return $user->role === 'admin';
    }
}
