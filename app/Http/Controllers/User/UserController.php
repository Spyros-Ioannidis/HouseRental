<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AdminStoreUserRequest;
use App\Http\Requests\User\AdminUpdateUserProfilePictureRequest;
use App\Http\Requests\User\AdminUpdateUserRequest;
use App\Http\Requests\User\UpdateEmailRequest;
use App\Http\Requests\User\UpdatePasswordRequest;
use App\Http\Requests\User\UpdateProfilePictureRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Models\User;
use App\Services\User\UserListingService;
use App\Services\User\UserManagementService;
use App\Services\User\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request, UserListingService $users)
    {
        Gate::authorize('viewAny', User::class);

        return Inertia::render('Admin/User/UserIndex', [
            'users' => $users->adminIndex($request),
            'filters' => $request->only(['search', 'sortKey', 'sortDirection', 'role']),
            'roles' => $users->adminRoleOptions(),
            'userRoutes' => [
                'create' => route('admin.users.create'),
                'store' => route('admin.users.store'),
            ],
        ]);
    }

    public function create(UserListingService $users)
    {
        Gate::authorize('create', User::class);

        return Inertia::render('Admin/User/UserCreate', [
            'roles' => $users->adminRoleOptions(),
            'userRoutes' => [
                'index' => route('admin.users'),
                'store' => route('admin.users.store'),
            ],
        ]);
    }

    public function store(AdminStoreUserRequest $request, UserManagementService $users)
    {
        $users->create($request->validated());

        Inertia::flash([
            'message' => 'User created.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.users');
    }

    public function show(string $locale, Request $request, User $user, UserListingService $users)
    {
        abort_unless(Gate::allows('view', $user), 404);

        $page = $users->sellerPage($user, $request);

        return inertia('SellerPage', [
            'user' => $user->only([
                'id',
                'first_name',
                'last_name',
                'name',
                'role',
                'profile_picture',
            ]),
            'houses' => $page['houses'],
            'stats' => $page['stats'],
        ]);
    }

    public function contact(User $user, string $type): JsonResponse
    {
        abort_unless(Gate::allows('viewContact', [$user, $type]), 404);

        $value = match ($type) {
            'phone' => $user->contact_phone,
            'email' => $user->contact_email ?? $user->email,
            default => null,
        };

        return response()->json([
            'label' => $type,
            'value' => $value,
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request, UserProfileService $profiles)
    {
        $profiles->updateProfile($request->user(), $request->validated());

        Inertia::flash('message', 'Profile updated.');

        return back();
    }

    public function updateProfilePicture(UpdateProfilePictureRequest $request, UserProfileService $profiles)
    {
        $attributes = $request->validated();

        $profiles->updateProfilePicture($request->user(), $attributes['profile_picture']);

        Inertia::flash('message', 'Profile picture updated.');

        return back();
    }

    public function updateEmail(UpdateEmailRequest $request, UserProfileService $profiles)
    {
        $attributes = $request->validated();

        if (! $profiles->updateEmail($request->user(), $attributes['email'])) {
            Inertia::flash('message', 'Email unchanged.');

            return back();
        }

        Inertia::flash('message', 'Email updated. Please verify your new email before continuing.');

        return redirect()->route('verification.notice');
    }

    public function updatePassword(UpdatePasswordRequest $request, UserProfileService $profiles)
    {
        $attributes = $request->validated();

        $profiles->updatePassword($request->user(), $attributes['password']);

        Inertia::flash('message', 'Password updated.');

        return back();
    }

    public function edit(Request $request, User $user, UserListingService $users)
    {
        Gate::authorize('update', $user);

        return Inertia::render('Admin/User/UserEdit', [
            'managedUser' => $users->adminDetail($user, $request->user()),
            'roles' => $users->adminRoleOptions(),
            'userRoutes' => [
                'index' => route('admin.users'),
            ],
        ]);
    }

    public function update(AdminUpdateUserRequest $request, User $user, UserManagementService $users)
    {
        $users->update($user, $request->user(), $request->validated());

        Inertia::flash([
            'message' => 'User updated.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function updateManagedProfilePicture(AdminUpdateUserProfilePictureRequest $request, User $user, UserManagementService $users)
    {
        $attributes = $request->validated();

        $users->updateProfilePicture($user, $attributes['profile_picture']);

        Inertia::flash([
            'message' => 'Profile picture updated.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function destroy(Request $request, User $user, UserManagementService $users)
    {
        Gate::authorize('delete', $user);

        $users->delete($user, $request->user());

        Inertia::flash([
            'message' => 'User deleted.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.users');
    }
}
