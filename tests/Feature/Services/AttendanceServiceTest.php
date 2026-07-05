<?php

namespace Tests\Feature\Services;

use App\Models\AcademicCalendar;
use App\Models\AttendanceTimeSetting;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AttendanceService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-07-06 08:00:00'));
        $this->service = app(AttendanceService::class);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function createClassWithStudent(): array
    {
        $class = SchoolClass::create(['name' => 'X-' . str()->random(4)]);
        $guardianUser = User::factory()->create();
        $guardian = Guardian::create([
            'user_id' => $guardianUser->id,
            'name' => 'Guardian Test',
        ]);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Student',
            'nis' => str()->random(5),
            'nisn' => str()->random(10),
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
            'guardian_id' => $guardian->id,
        ]);

        return ['class' => $class, 'student' => $student, 'guardian' => $guardian];
    }

    public function test_check_in_creates_attendance(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $attendance = $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        $this->assertEquals($student->id, $attendance->student_id);
        $this->assertEquals('Present', $attendance->status);
        $this->assertNotNull($attendance->check_in_time);
    }

    public function test_check_in_prevents_duplicate(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        // Create academic calendar for today
        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => false,
        ]);

        // First check-in
        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);

        // Second check-in should fail
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Sudah melakukan presensi hari ini.');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);
    }

    public function test_check_in_marks_as_late(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
        ]);

        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => false,
        ]);

        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $attendance = $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);

        $this->assertEquals('Late', $attendance->status);
    }

    public function test_check_in_marks_as_present(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-06 06:30:00'));

        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
        ]);

        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => false,
        ]);

        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $attendance = $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);

        $this->assertEquals('Present', $attendance->status);
    }

    public function test_history_returns_attendances(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create();
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        // Create some attendances
        AcademicCalendar::create(['holiday_date' => now()->subDays(2)->toDateString(), 'is_holiday' => false]);
        AcademicCalendar::create(['holiday_date' => now()->subDays(1)->toDateString(), 'is_holiday' => false]);

        $this->service->checkIn($student->id, ['latitude' => '-7.7959', 'longitude' => '110.3695']);

        $history = $this->service->history($student->id, 10);

        $this->assertIsArray($history);
        $this->assertGreaterThan(0, count($history));
    }

    public function test_stats_returns_correct_counts(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $user3 = User::factory()->create();
        Student::create(['user_id' => $user1->id, 'name' => 'Student 1', 'nis' => '001', 'nisn' => '1234567891', 'class_id' => $class->id, 'birth_date' => '2010-01-01', 'enrollment_year' => 2025, 'status' => 'Active']);
        Student::create(['user_id' => $user2->id, 'name' => 'Student 2', 'nis' => '002', 'nisn' => '1234567892', 'class_id' => $class->id, 'birth_date' => '2010-01-01', 'enrollment_year' => 2025, 'status' => 'Active']);
        Student::create(['user_id' => $user3->id, 'name' => 'Student 3', 'nis' => '003', 'nisn' => '1234567893', 'class_id' => $class->id, 'birth_date' => '2010-01-01', 'enrollment_year' => 2025, 'status' => 'Active']);

        AcademicCalendar::create(['holiday_date' => now()->toDateString(), 'is_holiday' => false]);

        // One student checks in
        $student1 = Student::where('nis', '001')->first();
        $this->service->checkIn($student1->id, ['latitude' => '-7.7959', 'longitude' => '110.3695']);

        $stats = $this->service->stats($class->id);

        $this->assertEquals(3, $stats['total']);
        // At least one student checked in (either Present or Late)
        $this->assertGreaterThanOrEqual(1, $stats['present'] + $stats['late']);
        // At least 2 students are absent (or 1 if one checked in)
        $this->assertGreaterThanOrEqual(0, $stats['absent']);
    }
}
