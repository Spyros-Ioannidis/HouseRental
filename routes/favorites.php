<?php

use App\Http\Controllers\House\FavoriteHouseController;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', RoleMiddleware::class . ':user'])
    ->controller(FavoriteHouseController::class)
    ->prefix('favorites')
    ->name('favorites.')
    ->group(function () {
        Route::post('{house}', 'store')->name('store');
        Route::delete('{house}', 'destroy')->name('destroy');
    });
