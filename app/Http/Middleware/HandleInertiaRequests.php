<?php

namespace App\Http\Middleware;

use App\Services\Settings\SiteSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Lang;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Throwable;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            ...self::sharedApplicationProps($request),
        ];
    }

    /**
     * Define shared props used by normal Inertia visits and rendered error pages.
     *
     * @return array<string, mixed>
     */
    public static function sharedApplicationProps(Request $request): array
    {
        try {
            $user = $request->user();
        } catch (Throwable) {
            $user = null;
        }

        $ziggyGroup = $user && in_array($user->role, ['admin', 'agent'], true)
            ? 'admin'
            : 'public';

        return [
            'auth' => [
                'user' => $user,
                'role' => $user?->role,
                'is_admin' => $user?->hasRole('admin') ?? false,
            ],
            'flash' => [
                'message' => fn () => $request->hasSession() ? $request->session()->get('message') : null,
                'type' => fn () => $request->hasSession() ? $request->session()->get('type') : null,
                'flash_id' => fn () => $request->hasSession() ? $request->session()->get('flash_id') : null,
            ],
            'locale' => App::getLocale(),
            'locales' => SetLocale::supportedLocales(),
            'site' => fn () => [
                'contactSettings' => app(SiteSettingsService::class)->contactSettings(),
            ],
            'translations' => Lang::get('ui'),
            'fallbackTranslations' => Lang::get('ui', [], 'en'),
            'ziggy' => fn () => [
                ...(new Ziggy($ziggyGroup))->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
