<?php

use App\Models\City;
use App\Models\ContactMessage;
use App\Models\House;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

function contactFlowPayload(array $overrides = []): array
{
    return array_merge([
        'name' => 'Jane Tenant',
        'email' => 'jane@example.com',
        'phone' => '+30 210 000 0000',
        'subject' => 'Viewing request',
        'message' => 'I would like to arrange a viewing for one of your listings.',
    ], $overrides);
}

function contactFlowHouse(User $agent, array $attributes = []): House
{
    $city = City::firstOrCreate(
        ['name' => 'Larisa'],
        ['name_en' => 'Larisa', 'name_el' => null],
    );
    $title = $attributes['title_en'] ?? 'Contact House ' . uniqid();

    return House::create([
        'user_id' => $agent->id,
        'title' => $title,
        'title_en' => $title,
        'title_el' => null,
        'description' => 'A listing that accepts contact messages.',
        'description_en' => 'A listing that accepts contact messages.',
        'description_el' => null,
        'year_built' => 2017,
        'address' => '31 Contact Street',
        'city' => $city->name,
        'city_id' => $city->id,
        'status' => House::STATUS_ACTIVE,
        'latitude' => '39.6390000',
        'longitude' => '22.4191000',
        'area' => 78,
        'price' => 880,
        'floor' => 2,
        'bathroom' => 1,
        'living_room' => 1,
        'bedroom' => 2,
    ]);
}

function contactFlowMessage(array $attributes = []): ContactMessage
{
    return ContactMessage::create(array_merge([
        'name' => 'Contact Sender',
        'email' => 'sender@example.com',
        'phone' => '+30 210 000 0000',
        'subject' => 'Question',
        'message' => 'I have a question about this listing.',
        'source' => 'general',
    ], $attributes));
}

test('general agent and listing contact messages validate and store correctly', function () {
    $agent = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $house = contactFlowHouse($agent);

    $this->post('/en/contact', contactFlowPayload())->assertRedirect();

    expect(ContactMessage::where('source', 'general')->count())->toBe(1);

    $this
        ->post('/en/contact', contactFlowPayload([
            'agent_id' => $agent->id,
            'subject' => 'Agent request',
        ]))
        ->assertRedirect();

    expect(ContactMessage::where('source', 'agent')->where('agent_id', $agent->id)->count())->toBe(1);

    $this
        ->post('/en/contact', contactFlowPayload([
            'house_id' => $house->id,
            'agent_id' => $agent->id,
            'subject' => 'Listing request',
        ]))
        ->assertRedirect();

    $listingMessage = ContactMessage::where('source', 'listing')->firstOrFail();

    expect($listingMessage->house_id)->toBe($house->id)
        ->and($listingMessage->agent_id)->toBe($agent->id);

    $this
        ->from('/en/contact')
        ->post('/en/contact', contactFlowPayload([
            'house_id' => $house->id,
            'agent_id' => $otherAgent->id,
        ]))
        ->assertRedirect('/en/contact')
        ->assertSessionHasErrors('agent_id');
});

test('admins see all contacts while agents see only related contacts', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);
    $otherAgent = User::factory()->create(['role' => 'agent']);
    $ownedHouse = contactFlowHouse($agent);
    $otherHouse = contactFlowHouse($otherAgent);

    $direct = contactFlowMessage(['agent_id' => $agent->id, 'source' => 'agent']);
    $listing = contactFlowMessage(['house_id' => $ownedHouse->id, 'source' => 'listing']);
    $unrelated = contactFlowMessage(['agent_id' => $otherAgent->id, 'house_id' => $otherHouse->id, 'source' => 'listing']);
    contactFlowMessage();

    $this
        ->actingAs($admin)
        ->get('/admin/contacts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Other/Contacts')
            ->has('contacts.data', 4)
        );

    $this
        ->actingAs($agent)
        ->get('/admin/contacts')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Other/Contacts')
            ->has('contacts.data', 2)
        );

    $this->actingAs($agent)->get("/admin/contacts/{$direct->id}")->assertOk();
    $this->actingAs($agent)->get("/admin/contacts/{$listing->id}")->assertOk();
    $this->actingAs($agent)->get("/admin/contacts/{$unrelated->id}")->assertForbidden();
});

test('contact routes are rate limited', function () {
    $agent = User::factory()->create([
        'role' => 'agent',
        'contact_email' => 'agent@example.com',
        'contact_phone' => '+30 210 000 0001',
    ]);

    for ($attempt = 0; $attempt < 5; $attempt++) {
        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.30'])
            ->post('/en/contact', contactFlowPayload(['email' => "sender{$attempt}@example.com"]))
            ->assertRedirect();
    }

    $this
        ->withServerVariables(['REMOTE_ADDR' => '203.0.113.30'])
        ->post('/en/contact', contactFlowPayload(['email' => 'sender-limited@example.com']))
        ->assertTooManyRequests();

    for ($attempt = 0; $attempt < 10; $attempt++) {
        $this
            ->withServerVariables(['REMOTE_ADDR' => '203.0.113.31'])
            ->get("/seller/{$agent->id}/contact/email")
            ->assertOk();
    }

    $this
        ->withServerVariables(['REMOTE_ADDR' => '203.0.113.31'])
        ->get("/seller/{$agent->id}/contact/email")
        ->assertTooManyRequests();
});
test('contact JSON submissions return the toast payload', function () {
    $this
        ->withHeader('Accept', 'application/json')
        ->post('/en/contact', contactFlowPayload())
        ->assertOk()
        ->assertJsonPath('message', 'Message sent successfully.');
});
test('toast translations are shared for both supported locales', function () {
    foreach (['en', 'el'] as $locale) {
        $this
            ->get("/{$locale}/contact")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('translations.flash.favorite_update_failed')
                ->has('translations.flash.comment_created')
                ->has('translations.flash.comment_updated')
                ->has('translations.flash.comment_deleted')
                ->has('translations.flash.contact_delete_confirm')
                ->has('translations.flash.contact_deleted')
                ->has('translations.flash.contact_send_failed')
                ->has('translations.flash.contact_rate_limited')
                ->has('translations.flash.logged_out')
            );
    }
});
test('only admins can permanently delete contact messages', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $agent = User::factory()->create(['role' => 'agent']);
    $user = User::factory()->create(['role' => 'user']);
    $contact = contactFlowMessage();

    $this
        ->actingAs($agent)
        ->delete("/admin/contacts/{$contact->id}")
        ->assertForbidden();

    $this
        ->actingAs($user)
        ->delete("/admin/contacts/{$contact->id}")
        ->assertNotFound();

    $this
        ->actingAs($admin)
        ->delete("/admin/contacts/{$contact->id}")
        ->assertRedirect(route('admin.contacts.index'));

    $this->assertDatabaseMissing('contact_messages', ['id' => $contact->id]);
});
