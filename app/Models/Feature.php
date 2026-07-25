<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feature extends Model
{
    /** @use HasFactory<\Database\Factories\FeaturesFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'name_el',
    ];

    public function houses()
    {
        return $this->belongsToMany(House::class);
    }

    public function localizedName(?string $locale = null): string
    {
        $locale ??= app()->getLocale();
        $column = "name_{$locale}";

        return $this->{$column}
            ?: $this->name_en
            ?: $this->name;
    }
}
