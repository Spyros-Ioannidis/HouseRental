<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RegistrationService
{
    /**
     * Create an account only after its verification email has been accepted by
     * the configured mail transport. A mail exception rolls the user insert
     * back with the transaction, except for an explicitly approved local demo
     * bypass.
     *
     * @param  array{first_name: string, last_name: string, email: string, password: string}  $attributes
     */
    public function register(array $attributes, bool $bypassEmailVerification = false): User
    {
        return DB::transaction(function () use ($attributes, $bypassEmailVerification): User {
            $user = User::create([
                'first_name' => $attributes['first_name'],
                'last_name' => $attributes['last_name'],
                'email' => $attributes['email'],
                'password' => Hash::make($attributes['password']),
                'email_verified_at' => $bypassEmailVerification ? now() : null,
            ]);

            if (! $bypassEmailVerification) {
                $this->sendVerificationEmail($user);
            }

            return $user;
        });
    }

    protected function sendVerificationEmail(User $user): void
    {
        $user->sendEmailVerificationNotification();
    }
}
