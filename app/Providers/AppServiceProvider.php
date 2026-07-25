<?php

namespace App\Providers;

use App\Models\City;
use App\Models\ContactMessage;
use App\Models\Feature;
use App\Models\House;
use App\Models\HouseComment;
use App\Models\HouseRental;
use App\Models\User;
use App\Policies\CityPolicy;
use App\Policies\ContactMessagePolicy;
use App\Policies\FeaturePolicy;
use App\Policies\HouseCommentPolicy;
use App\Policies\HousePolicy;
use App\Policies\HouseRentalPolicy;
use App\Policies\UserPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(City::class, CityPolicy::class);
        Gate::policy(ContactMessage::class, ContactMessagePolicy::class);
        Gate::policy(Feature::class, FeaturePolicy::class);
        Gate::policy(House::class, HousePolicy::class);
        Gate::policy(HouseComment::class, HouseCommentPolicy::class);
        Gate::policy(HouseRental::class, HouseRentalPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        RateLimiter::for('contact', function (Request $request) {
            $key = $request->user()
                ? 'user:' . $request->user()->id
                : 'ip:' . $request->ip();

            return Limit::perMinute(5)->by($key);
        });

        RateLimiter::for('seller-contact', function (Request $request) {
            $key = $request->user()
                ? 'user:' . $request->user()->id
                : 'ip:' . $request->ip();

            return Limit::perMinute(10)->by($key);
        });

        RateLimiter::for('house-comments', function (Request $request) {
            $key = $request->user()
                ? 'user:' . $request->user()->id
                : 'ip:' . $request->ip();

            return Limit::perMinute(10)->by($key);
        });

        RateLimiter::for('auth-login', function (Request $request) {
            $email = $this->normalizedAuthEmail($request);
            $ip = $this->rateLimitIp($request);

            return [
                Limit::perMinute(5)->by("auth-login:email:{$email}:ip:{$ip}"),
                Limit::perMinute(20)->by("auth-login:ip:{$ip}"),
            ];
        });

        RateLimiter::for('auth-register', function (Request $request) {
            return Limit::perMinute(3)->by('auth-register:ip:' . $this->rateLimitIp($request));
        });

        RateLimiter::for('auth-password-email', function (Request $request) {
            $email = $this->normalizedAuthEmail($request);
            $ip = $this->rateLimitIp($request);

            return [
                Limit::perMinute(5)->by("auth-password-email:email:{$email}"),
                Limit::perMinute(10)->by("auth-password-email:ip:{$ip}"),
            ];
        });

        RateLimiter::for('auth-password-reset', function (Request $request) {
            $email = $this->normalizedAuthEmail($request);
            $ip = $this->rateLimitIp($request);

            return [
                Limit::perMinute(5)->by("auth-password-reset:email:{$email}:ip:{$ip}"),
                Limit::perMinute(20)->by("auth-password-reset:ip:{$ip}"),
            ];
        });

        Schema::defaultStringLength(191);
    }

    private function normalizedAuthEmail(Request $request): string
    {
        $email = strtolower(trim((string) $request->input('email', '')));

        return $email !== '' ? $email : 'missing-email';
    }

    private function rateLimitIp(Request $request): string
    {
        return $request->ip() ?: 'unknown';
    }
}
