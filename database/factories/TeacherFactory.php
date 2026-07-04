<?php

namespace Database\Factories;

use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'teacher_code' => fake()->unique()->numerify('TCH-####'),
        ];
    }
}
