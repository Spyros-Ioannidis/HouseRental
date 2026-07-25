<?php

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

test('users can update profile fields and profile picture with validation', function () {
    Storage::fake('public');

    $user = User::factory()->create(['role' => 'user']);

    $this
        ->actingAs($user)
        ->post('/dashboard/profile', [
            'first_name' => 'Nikos',
            'last_name' => 'Tenant',
            'contact_phone' => '+30 210 000 0000',
            'contact_email' => 'contact@example.com',
        ])
        ->assertRedirect();

    $user->refresh();

    expect($user->first_name)->toBe('Nikos')
        ->and($user->contact_email)->toBe('contact@example.com');

    $this
        ->actingAs($user)
        ->post('/dashboard/profile', [
            'first_name' => '',
            'last_name' => 'Tenant',
        ])
        ->assertSessionHasErrors('first_name');

    $this
        ->actingAs($user)
        ->post('/dashboard/profile-picture', [
            'profile_picture' => UploadedFile::fake()->image('avatar.png', 300, 300),
        ])
        ->assertRedirect();

    expect($user->refresh()->profile_picture)->toContain("/storage/profile-pictures/{$user->id}/");

    $this
        ->actingAs($user)
        ->post('/dashboard/profile-picture', [
            'profile_picture' => UploadedFile::fake()->create('avatar.txt', 10, 'text/plain'),
        ])
        ->assertSessionHasErrors('profile_picture');
});

test('users can update email and password only with valid credentials', function () {
    Notification::fake();

    $emailUser = User::factory()->create(['role' => 'user', 'email' => 'old@example.com']);

    $this
        ->actingAs($emailUser)
        ->put('/dashboard/email', [
            'email' => 'new@example.com',
            'current_password' => 'Password#123',
        ])
        ->assertRedirect(route('verification.notice'));

    $emailUser->refresh();

    expect($emailUser->email)->toBe('new@example.com')
        ->and($emailUser->email_verified_at)->toBeNull();

    Notification::assertSentTo($emailUser, VerifyEmail::class);

    $passwordUser = User::factory()->create(['role' => 'user']);

    $this
        ->actingAs($passwordUser)
        ->put('/dashboard/password', [
            'current_password' => 'wrong-password',
            'password' => 'NewPassword#123',
            'password_confirmation' => 'NewPassword#123',
        ])
        ->assertSessionHasErrors('current_password');

    $this
        ->actingAs($passwordUser)
        ->put('/dashboard/password', [
            'current_password' => 'Password#123',
            'password' => 'NewPassword#123',
            'password_confirmation' => 'NewPassword#123',
        ])
        ->assertRedirect();

    expect(Hash::check('NewPassword#123', $passwordUser->refresh()->password))->toBeTrue();
});

test('admin user create and update respects roles and verification flags', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this
        ->actingAs($admin)
        ->post('/admin/users', [
            'first_name' => 'Maria',
            'last_name' => 'Agent',
            'email' => 'maria@example.com',
            'role' => 'agent',
            'password' => 'Password#123',
            'password_confirmation' => 'Password#123',
            'contact_phone' => '+30 210 000 0000',
            'contact_email' => 'maria.contact@example.com',
            'profile_picture' => '/storage/DefaultProfilePicture.jpg',
            'email_verified' => true,
        ])
        ->assertRedirect(route('admin.users'));

    $created = User::where('email', 'maria@example.com')->firstOrFail();

    expect($created->role)->toBe('agent')
        ->and($created->email_verified_at)->not->toBeNull()
        ->and(Hash::check('Password#123', $created->password))->toBeTrue();

    $this
        ->actingAs($admin)
        ->put("/admin/users/{$created->id}", [
            'first_name' => 'Maria',
            'last_name' => 'Manager',
            'email' => 'maria.manager@example.com',
            'role' => 'admin',
            'password' => '',
            'password_confirmation' => '',
            'contact_phone' => '',
            'contact_email' => '',
            'profile_picture' => '',
            'email_verified' => false,
        ])
        ->assertRedirect();

    $created->refresh();

    expect($created->role)->toBe('admin')
        ->and($created->email_verified_at)->toBeNull();
});

test('admin user deletion respects self delete and last admin restrictions', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);

    $this
        ->actingAs($admin)
        ->delete("/admin/users/{$user->id}")
        ->assertRedirect(route('admin.users'));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);

    $this
        ->actingAs($admin)
        ->delete("/admin/users/{$admin->id}")
        ->assertForbidden();

    $this
        ->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$admin->id}", [
            'first_name' => $admin->first_name,
            'last_name' => $admin->last_name,
            'email' => $admin->email,
            'role' => 'user',
            'password' => '',
            'password_confirmation' => '',
            'contact_phone' => $admin->contact_phone,
            'contact_email' => $admin->contact_email,
            'profile_picture' => $admin->profile_picture,
            'email_verified' => true,
        ])
        ->assertRedirect('/admin/users')
        ->assertSessionHasErrors('role');

    expect($admin->refresh()->role)->toBe('admin');
});
