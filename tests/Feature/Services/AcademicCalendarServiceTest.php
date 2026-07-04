<?php

namespace Tests\Feature\Services;

use App\Models\AcademicCalendar;
use App\Services\AcademicCalendarService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicCalendarServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AcademicCalendarService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(AcademicCalendarService::class);
    }

    public function test_create_creates_calendar_event(): void
    {
        $calendar = $this->service->create([
            'holiday_date' => '2025-12-25',
            'description' => 'Hari Natal',
            'is_holiday' => true,
        ]);

        $this->assertEquals('2025-12-25', $calendar->holiday_date->toDateString());
        $this->assertEquals('Hari Natal', $calendar->description);
        $this->assertTrue($calendar->is_holiday);
    }

    public function test_update_modifies_calendar_event(): void
    {
        $calendar = AcademicCalendar::create([
            'holiday_date' => '2025-12-25',
            'description' => 'Hari Natal',
            'is_holiday' => true,
        ]);

        $updated = $this->service->update($calendar->id, [
            'description' => 'Libur Natal',
            'is_holiday' => false,
        ]);

        $this->assertEquals('Libur Natal', $updated->description);
        $this->assertFalse($updated->is_holiday);
    }

    public function test_delete_removes_calendar_event(): void
    {
        $calendar = AcademicCalendar::create([
            'holiday_date' => '2025-12-25',
            'description' => 'Hari Natal',
            'is_holiday' => true,
        ]);

        $this->service->delete($calendar->id);

        $this->assertDatabaseMissing('academic_calendars', ['id' => $calendar->id]);
    }

    public function test_isHoliday_returns_true_for_holiday(): void
    {
        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'description' => 'Test Holiday',
            'is_holiday' => true,
        ]);

        $this->assertTrue($this->service->isHoliday(now()->toDateString()));
    }

    public function test_isHoliday_returns_false_for_non_holiday(): void
    {
        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'description' => 'Not a Holiday',
            'is_holiday' => false,
        ]);

        $this->assertFalse($this->service->isHoliday(now()->toDateString()));
    }

    public function test_findAll_returns_all_calendars(): void
    {
        AcademicCalendar::create([
            'holiday_date' => '2025-12-25',
            'is_holiday' => true,
        ]);
        AcademicCalendar::create([
            'holiday_date' => '2026-01-01',
            'is_holiday' => true,
        ]);

        $all = $this->service->findAll();

        $this->assertCount(2, $all);
    }
}
