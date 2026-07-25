<?php

namespace App\Http\Requests\House;

use App\Models\House;
use App\Models\HouseComment;
use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class StoreHouseCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $house = $this->route('house');

        return $this->user()
            && $house instanceof House
            && Gate::allows('create', [HouseComment::class, $house]);
    }

    public function rules(): array
    {
        return [
            'content' => ['required', ...FieldRules::houseComment()],
        ];
    }

    protected function prepareForValidation(): void
    {
        $content = $this->input('content');

        if (is_string($content)) {
            $this->merge(['content' => trim($content)]);
        }
    }
}
