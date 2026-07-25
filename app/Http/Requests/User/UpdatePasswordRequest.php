<?php

namespace App\Http\Requests\User;

use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdatePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && Gate::allows('update', $this->user());
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', ...PasswordRules::current()],
            'password' => ['required', ...PasswordRules::strong(), 'confirmed'],
        ];
    }
}
