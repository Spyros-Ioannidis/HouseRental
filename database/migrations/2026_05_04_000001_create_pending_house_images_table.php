<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_house_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('creation_token');
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name');
            $table->unsignedBigInteger('size');
            $table->unsignedBigInteger('thumbnail_size')->nullable();
            $table->string('mime_type');
            $table->string('thumbnail_mime_type')->nullable();
            $table->integer('order')->default(0);
            $table->timestamp('expires_at')->index();
            $table->timestamps();

            $table->index(['creation_token', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_house_images');
    }
};
