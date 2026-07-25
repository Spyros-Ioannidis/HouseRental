<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\UserDashboardController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', fn () => redirect()->route('user.dashboard.profile'))
        ->name('dashboard');

    Route::controller(UserDashboardController::class)
        ->prefix('/dashboard')
        ->name('user.dashboard.')
        ->group(function () {
            Route::get('/profile', 'profile')->name('profile');
            Route::get('/profile-picture', 'picture')->name('profile-picture');
            Route::get('/email', 'email')->name('email');
            Route::get('/password', 'password')->name('password');
            Route::get('/security', 'security')->name('security');
            Route::get('/favorites', 'favorites')
                ->middleware(RoleMiddleware::class . ':user')
                ->name('favorites');
        });

    Route::prefix('dashboard')->name('dashboard.')->group(function () {
        Route::controller(UserController::class)->group(function () {
            Route::post('/profile', 'updateProfile')->name('profile.update');
            Route::post('/profile-picture', 'updateProfilePicture')->name('profile-picture.update');
            Route::put('/email', 'updateEmail')->name('email.update');
            Route::put('/password', 'updatePassword')->name('password.update');
        });

        Route::post('/email-verification', [AuthController::class, 'sendVerification'])
            ->middleware('throttle:5,1')
            ->name('verification.send');
    });
});
