<?php

namespace App\Http\Requests\User;

use App\Support\FieldRules;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Gate;

class AdminUpdateUserProfilePictureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return Gate::allows('update', $this->route('user'));
    }

    public function rules(): array
    {
        return [
            'profile_picture' => ['required', ...FieldRules::profilePictureImage()],
        ];
    }
}
