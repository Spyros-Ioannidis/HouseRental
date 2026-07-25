<?php

use App\Http\Controllers\Admin\AdminCatalogController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Contact\ContactController;
use App\Http\Controllers\House\HouseController;
use App\Http\Controllers\House\HouseImageController;
use App\Http\Controllers\House\HouseRentalController;
use App\Http\Controllers\User\UserController;
use App\Http\Middleware\EnsureAdminAreaAccess;
use App\Http\Middleware\NoIndex;
use Illuminate\Support\Facades\Route;

Route::middleware([EnsureAdminAreaAccess::class, 'verified', NoIndex::class])->group(function () {
    Route::get('admin', [AdminDashboardController::class, 'index'])
        ->name('admin');

    Route::prefix('admin/contacts')
        ->name('admin.contacts.')
        ->controller(ContactController::class)
        ->group(function () {
            Route::get('/', 'adminIndex')->name('index');
            Route::get('{contact}', 'adminShow')->name('show');
            Route::delete('{contact}', 'destroy')->name('destroy');
        });

    Route::prefix('admin/houses')
        ->name('admin.houses.')
        ->controller(HouseController::class)
        ->group(function () {
            Route::get('/', 'admin_index')->name('index');
            Route::get('/create', 'create')->name('create');
            Route::post('/', 'store')->name('store');

            Route::prefix('{house}')->group(function () {
                Route::get('/edit', 'edit')->withTrashed()->name('edit');
                Route::put('/update', 'update')->withTrashed()->name('update');
                Route::delete('/', 'destroy')->withTrashed()->name('destroy');
                Route::patch('/restore', 'restore')->withTrashed()->name('restore');
                Route::delete('/force', 'forceDestroy')->withTrashed()->name('force-destroy');
            });
        });

    Route::scopeBindings()
        ->prefix('admin/houses/{house}/rentals')
        ->name('admin.houses.rentals.')
        ->controller(HouseRentalController::class)
        ->group(function () {
            Route::post('/', 'store')->name('store');
            Route::put('{rental}', 'update')->name('update');
            Route::delete('{rental}', 'destroy')->name('destroy');
        });

    Route::controller(HouseImageController::class)->group(function () {
        Route::delete('/admin/houses/create-drafts/{draft}', 'cancelDraft')
            ->name('admin.house-drafts.cancel');

        Route::prefix('/admin/houses/create-drafts/{draft}/images')
            ->name('admin.house-drafts.images.')
            ->group(function () {
                Route::post('/', 'store')->name('store');
                Route::post('/reorder', 'reorder')->name('reorder');
                Route::delete('/batch', 'destroyBatch')->name('destroy-batch');
                Route::delete('/{image}', 'destroy')->name('destroy');
            });

        Route::prefix('/houses/{house}/images')
            ->name('houses.images.')
            ->group(function () {
                Route::post('/', 'store')->name('store');
                Route::post('/reorder', 'reorder')->name('reorder');
                Route::delete('/', 'destroyBatch')->name('destroy-batch');
                Route::delete('/{image}', 'destroy')->name('destroy');
            });
    });
});

Route::middleware([EnsureAdminAreaAccess::class, 'verified', NoIndex::class])->group(function () {
    Route::controller(UserController::class)->group(function () {
        Route::get('admin/users', 'index')->name('admin.users');
        Route::get('admin/users/create', 'create')->name('admin.users.create');
        Route::post('admin/users', 'store')->name('admin.users.store');
        Route::get('admin/users/{user}/edit', 'edit')->name('admin.users.edit');
        Route::put('admin/users/{user}', 'update')->name('admin.users.update');
        Route::post('admin/users/{user}/profile-picture', 'updateManagedProfilePicture')->name('admin.users.profile-picture.update');
        Route::delete('admin/users/{user}', 'destroy')->name('admin.users.destroy');
    });

    Route::prefix('admin/settings')
        ->name('admin.settings.')
        ->controller(AdminCatalogController::class)
        ->group(function () {
            Route::get('/', 'index')->name('index');
            Route::put('contact', 'updateContact')->name('contact.update');

            Route::prefix('cities')->name('cities.')->group(function () {
                Route::post('/', 'storeCity')->name('store');
                Route::put('{city}', 'updateCity')->name('update');
                Route::delete('{city}', 'destroyCity')->name('destroy');
            });

            Route::prefix('features')->name('features.')->group(function () {
                Route::post('/', 'storeFeature')->name('store');
                Route::put('{feature}', 'updateFeature')->name('update');
                Route::delete('{feature}', 'destroyFeature')->name('destroy');
            });
        });
});
