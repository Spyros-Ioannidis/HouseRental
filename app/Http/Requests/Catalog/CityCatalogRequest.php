<?php

namespace App\Http\Requests\Catalog;

use App\Models\City;
use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class CityCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        $city = $this->route('city');

        if (! $city) {
            return Gate::allows('create', City::class);
        }

        $city = $city instanceof City
            ? $city
            : City::findOrFail($city);

        return Gate::allows('update', $city);
    }

    public function rules(): array
    {
        $city = $this->route('city');
        $cityId = $city instanceof City ? $city->id : $city;

        return [
            'name' => [
                'required',
                ...FieldRules::catalogName(),
                Rule::unique('cities', 'name')->ignore($cityId),
            ],
            'name_en' => ['nullable', ...FieldRules::catalogName()],
            'name_el' => ['nullable', ...FieldRules::catalogName()],
        ];
    }
}
