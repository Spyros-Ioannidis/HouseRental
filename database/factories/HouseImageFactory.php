<?php

namespace Database\Factories;

use App\Models\House;
use App\Models\HouseImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseImage>
 */
class HouseImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seed = $this->faker->uuid();

        return [
            'house_id' => House::factory(),
            'path' => "https://picsum.photos/seed/{$seed}/640/480",
            'original_name' => $this->faker->slug() . '.jpg',
            'size' => $this->faker->numberBetween(80_000, 2_500_000),
            'mime_type' => 'image/jpeg',
            'order' => 0,
        ];
    }
}
