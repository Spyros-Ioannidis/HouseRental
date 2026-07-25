<?php

use App\Models\City;
use App\Models\House;
use App\Models\HouseImage;
use App\Models\PendingHouseImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

function houseImageManagementHouse(User $agent): House
{
    $city = City::firstOrCreate(
        ['name' => 'Larisa'],
        ['name_en' => 'Larisa', 'name_el' => null],
    );

    return House::create([
        'user_id' => $agent->id,
        'title' => 'Image managed house',
        'title_en' => 'Image managed house',
        'title_el' => null,
        'description' => 'A listing used for image management tests.',
        'description_en' => 'A listing used for image management tests.',
        'description_el' => null,
        'year_built' => 2016,
        'address' => '40 Image Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 76,
        'price' => 820,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

function houseImageManagementStartDraft($test, User $user): string
{
    $test
        ->actingAs($user)
        ->get('/admin/houses/create')
        ->assertOk();

    $draft = session('house_create.draft_token');

    expect($draft)->toBeString()->not->toBe('');

    return $draft;
}

function houseImageManagementUpload(): array
{
    return ['file' => UploadedFile::fake()->image('room.jpg', 1200, 800)];
}

function houseImageManagementImage(House $house, int $order = 0): HouseImage
{
    return HouseImage::create([
        'house_id' => $house->id,
        'path' => "https://example.test/houses/{$house->id}/{$order}.jpg",
        'thumbnail_path' => null,
        'original_name' => "room-{$order}.jpg",
        'size' => 1000,
        'thumbnail_size' => null,
        'mime_type' => 'image/jpeg',
        'thumbnail_mime_type' => null,
        'order' => $order,
    ]);
}

test('upload validation accepts allowed images and rejects invalid files or sizes', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $house = houseImageManagementHouse($admin);

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/houses/{$house->id}/images", houseImageManagementUpload())
        ->assertOk()
        ->assertJsonStructure(['id', 'url', 'name', 'size']);

    expect(HouseImage::where('house_id', $house->id)->count())->toBe(1);

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/houses/{$house->id}/images", [
            'file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/houses/{$house->id}/images", [
            'file' => UploadedFile::fake()->image('too-large.jpg')->size(10241),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('file');
});

test('image max count is enforced for a house', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $house = houseImageManagementHouse($admin);

    for ($order = 0; $order < 20; $order++) {
        houseImageManagementImage($house, $order);
    }

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/houses/{$house->id}/images", houseImageManagementUpload())
        ->assertUnprocessable();
});

test('reorder and delete are scoped to the correct house and draft', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'admin']);
    $house = houseImageManagementHouse($admin);
    $otherHouse = houseImageManagementHouse($admin);
    $houseImage = houseImageManagementImage($house, 0);
    $otherHouseImage = houseImageManagementImage($otherHouse, 0);

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/houses/{$house->id}/images/reorder", [
            'ids' => [$houseImage->id, $otherHouseImage->id],
        ])
        ->assertUnprocessable();

    $this
        ->actingAs($admin)
        ->delete("/houses/{$house->id}/images/{$otherHouseImage->id}")
        ->assertNotFound();

    $draft = houseImageManagementStartDraft($this, $admin);
    $draftImageId = $this
        ->actingAs($admin)
        ->post("/admin/houses/create-drafts/{$draft}/images", houseImageManagementUpload())
        ->assertOk()
        ->json('id');

    session()->forget('house_create');
    $otherDraft = houseImageManagementStartDraft($this, $admin);
    $otherDraftImageId = $this
        ->actingAs($admin)
        ->post("/admin/houses/create-drafts/{$otherDraft}/images", houseImageManagementUpload())
        ->assertOk()
        ->json('id');

    session()->put('house_create.draft_token', $draft);
    session()->put('house_create.user_id', $admin->id);
    session()->put('house_create.session_id', PendingHouseImage::findOrFail($draftImageId)->session_id);
    session()->put('house_create.expires_at', now()->addHour()->toIso8601String());

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/admin/houses/create-drafts/{$draft}/images/reorder", [
            'ids' => [$draftImageId, $otherDraftImageId],
        ])
        ->assertUnprocessable();

    $this
        ->actingAs($admin)
        ->delete("/admin/houses/create-drafts/{$draft}/images/{$otherDraftImageId}")
        ->assertNotFound();
});

test('draft cancellation and expiration cannot affect another users draft', function () {
    Storage::fake('public');

    $baseNow = now();
    $owner = User::factory()->create(['role' => 'admin']);
    $other = User::factory()->create(['role' => 'admin']);

    $ownerDraft = houseImageManagementStartDraft($this, $owner);
    $ownerImageId = $this
        ->actingAs($owner)
        ->post("/admin/houses/create-drafts/{$ownerDraft}/images", houseImageManagementUpload())
        ->assertOk()
        ->json('id');
    $ownerSession = session('house_create');

    $otherDraft = houseImageManagementStartDraft($this, $other);
    $otherImageId = $this
        ->actingAs($other)
        ->post("/admin/houses/create-drafts/{$otherDraft}/images", houseImageManagementUpload())
        ->assertOk()
        ->json('id');

    PendingHouseImage::whereKey($otherImageId)->update([
        'expires_at' => $baseNow->copy()->addHours(4),
    ]);

    $this
        ->actingAs($other)
        ->delete("/admin/houses/create-drafts/{$ownerDraft}")
        ->assertNotFound();

    expect(PendingHouseImage::whereKey($ownerImageId)->exists())->toBeTrue();

    try {
        Carbon::setTestNow($baseNow->copy()->addHours(2));

        $this
            ->actingAs($owner)
            ->withSession(['house_create' => $ownerSession])
            ->post("/admin/houses/create-drafts/{$ownerDraft}/images", houseImageManagementUpload())
            ->assertStatus(419);
    } finally {
        Carbon::setTestNow();
    }

    expect(PendingHouseImage::whereKey($ownerImageId)->exists())->toBeFalse()
        ->and(PendingHouseImage::whereKey($otherImageId)->exists())->toBeTrue();
});
