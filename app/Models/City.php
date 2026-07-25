<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;

class City extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'name_en',
        'name_el',
    ];

    public function houses()
    {
        return $this->hasMany(House::class);
    }

    public function localizedName(?string $locale = null): string
    {
        $locale ??= App::getLocale();
        $column = "name_{$locale}";

        return $this->{$column}
            ?: $this->name_en
            ?: $this->name;
    }
}
