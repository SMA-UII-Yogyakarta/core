<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

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
        ];
    }
}
