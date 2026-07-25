<?php

namespace App\Http\Requests\User;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class UpdateProfilePictureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && Gate::allows('update', $this->user());
    }

    public function rules(): array
    {
        return [
            'profile_picture' => ['required', ...FieldRules::profilePictureImage()],
        ];
    }
}
