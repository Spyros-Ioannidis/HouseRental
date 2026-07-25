<?php

namespace App\Http\Requests\House;

use App\Models\House;
use App\Services\House\Management\HouseValidationRules;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class StoreHouseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return Gate::allows('create', House::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge([
            'creation_token' => ['required', 'uuid'],
        ], app(HouseValidationRules::class)->rules(false, $this->user()));
    }

    protected function failedValidation(Validator $validator): void
    {
        Inertia::flash([
            'message' => __('ui.flash.house_create_failed'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        throw new HttpResponseException(
            back()
                ->withErrors($validator)
                ->withInput()
        );
    }
}
