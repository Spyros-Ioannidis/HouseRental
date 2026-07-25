<?php

namespace App\Http\Requests\Auth;

use App\Support\FieldRules;
use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', ...FieldRules::personName()],
            'last_name' => ['required', ...FieldRules::personName()],
            'email' => ['required', ...FieldRules::email(), Rule::unique('users', 'email')],
            'password' => ['required', ...PasswordRules::strong(), 'confirmed'],
            'bypass_email_verification' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'first_name' => trim((string) $this->input('first_name')),
            'last_name' => trim((string) $this->input('last_name')),
        ]);
    }
}
