<?php

namespace App\Services\House\Comments;

use App\Models\House;
use App\Models\HouseComment;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class HouseCommentService
{
    public function payload(House $house, ?User $user): array
    {
        return [
            'comments' => $this->commentsFor($house),
            'can_comment' => $user
                ? Gate::forUser($user)->allows('create', [HouseComment::class, $house])
                : false,
            'can_moderate' => $user?->role === 'admin',
            'active_user' => $user ? $this->activeUser($user) : null,
        ];
    }

    public function commentsFor(House $house): array
    {
        return $house->comments()
            ->with('user:id,first_name,last_name,profile_picture')
            ->oldest()
            ->get()
            ->map(fn (HouseComment $comment) => $this->format($comment))
            ->all();
    }

    public function moderationFor(House $house): array
    {
        return $house->comments()
            ->with('user:id,first_name,last_name,email')
            ->latest()
            ->get()
            ->map(fn (HouseComment $comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'author_name' => $comment->author_name,
                'created_at' => $comment->created_at?->toIso8601String(),
                'user' => $comment->user?->only(['id', 'first_name', 'last_name', 'name', 'email']),
            ])
            ->all();
    }

    public function create(House $house, User $user, string $content): HouseComment
    {
        return $house->comments()->create([
            'user_id' => $user->id,
            'author_name' => $this->displayName($user),
            'content' => $content,
        ])->load('user:id,first_name,last_name,profile_picture');
    }

    public function update(HouseComment $comment, string $content): HouseComment
    {
        $comment->update(['content' => $content]);

        return $comment->refresh()->load('user:id,first_name,last_name,profile_picture');
    }

    public function format(HouseComment $comment): array
    {
        $user = $comment->user;
        $authorId = $comment->user_id ?? "comment-{$comment->id}";

        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'author' => [
                'id' => $authorId,
                'name' => $comment->author_name,
                'avatar' => $user?->profile_picture,
            ],
            'date' => $comment->created_at?->toIso8601String(),
            'format' => 'text',
            'user' => $authorId,
        ];
    }

    public function activeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $this->displayName($user),
            'avatar' => $user->profile_picture,
        ];
    }

    private function displayName(User $user): string
    {
        return $user->name !== '' ? $user->name : $user->email;
    }
}
