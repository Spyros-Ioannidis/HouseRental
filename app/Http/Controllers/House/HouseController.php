<?php

namespace App\Http\Controllers\House;

use App\Http\Controllers\Controller;

use App\Http\Requests\House\StoreHouseRequest;
use App\Http\Requests\House\UpdateHouseRequest;
use App\Models\House;
use App\Models\HouseRental;
use App\Services\House\Comments\HouseCommentService;
use App\Services\House\Images\HouseImageManager;
use App\Services\House\Listings\HouseFilterService;
use App\Services\House\Listings\HouseListingService;
use App\Services\House\Listings\HousePresenter;
use App\Services\House\Management\HouseFormOptions;
use App\Services\House\Management\HouseManagementService;
use App\Services\House\Management\HouseStatusService;
use App\Services\House\Rentals\HouseRentalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class HouseController extends Controller
{
    public function index(
        Request $request,
        HouseFilterService $houseFilters,
        HouseListingService $listings,
    ) {
        [$houses, $stats] = $listings->publicIndex($request, $houseFilters);

        return inertia('Houses', [
            'houses' => $houses,
            'filters' => $houseFilters->filters($stats),
            'query' => $request->only([
                ...$houseFilters->keys(),
                ...$listings->publicOrderKeys(),
            ]),
        ]);
    }

    public function admin_index(Request $request, HouseListingService $listings)
    {
        $query = $request->only($listings->adminQueryKeys());

        return Inertia::render('Admin/House/HouseIndex', [
            'houses' => $listings->adminIndex($request),
            'filters' => $query,
            'query' => $query,
            'houseFilters' => $listings->adminFilters($request),
            'canManageDeletedHouses' => Gate::allows('manageDeletedHouses', House::class),
        ]);
    }

    public function create(
        Request $request,
        HouseImageManager $images,
        HouseFormOptions $options,
        HouseStatusService $statuses,
    ) {
        Gate::authorize('create', House::class);

        $user = $request->user();
        $draft = $images->startOrResumeDraft($request);

        return Inertia::render('Admin/House/HouseCreate', [
            'agents' => $options->agentsFor($user),
            'features' => $options->features(),
            'cities' => $options->cities(),
            'statusOptions' => $statuses->optionsFor($user, null, true),
            'defaultStatus' => $statuses->defaultFor($user),
            'canChangeAgent' => Gate::allows('changeAgent', House::class),
            'draftToken' => $draft['token'],
            'draftExpiresAt' => $draft['expires_at']->toIso8601String(),
            'existingImages' => $draft['images'],
        ]);
    }

    public function store(
        StoreHouseRequest $request,
        HouseImageManager $images,
        HouseManagementService $houses,
    ) {
        $images->cleanupExpiredDraftImages();

        $validated = $request->validated();
        $draftToken = $validated['creation_token'];

        if ($images->draftExpired($draftToken, $request)) {
            $images->cancelDraft($request, $draftToken);

            Inertia::flash([
                'message' => __('ui.flash.house_creation_timed_out'),
                'flash_id' => now()->getTimestampMs(),
            ]);

            return back()
                ->withErrors([
                    'creation_token' => __('ui.flash.house_creation_expired'),
                ])
                ->withInput();
        }

        $house = $houses->create($validated, $request->user(), $request);

        $images->forgetDraft($request, $draftToken);

        Inertia::flash([
            'message' => __('ui.flash.house_created'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()
            ->route('admin.houses.edit', $house->id);
    }

    public function show(string $locale, Request $request, House $house, HousePresenter $presenter)
    {
        abort_unless(Gate::allows('view', $house), 404);

        $house->load([
            'user:id,first_name,last_name,profile_picture',
            'cityRecord:id,name,name_en,name_el',
            'features:id,name,name_en,name_el',
        ]);

        return inertia('House', ['house' => $presenter->payload($house, $request, true)]);
    }

    public function edit(
        Request $request,
        House $house,
        HouseFormOptions $options,
        HousePresenter $presenter,
        HouseRentalService $rentals,
        HouseCommentService $comments,
        HouseStatusService $statuses,
    ) {
        Gate::authorize('manage', $house);

        $house->load([
            'user:id,first_name,last_name,role',
            'cityRecord:id,name,name_en,name_el',
            'features:id,name',
        ]);

        $user = $request->user();

        return Inertia::render('Admin/House/HouseEdit', [
            'house' => $presenter->payload($house),
            'agents' => $options->agentsFor($user),
            'features' => $options->features(),
            'cities' => $options->cities(),
            'statusOptions' => $statuses->optionsFor($user, $house),
            'canChangeAgent' => Gate::allows('changeAgent', House::class),
            'canDeleteHouse' => Gate::allows('delete', $house),
            'canEditDeletedHouse' => Gate::allows('manageDeletedHouses', House::class),
            'canManageRentals' => Gate::allows('create', [HouseRental::class, $house]),
            'canModerateComments' => $user->role === 'admin',
            'rentalData' => $rentals->adminPayload($house),
            'commentModeration' => $user->role === 'admin' ? $comments->moderationFor($house) : [],
        ]);
    }

    public function update(UpdateHouseRequest $request, House $house, HouseManagementService $houses)
    {
        $houses->update($house, $request->validated(), $request->user());

        Inertia::flash([
            'message' => __('ui.flash.house_updated'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()
            ->route('admin.houses.edit', $house->id);
    }

    public function destroy(Request $request, House $house, HouseManagementService $houses)
    {
        Gate::authorize('delete', $house);

        $houses->moveToDeleted($house);

        Inertia::flash([
            'message' => __('ui.flash.house_deleted'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.houses.index');
    }

    public function restore(Request $request, House $house, HouseManagementService $houses)
    {
        Gate::authorize('restore', $house);
        abort_unless($house->trashed(), 404);

        $houses->restore($house);

        Inertia::flash([
            'message' => __('ui.flash.house_restored'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.houses.index');
    }

    public function forceDestroy(Request $request, House $house, HouseManagementService $houses)
    {
        Gate::authorize('forceDelete', $house);
        abort_unless($house->trashed(), 404);

        $houses->forceDestroy($house);

        Inertia::flash([
            'message' => __('ui.flash.house_force_deleted'),
            'flash_id' => now()->getTimestampMs(),
        ]);

        return redirect()->route('admin.houses.index');
    }
}
