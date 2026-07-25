<?php

namespace App\Http\Requests\User;

use App\Models\User;
use App\Support\FieldRules;
use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AdminUpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('user'));
    }

    public function rules(): array
    {
        $user = $this->route('user');

        return [
            'first_name' => ['required', ...FieldRules::personName()],
            'last_name' => ['required', ...FieldRules::personName()],
            'email' => [
                'required',
                ...FieldRules::email(),
                Rule::unique('users', 'email')->ignore($user instanceof User ? $user->id : $user),
            ],
            'role' => ['required', 'string', Rule::in(['user', 'agent', 'admin'])],
            'password' => ['nullable', ...PasswordRules::strong(), 'confirmed'],
            'contact_phone' => ['nullable', ...FieldRules::phone(40)],
            'contact_email' => ['nullable', ...FieldRules::email()],
            'profile_picture' => ['nullable', ...FieldRules::profilePicturePath()],
            'email_verified' => ['required', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $attributes = [
            'first_name' => trim((string) $this->input('first_name')),
            'last_name' => trim((string) $this->input('last_name')),
            'email' => trim((string) $this->input('email')),
            'contact_phone' => $this->filled('contact_phone')
                ? trim((string) $this->input('contact_phone'))
                : null,
            'contact_email' => $this->filled('contact_email')
                ? trim((string) $this->input('contact_email'))
                : null,
            'email_verified' => $this->boolean('email_verified'),
        ];

        if ($this->has('profile_picture')) {
            $attributes['profile_picture'] = $this->filled('profile_picture')
                ? trim((string) $this->input('profile_picture'))
                : null;
        }

        $this->merge($attributes);
    }
}
