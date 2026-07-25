<?php

namespace App\Support;

use Illuminate\Validation\Rules\Password;

final class PasswordRules
{
    public static function basic(): array
    {
        return ['string', 'min:8', 'max:255'];
    }

    public static function strong(): array
    {
        return [
            'string',
            'max:255',
            Password::min(8)->letters()->numbers()->symbols(),
        ];
    }

    public static function current(): array
    {
        return ['current_password'];
    }
}
