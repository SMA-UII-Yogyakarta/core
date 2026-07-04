<?php

namespace Database\Factories;

use App\Models\AcademicCalendar;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicCalendarFactory extends Factory
{
    protected $model = AcademicCalendar::class;

    public function definition(): array
    {
        return [
            'holiday_date' => fake()->unique()->dateTimeBetween('-1 month', '+3 months')->format('Y-m-d'),
            'description' => fake()->randomElement([
                'Libur Nasional',
                'Libur Hari Raya',
                'Cuti Bersama',
                'Libur Semester',
                'Hari Besar Keagamaan',
            ]),
            'is_holiday' => true,
        ];
    }
}
