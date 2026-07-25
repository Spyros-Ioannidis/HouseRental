<?php

namespace App\Http\Requests\User;

use App\Support\FieldRules;
use App\Support\PasswordRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class UpdateEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && Gate::allows('update', $this->user());
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                ...FieldRules::email(),
                Rule::unique('users', 'email')->ignore($this->user()->id),
            ],
            'current_password' => ['required', ...PasswordRules::current()],
        ];
    }
}
