<?php

use App\Models\User;
use App\Services\Auth\RegistrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;

uses(RefreshDatabase::class);

function authSecurityServer(string $ip): array
{
    return ['REMOTE_ADDR' => $ip];
}

test('demo registration can bypass email verification', function () {
    Notification::fake();

    $this
        ->post('/register', [
            'first_name' => 'Demo',
            'last_name' => 'Bypass',
            'email' => 'demo-bypass@example.com',
            'password' => 'Password#123',
            'password_confirmation' => 'Password#123',
            'bypass_email_verification' => true,
        ])
        ->assertRedirect('/dashboard');

    $user = User::where('email', 'demo-bypass@example.com')->firstOrFail();

    expect($user->email_verified_at)->not->toBeNull();

    $this->assertAuthenticatedAs($user);
    Notification::assertNothingSent();
});

test('registration is rolled back when sending the verification email fails', function () {
    $registrationService = new class extends RegistrationService
    {
        protected function sendVerificationEmail(User $user): void
        {
            throw new RuntimeException('Mail transport is unavailable.');
        }
    };

    $this->app->instance(RegistrationService::class, $registrationService);

    $this
        ->post('/register', [
            'first_name' => 'Mail',
            'last_name' => 'Failure',
            'email' => 'mail-failure@example.com',
            'password' => 'Password#123',
            'password_confirmation' => 'Password#123',
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('email');

    expect(User::where('email', 'mail-failure@example.com')->exists())->toBeFalse();
    $this->assertGuest();
});

test('login requests are rate limited', function () {
    $payload = [
        'email' => 'limited-login@example.com',
        'password' => 'WrongPassword#123',
    ];

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this
            ->withServerVariables(authSecurityServer('203.0.113.10'))
            ->post('/login', $payload)
            ->assertRedirect();
    }

    $this
        ->withServerVariables(authSecurityServer('203.0.113.10'))
        ->post('/login', $payload)
        ->assertTooManyRequests();
});

test('registration requests are rate limited', function () {
    $payload = [
        'first_name' => 'Rate',
        'last_name' => 'Limited',
        'email' => 'limited-register@example.com',
        'password' => 'weak',
        'password_confirmation' => 'weak',
    ];

    for ($attempt = 0; $attempt < 3; $attempt++) {
        $this
            ->withServerVariables(authSecurityServer('203.0.113.11'))
            ->post('/register', $payload)
            ->assertRedirect();
    }

    $this
        ->withServerVariables(authSecurityServer('203.0.113.11'))
        ->post('/register', $payload)
        ->assertTooManyRequests();
});

test('forgot password requests are rate limited', function () {
    $payload = ['email' => 'limited-password-link@example.com'];

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this
            ->withServerVariables(authSecurityServer('203.0.113.12'))
            ->post('/forgot-password', $payload)
            ->assertRedirect();
    }

    $this
        ->withServerVariables(authSecurityServer('203.0.113.12'))
        ->post('/forgot-password', $payload)
        ->assertTooManyRequests();
});

test('verification resend requests are rate limited', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create(['role' => 'user']);

    for ($attempt = 0; $attempt < 6; $attempt++) {
        $this
            ->actingAs($user)
            ->withServerVariables(authSecurityServer('203.0.113.13'))
            ->post('/email/verification-notification')
            ->assertRedirect();
    }

    $this
        ->actingAs($user)
        ->withServerVariables(authSecurityServer('203.0.113.13'))
        ->post('/email/verification-notification')
        ->assertTooManyRequests();
});

test('unverified users cannot access verified dashboard or admin routes', function () {
    $user = User::factory()->unverified()->create(['role' => 'user']);
    $admin = User::factory()->unverified()->create(['role' => 'admin']);

    $this
        ->actingAs($user)
        ->get('/dashboard')
        ->assertRedirect(route('verification.notice'));

    $this
        ->actingAs($admin)
        ->get('/admin')
        ->assertRedirect(route('verification.notice'));
});
test('logout flashes a localized success message', function () {
    $user = User::factory()->create(['role' => 'user']);

    $this
        ->actingAs($user)
        ->post('/logout')
        ->assertRedirect('/')
        ->assertSessionHas('message', 'You have been signed out.');
});
