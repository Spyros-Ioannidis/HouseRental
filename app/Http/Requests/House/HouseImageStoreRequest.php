<?php

namespace App\Http\Requests\House;

use App\Models\House;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class HouseImageStoreRequest extends FormRequest
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
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,webp',
            ],
        ];
    }
}
