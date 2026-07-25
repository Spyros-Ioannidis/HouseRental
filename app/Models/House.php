<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class House extends Model
{
    /** @use HasFactory<\Database\Factories\HouseFactory> */
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING_REVIEW = 'pending_review';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_HIDDEN = 'hidden';
    public const STATUS_RESERVED = 'reserved';
    public const STATUS_RENTED = 'rented';
    public const STATUS_ARCHIVED = 'archived';
    public const STATUS_DELETED = 'deleted';

    public const STATUSES = [
        self::STATUS_PENDING_REVIEW,
        self::STATUS_ACTIVE,
        self::STATUS_HIDDEN,
        self::STATUS_RESERVED,
        self::STATUS_RENTED,
        self::STATUS_ARCHIVED,
        self::STATUS_DELETED,
    ];

    protected $fillable = [
        'title',
        'title_en',
        'title_el',
        'user_id',
        'address',
        'city',
        'city_id',
        'status',
        'latitude',
        'longitude',
        'description',
        'description_en',
        'description_el',
        'year_built',
        'area',
        'price',
        'floor',
        'bathroom',
        'living_room',
        'bedroom',
    ];

    protected $casts = [
        'images' => 'array',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'price' => 'integer',
        'deleted_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function features()
    {
        return $this->belongsToMany(Feature::class);
    }

    public function cityRecord()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'favorite_house')->withTimestamps();
    }

    public function rentals()
    {
        return $this->hasMany(HouseRental::class);
    }

    public function confirmedRentals()
    {
        return $this->rentals()->confirmed();
    }

    public function comments()
    {
        return $this->hasMany(HouseComment::class);
    }

    public function images()
    {
        return $this->hasMany(HouseImage::class)->orderBy('order');
    }

    public function thumbnail()
    {
        $imagePath = "COALESCE(NULLIF(thumbnail_path, ''), NULLIF(path, ''))";
        $storagePath = DB::connection()->getDriverName() === 'sqlite'
            ? "'/storage/' || {$imagePath}"
            : "CONCAT('/storage/', {$imagePath})";

        return $this->hasOne(HouseImage::class)
        ->select([
            'id',
            'house_id',
            DB::raw("
                CASE
                    WHEN {$imagePath} IS NULL
                        THEN '/storage/DefaultProfilePicture.jpg'
                    WHEN {$imagePath} LIKE 'houses%'
                        THEN {$storagePath}
                    ELSE {$imagePath}
                END AS path
            "),
        ])
        ->where('order', 0)
        ->withDefault(function ($image, $house) {
            $image->id = null;
            $image->house_id = $house->id;
            $image->path = '/storage/DefaultProfilePicture.jpg';
        });
    }

    public function localizedTitle(?string $locale = null): string
    {
        return $this->localizedValue('title', $locale);
    }

    public function localizedDescription(?string $locale = null): string
    {
        return $this->localizedValue('description', $locale);
    }

    public function localizedCity(?string $locale = null): string
    {
        return $this->cityRecord?->localizedName($locale)
            ?: $this->city
            ?: '';
    }

    public function applyLocalizedAttributes(?string $locale = null): self
    {
        $this->setAttribute('title', $this->localizedTitle($locale));
        $this->setAttribute('description', $this->localizedDescription($locale));

        if ($this->relationLoaded('features')) {
            $this->features->each(function (Feature $feature) use ($locale): void {
                $feature->setAttribute('name', $feature->localizedName($locale));
            });
        }

        return $this;
    }

    public function isPubliclyVisible(): bool
    {
        return $this->status === self::STATUS_ACTIVE && ! $this->trashed();
    }

    public function isOwnedBy(User $user): bool
    {
        return (int) $this->user_id === (int) $user->id;
    }

    public function hasConfirmedRenter(User $user): bool
    {
        return $this->confirmedRentals()
            ->where('user_id', $user->id)
            ->exists();
    }

    private function localizedValue(string $field, ?string $locale = null): string
    {
        $locale ??= app()->getLocale();
        $localizedColumn = "{$field}_{$locale}";
        $defaultColumn = "{$field}_en";

        return $this->{$localizedColumn}
            ?: $this->{$defaultColumn}
            ?: $this->{$field}
            ?: '';
    }
}
