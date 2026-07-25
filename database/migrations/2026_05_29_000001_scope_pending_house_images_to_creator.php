<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pending_house_images', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->nullable()
                ->after('creation_token')
                ->constrained()
                ->nullOnDelete();
            $table->string('session_id', 120)
                ->nullable()
                ->after('user_id');

            $table->index(['creation_token', 'user_id', 'session_id'], 'pending_house_images_scope_index');
        });
    }

    public function down(): void
    {
        Schema::table('pending_house_images', function (Blueprint $table) {
            $table->dropIndex('pending_house_images_scope_index');
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'session_id']);
        });
    }
};
