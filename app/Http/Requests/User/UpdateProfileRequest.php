<?php

namespace App\Http\Requests\User;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && Gate::allows('update', $this->user());
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', ...FieldRules::personName()],
            'last_name' => ['required', ...FieldRules::personName()],
            'contact_phone' => ['nullable', ...FieldRules::phone()],
            'contact_email' => ['nullable', ...FieldRules::email()],
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
