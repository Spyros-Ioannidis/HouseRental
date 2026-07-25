<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PendingHouseImage extends Model
{
    protected $fillable = [
        'creation_token',
        'user_id',
        'session_id',
        'path',
        'thumbnail_path',
        'original_name',
        'size',
        'thumbnail_size',
        'mime_type',
        'thumbnail_mime_type',
        'order',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    protected $appends = ['url', 'name'];

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
