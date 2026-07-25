<?php

namespace App\Models;

use Database\Factories\HouseImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class HouseImage extends Model
{
    /** @use HasFactory<HouseImageFactory> */
    use HasFactory;

    protected $fillable = [
        'house_id',
        'path',
        'thumbnail_path',
        'original_name',
        'size',
        'thumbnail_size',
        'mime_type',
        'thumbnail_mime_type',
        'order',
    ];

    protected $appends = ['url', 'name'];

    public function house(): BelongsTo
    {
        return $this->belongsTo(House::class);
    }

    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, 'http://') || str_starts_with($this->path, 'https://')) {
            return $this->path;
        }

        return Storage::disk('public')->url($this->path);
    }

    public function getNameAttribute(): string
    {
        return $this->original_name ?: basename($this->path);
    }
}
