<?php

namespace App\Http\Requests\House;

use App\Models\House;
use App\Services\House\Management\HouseValidationRules;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UpdateHouseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $house = $this->route('house');

        return $this->user()
            && $house instanceof House
            && Gate::allows('update', $house)
            && ! $house->trashed();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $house = $this->route('house');

        return app(HouseValidationRules::class)->rules(
            true,
            $this->user(),
            $house instanceof House ? $house : null,
        );
    }

    protected function failedValidation(Validator $validator): void
    {
        Inertia::flash([
            'message' => __('ui.flash.house_update_failed'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        throw new HttpResponseException(
            back()->withErrors($validator)
        );
    }
}
