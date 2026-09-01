<?php

namespace Tests\Feature\Web;

use App\Models\AttendanceTimeSetting;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class HomeroomReportBreakdownTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Carbon::setTestNow(Carbon::parse('2026-08-28 12:00:00'));
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_monthly_report_counts_pending_leave_as_pending_not_permission(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');
        $this->leave($student, 'Event', 'Pending', '2026-08-28');

        $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.pending', 1)
                ->where('summary.permission', 0)
                ->has('dailyBreakdown.0.pending'));
    }

    public function test_monthly_report_attendance_wins_over_pending_leave_same_day(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');
        $this->leave($student, 'Event', 'Pending', '2026-08-28');

        $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.pending', 1));
    }

    public function test_monthly_report_attendance_beats_leave_for_same_student_day(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');
        $this->leave($student, 'Event', 'Pending', '2026-08-28');

        \App\Models\Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-28',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        // Attendance wins: the same student/day is counted once as present, not as pending.
        $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.pending', 0)
                ->where('summary.on_time', 1));
    }

    public function test_monthly_report_duplicate_approved_leaves_diff_category_prefers_sick(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');
        $this->leave($student, 'Event', 'Approved', '2026-08-28');
        $this->leave($student, 'Sick', 'Approved', '2026-08-28');

        $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('summary.sick', 1)
                ->where('summary.permission', 0)
                ->where('summary.pending', 0));
    }

    public function test_monthly_report_rate_excludes_pending_from_denominator(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');

        \App\Models\Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-07',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);
        $this->leave($student, 'Event', 'Pending', '2026-08-06');

        $response = $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk();

        $page = $response->viewData('page');
        $summary = $page['props']['summary'];

        // Pending is present but excluded from the rate denominator.
        $this->assertGreaterThan(0, $summary['pending']);
        $denominator = $summary['on_time'] + $summary['late']
            + $summary['permission'] + $summary['sick'] + $summary['absent'];
        $expected = $denominator > 0 ? round((($summary['on_time'] + $summary['late']) / $denominator) * 100, 1) : 0;
        $this->assertEquals($expected, $summary['attendance_rate']);
    }

    public function test_semester_report_rate_excludes_pending_from_denominator(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');

        \App\Models\Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-07',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);
        $this->leave($student, 'Event', 'Pending', '2026-08-06');

        $response = $this->actingAs($user)
            ->get('/reports?tab=semester&semester=1&year=2026')
            ->assertOk();

        $page = $response->viewData('page');
        $summary = $page['props']['summary'];

        $this->assertGreaterThan(0, $summary['pending']);
        $denominator = $summary['on_time'] + $summary['late']
            + $summary['permission'] + $summary['sick'] + $summary['absent'];
        $expected = $denominator > 0 ? round((($summary['on_time'] + $summary['late']) / $denominator) * 100, 1) : 0;
        $this->assertEquals($expected, $summary['attendance_rate']);
    }

    public function test_monthly_report_serves_discipline_rate_micro_and_macro(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');

        \App\Models\Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-07',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        $response = $this->actingAs($user)
            ->get('/reports?tab=monthly&month=8&year=2026')
            ->assertOk();

        $page = $response->viewData('page');
        $props = $page['props'];
        $summary = $props['summary'];
        $studentRow = $props['students'][0];

        $this->assertGreaterThan(0, $summary['school_days']);
        $this->assertEquals(1, $studentRow['on_time']);
        $this->assertEquals(0, $studentRow['late']);

        // micro (per student): on_time / school_days
        $expectedMicro = round((1 / $summary['school_days']) * 100, 1);
        $this->assertEquals($expectedMicro, $studentRow['discipline_rate']);

        // micro (per student) attendance rate: present / (present + permission + sick + absent) = 1 / school_days
        $expectedMicroAtt = $summary['school_days'] > 0 ? round((1 / $summary['school_days']) * 100, 1) : 0;
        $this->assertEquals($expectedMicroAtt, $studentRow['attendance_rate']);
        $this->assertEquals($expectedMicroAtt, $summary['attendance_rate']);

        // macro (class): total on_time / (school_days * total students)
        $expectedMacro = round(($summary['on_time'] / ($summary['school_days'] * $summary['total_students'])) * 100, 1);
        $this->assertEquals($expectedMacro, $summary['discipline_rate']);
    }

    public function test_semester_report_serves_discipline_rate_micro_and_macro(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        $class = SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);
        $student = $this->activeStudent($class, '10001');

        \App\Models\Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-07',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        $response = $this->actingAs($user)
            ->get('/reports?tab=semester&semester=1&year=2026')
            ->assertOk();

        $page = $response->viewData('page');
        $props = $page['props'];
        $summary = $props['summary'];
        $studentRow = $props['students'][0];

        $this->assertGreaterThan(0, $summary['school_days']);
        $this->assertEquals(1, $studentRow['on_time']);
        $this->assertEquals(0, $studentRow['late']);

        $expectedMicro = round((1 / $summary['school_days']) * 100, 1);
        $this->assertEquals($expectedMicro, $studentRow['discipline_rate']);

        // micro (per student) attendance rate: present / (present + permission + sick + absent) = 1 / school_days
        $expectedMicroAtt = $summary['school_days'] > 0 ? round((1 / $summary['school_days']) * 100, 1) : 0;
        $this->assertEquals($expectedMicroAtt, $studentRow['attendance_rate']);
        $this->assertEquals($expectedMicroAtt, $summary['attendance_rate']);

        $expectedMacro = round(($summary['on_time'] / ($summary['school_days'] * $summary['total_students'])) * 100, 1);
        $this->assertEquals($expectedMacro, $summary['discipline_rate']);
    }

    private function makeWali(): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'wali']);

        return [$user, $teacher];
    }

    private function activeStudent(SchoolClass $class, string $nis): Student
    {
        return Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'name' => 'Student-' . $nis,
            'nis' => $nis,
            'nisn' => '99' . $nis,
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
    }

    private function leave(Student $student, string $category, string $status, string $date): LeaveRequest
    {
        $guardian = Guardian::create([
            'user_id' => User::factory()->create(['role' => 'guardian'])->id,
            'name' => 'Guardian of ' . $student->name,
        ]);

        return LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => $category,
            'start_date' => $date,
            'end_date' => $date,
            'approval_status' => $status,
        ]);
    }

    private function seedActiveWeekdays(): void
    {
        foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as $day) {
            AttendanceTimeSetting::create([
                'day' => $day,
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
                'is_active' => true,
            ]);
        }
    }

    public function test_daily_report_defaults_invalid_date_without_error(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);

        $this->actingAs($user)
            ->get('/reports?tab=daily&date=abc')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('tab', 'daily')->where('selectedDate', '2026-08-28'));
    }

    public function test_monthly_report_defaults_invalid_month_without_error(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);

        $this->actingAs($user)
            ->get('/reports?tab=monthly&month=13&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('tab', 'monthly')->where('selectedMonth', 8));
    }

    public function test_semester_report_defaults_invalid_semester_without_error(): void
    {
        $this->seedActiveWeekdays();

        [$user, $teacher] = $this->makeWali();
        SchoolClass::factory()->create(['name' => 'X-A', 'teacher_id' => $teacher->id]);

        $this->actingAs($user)
            ->get('/reports?tab=semester&semester=3&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->where('tab', 'semester')->where('selectedSemester', '1'));
    }
}
