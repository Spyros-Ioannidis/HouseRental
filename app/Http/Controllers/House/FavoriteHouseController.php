<?php

namespace App\Http\Controllers\House;

use App\Http\Controllers\Controller;

use App\Models\House;
use App\Services\House\Favorites\FavoriteHouseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class FavoriteHouseController extends Controller
{
    public function store(Request $request, House $house, FavoriteHouseService $favorites)
    {
        abort_unless(Gate::allows('favorite', $house), 404);

        $favorites->add($request->user(), $house);

        return $this->respond($request, true, __('ui.flash.favorite_added'));
    }

    public function destroy(Request $request, House $house, FavoriteHouseService $favorites)
    {
        Gate::authorize('unfavorite', $house);

        $favorites->remove($request->user(), $house);

        return $this->respond($request, false, __('ui.flash.favorite_removed'));
    }

    private function respond(Request $request, bool $isFavorited, string $message)
    {
        if ($request->expectsJson() || $request->ajax()) {
            return response()->json([
                'is_favorited' => $isFavorited,
                'message' => $message,
            ]);
        }

        Inertia::flash([
            'message' => $message,
            'flash_id' => now()->getTimestampMs(),
        ]);

        return back();
    }
}
