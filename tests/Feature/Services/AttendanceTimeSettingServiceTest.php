<?php

namespace Tests\Feature\Services;

use App\Models\AttendanceTimeSetting;
use App\Services\AttendanceTimeSettingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceTimeSettingServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AttendanceTimeSettingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AttendanceTimeSettingService::class);
    }

    public function test_findAll_returns_all_settings(): void
    {
        AttendanceTimeSetting::create([
            'day' => 'Monday',
            'check_in_open' => '07:00:00',
            'late_threshold' => '08:00:00',
            'check_in_close' => '16:00:00',
        ]);
        AttendanceTimeSetting::create([
            'day' => 'Tuesday',
            'check_in_open' => '07:00:00',
            'late_threshold' => '08:00:00',
            'check_in_close' => '16:00:00',
        ]);

        $settings = $this->service->findAll();

        $this->assertCount(2, $settings);
    }

    public function test_updateOrCreate_creates_new_setting(): void
    {
        $setting = $this->service->updateOrCreate([
            'day' => 'Monday',
            'check_in_open' => '07:00:00',
            'late_threshold' => '08:00:00',
            'check_in_close' => '16:00:00',
        ]);

        $this->assertEquals('Monday', $setting->day);
        $this->assertEquals('07:00:00', $setting->check_in_open->format('H:i:s'));
    }

    public function test_updateOrCreate_updates_existing_setting(): void
    {
        AttendanceTimeSetting::create([
            'day' => 'Monday',
            'check_in_open' => '07:00:00',
            'late_threshold' => '08:00:00',
            'check_in_close' => '16:00:00',
        ]);

        $setting = $this->service->updateOrCreate([
            'day' => 'Monday',
            'check_in_open' => '07:30:00',
            'late_threshold' => '08:30:00',
            'check_in_close' => '16:30:00',
        ]);

        $this->assertEquals('07:30:00', $setting->check_in_open->format('H:i:s'));
        $this->assertEquals('08:30:00', $setting->late_threshold->format('H:i:s'));
    }

    public function test_bulkUpdate_updates_multiple_settings(): void
    {
        $settings = [
            [
                'day' => 'Monday',
                'check_in_open' => '07:00:00',
                'late_threshold' => '08:00:00',
                'check_in_close' => '16:00:00',
            ],
            [
                'day' => 'Tuesday',
                'check_in_open' => '07:00:00',
                'late_threshold' => '08:00:00',
                'check_in_close' => '16:00:00',
            ],
        ];

        $this->service->bulkUpdate($settings);

        $this->assertDatabaseCount('attendance_time_settings', 2);
        $this->assertDatabaseHas('attendance_time_settings', ['day' => 'Monday']);
        $this->assertDatabaseHas('attendance_time_settings', ['day' => 'Tuesday']);
    }
}
