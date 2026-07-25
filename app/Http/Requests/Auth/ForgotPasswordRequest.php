<?php

namespace App\Http\Requests\Auth;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;

class ForgotPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', ...FieldRules::email()],
        ];
    }
}
