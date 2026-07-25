<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SUPPORTED_LOCALES = [
        'en' => 'English',
        'el' => 'Ελληνικά',
    ];

    public static function supportedLocales(): array
    {
        return self::SUPPORTED_LOCALES;
    }

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale')
            ?: $request->session()->get('locale', config('app.locale', 'en'));

        if (! array_key_exists($locale, self::SUPPORTED_LOCALES)) {
            $locale = config('app.locale', 'en');
        }

        App::setLocale($locale);
        $request->session()->put('locale', $locale);

        return $next($request);
    }
}
