<?php

namespace App\Http\Requests\Settings;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateContactSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'email' => ['required', ...FieldRules::email()],
            'phone' => ['required', ...FieldRules::phone()],
            'office' => ['required', 'string', 'max:255'],
        ];
    }
}
