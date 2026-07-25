<?php

namespace Database\Seeders;

use App\Models\City;
use Illuminate\Database\Seeder;

class CitySeeder extends Seeder
{
    public function run(): void
    {
        collect([
            ['name' => 'Larisa', 'name_en' => 'Larisa', 'name_el' => 'Λάρισα'],
            ['name' => 'Volos', 'name_en' => 'Volos', 'name_el' => 'Βόλος'],
            ['name' => 'Trikala', 'name_en' => 'Trikala', 'name_el' => 'Τρίκαλα'],
        ])->each(fn (array $city) => City::updateOrCreate(
            ['name' => $city['name']],
            $city,
        ));
    }
}
