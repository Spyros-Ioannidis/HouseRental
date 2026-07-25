<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Http\Requests\Catalog\CityCatalogRequest;
use App\Http\Requests\Catalog\FeatureCatalogRequest;
use App\Http\Requests\Settings\UpdateContactSettingsRequest;
use App\Models\City;
use App\Models\Feature;
use App\Services\Catalog\CatalogService;
use App\Services\Settings\SiteSettingsService;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AdminCatalogController extends Controller
{
    public function index(CatalogService $catalog, SiteSettingsService $settings)
    {
        Gate::authorize('viewAny', City::class);
        Gate::authorize('viewAny', Feature::class);

        return Inertia::render('Admin/Other/Settings', [
            ...$catalog->settingsPayload(),
            'contactSettings' => $settings->contactSettings(),
            'contactSettingsRoute' => route('admin.settings.contact.update'),
        ]);
    }

    public function updateContact(UpdateContactSettingsRequest $request, SiteSettingsService $settings)
    {
        $settings->updateContactSettings($request->validated());

        Inertia::flash([
            'message' => __('ui.flash.contact_settings_updated'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function storeCity(CityCatalogRequest $request, CatalogService $catalog)
    {
        $catalog->createCity($request->validated());

        Inertia::flash([
            'message' => __('ui.flash.city_added'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function updateCity(CityCatalogRequest $request, City $city, CatalogService $catalog)
    {
        $catalog->updateCity($city, $request->validated());

        Inertia::flash([
            'message' => __('ui.flash.city_updated'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function destroyCity(City $city, CatalogService $catalog)
    {
        Gate::authorize('delete', $city);

        if (! $catalog->deleteCity($city)) {
            return back()->withErrors([
                'city' => __('ui.flash.city_in_use'),
            ]);
        }

        Inertia::flash([
            'message' => __('ui.flash.city_removed'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function storeFeature(FeatureCatalogRequest $request, CatalogService $catalog)
    {
        $catalog->createFeature($request->validated());

        Inertia::flash([
            'message' => __('ui.flash.feature_added'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function updateFeature(FeatureCatalogRequest $request, Feature $feature, CatalogService $catalog)
    {
        $catalog->updateFeature($feature, $request->validated());

        Inertia::flash([
            'message' => __('ui.flash.feature_updated'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }

    public function destroyFeature(Feature $feature, CatalogService $catalog)
    {
        Gate::authorize('delete', $feature);

        $catalog->deleteFeature($feature);

        Inertia::flash([
            'message' => __('ui.flash.feature_removed'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }
}
