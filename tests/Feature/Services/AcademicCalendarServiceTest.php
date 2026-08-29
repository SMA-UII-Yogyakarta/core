<?php

namespace Tests\Feature\Services;

use App\Models\AcademicCalendar;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\AcademicCalendarService;
use Carbon\Carbon;
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

    public function test_isSchoolDay_false_when_day_inactive(): void
    {
        // Saturday without any active period is not a school day
        $saturday = \Carbon\Carbon::parse('2026-08-29');

        $this->assertFalse($this->service->isSchoolDay($saturday->toDateString()));
    }

    public function test_isSchoolDay_false_when_day_missing_schedule(): void
    {
        $monday = \Carbon\Carbon::parse('2026-08-10'); // Monday, no AttendanceTimeSetting row

        $this->assertFalse($this->service->isSchoolDay($monday->toDateString()));
    }

    public function test_isSchoolDay_false_on_active_holiday(): void
    {
        $weekday = \Carbon\Carbon::parse('2026-08-17'); // Monday
        \App\Models\AttendanceTimeSetting::create([
            'day' => $weekday->format('l'),
            'check_in_open' => '06:30:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:30:00',
            'is_active' => true,
        ]);
        AcademicCalendar::create([
            'holiday_date' => $weekday->toDateString(),
            'description' => 'HUT RI',
            'is_holiday' => true,
        ]);

        $this->assertFalse($this->service->isSchoolDay($weekday->toDateString()));
    }

    public function test_isSchoolDay_true_on_active_regular_weekday(): void
    {
        $weekday = \Carbon\Carbon::parse('2026-08-17'); // Monday
        \App\Models\AttendanceTimeSetting::create([
            'day' => $weekday->format('l'),
            'check_in_open' => '06:30:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:30:00',
            'is_active' => true,
        ]);
        AcademicCalendar::create([
            'holiday_date' => $weekday->toDateString(),
            'description' => 'Only an event, not a holiday',
            'is_holiday' => false,
        ]);

        $this->assertTrue($this->service->isSchoolDay($weekday->toDateString()));
    }

    public function test_isAlpaApplicable_false_for_future_date(): void
    {
        $future = \Carbon\Carbon::parse('2026-12-25')->toDateString();

        $this->assertFalse($this->service->isAlpaApplicable($future));
    }

    public function test_isAlpaApplicable_true_for_past_date(): void
    {
        $past = now()->subDay()->toDateString();

        $this->assertTrue($this->service->isAlpaApplicable($past));
    }

    public function test_isAlpaApplicable_false_today_before_close(): void
    {
        \Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-10 06:00:00')); // Monday before 07:30 close
        \App\Models\AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:30:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:30:00',
            'is_active' => true,
        ]);

        $this->assertFalse($this->service->isAlpaApplicable(now()->toDateString()));

        \Carbon\Carbon::setTestNow();
    }

    public function test_isAlpaApplicable_true_today_after_close(): void
    {
        \Carbon\Carbon::setTestNow(\Carbon\Carbon::parse('2026-08-10 11:00:00')); // Monday after 07:30 close
        \App\Models\AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:30:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:30:00',
            'is_active' => true,
        ]);
        $this->assertTrue($this->service->isAlpaApplicable(now()->toDateString()));

        \Carbon\Carbon::setTestNow();
    }

    public function test_summarize_approved_leave_days_dedups_and_prefers_sick(): void
    {
        $this->seedActiveWeekdays();
        $student = $this->createStudent();

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $student->guardian_id,
            'category' => 'Event',
            'start_date' => '2026-08-27',
            'end_date' => '2026-08-27',
            'approval_status' => 'Approved',
        ]);
        // Two approved leaves on the same day, different category: Sick must win.
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $student->guardian_id,
            'category' => 'Event',
            'start_date' => '2026-08-28',
            'end_date' => '2026-08-28',
            'approval_status' => 'Approved',
        ]);
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $student->guardian_id,
            'category' => 'Sick',
            'start_date' => '2026-08-28',
            'end_date' => '2026-08-28',
            'approval_status' => 'Approved',
        ]);

        $summary = $this->service->summarizeApprovedLeaveDays(
            LeaveRequest::all(),
            Carbon::parse('2026-08-01'),
            Carbon::parse('2026-08-31'),
        );

        // 27/8 = permit, 28/8 = sick (deduped, Sick wins) -> 1 each, no double count.
        $this->assertEquals(1, $summary['permit'][$student->id]);
        $this->assertEquals(1, $summary['sick'][$student->id]);
    }

    public function test_summarize_approved_leave_days_skips_weekends(): void
    {
        $this->seedActiveWeekdays();
        $student = $this->createStudent();

        // Leave spanning Friday (28) through Sunday (30) 2026.
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $student->guardian_id,
            'category' => 'Event',
            'start_date' => '2026-08-28',
            'end_date' => '2026-08-30',
            'approval_status' => 'Approved',
        ]);

        $summary = $this->service->summarizeApprovedLeaveDays(
            LeaveRequest::all(),
            Carbon::parse('2026-08-01'),
            Carbon::parse('2026-08-31'),
        );

        // Only Friday 28/8 is a school day; the weekend is skipped.
        $this->assertEquals(1, $summary['permit'][$student->id]);
        $this->assertArrayNotHasKey($student->id, $summary['sick']);
    }

    private function seedActiveWeekdays(): void
    {
        foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as $day) {
            \App\Models\AttendanceTimeSetting::create([
                'day' => $day,
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
                'is_active' => true,
            ]);
        }
    }

    private function createStudent(): Student
    {
        $class = SchoolClass::create(['name' => 'X-' . str()->random(4)]);
        $guardian = Guardian::create([
            'user_id' => User::factory()->create()->id,
            'name' => 'Guardian Test',
        ]);
        $student = Student::create([
            'user_id' => User::factory()->create()->id,
            'name' => 'Student',
            'nis' => str()->random(5),
            'nisn' => str()->random(10),
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
            'guardian_id' => $guardian->id,
        ]);

        return $student;
    }
}
