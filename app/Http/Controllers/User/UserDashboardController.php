<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;

use App\Services\User\UserProfileService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    private const COMPONENTS = [
        'email' => 'User/Dashboard/Email',
        'favorites' => 'User/Dashboard/Favorites',
        'password' => 'User/Dashboard/Password',
        'picture' => 'User/Dashboard/ProfilePicture',
        'profile' => 'User/Dashboard/Profile',
        'security' => 'User/Dashboard/Security',
    ];

    private function render(Request $request, string $section, array $props = []): Response
    {
        return Inertia::render(self::COMPONENTS[$section], [
            'user' => $request->user(),
            ...$props,
        ]);
    }

    public function profile(Request $request): Response
    {
        return $this->render($request, 'profile');
    }

    public function picture(Request $request): Response
    {
        return $this->render($request, 'picture');
    }

    public function email(Request $request): Response
    {
        return $this->render($request, 'email');
    }

    public function password(Request $request): Response
    {
        return $this->render($request, 'password');
    }

    public function security(Request $request): Response
    {
        return $this->render($request, 'security');
    }

    public function favorites(Request $request, UserProfileService $profiles): Response
    {
        return $this->render($request, 'favorites', [
            'favoriteHouses' => $profiles->favoriteHousesForDashboard($request->user())->values(),
        ]);
    }

}
