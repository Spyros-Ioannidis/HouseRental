<?php

namespace App\Policies;

use App\Models\User;

class CityPolicy
{
    private function manageCatalog(?User $user): bool
    {
        return $user?->role === 'admin';
    }

    public function viewAny(?User $user): bool
    {
        return $this->manageCatalog($user);
    }

    public function create(?User $user): bool
    {
        return $this->manageCatalog($user);
    }

    public function update(?User $user): bool
    {
        return $this->manageCatalog($user);
    }

    public function delete(?User $user): bool
    {
        return $this->manageCatalog($user);
    }
}
