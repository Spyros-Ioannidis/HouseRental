<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HouseRental extends Model
{
    /** @use HasFactory<\Database\Factories\HouseRentalFactory> */
    use HasFactory;

    protected $fillable = [
        'house_id',
        'user_id',
        'starts_on',
        'ends_on',
        'confirmed_at',
        'revoked_at',
        'confirmed_by_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
            'confirmed_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function confirmedBy()
    {
        return $this->belongsTo(User::class, 'confirmed_by_id');
    }

    public function scopeConfirmed(Builder $query): Builder
    {
        return $query->whereNull('revoked_at');
    }
}
