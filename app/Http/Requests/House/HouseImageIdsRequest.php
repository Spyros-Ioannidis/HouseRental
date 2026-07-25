<?php

namespace App\Http\Requests\House;

use App\Models\House;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class HouseImageIdsRequest extends FormRequest
{
    public function authorize(): bool
    {
        if ($this->route('draft')) {
            return Gate::allows('create', House::class);
        }

        $house = $this->route('house');

        if (! $house) {
            return Gate::allows('create', House::class);
        }

        $house = $house instanceof House
            ? $house
            : House::findOrFail($house);

        return Gate::allows('manageImages', $house);
    }

    public function rules(): array
    {
        return [
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'distinct'],
        ];
    }
}
