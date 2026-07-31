<?php

namespace Tests\Feature\Services;

use App\Models\Attendance;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\AnalyticsService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AnalyticsService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-07-12 10:00:00'));
        $this->service = app(AnalyticsService::class);
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

    public function test_student_detail_returns_correct_stats(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-10',
            'check_in_time' => '08:00:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-11',
            'check_in_time' => '08:15:00',
            'status' => 'Late',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);

        $result = $this->service->studentDetail($student->id, 7, 2026);

        $this->assertEquals(2, $result['stats']['total_days']);
        $this->assertEquals(1, $result['stats']['present']);
        $this->assertEquals(1, $result['stats']['late']);
        $this->assertEquals(0, $result['stats']['absent']);
        $this->assertEquals(1, $result['stats']['sick_permit']);
    }

    public function test_student_detail_returns_zero_when_no_attendance(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        $result = $this->service->studentDetail($student->id, 7, 2026);

        $this->assertEquals(0, $result['stats']['total_days']);
        $this->assertEquals(0, $result['stats']['present']);
        $this->assertEquals(0, $result['stats']['late']);
        $this->assertEquals(0, $result['stats']['absent']);
        $this->assertEquals(0, $result['stats']['sick_permit']);
    }

    public function test_student_detail_includes_approved_leave_in_sick_permit(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);

        $result = $this->service->studentDetail($student->id, 7, 2026);

        $this->assertEquals(1, $result['stats']['sick_permit']);
    }

    public function test_student_detail_includes_pending_leave_in_sick_permit(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Pending',
        ]);

        $result = $this->service->studentDetail($student->id, 7, 2026);

        $this->assertEquals(1, $result['stats']['sick_permit']);
    }

    public function test_student_detail_excludes_rejected_leave_from_sick_permit(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Rejected',
        ]);

        $result = $this->service->studentDetail($student->id, 7, 2026);

        $this->assertEquals(0, $result['stats']['sick_permit']);
    }

    public function test_student_detail_throws_when_student_not_found(): void
    {
        $this->expectException(ModelNotFoundException::class);

        $this->service->studentDetail(99999, 7, 2026);
    }

    public function test_student_monthly_trend_returns_12_months(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        $result = $this->service->studentMonthlyTrend($student->id, 2026);

        $this->assertCount(12, $result);
    }

    public function test_student_monthly_trend_has_month_and_label_keys(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        $result = $this->service->studentMonthlyTrend($student->id, 2026);

        foreach ($result as $month) {
            $this->assertArrayHasKey('month', $month);
            $this->assertArrayHasKey('label', $month);
            $this->assertArrayHasKey('present', $month);
            $this->assertArrayHasKey('late', $month);
            $this->assertArrayHasKey('absent', $month);
        }
    }

    public function test_student_monthly_trend_returns_zero_when_no_attendance(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        $result = $this->service->studentMonthlyTrend($student->id, 2026);

        foreach ($result as $month) {
            $this->assertEquals(0, $month['present']);
            $this->assertEquals(0, $month['late']);
            $this->assertEquals(0, $month['absent']);
        }
    }

    public function test_student_monthly_trend_counts_absent_correctly(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-01',
            'check_in_time' => '08:00:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-02',
            'check_in_time' => '08:15:00',
            'status' => 'Late',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        $result = $this->service->studentMonthlyTrend($student->id, 2026);

        $july = $result[6]; // July = index 6
        $this->assertEquals(1, $july['present']);
        $this->assertEquals(1, $july['late']);
        $this->assertEquals(0, $july['absent']);
    }

    public function test_school_overview_returns_correct_structure(): void
    {
        $result = $this->service->schoolOverview('2026-07-12');

        $this->assertArrayHasKey('date', $result);
        $this->assertArrayHasKey('total_students', $result);
        $this->assertArrayHasKey('verified_present', $result);
        $this->assertArrayHasKey('present', $result);
        $this->assertArrayHasKey('late', $result);
        $this->assertArrayHasKey('sick_permission', $result);
        $this->assertArrayHasKey('absent', $result);
        $this->assertArrayHasKey('classes', $result);
    }

    public function test_school_overview_counts_sick_permission(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);

        $result = $this->service->schoolOverview('2026-07-12');

        $this->assertEquals(1, $result['sick_permission']);
    }

    public function test_class_detail_returns_students_with_status(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-12',
            'check_in_time' => '08:00:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        $result = $this->service->classDetail($class->id, '2026-07-12');

        $this->assertArrayHasKey('class', $result);
        $this->assertArrayHasKey('students', $result);
        $this->assertCount(1, $result['students']);
        $this->assertEquals('Present', $result['students']->first()['status']);
    }

    public function test_class_detail_marks_absent_students(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        $result = $this->service->classDetail($class->id, '2026-07-12');

        $this->assertEquals('Absent', $result['students']->first()['status']);
    }
}
