<?php

namespace Database\Factories;

use App\Models\AttendanceTimeSetting;
use Illuminate\Database\Eloquent\Factories\Factory;

class AttendanceTimeSettingFactory extends Factory
{
    protected $model = AttendanceTimeSetting::class;

    public function definition(): array
    {
        return [
            'day' => 'Monday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '08:00:00',
        ];
    }
}
