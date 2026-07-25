<?php

namespace App\Services\User;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserManagementService
{
    public function create(array $attributes): User
    {
        return User::create($this->saveAttributes($attributes));
    }

    public function update(User $user, User $actor, array $attributes): void
    {
        $attributes = $this->saveAttributes($attributes, $user);
        $nextRole = $attributes['role'] ?? $user->role;

        if ((int) $actor->id === (int) $user->id && $nextRole !== $user->role) {
            throw ValidationException::withMessages([
                'role' => 'You cannot change your own admin role.',
            ]);
        }

        if ($user->role === 'admin' && $nextRole !== 'admin' && $this->adminCount() <= 1) {
            throw ValidationException::withMessages([
                'role' => 'At least one admin account must remain.',
            ]);
        }

        $user->update($attributes);
    }

    public function delete(User $user, User $actor): void
    {
        if ((int) $actor->id === (int) $user->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete your own account.',
            ]);
        }

        if ($user->role === 'admin' && $this->adminCount() <= 1) {
            throw ValidationException::withMessages([
                'user' => 'At least one admin account must remain.',
            ]);
        }

        $user->delete();
    }

    public function updateProfilePicture(User $user, UploadedFile $picture): void
    {
        $directory = "profile-pictures/{$user->id}";

        Storage::disk('public')->deleteDirectory($directory);

        $path = $picture->store($directory, 'public');

        $user->forceFill([
            'profile_picture' => Storage::url($path),
        ])->save();
    }

    private function saveAttributes(array $attributes, ?User $user = null): array
    {
        $payload = Arr::only($attributes, [
            'first_name',
            'last_name',
            'email',
            'role',
            'contact_phone',
            'contact_email',
            'profile_picture',
        ]);

        if (filled($attributes['password'] ?? null)) {
            $payload['password'] = $attributes['password'];
        }

        $payload['email_verified_at'] = ($attributes['email_verified'] ?? false)
            ? ($user?->email_verified_at ?? now())
            : null;

        return $payload;
    }

    private function adminCount(): int
    {
        return User::where('role', 'admin')->count();
    }
}
