<?php

namespace Tests\Feature\Services;

use App\Models\Attendance;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\DashboardService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    protected DashboardService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-07-12 10:00:00'));
        $this->service = app(DashboardService::class);
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    private function createStudent(): array
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

        return ['student' => $student, 'guardian' => $guardian];
    }

    private function createAttendance(int $studentId, string $status): void
    {
        Attendance::create([
            'student_id' => $studentId,
            'attendance_date' => '2026-07-12',
            'check_in_time' => '08:00:00',
            'status' => $status,
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);
    }

    private function createApprovedSickLeave(int $studentId, int $guardianId): void
    {
        LeaveRequest::create([
            'student_id' => $studentId,
            'guardian_id' => $guardianId,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);
    }

    public function test_absent_student_is_not_counted_twice_by_sick_permit(): void
    {
        $data = $this->createStudent();

        $this->createAttendance($data['student']->id, 'Present');
        $this->createApprovedSickLeave($data['student']->id, $data['guardian']->id);

        $stats = $this->service->getAdminStats();

        $this->assertEquals(1, $stats['verified_present']);
        $this->assertEquals(0, $stats['sick_permit']);
        $this->assertEquals(0, $stats['absent']);
        $this->assertEquals(1, $stats['total_students']);
    }

    public function test_sick_student_without_attendance_is_not_counted_as_absent(): void
    {
        $data = $this->createStudent();

        $this->createApprovedSickLeave($data['student']->id, $data['guardian']->id);

        $stats = $this->service->getAdminStats();

        $this->assertEquals(0, $stats['verified_present']);
        $this->assertEquals(1, $stats['sick_permit']);
        $this->assertEquals(0, $stats['absent']);
    }

    public function test_multiple_sick_requests_same_student_count_once(): void
    {
        $data = $this->createStudent();

        $this->createApprovedSickLeave($data['student']->id, $data['guardian']->id);
        $this->createApprovedSickLeave($data['student']->id, $data['guardian']->id);

        $stats = $this->service->getAdminStats();

        $this->assertEquals(1, $stats['sick_permit']);
        $this->assertEquals(0, $stats['absent']);
    }

    public function test_no_attendance_and_no_leave_counts_as_absent(): void
    {
        $this->createStudent();

        $stats = $this->service->getAdminStats();

        $this->assertEquals(0, $stats['verified_present']);
        $this->assertEquals(0, $stats['sick_permit']);
        $this->assertEquals(1, $stats['absent']);
    }
}
