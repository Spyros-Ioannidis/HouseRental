<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/email/verify', [AuthController::class, 'page_verify'])->name('verification.notice');
    Route::post('/email/verification-notification', [AuthController::class, 'sendVerification'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
        $request->fulfill();

        Inertia::flash([
            'message' => 'Email verified.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect('/dashboard');
    })->middleware(['signed', 'throttle:6,1'])->name('verification.verify');
});

Route::middleware('guest')->controller(AuthController::class)->group(function () {
    Route::get('/login', 'page_login')->name('login');
    Route::post('/login', 'login')->middleware('throttle:auth-login');

    Route::get('/register', 'page_register')->name('register');
    Route::post('/register', 'register')->middleware('throttle:auth-register');

    Route::get('/forgot-password', 'page_forgot_password')->name('password.request');
    Route::post('/forgot-password', 'sendPasswordResetLink')
        ->middleware('throttle:auth-password-email')
        ->name('password.email');
    Route::get('/reset-password/{token}', 'page_reset_password')->name('password.reset');
    Route::post('/reset-password', 'resetPassword')
        ->middleware('throttle:auth-password-reset')
        ->name('password.update');
});
