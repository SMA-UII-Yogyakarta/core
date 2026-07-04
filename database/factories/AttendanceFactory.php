<?php

namespace Database\Factories;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceFactory extends Factory
{
    protected $model = Attendance::class;

    public function definition(): array
    {
        $status = fake()->randomElement(['Present', 'Late', 'Absent']);
        $isAbsent = $status === 'Absent';

        return [
            'attendance_date' => fake()
                ->dateTimeBetween('-1 month', 'now')
                ->format('Y-m-d'),
            'check_in_time' => $isAbsent
                ? '00:00:00'
                : fake()->randomElement([
                    '06:45:00',
                    '06:50:00',
                    '06:55:00',
                    '07:00:00',
                    '07:05:00',
                    '07:10:00',
                ]),
            'latitude' => $isAbsent ? '0.000000' : fake()->latitude(-8, -7),
            'longitude' => $isAbsent ? '0.000000' : fake()->longitude(110, 111),
            'photo_url' => $isAbsent
                ? ''
                : 'https://via.placeholder.com/320x240?text=Selfie',
            'status' => $status,
        ];
    }
}
