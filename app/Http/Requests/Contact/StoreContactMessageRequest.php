<?php

namespace App\Http\Requests\Contact;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', ...FieldRules::email()],
            'phone' => ['nullable', ...FieldRules::phone()],
            'subject' => ['required', 'string', 'min:3', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:4000'],
            'agent_id' => ['nullable', 'integer'],
            'house_id' => ['nullable', 'integer'],
        ];
    }
}
