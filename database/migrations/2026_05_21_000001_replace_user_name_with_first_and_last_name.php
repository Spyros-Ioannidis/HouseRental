<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        $hasName = Schema::hasColumn('users', 'name');

        if (! Schema::hasColumn('users', 'first_name')) {
            Schema::table('users', function (Blueprint $table) use ($hasName) {
                $table->string('first_name')->default('')->after($hasName ? 'name' : 'id');
            });
        }

        if (! Schema::hasColumn('users', 'last_name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('last_name')->default('')->after('first_name');
            });
        }

        if ($hasName) {
            DB::table('users')
                ->select(['id', 'name'])
                ->orderBy('id')
                ->chunkById(100, function ($users): void {
                    foreach ($users as $user) {
                        [$firstName, $lastName] = $this->splitName($user->name);

                        DB::table('users')
                            ->where('id', $user->id)
                            ->update([
                                'first_name' => $firstName,
                                'last_name' => $lastName,
                            ]);
                    }
                });

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('name');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable('users')) {
            return;
        }

        $hasFirstName = Schema::hasColumn('users', 'first_name');
        $hasLastName = Schema::hasColumn('users', 'last_name');

        if (! Schema::hasColumn('users', 'name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('name')->default('')->after('id');
            });
        }

        if ($hasFirstName || $hasLastName) {
            $columns = ['id'];

            if ($hasFirstName) {
                $columns[] = 'first_name';
            }

            if ($hasLastName) {
                $columns[] = 'last_name';
            }

            DB::table('users')
                ->select($columns)
                ->orderBy('id')
                ->chunkById(100, function ($users) use ($hasFirstName, $hasLastName): void {
                    foreach ($users as $user) {
                        $name = trim(implode(' ', array_filter([
                            $hasFirstName ? $user->first_name : '',
                            $hasLastName ? $user->last_name : '',
                        ], fn ($part) => $part !== null && $part !== '')));

                        DB::table('users')
                            ->where('id', $user->id)
                            ->update(['name' => $name]);
                    }
                });
        }

        if ($hasLastName) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('last_name');
            });
        }

        if ($hasFirstName) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('first_name');
            });
        }
    }

    private function splitName(?string $name): array
    {
        $name = trim((string) $name);

        if ($name === '') {
            return ['', ''];
        }

        $parts = preg_split('/\s+/', $name, 2);

        return [$parts[0], $parts[1] ?? ''];
    }
};
