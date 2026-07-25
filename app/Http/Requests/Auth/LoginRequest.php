<?php

namespace App\Http\Requests\Auth;

use App\Support\FieldRules;
use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', ...FieldRules::email()],
            'password' => ['required', ...PasswordRules::basic()],
        ];
    }
}
