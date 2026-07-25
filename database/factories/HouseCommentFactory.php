<?php

namespace Database\Factories;

use App\Models\House;
use App\Models\HouseComment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HouseComment>
 */
class HouseCommentFactory extends Factory
{
    protected $model = HouseComment::class;

    public function definition(): array
    {
        $user = User::factory()->create(['role' => 'user']);

        return [
            'house_id' => House::factory(),
            'user_id' => $user->id,
            'author_name' => $user->name,
            'content' => $this->faker->sentence,
        ];
    }
}
