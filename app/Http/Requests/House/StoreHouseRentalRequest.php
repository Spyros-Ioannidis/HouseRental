<?php

namespace App\Http\Requests\House;

use App\Models\House;
use App\Models\HouseRental;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class StoreHouseRentalRequest extends FormRequest
{
    public function authorize(): bool
    {
        $house = $this->route('house');

        return $this->user()
            && $house instanceof House
            && Gate::allows('create', [HouseRental::class, $house]);
    }

    public function rules(): array
    {
        $house = $this->route('house');
        $houseId = $house instanceof House ? $house->id : null;

        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('role', 'user')),
                Rule::unique('house_rentals', 'user_id')
                    ->where(fn ($query) => $query->where('house_id', $houseId))
                    ->whereNull('revoked_at'),
            ],
            'starts_on' => ['nullable', 'date'],
            'ends_on' => ['nullable', 'date', 'after_or_equal:starts_on'],
        ];
    }
}
