<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class HouseComment extends Model
{
    /** @use HasFactory<\Database\Factories\HouseCommentFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'house_id',
        'user_id',
        'author_name',
        'content',
    ];

    public function house()
    {
        return $this->belongsTo(House::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
