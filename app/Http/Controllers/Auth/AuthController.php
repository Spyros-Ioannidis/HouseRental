<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\Auth\RegistrationService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Throwable;

class AuthController extends Controller
{
    public function page_login()
    {
        return Inertia::render('Auth/Login');
    }

    public function page_register()
    {
        return Inertia::render('Auth/Register');
    }

    public function page_verify()
    {
        return Inertia::render('Auth/VerifyEmail');
    }

    public function page_forgot_password()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    public function page_reset_password(Request $request, string $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email'),
        ]);
    }

    public function login(LoginRequest $request)
    {
        $attributes = $request->validated();

        if (! Auth::attempt($attributes)) {
            return back()
                ->withErrors(['password' => 'Invalid email or password.'])
                ->withInput();
        }

        $request->session()->regenerate();

        if (! $request->user()->hasVerifiedEmail()) {
            Inertia::flash([
                'message' => 'Please verify your email before continuing.',
                'flash_id' => now()->getTimestampMs(),
            ]);

            return redirect()->route('verification.notice');
        }

        Inertia::flash([
            'message' => 'You are now logged in.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->intended('/');
    }

    public function register(RegisterRequest $request, RegistrationService $registrationService)
    {
        $attributes = $request->validated();
        $bypassEmailVerification = $request->boolean('bypass_email_verification');

        try {
            $user = $registrationService->register($attributes, $bypassEmailVerification);
        } catch (Throwable $exception) {
            report($exception);

            return back()
                ->withErrors([
                    'email' => 'We could not send the verification email. Please try again shortly.',
                ])
                ->withInput();
        }

        Auth::login($user);

        if ($bypassEmailVerification) {
            Inertia::flash([
                'message' => 'Registration complete. Email verification was bypassed for the local demo.',
                'flash_id' => now()->getTimestampMs(),
            ]);

            return redirect('/dashboard');
        }

        Inertia::flash([
            'message' => 'A verification email has been sent. Please verify before continuing.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('verification.notice');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with([
            'message' => __('ui.flash.logged_out'),
            'type' => 'success',
            'flash_id' => now()->getTimestampMs(),
        ]);
    }

    public function sendVerification(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            Inertia::flash([
                'message' => 'Your email is already verified.',
                'flash_id' => now()->getTimestampMs(),
            ]);

            return back();
        }

        $user->sendEmailVerificationNotification();
        Inertia::flash([
            'message' => 'Verification email sent.',
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function sendPasswordResetLink(ForgotPasswordRequest $request)
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status !== Password::RESET_LINK_SENT) {
            return back()
                ->withErrors(['email' => __($status)])
                ->withInput();
        }

        Inertia::flash([
            'message' => __($status),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function resetPassword(ResetPasswordRequest $request)
    {
        $attributes = $request->validated();

        $status = Password::reset(
            $attributes,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            return back()
                ->withErrors(['email' => __($status)])
                ->withInput($request->only('email'));
        }

        Inertia::flash([
            'message' => __($status),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('login');
    }
}
