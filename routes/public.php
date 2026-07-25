<?php

use App\Http\Controllers\Contact\ContactController;
use App\Http\Controllers\House\HouseCommentController;
use App\Http\Controllers\House\HouseController;
use App\Http\Controllers\User\UserController;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

$preferredLocale = function (Request $request): string {
    $locale = $request->session()->get('locale', config('app.locale', 'en'));

    return array_key_exists($locale, SetLocale::supportedLocales()) ? $locale : 'en';
};

$legalPages = [
    'privacy-policy' => [
        'name' => 'privacy.policy',
        'pageKey' => 'privacy',
    ],
    'terms-of-use' => [
        'name' => 'terms.use',
        'pageKey' => 'terms',
    ],
    'cookie-policy' => [
        'name' => 'cookies.policy',
        'pageKey' => 'cookies',
    ],
    'accessibility-statement' => [
        'name' => 'accessibility.statement',
        'pageKey' => 'accessibility',
    ],
];

Route::get('/houses', function (Request $request) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request) . '/houses');
});

Route::get('/home', function (Request $request) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request));
});

Route::get('/houses/{house}', function (Request $request, string $house) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request) . '/houses/' . $house);
});

Route::get('/about', function (Request $request) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request) . '/about');
});

Route::get('/contact', function (Request $request) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request) . '/contact');
});

foreach (array_keys($legalPages) as $slug) {
    Route::get('/' . $slug, function (Request $request) use ($preferredLocale, $slug) {
        return redirect('/' . $preferredLocale($request) . '/' . $slug);
    });
}

Route::get('/seller/{user}', function (Request $request, string $user) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request) . '/seller/' . $user);
});

Route::prefix('{locale}')->group(function () use ($legalPages) {
    Route::get('/', function (string $locale) {
        return Inertia::render('Home');
    })->name('home');

    Route::get('about', function () {
        return Inertia::render('About');
    })->name('about');

    Route::get('contact', [ContactController::class, 'create'])->name('contact');
    Route::post('contact', [ContactController::class, 'store'])
        ->middleware('throttle:contact')
        ->name('contact.store');

    foreach ($legalPages as $slug => $page) {
        Route::get($slug, function () use ($page) {
            return Inertia::render('LegalPage', [
                'pageKey' => $page['pageKey'],
            ]);
        })->name($page['name']);
    }

    Route::controller(HouseController::class)->group(function () {
        Route::get('houses', 'index')->name('houses.index');
        Route::get('houses/{house}', 'show')->name('houses.show');
    });

    Route::scopeBindings()
        ->prefix('houses/{house}/comments')
        ->name('houses.comments.')
        ->controller(HouseCommentController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');

            Route::middleware(['auth', 'verified'])->group(function () {
                Route::post('/', 'store')
                    ->middleware('throttle:house-comments')
                    ->name('store');
                Route::put('{comment}', 'update')->name('update');
                Route::delete('{comment}', 'destroy')->name('destroy');
            });
        });

    Route::get('seller/{user}', [UserController::class, 'show'])->name('seller.show');
});

Route::get('seller/{user}/contact/{type}', [UserController::class, 'contact'])
    ->middleware('throttle:seller-contact')
    ->name('seller.contact');
