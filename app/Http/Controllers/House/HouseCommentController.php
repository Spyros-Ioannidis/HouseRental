<?php

namespace App\Http\Controllers\House;

use App\Http\Controllers\Controller;

use App\Http\Requests\House\StoreHouseCommentRequest;
use App\Http\Requests\House\UpdateHouseCommentRequest;
use App\Models\House;
use App\Models\HouseComment;
use App\Services\House\Comments\HouseCommentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class HouseCommentController extends Controller
{
    public function index(string $locale, Request $request, House $house, HouseCommentService $comments): JsonResponse
    {
        abort_unless(Gate::allows('view', $house), 404);

        return response()->json($comments->payload($house, $request->user()));
    }

    public function store(
        string $locale,
        StoreHouseCommentRequest $request,
        House $house,
        HouseCommentService $comments,
    ): JsonResponse {
        $validated = $request->validated();
        $comment = $comments->create($house, $request->user(), $validated['content']);

        return response()->json([
            'comment' => $comments->format($comment),
        ], 201);
    }

    public function update(
        string $locale,
        UpdateHouseCommentRequest $request,
        House $house,
        HouseComment $comment,
        HouseCommentService $comments,
    ): JsonResponse {
        $this->abortIfMismatched($house, $comment);

        $validated = $request->validated();
        $comment = $comments->update($comment, $validated['content']);

        return response()->json([
            'comment' => $comments->format($comment),
        ]);
    }

    public function destroy(string $locale, House $house, HouseComment $comment): JsonResponse
    {
        $this->abortIfMismatched($house, $comment);
        Gate::authorize('delete', $comment);

        $comment->delete();

        return response()->json([], 204);
    }

    private function abortIfMismatched(House $house, HouseComment $comment): void
    {
        abort_unless((int) $comment->house_id === (int) $house->id, 404);
    }
}
