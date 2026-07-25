<?php

namespace App\Services\House\Management;

use App\Models\House;
use App\Models\User;
use App\Support\FieldRules;
use Illuminate\Validation\Rule;

class HouseValidationRules
{
    public function __construct(private HouseStatusService $statuses) {}

    public function rules(bool $partial = false, ?User $user = null, ?House $house = null): array
    {
        $required = $partial ? ['sometimes', 'required'] : ['required'];
        $features = $partial ? ['sometimes', 'array'] : ['nullable', 'array'];
        $optionalString = $partial ? ['sometimes', 'nullable'] : ['nullable'];
        $requiredCity = $partial ? ['sometimes', 'required'] : ['required'];

        return [
            'title_en' => array_merge($required, ['string', 'min:3', 'max:255']),
            'title_el' => array_merge($optionalString, ['string', 'min:3', 'max:255']),
            'agent' => array_merge($required, ['exists:users,id']),
            'address' => array_merge($required, ['string', 'min:3', 'max:120']),
            'city' => array_merge($requiredCity, [...FieldRules::catalogName(), Rule::exists('cities', 'name')]),
            'status' => array_merge($partial ? ['sometimes', 'required'] : ['nullable'], [
                Rule::in($this->statuses->valuesFor($user, $house, ! $partial)),
            ]),
            'latitude' => array_merge($optionalString, ['numeric', 'between:-90,90']),
            'longitude' => array_merge($optionalString, ['numeric', 'between:-180,180']),
            'description_en' => array_merge($required, ['string']),
            'description_el' => array_merge($optionalString, ['string']),

            'year_built' => array_merge($required, ['integer', 'between:1800,2100']),
            'area' => array_merge($required, ['integer', 'min:0']),
            'price' => array_merge($required, ['integer', 'min:0', 'max:99999']),

            'floor' => array_merge($required, ['integer', 'between:0,20']),
            'bathroom' => array_merge($required, ['integer', 'between:0,20']),
            'living_room' => array_merge($required, ['integer', 'between:0,20']),
            'bedroom' => array_merge($required, ['integer', 'between:0,20']),

            'features' => $features,
            'features.*' => ['exists:features,id'],
        ];
    }
}
