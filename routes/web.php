<?php

use App\Http\Middleware\SetLocale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::pattern('locale', 'en|el');

$preferredLocale = function (Request $request): string {
    $locale = $request->session()->get('locale', config('app.locale', 'en'));

    return array_key_exists($locale, SetLocale::supportedLocales()) ? $locale : 'en';
};

Route::get('/', function (Request $request) use ($preferredLocale) {
    return redirect('/' . $preferredLocale($request));
});

Route::post('/locale/{locale}', function (Request $request, string $locale) {
    abort_unless(array_key_exists($locale, SetLocale::supportedLocales()), 404);

    $request->session()->put('locale', $locale);
    $redirect = $request->input('redirect', '/');

    if (! is_string($redirect) || ! str_starts_with($redirect, '/') || str_starts_with($redirect, '//')) {
        $redirect = '/';
    }

    return redirect($redirect);
})->name('locale.switch');
