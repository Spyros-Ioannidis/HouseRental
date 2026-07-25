<?php

namespace App\Http\Requests\Catalog;

use App\Models\Feature;
use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class FeatureCatalogRequest extends FormRequest
{
    public function authorize(): bool
    {
        $feature = $this->route('feature');

        if (! $feature) {
            return Gate::allows('create', Feature::class);
        }

        $feature = $feature instanceof Feature
            ? $feature
            : Feature::findOrFail($feature);

        return Gate::allows('update', $feature);
    }

    public function rules(): array
    {
        $feature = $this->route('feature');
        $featureId = $feature instanceof Feature ? $feature->id : $feature;

        return [
            'name' => [
                'required',
                ...FieldRules::catalogName(),
                Rule::unique('features', 'name')->ignore($featureId),
            ],
            'name_en' => ['nullable', ...FieldRules::catalogName()],
            'name_el' => ['nullable', ...FieldRules::catalogName()],
        ];
    }
}
