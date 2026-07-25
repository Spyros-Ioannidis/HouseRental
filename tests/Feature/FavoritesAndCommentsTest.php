<?php

use App\Models\City;
use App\Models\House;
use App\Models\HouseComment;
use App\Models\HouseRental;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function favoritesCommentsHouse(User $agent, array $attributes = []): House
{
    $city = City::firstOrCreate(
        ['name' => 'Larisa'],
        ['name_en' => 'Larisa', 'name_el' => null],
    );
    $title = $attributes['title_en'] ?? 'Favorite Comment House ' . uniqid();

    return House::create([
        'user_id' => $agent->id,
        'title' => $title,
        'title_en' => $title,
        'title_el' => null,
        'description' => 'A listing used for favorites and comments.',
        'description_en' => 'A listing used for favorites and comments.',
        'description_el' => null,
        'year_built' => 2015,
        'address' => '50 Favorite Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => $attributes['status'] ?? House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 74,
        'price' => 840,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

function favoritesCommentsComment(House $house, User $user, string $content = 'Original comment'): HouseComment
{
    return HouseComment::create([
        'house_id' => $house->id,
        'user_id' => $user->id,
        'author_name' => $user->name,
        'content' => $content,
    ]);
}

test('only normal users can favorite public houses', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $admin = User::factory()->create(['role' => 'admin']);
    $user = User::factory()->create(['role' => 'user']);
    $house = favoritesCommentsHouse($agent);

    $this->post("/favorites/{$house->id}")->assertRedirect('/login');

    $this
        ->actingAs($agent)
        ->withHeader('Accept', 'application/json')
        ->post("/favorites/{$house->id}")
        ->assertForbidden();

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->post("/favorites/{$house->id}")
        ->assertForbidden();

    $this
        ->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post("/favorites/{$house->id}")
        ->assertOk()
        ->assertJsonPath('is_favorited', true)
        ->assertJsonPath('message', 'House added to favorites.');

    expect($user->favoriteHouses()->whereKey($house->id)->exists())->toBeTrue();
});

test('favorites cannot be added to non public houses', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $user = User::factory()->create(['role' => 'user']);
    $house = favoritesCommentsHouse($agent, ['status' => House::STATUS_HIDDEN]);

    $this
        ->actingAs($user)
        ->withHeader('Accept', 'application/json')
        ->post("/favorites/{$house->id}")
        ->assertNotFound();

    expect($user->favoriteHouses()->whereKey($house->id)->exists())->toBeFalse();
});

test('comments can be created updated deleted and moderated only by allowed users', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $admin = User::factory()->create(['role' => 'admin']);
    $renter = User::factory()->create(['role' => 'user']);
    $otherUser = User::factory()->create(['role' => 'user']);
    $house = favoritesCommentsHouse($agent);

    HouseRental::factory()->create([
        'house_id' => $house->id,
        'user_id' => $renter->id,
        'revoked_at' => null,
    ]);

    $commentId = $this
        ->actingAs($renter)
        ->withHeader('Accept', 'application/json')
        ->post("/en/houses/{$house->id}/comments", [
            'content' => 'A confirmed renter comment.',
        ])
        ->assertCreated()
        ->json('comment.id');

    $this
        ->actingAs($otherUser)
        ->withHeader('Accept', 'application/json')
        ->post("/en/houses/{$house->id}/comments", [
            'content' => 'An unauthorized comment.',
        ])
        ->assertForbidden();

    $this
        ->actingAs($renter)
        ->withHeader('Accept', 'application/json')
        ->put("/en/houses/{$house->id}/comments/{$commentId}", [
            'content' => 'An edited renter comment.',
        ])
        ->assertOk()
        ->assertJsonPath('comment.content', 'An edited renter comment.');

    $this
        ->actingAs($otherUser)
        ->withHeader('Accept', 'application/json')
        ->put("/en/houses/{$house->id}/comments/{$commentId}", [
            'content' => 'A forbidden edit.',
        ])
        ->assertForbidden();

    $this
        ->actingAs($admin)
        ->get("/admin/houses/{$house->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/House/HouseEdit')
            ->where('canModerateComments', true)
            ->has('commentModeration', 1)
        );

    $this
        ->actingAs($agent)
        ->get("/admin/houses/{$house->id}/edit")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/House/HouseEdit')
            ->where('canModerateComments', false)
            ->has('commentModeration', 0)
        );

    $this
        ->actingAs($admin)
        ->withHeader('Accept', 'application/json')
        ->delete("/en/houses/{$house->id}/comments/{$commentId}")
        ->assertNoContent();

    $this->assertSoftDeleted('house_comments', ['id' => $commentId]);
});
