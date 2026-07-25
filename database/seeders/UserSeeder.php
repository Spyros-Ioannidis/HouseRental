<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $demoAccounts = [
            [
                'first_name' => 'Demo',
                'last_name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => 'Admin#123',
                'role' => 'admin',
            ],
            [
                'first_name' => 'Demo',
                'last_name' => 'Agent',
                'email' => 'agent@example.com',
                'password' => 'Agent#123',
                'role' => 'agent',
            ],
            [
                'first_name' => 'Demo',
                'last_name' => 'User',
                'email' => 'user@example.com',
                'password' => 'User#123',
                'role' => 'user',
            ],
            [
                'first_name' => 'Demo',
                'last_name' => 'Admin2',
                'email' => 'admin2@example.com',
                'password' => 'Admin2#123',
                'role' => 'admin',
            ],

        ];

        foreach ($demoAccounts as $account) {
            $user = User::firstOrNew(['email' => $account['email']]);
            $user->forceFill([
                'first_name' => $account['first_name'],
                'last_name' => $account['last_name'],
                'password' => Hash::make($account['password']),
                'role' => $account['role'],
                'email_verified_at' => now(),
            ])->save();
        }

        User::where('email', '1@1.com')->first()
        ?? User::factory()->create([
            'first_name' => 'Demo',
            'last_name' => 'One',
            'email' => '1@1.com',
            'password' => Hash::make('DemoOne#123'),
            'role' => 'admin',
        ]);

        User::factory(10)->create();

        $roles = ['admin', 'agent', 'user'];

        for ($i = 0; $i < 3; $i++) {
            User::factory()->create([
                'role' => $roles[$i % count($roles)],
            ]);
        }
    }
}
