<?php

namespace App\Http\Controllers\House;

use App\Http\Controllers\Controller;

use App\Http\Requests\House\HouseImageIdsRequest;
use App\Http\Requests\House\HouseImageStoreRequest;
use App\Models\House;
use App\Services\House\Images\HouseImageManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HouseImageController extends Controller
{
    public function __construct(private HouseImageManager $images)
    {
    }

    public function upload(HouseImageStoreRequest $request, House $house)
    {
        return $this->store($request, $house);
    }

    public function store(HouseImageStoreRequest $request, $house = null)
    {
        $this->authorizeHouseImages($request, $house);

        $image = $this->images->store($request, $house);

        return response()->json($this->images->imagePayload($image));
    }

    public function reorder(HouseImageIdsRequest $request, $house = null)
    {
        $this->authorizeHouseImages($request, $house);

        $validated = $request->validated();

        $this->images->reorder($request, $house, $validated['ids']);

        return response()->noContent();
    }

    public function destroy(Request $request, $house = null, $image = null)
    {
        $this->authorizeHouseImages($request, $house);

        $this->images->destroy($request, $house, $request->route('image') ?? $image);

        return response()->noContent();
    }

    public function destroyBatch(HouseImageIdsRequest $request, $house = null)
    {
        $this->authorizeHouseImages($request, $house);

        $validated = $request->validated();

        $this->images->destroyBatch($request, $house, array_values($validated['ids']));

        return response()->noContent();
    }

    public function cancelDraft(Request $request, string $draft)
    {
        $this->images->cancelDraft($request, $draft);

        return response()->noContent();
    }

    private function authorizeHouseImages(Request $request, $house = null): void
    {
        if ($request->route('draft')) {
            return;
        }

        $routeHouse = $request->route('house') ?? $house;

        if (! $routeHouse) {
            return;
        }

        $house = $routeHouse instanceof House
            ? $routeHouse
            : House::findOrFail($routeHouse);

        Gate::authorize('manageImages', $house);
    }
}
