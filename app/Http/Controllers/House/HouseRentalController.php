<?php

namespace App\Http\Controllers\House;

use App\Http\Controllers\Controller;

use App\Http\Requests\House\StoreHouseRentalRequest;
use App\Http\Requests\House\UpdateHouseRentalRequest;
use App\Models\House;
use App\Models\HouseRental;
use App\Services\House\Rentals\HouseRentalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HouseRentalController extends Controller
{
    private function abortIfMismatched(House $house, HouseRental $rental): void
    {
        abort_unless((int) $rental->house_id === (int) $house->id, 404);
    }

    public function store(StoreHouseRentalRequest $request, House $house, HouseRentalService $rentals): JsonResponse
    {
        $rental = $rentals->create($house, $request->user(), $request->validated());

        return response()->json([
            'rental' => $rentals->format($rental),
        ], 201);
    }

    public function update(
        UpdateHouseRentalRequest $request,
        House $house,
        HouseRental $rental,
        HouseRentalService $rentals,
    ): JsonResponse {
        $this->abortIfMismatched($house, $rental);

        $rental = $rentals->update($rental, $request->validated());

        return response()->json([
            'rental' => $rentals->format($rental),
        ]);
    }

    public function destroy(Request $request, House $house, HouseRental $rental, HouseRentalService $rentals): JsonResponse
    {
        $this->abortIfMismatched($house, $rental);
        Gate::authorize('delete', $rental);

        $rental = $rentals->revoke($rental);

        return response()->json([
            'rental' => $rentals->format($rental),
        ]);
    }


}
