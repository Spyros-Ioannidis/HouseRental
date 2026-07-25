<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('name_en')->nullable();
            $table->string('name_el')->nullable();
            $table->timestamps();
        });

        Schema::create('houses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('title');
            $table->string('title_en')->nullable();
            $table->string('title_el')->nullable();
            $table->text('description');
            $table->text('description_en')->nullable();
            $table->text('description_el')->nullable();
            $table->integer('year_built');
            $table->string('address');
            $table->string('city')->nullable();
            $table->foreignId('city_id')->nullable()->constrained()->restrictOnDelete();
            $table->string('status')->default('active')->index();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            $table->integer('area')->nullable();
            $table->unsignedInteger('price');

            $table->integer('floor')->nullable();
            $table->integer('bathroom')->default(1);
            $table->integer('living_room')->default(1);
            $table->integer('bedroom')->default(1);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['latitude', 'longitude']);
        });

        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_en')->nullable();
            $table->string('name_el')->nullable();
            $table->timestamps();
        });

        Schema::create('feature_house', function (Blueprint $table) {
            $table->id();

            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->foreignId('feature_id')->constrained()->cascadeOnDelete();

            $table->unique(['house_id', 'feature_id']);
        });

        Schema::create('favorite_house', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'house_id']);
        });

        Schema::create('house_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('thumbnail_path')->nullable();
            $table->string('original_name');
            $table->unsignedBigInteger('size');
            $table->unsignedBigInteger('thumbnail_size')->nullable();
            $table->string('mime_type');
            $table->string('thumbnail_mime_type')->nullable();
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['house_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('house_images');
        Schema::dropIfExists('favorite_house');
        Schema::dropIfExists('feature_house');
        Schema::dropIfExists('features');
        Schema::dropIfExists('houses');
        Schema::dropIfExists('cities');
    }
};
