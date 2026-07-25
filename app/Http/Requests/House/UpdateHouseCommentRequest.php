<?php

namespace App\Http\Requests\House;

use App\Models\HouseComment;
use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateHouseCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $comment = $this->route('comment');

        return $this->user()
            && $comment instanceof HouseComment
            && Gate::allows('update', $comment);
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
