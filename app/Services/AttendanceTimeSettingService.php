<?php

namespace App\Services;

use App\Models\AttendanceTimeSetting;
use Illuminate\Database\Eloquent\Collection;

class AttendanceTimeSettingService
{
    public function findAll(): Collection
    {
        return AttendanceTimeSetting::all();
    }

    public function updateOrCreate(array $data): AttendanceTimeSetting
    {
        return AttendanceTimeSetting::updateOrCreate(
            ['day' => $data['day']],
            [
                'check_in_open' => $data['check_in_open'],
                'late_threshold' => $data['late_threshold'],
                'check_in_close' => $data['check_in_close'],
            ],
        );
    }

    public function bulkUpdate(array $settings): void
    {
        foreach ($settings as $setting) {
            $this->updateOrCreate($setting);
        }
    }
}
