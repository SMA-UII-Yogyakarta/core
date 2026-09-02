<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    protected $model = SchoolClass::class;

    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'X-A (Reguler)',
                'X-B (Reguler)',
                'XI-A (Reguler)',
                'XI-B (Reguler)',
                'XII-A (Reguler)',
            ]),
            'level' => 'X',
            'academic_year' => '2024/2025',
            'capacity' => 36,
        ];
    }
}
