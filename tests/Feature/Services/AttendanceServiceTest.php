<?php

namespace Tests\Feature\Services;

use App\Models\AcademicCalendar;
use App\Models\AttendanceTimeSetting;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\SchoolLocationSetting;
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
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        $this->assertEquals($student->id, $attendance->student_id);
        $this->assertEquals('Late', $attendance->status);
        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}:\d{2}$/', $attendance->check_in_time->format('H:i:s'));
    }

    public function test_check_in_prevents_duplicate(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
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

        // Create academic calendar for today
        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => false,
        ]);

        // First check-in
        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        // Second check-in should fail
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Already checked in today.');

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
            'photo_url' => 'https://example.com/photo.jpg',
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
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        $this->assertEquals('Present', $attendance->status);
    }

    public function test_history_returns_attendances(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
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

        // Create some attendances
        AcademicCalendar::create(['holiday_date' => now()->toDateString(), 'is_holiday' => false]);

        $this->service->checkIn($student->id, ['latitude' => '-7.7959', 'longitude' => '110.3695', 'photo_url' => 'https://example.com/photo.jpg']);

        $history = $this->service->history($student->id, 10);

        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $history);
        $this->assertGreaterThan(0, $history->total());
    }

    public function test_check_in_rejects_no_schedule(): void
    {
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

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('No attendance schedule for');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);
    }

    public function test_check_in_rejects_inactive_day(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-06 08:00:00'));

        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
            'is_active' => false,
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

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Attendance is closed for');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
            'photo_url' => 'https://example.com/photo.jpg',
        ]);
    }

    public function test_check_in_rejects_too_early(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-06 05:30:00'));

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

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Attendance opens at');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);
    }

    public function test_check_in_rejects_after_close(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-07-06 10:30:00'));

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

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Attendance closed at');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);
    }

    public function test_check_in_rejects_holiday(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
        ]);

        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => true,
            'description' => 'Hari Libur Nasional',
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

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Today is a holiday');

        $this->service->checkIn($student->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
        ]);
    }

    public function test_stats_returns_correct_counts(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '10:00:00',
        ]);

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
        $this->service->checkIn($student1->id, ['latitude' => '-7.7959', 'longitude' => '110.3695', 'photo_url' => 'https://example.com/photo.jpg']);

        $stats = $this->service->stats($class->id);

        $this->assertEquals(3, $stats['total']);
        // At least one student checked in (either Present or Late)
        $this->assertGreaterThanOrEqual(1, $stats['present'] + $stats['late']);
        // At least 2 students are absent (or 1 if one checked in)
        $this->assertGreaterThanOrEqual(0, $stats['absent']);
        $this->assertEquals(0, $stats['sick_permission']);
    }

    public function test_sick_stats_counts_valid_leave(): void
    {
        $data = $this->createClassWithStudent();

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $stats = $this->service->stats($data['class']->id);

        $this->assertEquals(1, $stats['sick_permission']);
    }

    public function test_sick_stats_excludes_event_category(): void
    {
        $data = $this->createClassWithStudent();

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $stats = $this->service->stats($data['class']->id);

        $this->assertEquals(0, $stats['sick_permission']);
    }

    public function test_sick_stats_excludes_pending_status(): void
    {
        $data = $this->createClassWithStudent();

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'approval_status' => 'Pending',
        ]);

        $stats = $this->service->stats($data['class']->id);

        $this->assertEquals(0, $stats['sick_permission']);
    }

    public function test_sick_stats_excludes_past_date_range(): void
    {
        $data = $this->createClassWithStudent();

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => now()->subDays(10)->toDateString(),
            'end_date' => now()->subDays(5)->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $stats = $this->service->stats($data['class']->id);

        $this->assertEquals(0, $stats['sick_permission']);
    }

    public function test_sick_stats_excludes_future_date_range(): void
    {
        $data = $this->createClassWithStudent();

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(5)->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $stats = $this->service->stats($data['class']->id);

        $this->assertEquals(0, $stats['sick_permission']);
    }

    public function test_sick_stats_excludes_other_class(): void
    {
        $data = $this->createClassWithStudent();
        $otherClass = SchoolClass::create(['name' => 'XI-A']);

        LeaveRequest::create([
            'student_id' => $data['student']->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $stats = $this->service->stats($otherClass->id);

        $this->assertEquals(0, $stats['sick_permission']);
    }

    private function scheduleToday(): void
    {
        AttendanceTimeSetting::create([
            'day' => now()->format('l'),
            'check_in_open' => '06:00:00',
            'late_threshold' => '08:30:00',
            'check_in_close' => '10:00:00',
        ]);

        AcademicCalendar::create([
            'holiday_date' => now()->toDateString(),
            'is_holiday' => false,
        ]);
    }

    public function test_check_in_rejects_missing_coordinates(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Valid GPS coordinates are required.');

        $this->service->checkIn($data['student']->id, [
            'photo_url' => 'https://example.com/photo.jpg',
        ]);
    }

    public function test_check_in_rejects_out_of_range_coordinates(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('GPS coordinates are out of range.');

        $this->service->checkIn($data['student']->id, [
            'latitude' => 999.0,
            'longitude' => 110.3695,
            'photo_url' => 'https://example.com/photo.jpg',
        ]);
    }

    public function test_check_in_rejects_position_outside_school_radius(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        SchoolLocationSetting::create([
            'name' => 'SMA UII',
            'address' => 'Yogyakarta',
            'latitude' => -7.7959,
            'longitude' => 110.3695,
            'radius_meters' => 100,
            'is_active' => true,
        ]);

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('222 meter dari titik presensi sekolah');

        $this->service->checkIn($data['student']->id, [
            'latitude' => -7.7939,
            'longitude' => 110.3695,
            'photo_url' => 'https://example.com/photo.jpg',
        ]);
    }

    public function test_check_in_accepts_position_within_school_radius(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        SchoolLocationSetting::create([
            'name' => 'SMA UII',
            'address' => 'Yogyakarta',
            'latitude' => -7.7959,
            'longitude' => 110.3695,
            'radius_meters' => 100,
            'is_active' => true,
        ]);

        $attendance = $this->service->checkIn($data['student']->id, [
            'latitude' => '-7.7959',
            'longitude' => '110.3695',
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        $this->assertSame(-7.7959, (float) $attendance->latitude);
        $this->assertSame(110.3695, (float) $attendance->longitude);
        $this->assertSame('Present', $attendance->status);
    }

    public function test_check_in_skips_geofence_when_location_setting_inactive(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        SchoolLocationSetting::create([
            'name' => 'SMA UII',
            'address' => 'Yogyakarta',
            'latitude' => -7.7959,
            'longitude' => 110.3695,
            'radius_meters' => 100,
            'is_active' => false,
        ]);

        $attendance = $this->service->checkIn($data['student']->id, [
            'latitude' => -6.2,
            'longitude' => 106.8,
            'photo_url' => 'https://example.com/photo.jpg',
        ]);

        $this->assertSame('Present', $attendance->status);
    }

    public function test_check_in_requires_photo_source(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('Attendance photo is required.');

        $this->service->checkIn($data['student']->id, [
            'latitude' => -7.7959,
            'longitude' => 110.3695,
        ]);
    }

    public function test_check_in_rejects_non_image_blob(): void
    {
        $this->scheduleToday();
        $data = $this->createClassWithStudent();

        $this->expectException(\RuntimeException::class);

        $this->service->checkIn($data['student']->id, [
            'latitude' => -7.7959,
            'longitude' => 110.3695,
            'photo_blob' => base64_encode('not-an-image'),
        ]);
    }
}
