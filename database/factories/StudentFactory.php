<?php

namespace Database\Factories;

use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'nis' => fake()->unique()->numerify('##########'),
            'nisn' => fake()->unique()->numerify('##############'),
            'name' => fake()->name(),
            'birth_date' => fake()->date(max: '2010-01-01'),
            'enrollment_year' => 2025,
            'status' => 'Active',
        ];
    }
}
