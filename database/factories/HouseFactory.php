<?php

namespace Database\Factories;

use App\Models\City;
use App\Models\Feature;
use App\Models\House;
use App\Models\HouseImage;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<House>
 */
class HouseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $user = User::where('role', 'agent')->inRandomOrder()->first();
        $city = City::inRandomOrder()->first()
            ?? City::create([
                'name' => 'Larisa',
                'name_en' => 'Larisa',
                'name_el' => null,
            ]);
        $location = collect([
            ['city' => 'Larisa', 'latitude' => 39.6390, 'longitude' => 22.4191],
            ['city' => 'Volos', 'latitude' => 39.3622, 'longitude' => 22.9422],
            ['city' => 'Trikala', 'latitude' => 39.5557, 'longitude' => 21.7679],
        ])->firstWhere('city', $city?->name) ?? [
            'city' => $city->name,
            'latitude' => 39.6390,
            'longitude' => 22.4191,
        ];

        return [
            'user_id' => $user?->id ?? User::factory()->create(['role' => 'agent'])->id,
            'created_at' => now(),
            'updated_at' => now(),

            'title' => $title = $this->faker->sentence(3),
            'title_en' => $title,
            'title_el' => null,
            'description' => $description = $this->faker->paragraph,
            'description_en' => $description,
            'description_el' => null,
            'year_built' => $this->faker->numberBetween(1950, 2025),
            'address' => $this->faker->streetAddress,
            'city' => $location['city'],
            'city_id' => $city->id,
            'status' => House::STATUS_ACTIVE,
            'latitude' => $this->faker->latitude($location['latitude'] - 0.04, $location['latitude'] + 0.04),
            'longitude' => $this->faker->longitude($location['longitude'] - 0.04, $location['longitude'] + 0.04),
            'area' => $this->faker->numberBetween(20, 100), // sq meters
            'price' => $this->faker->numberBetween(200, 1000),
            'floor' => $this->faker->numberBetween(1, 5),
            'bathroom' => $this->faker->numberBetween(1, 3),
            'living_room' => $this->faker->numberBetween(1, 3),
            'bedroom' => $this->faker->numberBetween(1, 3),
        ];
    }

    public function configure()
    {
        return $this->afterCreating(function (House $house) {
            $features = Feature::inRandomOrder()->take(rand(2, 5))->pluck('id');
            $house->features()->sync($features);

            HouseImage::factory()
                ->count(rand(3, 7))
                ->sequence(fn ($sequence) => ['order' => $sequence->index])
                ->for($house)
                ->create();
        });
    }
}
