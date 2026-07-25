<?php

namespace App\Services\Contact;

use App\Models\ContactMessage;
use App\Models\House;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ContactMessageService
{
    public function store(array $attributes, ?User $user): void
    {
        $house = null;

        if (! empty($attributes['house_id'])) {
            $house = House::query()
                ->whereKey($attributes['house_id'])
                ->where('status', House::STATUS_ACTIVE)
                ->firstOrFail();

            if (! empty($attributes['agent_id']) && (int) $attributes['agent_id'] !== (int) $house->user_id) {
                throw ValidationException::withMessages([
                    'agent_id' => 'The selected agent does not manage this listing.',
                ]);
            }

            $attributes['agent_id'] = $house->user_id;
        }

        if (! empty($attributes['agent_id'])) {
            $agent = User::query()
                ->whereKey($attributes['agent_id'])
                ->whereIn('role', ['agent', 'admin'])
                ->first();

            if (! $agent) {
                throw ValidationException::withMessages([
                    'agent_id' => 'The selected agent is not available.',
                ]);
            }
        }

        $attributes['user_id'] = $user?->id;
        $attributes['source'] = $house ? 'listing' : (! empty($attributes['agent_id']) ? 'agent' : 'general');

        ContactMessage::create($attributes);
    }

    public function paginatedForAdmin(Request $request)
    {
        $query = $this->visibleTo($request->user())
            ->with([
                'user:id,first_name,last_name,email',
                'agent:id,first_name,last_name,email',
                'house:id,title,user_id',
            ]);

        if ($request->filled('search')) {
            $search = $request->input('search');

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%")
                    ->orWhereHas('agent', function ($agentQuery) use ($search) {
                        $agentQuery->whereNameLike($search)
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('house', function ($houseQuery) use ($search) {
                        $houseQuery->where('title', 'like', "%{$search}%");
                    });
            });
        }

        $sortKey = $request->input('sortKey');
        $sortDirection = $request->input('sortDirection');
        $sortable = ['name', 'email', 'subject', 'created_at', 'read_at', 'source'];

        if (in_array($sortKey, $sortable, true) && in_array($sortDirection, ['asc', 'desc'], true)) {
            $query->orderBy($sortKey, $sortDirection);
        } else {
            $query->latest();
        }

        return $query->paginate(10)->withQueryString();
    }

    public function visibleTo(?User $user)
    {
        return ContactMessage::query()
            ->when($user?->role !== 'admin', function ($query) use ($user) {
                $query->where(function ($visible) use ($user) {
                    $visible->where('agent_id', $user->id)
                        ->orWhereHas('house', function ($houseQuery) use ($user) {
                            $houseQuery->where('user_id', $user->id);
                        });
                });
            });
    }

    public function markRead(ContactMessage $contact): void
    {
        if (! $contact->read_at) {
            $contact->forceFill(['read_at' => now()])->save();
        }
    }
}
