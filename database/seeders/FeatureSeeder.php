<?php

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            ['name' => 'Garden', 'name_en' => 'Garden', 'name_el' => 'Κήπος'],
            ['name' => 'Basement', 'name_en' => 'Basement', 'name_el' => 'Υπόγειο'],
            ['name' => 'Elevator', 'name_en' => 'Elevator', 'name_el' => 'Ασανσέρ'],
            ['name' => 'Parking', 'name_en' => 'Parking', 'name_el' => 'Στάθμευση'],
            ['name' => 'Balcony', 'name_en' => 'Balcony', 'name_el' => 'Μπαλκόνι'],
            ['name' => 'Storage room', 'name_en' => 'Storage room', 'name_el' => 'Αποθήκη'],
            ['name' => 'Air Conditioning', 'name_en' => 'Air Conditioning', 'name_el' => 'Κλιματισμός'],
            ['name' => 'Heating', 'name_en' => 'Heating', 'name_el' => 'Θέρμανση'],
            ['name' => 'Furnished', 'name_en' => 'Furnished', 'name_el' => 'Επιπλωμένο'],
            ['name' => 'Accessible', 'name_en' => 'Accessible', 'name_el' => 'Προσβάσιμο'],
            ['name' => 'Security door', 'name_en' => 'Security door', 'name_el' => 'Πόρτα ασφαλείας'],
        ];

        foreach ($features as $feature) {
            Feature::updateOrCreate(
                ['name' => $feature['name']],
                $feature,
            );
        }
    }
}
