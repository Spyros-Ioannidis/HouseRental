<?php

namespace Database\Factories;

use App\Models\House;
use App\Models\HouseRental;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseRental>
 */
class HouseRentalFactory extends Factory
{
    protected $model = HouseRental::class;

    public function definition(): array
    {
        return [
            'house_id' => House::factory(),
            'user_id' => User::factory()->create(['role' => 'user'])->id,
            'starts_on' => null,
            'ends_on' => null,
            'confirmed_at' => now(),
            'revoked_at' => null,
            'confirmed_by_id' => User::factory()->create(['role' => 'admin'])->id,
        ];
    }
}
