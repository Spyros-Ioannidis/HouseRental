<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'email_verified_at',
        'role',
        'profile_picture',
        'contact_phone',
        'contact_email',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'name',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    protected function name(): Attribute
    {
        return Attribute::make(
            get: fn ($value, array $attributes) => $this->fullName($attributes, $value),
            set: function (?string $value): array {
                [$firstName, $lastName] = $this->splitFullName($value);

                return [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                ];
            },
        );
    }

    public function scopeWhereNameLike(Builder $query, string $search): Builder
    {
        $search = trim($search);

        return $query->where(function (Builder $nameQuery) use ($search) {
            $nameQuery
                ->where('first_name', 'like', "%{$search}%")
                ->orWhere('last_name', 'like', "%{$search}%");

            foreach (preg_split('/\s+/', $search) ?: [] as $term) {
                if ($term === '' || $term === $search) {
                    continue;
                }

                $nameQuery
                    ->orWhere('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%");
            }
        });
    }

    public function scopeOrderByName(Builder $query, string $direction = 'asc'): Builder
    {
        return $query
            ->orderBy('first_name', $direction)
            ->orderBy('last_name', $direction);
    }

    public function houses()
    {
        return $this->hasMany(House::class);
    }

    public function favoriteHouses()
    {
        return $this->belongsToMany(House::class, 'favorite_house')->withTimestamps();
    }

    public function contactMessages()
    {
        return $this->hasMany(ContactMessage::class);
    }

    public function houseRentals()
    {
        return $this->hasMany(HouseRental::class);
    }

    public function houseComments()
    {
        return $this->hasMany(HouseComment::class);
    }

    private function fullName(array $attributes, mixed $fallback = null): string
    {
        $name = trim(implode(' ', array_filter([
            $attributes['first_name'] ?? '',
            $attributes['last_name'] ?? '',
        ], fn ($part) => $part !== null && $part !== '')));

        return $name !== '' ? $name : (string) ($fallback ?? '');
    }

    private function splitFullName(?string $name): array
    {
        $name = trim((string) $name);

        if ($name === '') {
            return ['', ''];
        }

        $parts = preg_split('/\s+/', $name, 2);

        return [$parts[0], $parts[1] ?? ''];
    }
}
