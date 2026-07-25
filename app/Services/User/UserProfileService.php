<?php

namespace App\Services\User;

use App\Models\House;
use App\Models\User;
use App\Services\House\Listings\HousePresenter;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserProfileService
{
    public function __construct(private HousePresenter $presenter) {}

    public function favoriteHousesForDashboard(User $user)
    {
        $favoriteHouses = collect();

        if ($user->role !== 'user') {
            return $favoriteHouses;
        }

        $favoriteHouses = $user
            ->favoriteHouses()
            ->where('status', House::STATUS_ACTIVE)
            ->with(['user:id,first_name,last_name', 'cityRecord:id,name,name_en,name_el', 'features:id,name,name_en,name_el', 'thumbnail'])
            ->orderByPivot('created_at', 'desc')
            ->get();

        $favoriteHouses->each(function (House $house): void {
            $this->presenter->prepareForDisplay($house);
            $house->setAttribute('is_favorited', true);
        });

        return $favoriteHouses;
    }

    public function updateProfile(User $user, array $attributes): void
    {
        $user->forceFill($attributes)->save();
    }

    public function updateProfilePicture(User $user, $picture): void
    {
        $directory = "profile-pictures/{$user->id}";

        Storage::disk('public')->deleteDirectory($directory);

        $path = $picture->store($directory, 'public');

        $user->forceFill([
            'profile_picture' => Storage::url($path),
        ])->save();
    }

    public function updateEmail(User $user, string $email): bool
    {
        if ($email === $user->email) {
            return false;
        }

        $user->forceFill([
            'email' => $email,
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();

        return true;
    }

    public function updatePassword(User $user, string $password): void
    {
        $user->forceFill([
            'password' => Hash::make($password),
        ])->save();
    }
}
