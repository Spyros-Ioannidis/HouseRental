<?php

use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\SetLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',

        then: function () {
            foreach ([
                'public.php',
                'auth.php',
                'user-dashboard.php',
                'favorites.php',
                'admin.php',
            ] as $routeFile) {
                Route::middleware('web')
                    ->group(base_path("routes/{$routeFile}"));
            }
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            SetLocale::class,
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (Response $response, Throwable $exception, Request $request) {
            $status = $response->getStatusCode();
            $errorPages = [403, 404, 419, 500, 503];

            if ($request->expectsJson() || ! in_array($status, $errorPages, true)) {
                return $response;
            }

            $locale = $request->segment(1);

            if (array_key_exists($locale, SetLocale::supportedLocales())) {
                app()->setLocale($locale);
            }

            return Inertia::render(
                "Errors/{$status}",
                HandleInertiaRequests::sharedApplicationProps($request),
            )
                ->toResponse($request)
                ->setStatusCode($status);
        });
    })->create();
