<?php

use App\Models\City;
use App\Models\House;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function adminHouseManagementCity(): City
{
    return City::firstOrCreate(
        ['name' => 'Larisa'],
        ['name_en' => 'Larisa', 'name_el' => null],
    );
}

function adminHouseManagementStartDraft($test, User $user): string
{
    $test
        ->actingAs($user)
        ->get('/admin/houses/create')
        ->assertOk();

    $draft = session('house_create.draft_token');

    expect($draft)->toBeString()->not->toBe('');

    return $draft;
}

function adminHouseManagementStorePayload(User $agent, string $draft, array $overrides = []): array
{
    $city = adminHouseManagementCity();

    return array_merge([
        'creation_token' => $draft,
        'title_en' => 'Managed central apartment',
        'title_el' => null,
        'agent' => $agent->id,
        'address' => '14 Admin Street',
        'city' => $city->name,
        'status' => House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'description_en' => 'A bright managed apartment close to the center.',
        'description_el' => null,
        'year_built' => 2019,
        'area' => 80,
        'price' => 900,
        'floor' => 3,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
        'features' => [],
    ], $overrides);
}

function adminHouseManagementUpdatePayload(User $agent, array $overrides = []): array
{
    $city = adminHouseManagementCity();

    return array_merge([
        'title_en' => 'Updated managed apartment',
        'title_el' => null,
        'agent' => $agent->id,
        'address' => '18 Updated Street',
        'city' => $city->name,
        'status' => House::STATUS_HIDDEN,
        'latitude' => '39.6400000',
        'longitude' => '22.4200000',
        'description_en' => 'An updated description for the managed apartment.',
        'description_el' => null,
        'year_built' => 2020,
        'area' => 82,
        'price' => 950,
        'floor' => 4,
        'bathroom' => 2,
        'living_room' => 1,
        'bedroom' => 2,
        'features' => [],
    ], $overrides);
}

function adminHouseManagementHouse(User $agent, array $attributes = []): House
{
    $city = adminHouseManagementCity();
    $title = $attributes['title_en'] ?? 'Managed House ' . uniqid();

    return House::create([
        'user_id' => $agent->id,
        'title' => $title,
        'title_en' => $title,
        'title_el' => null,
        'description' => 'A managed listing.',
        'description_en' => 'A managed listing.',
        'description_el' => null,
        'year_built' => 2018,
        'address' => '22 Managed Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => $attributes['status'] ?? House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 70,
        'price' => 780,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

test('admins can create and update houses through form requests', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);
    $draft = adminHouseManagementStartDraft($this, $admin);

    $this
        ->actingAs($admin)
        ->post('/admin/houses', adminHouseManagementStorePayload($agent, $draft))
        ->assertRedirect();

    $house = House::where('title_en', 'Managed central apartment')->firstOrFail();

    expect($house->user_id)->toBe($agent->id)
        ->and($house->status)->toBe(House::STATUS_ACTIVE);

    $this
        ->actingAs($admin)
        ->put("/admin/houses/{$house->id}/update", adminHouseManagementUpdatePayload($agent, [
            'price' => 1100,
        ]))
        ->assertRedirect();

    $house->refresh();

    expect($house->title_en)->toBe('Updated managed apartment')
        ->and($house->price)->toBe(1100)
        ->and($house->status)->toBe(House::STATUS_HIDDEN);
});

test('agents can create pending houses and update only their own listings', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $draft = adminHouseManagementStartDraft($this, $agent);

    $this
        ->actingAs($agent)
        ->post('/admin/houses', adminHouseManagementStorePayload($otherAgent, $draft, [
            'status' => House::STATUS_PENDING_REVIEW,
        ]))
        ->assertRedirect();

    $house = House::where('title_en', 'Managed central apartment')->firstOrFail();

    expect($house->user_id)->toBe($agent->id)
        ->and($house->status)->toBe(House::STATUS_PENDING_REVIEW);

    $this
        ->actingAs($agent)
        ->put("/admin/houses/{$house->id}/update", adminHouseManagementUpdatePayload($otherAgent))
        ->assertRedirect();

    $house->refresh();

    expect($house->user_id)->toBe($agent->id)
        ->and($house->title_en)->toBe('Updated managed apartment');
});

test('agents cannot manage houses owned by other agents', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $house = adminHouseManagementHouse($otherAgent);

    $this->actingAs($agent)->get("/admin/houses/{$house->id}/edit")->assertForbidden();

    $this
        ->actingAs($agent)
        ->put("/admin/houses/{$house->id}/update", adminHouseManagementUpdatePayload($agent))
        ->assertForbidden();

    $this->actingAs($agent)->delete("/admin/houses/{$house->id}")->assertForbidden();
});

test('delete restore and force delete follow house policy behavior', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $admin = User::factory()->create(['role' => 'admin']);
    $house = adminHouseManagementHouse($agent);

    $this
        ->actingAs($agent)
        ->delete("/admin/houses/{$house->id}")
        ->assertRedirect(route('admin.houses.index'));

    $deleted = House::withTrashed()->findOrFail($house->id);

    expect($deleted->trashed())->toBeTrue()
        ->and($deleted->status)->toBe(House::STATUS_DELETED);

    $this->actingAs($agent)->patch("/admin/houses/{$house->id}/restore")->assertForbidden();
    $this->actingAs($agent)->delete("/admin/houses/{$house->id}/force")->assertForbidden();

    $this
        ->actingAs($admin)
        ->patch("/admin/houses/{$house->id}/restore")
        ->assertRedirect(route('admin.houses.index'));

    $restored = House::findOrFail($house->id);

    expect($restored->trashed())->toBeFalse()
        ->and($restored->status)->toBe(House::STATUS_ARCHIVED);

    $forceDeleted = adminHouseManagementHouse($agent);
    $forceDeleted->delete();

    $this
        ->actingAs($admin)
        ->delete("/admin/houses/{$forceDeleted->id}/force")
        ->assertRedirect(route('admin.houses.index'));

    expect(House::withTrashed()->find($forceDeleted->id))->toBeNull();
});
