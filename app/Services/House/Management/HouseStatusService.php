<?php

namespace App\Services\House\Management;

use App\Models\House;
use App\Models\User;

class HouseStatusService
{
    public function optionsFor(?User $user, ?House $house = null, bool $forCreate = false): array
    {
        $labels = $this->labels();

        return collect($this->valuesFor($user, $house, $forCreate))
            ->map(fn (string $status) => [
                'value' => $status,
                'label' => $labels[$status] ?? $status,
            ])
            ->values()
            ->all();
    }

    public function defaultFor(User $user): string
    {
        return $user->role === 'admin'
            ? House::STATUS_ACTIVE
            : House::STATUS_PENDING_REVIEW;
    }

    public function valuesFor(?User $user, ?House $house = null, bool $forCreate = false): array
    {
        if ($user?->role === 'admin') {
            return array_values(array_filter(
                House::STATUSES,
                fn (string $status) => $status !== House::STATUS_DELETED,
            ));
        }

        if ($forCreate || ! $house) {
            return [House::STATUS_PENDING_REVIEW];
        }

        $statuses = [
            House::STATUS_PENDING_REVIEW,
            House::STATUS_HIDDEN,
            House::STATUS_RESERVED,
            House::STATUS_RENTED,
            House::STATUS_ARCHIVED,
        ];

        if ($house->status === House::STATUS_ACTIVE) {
            $statuses[] = House::STATUS_ACTIVE;
        }

        return array_values(array_unique($statuses));
    }

    public function labels(): array
    {
        return [
            House::STATUS_PENDING_REVIEW => __('ui.status.pending_review'),
            House::STATUS_ACTIVE => __('ui.status.active'),
            House::STATUS_HIDDEN => __('ui.status.hidden'),
            House::STATUS_RESERVED => __('ui.status.reserved'),
            House::STATUS_RENTED => __('ui.status.rented'),
            House::STATUS_ARCHIVED => __('ui.status.archived'),
            House::STATUS_DELETED => __('ui.status.deleted'),
        ];
    }
}
