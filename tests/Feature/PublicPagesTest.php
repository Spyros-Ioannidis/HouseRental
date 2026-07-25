<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('root and public aliases redirect to the preferred locale', function () {
    $this->get('/')->assertRedirect('/en');
    $this->get('/home')->assertRedirect('/en');
    $this->get('/houses')->assertRedirect('/en/houses');
    $this->get('/about')->assertRedirect('/en/about');
    $this->get('/contact')->assertRedirect('/en/contact');

    $this->withSession(['locale' => 'el'])->get('/')->assertRedirect('/el');
    $this->withSession(['locale' => 'el'])->get('/home')->assertRedirect('/el');
    $this->withSession(['locale' => 'el'])->get('/houses')->assertRedirect('/el/houses');
    $this->withSession(['locale' => 'el'])->get('/about')->assertRedirect('/el/about');
    $this->withSession(['locale' => 'el'])->get('/contact')->assertRedirect('/el/contact');
});

test('localized public pages render their inertia components', function (string $path, string $component) {
    $this
        ->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component($component));
})->with([
    'english home' => ['/en', 'Home'],
    'greek home' => ['/el', 'Home'],
    'english houses' => ['/en/houses', 'Houses'],
    'greek houses' => ['/el/houses', 'Houses'],
    'english about' => ['/en/about', 'About'],
    'greek about' => ['/el/about', 'About'],
    'english contact' => ['/en/contact', 'Contact'],
    'greek contact' => ['/el/contact', 'Contact'],
]);

test('legal pages provide their content in the active locale', function (string $path, string $pageKey, string $title, string $intro) {
    $this
        ->get($path)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('LegalPage')
            ->where('pageKey', $pageKey)
            ->where("translations.legal.{$pageKey}.title", $title)
            ->where("translations.legal.{$pageKey}.intro", $intro)
        );
})->with([
    'english privacy policy' => ['/en/privacy-policy', 'privacy', 'Privacy Policy', 'This policy explains what information HouseRental collects, why it is used, and how users can manage their information.'],
    'greek terms of use' => ['/el/terms-of-use', 'terms', 'Όροι χρήσης', 'Οι όροι αυτοί περιγράφουν τους βασικούς κανόνες χρήσης του HouseRental ως επισκέπτης, κάτοχος λογαριασμού, πωλητής, μεσίτης ή διαχειριστής.'],
    'greek cookie policy' => ['/el/cookie-policy', 'cookies', 'Πολιτική cookies', 'Η πολιτική αυτή εξηγεί τα cookies και την παρόμοια αποθήκευση στον περιηγητή που μπορεί να χρησιμοποιούνται όταν αναπτύσσεται το HouseRental.'],
    'greek accessibility statement' => ['/el/accessibility-statement', 'accessibility', 'Δήλωση προσβασιμότητας', 'Το HouseRental επιδιώκει να προσφέρει εύχρηστη εμπειρία δημόσιας περιήγησης και λογαριασμού για ανθρώπους με διαφορετικές ανάγκες πρόσβασης.'],
]);

test('about page renders as an inertia page instead of dumping output', function () {
    $this
        ->get('/en/about')
        ->assertOk()
        ->assertHeader('Vary', 'X-Inertia')
        ->assertInertia(fn (Assert $page) => $page->component('About'));
});

test('public error pages render through inertia', function (int $status) {
    Route::middleware('web')->get("/_test/errors/{$status}", function () use ($status) {
        abort($status);
    });

    $this
        ->get("/_test/errors/{$status}")
        ->assertStatus($status)
        ->assertInertia(fn (Assert $page) => $page->component("Errors/{$status}"));
})->with([
    'forbidden' => [403],
    'expired' => [419],
    'unavailable' => [503],
]);

test('public 404 errors render through inertia', function () {
    $this
        ->get('/en/does-not-exist')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page->component('Errors/404'));
});

test('public 500 errors render through inertia', function () {
    Route::middleware('web')->get('/_test/errors/exception', function () {
        throw new RuntimeException('Intentional test exception.');
    });

    $this
        ->get('/_test/errors/exception')
        ->assertStatus(500)
        ->assertInertia(fn (Assert $page) => $page->component('Errors/500'));
});
