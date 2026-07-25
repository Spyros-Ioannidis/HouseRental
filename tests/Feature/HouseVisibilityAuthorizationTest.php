<?php

use App\Models\City;
use App\Models\House;
use App\Models\HouseRental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function houseVisibilityCity(): City
{
    return City::firstOrCreate(
        ['name' => 'Larisa'],
        ['name_en' => 'Larisa', 'name_el' => null],
    );
}

function houseVisibilityHouse(User $owner, array $attributes = []): House
{
    $city = houseVisibilityCity();
    $title = $attributes['title_en'] ?? 'Visibility House ' . uniqid();

    return House::create([
        'user_id' => $owner->id,
        'title' => $title,
        'title_en' => $title,
        'title_el' => null,
        'description' => 'A test listing for visibility coverage.',
        'description_en' => 'A test listing for visibility coverage.',
        'description_el' => null,
        'year_built' => 2018,
        'address' => '12 Visibility Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => $attributes['status'] ?? House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 72,
        'price' => 850,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

test('guests see only active public houses in the public index', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $active = houseVisibilityHouse($agent, ['status' => House::STATUS_ACTIVE]);

    foreach ([
        House::STATUS_HIDDEN,
        House::STATUS_PENDING_REVIEW,
        House::STATUS_RESERVED,
        House::STATUS_RENTED,
        House::STATUS_ARCHIVED,
        House::STATUS_DELETED,
    ] as $status) {
        houseVisibilityHouse($agent, ['status' => $status]);
    }

    $softDeleted = houseVisibilityHouse($agent, ['status' => House::STATUS_ACTIVE]);
    $softDeleted->delete();

    $this
        ->get('/en/houses')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Houses')
            ->has('houses.data', 1)
            ->where('houses.data.0.id', $active->id)
        );
});

test('guests cannot open protected house statuses', function (string $status) {
    $agent = User::factory()->create(['role' => 'agent']);
    $house = houseVisibilityHouse($agent, ['status' => $status]);

    $this->get("/en/houses/{$house->id}")->assertNotFound();
})->with([
    House::STATUS_HIDDEN,
    House::STATUS_PENDING_REVIEW,
    House::STATUS_RESERVED,
    House::STATUS_RENTED,
    House::STATUS_ARCHIVED,
    House::STATUS_DELETED,
]);

test('guests can open active houses but not soft deleted houses', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $active = houseVisibilityHouse($agent, ['status' => House::STATUS_ACTIVE]);
    $softDeleted = houseVisibilityHouse($agent, ['status' => House::STATUS_ACTIVE]);
    $softDeleted->delete();

    $this->get("/en/houses/{$active->id}")->assertOk();
    $this->get("/en/houses/{$softDeleted->id}")->assertNotFound();
});

test('admins owning agents and confirmed renters can open protected listings', function () {
    $owner = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $admin = User::factory()->create(['role' => 'admin']);
    $renter = User::factory()->create(['role' => 'user']);
    $otherUser = User::factory()->create(['role' => 'user']);
    $house = houseVisibilityHouse($owner, ['status' => House::STATUS_RESERVED]);

    HouseRental::factory()->create([
        'house_id' => $house->id,
        'user_id' => $renter->id,
        'revoked_at' => null,
    ]);

    $this->actingAs($admin)->get("/en/houses/{$house->id}")->assertOk();
    $this->actingAs($owner)->get("/en/houses/{$house->id}")->assertOk();
    $this->actingAs($renter)->get("/en/houses/{$house->id}")->assertOk();

    $this->actingAs($otherAgent)->get("/en/houses/{$house->id}")->assertNotFound();
    $this->actingAs($otherUser)->get("/en/houses/{$house->id}")->assertNotFound();
});

test('admin house index is global while agent house index is owner scoped', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $admin = User::factory()->create(['role' => 'admin']);

    $ownHouse = houseVisibilityHouse($agent);
    houseVisibilityHouse($otherAgent);

    $this
        ->actingAs($admin)
        ->get('/admin/houses')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/House/HouseIndex')
            ->has('houses.data', 2)
        );

    $this
        ->actingAs($agent)
        ->get('/admin/houses')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/House/HouseIndex')
            ->has('houses.data', 1)
            ->where('houses.data.0.id', $ownHouse->id)
        );
});
