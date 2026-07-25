<?php

use App\Models\City;
use App\Models\Feature;
use App\Models\House;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function catalogSettingsHouse(User $agent, City $city): House
{
    return House::create([
        'user_id' => $agent->id,
        'title' => 'Catalog house',
        'title_en' => 'Catalog house',
        'title_el' => null,
        'description' => 'A listing tied to catalog data.',
        'description_en' => 'A listing tied to catalog data.',
        'description_el' => null,
        'year_built' => 2014,
        'address' => '60 Catalog Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 73,
        'price' => 830,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

test('contact settings validate and authorize correctly', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);

    $this
        ->actingAs($admin)
        ->put('/admin/settings/contact', [
            'email' => 'office@example.com',
            'phone' => '+30 210 111 1111',
            'office' => 'Athens Office',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('site_settings', [
        'key' => 'contact_email',
        'value' => 'office@example.com',
    ]);

    $this
        ->actingAs($admin)
        ->put('/admin/settings/contact', [
            'email' => 'not-an-email',
            'phone' => '+30 210 111 1111',
            'office' => 'Athens Office',
        ])
        ->assertSessionHasErrors('email');

    $this
        ->actingAs($agent)
        ->put('/admin/settings/contact', [
            'email' => 'agent@example.com',
            'phone' => '+30 210 111 1111',
            'office' => 'Agent Office',
        ])
        ->assertForbidden();
});

test('cities validate authorize and cannot be deleted while in use', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);

    $this
        ->actingAs($admin)
        ->post('/admin/settings/cities', [
            'name' => 'Volos',
            'name_en' => 'Volos',
            'name_el' => 'Volos',
        ])
        ->assertRedirect();

    $city = City::where('name', 'Volos')->firstOrFail();

    $this
        ->actingAs($admin)
        ->put("/admin/settings/cities/{$city->id}", [
            'name' => 'Trikala',
            'name_en' => 'Trikala',
            'name_el' => null,
        ])
        ->assertRedirect();

    expect($city->refresh()->name)->toBe('Trikala');

    catalogSettingsHouse($agent, $city);

    $this
        ->actingAs($admin)
        ->from('/admin/settings')
        ->delete("/admin/settings/cities/{$city->id}")
        ->assertRedirect('/admin/settings')
        ->assertSessionHasErrors('city');

    $this->assertDatabaseHas('cities', ['id' => $city->id]);

    $this
        ->actingAs($agent)
        ->post('/admin/settings/cities', [
            'name' => 'Agent City',
            'name_en' => 'Agent City',
        ])
        ->assertForbidden();
});

test('features validate authorize and can be created updated and deleted consistently', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);

    $this
        ->actingAs($admin)
        ->post('/admin/settings/features', [
            'name' => 'Balcony',
            'name_en' => 'Balcony',
            'name_el' => null,
        ])
        ->assertRedirect();

    $feature = Feature::where('name', 'Balcony')->firstOrFail();

    $this
        ->actingAs($admin)
        ->put("/admin/settings/features/{$feature->id}", [
            'name' => 'Garden',
            'name_en' => 'Garden',
            'name_el' => null,
        ])
        ->assertRedirect();

    expect($feature->refresh()->name)->toBe('Garden');

    $this
        ->actingAs($admin)
        ->delete("/admin/settings/features/{$feature->id}")
        ->assertRedirect();

    $this->assertDatabaseMissing('features', ['id' => $feature->id]);

    $this
        ->actingAs($agent)
        ->post('/admin/settings/features', [
            'name' => 'Agent Feature',
            'name_en' => 'Agent Feature',
        ])
        ->assertForbidden();
});
