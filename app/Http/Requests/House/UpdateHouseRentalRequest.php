<?php

namespace App\Http\Requests\House;

use App\Models\HouseRental;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateHouseRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $rental = $this->route('rental');

        return $this->user()
            && $rental instanceof HouseRental
            && Gate::allows('update', $rental);
    }

    public function rules(): array
    {
        return [
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
        ];
    }
}
