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

    public function test_class_detail_marks_approved_sick_leave_as_sick(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);

        $result = $this->service->classDetail($class->id, '2026-07-12');

        $this->assertEquals('Sick', $result['students']->first()['status']);
    }

    public function test_class_detail_marks_approved_non_sick_leave_as_permission(): void
    {
        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-12',
            'end_date' => '2026-07-12',
            'approval_status' => 'Approved',
        ]);

        $result = $this->service->classDetail($class->id, '2026-07-12');

        $this->assertEquals('Permission', $result['students']->first()['status']);
    }

    public function test_class_monthly_recap_counts_non_sick_as_izin(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        $row = $recap['students']->first();
        $this->assertEquals(1, $row['izin']);
        $this->assertEquals(0, $row['sakit']);
        $this->assertEquals(0, $row['tertunda']);
    }

    public function test_class_monthly_recap_counts_pending_leave_as_tertunda_not_izin(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Pending',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        $row = $recap['students']->first();
        $this->assertEquals(1, $row['tertunda']);
        $this->assertEquals(0, $row['izin']);
        $this->assertEquals(0, $row['sakit']);
    }

    public function test_class_monthly_recap_attendance_wins_over_leave_same_day(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-10',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        $row = $recap['students']->first();
        $this->assertEquals(1, $row['masuk']);
        $this->assertEquals(0, $row['izin']);
        $this->assertEquals(0, $row['tertunda']);
    }

    public function test_class_monthly_recap_dedup_duplicate_leaves_same_day(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Competition',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Pending',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        // Approved takes precedence over Pending, deduped to a single day -> 1 izin, 0 tertunda
        $row = $recap['students']->first();
        $this->assertEquals(1, $row['izin']);
        $this->assertEquals(0, $row['tertunda']);
    }

    public function test_class_monthly_recap_duplicate_approved_leaves_diff_category_prefers_sick(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        // Two approved leaves on the same day (different category): count once, Sick wins.
        $row = $recap['students']->first();
        $this->assertEquals(1, $row['sakit']);
        $this->assertEquals(0, $row['izin']);
        $this->assertEquals(0, $row['tertunda']);
    }

    public function test_class_monthly_recap_approved_sick_beats_pending_leave_same_day(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Sick',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Approved',
        ]);
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10',
            'end_date' => '2026-07-10',
            'approval_status' => 'Pending',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        // Approved (Sick) wins over the pending permit on the same day.
        $row = $recap['students']->first();
        $this->assertEquals(1, $row['sakit']);
        $this->assertEquals(0, $row['izin']);
        $this->assertEquals(0, $row['tertunda']);
    }

    public function test_class_monthly_recap_per_student_total_never_exceeds_school_days(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        // leave spanning a weekend must only count school days
        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-10', // Friday
            'end_date' => '2026-07-12', // Sunday
            'approval_status' => 'Approved',
        ]);

        $recap = $this->service->classMonthlyRecap($class->id, 7, 2026);

        // Leave spans Fri (10) - Sun (12); only school days count. Juli 1..12 has 8 active weekdays.
        $row = $recap['students']->first();
        $this->assertEquals(1, $row['izin']);
        $total = $row['masuk'] + $row['izin'] + $row['sakit'] + $row['tertunda'] + $row['alpha'];
        $this->assertEquals(8, $total);
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

    public function test_class_monthly_recap_alpha_uses_elapsed_active_school_days(): void
    {
        $data = $this->createClassWithStudent();

        foreach (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as $day) {
            \App\Models\AttendanceTimeSetting::create([
                'day' => $day,
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
                'is_active' => true,
            ]);
        }

        // Now is fixed at 2026-07-12 10:00 by setUp. Count Mon-Fri from Jul 1..Jul 12
        // (past days and today-after-close are alpa-applicable, future days are not).
        $expectedElapsed = 0;
        for ($d = \Carbon\Carbon::create(2026, 7, 1); $d->lte(\Carbon\Carbon::create(2026, 7, 12)); $d->addDay()) {
            if (in_array($d->format('l'), ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], true)) {
                $expectedElapsed++;
            }
        }

        $alpha = $this->service->classMonthlyRecap($data['class']->id, 7, 2026)['students']->first()['alpha'];
        $this->assertEquals($expectedElapsed, $alpha);
    }

    public function test_class_monthly_report_rate_excludes_pending_from_denominator(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-08',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $data['guardian']->id,
            'category' => 'Event',
            'start_date' => '2026-07-09',
            'end_date' => '2026-07-09',
            'approval_status' => 'Pending',
        ]);

        $report = $this->service->classMonthlyReport($class->id, 7, 2026);

        $this->assertArrayHasKey('recap', $report);
        $this->assertArrayHasKey('daily', $report);
        $this->assertArrayHasKey('summary', $report);

        $summary = $report['summary'];
        $this->assertEquals(1, $summary['tepat_waktu']);
        $this->assertEquals(0, $summary['terlambat']);
        $this->assertEquals(0, $summary['izin']);
        $this->assertEquals(0, $summary['sakit']);
        $this->assertEquals(1, $summary['tertunda']);
        $this->assertEquals(6, $summary['alpa']);
        $this->assertEquals(1, $summary['total_students']);

        // Rate excludes "Izin Tertunda" from the denominator: (1+0) / (1+0+0+0+6) = 14.3
        $this->assertEqualsWithDelta(14.3, $summary['attendance_rate'], 0.05);

        // Same exclusion applies to the per-student (micro) attendance rate:
        // masuk(1) / (masuk + izin + sakit + alpha) = 1 / (1+0+0+6) = 14.3 (not 12.5)
        $studentRow = $report['recap']->first();
        $this->assertEqualsWithDelta(14.3, $studentRow['attendance_rate'], 0.05);

        // Every daily row carries the ISO date (needed by the tooltip weekday)
        foreach ($report['daily'] as $day) {
            $this->assertArrayHasKey('date', $day);
            $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $day['date']);
        }
    }

    public function test_class_monthly_report_discipline_rate_micro_and_macro(): void
    {
        $this->seedActiveWeekdays();

        $data = $this->createClassWithStudent();
        $student = $data['student'];
        $class = $data['class'];

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-08',
            'check_in_time' => '06:50:00',
            'status' => 'Present',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);
        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-07-09',
            'check_in_time' => '07:10:00',
            'status' => 'Late',
            'latitude' => -7.79,
            'longitude' => 110.36,
            'photo_url' => 'https://via.placeholder.com/320x240?text=Selfie',
        ]);

        $report = $this->service->classMonthlyReport($class->id, 7, 2026);
        $summary = $report['summary'];

        // 8 elapsed active school days (Jul 1..12, Mon-Fri, now = Jul 12 10:00)
        $this->assertEquals(8, $summary['school_days']);

        // Only Present counts as on-time (Late does not): 1 on-time out of 8
        $studentRow = $report['recap']->first();
        $this->assertEquals(1, $studentRow['tepat_waktu']);
        $this->assertEquals(1, $studentRow['terlambat']);
        $this->assertEquals(2, $studentRow['masuk']);
        $this->assertEqualsWithDelta(12.5, $studentRow['discipline_rate'], 0.05);

        // Micro attendance rate = present+late / (present+late+izin+sakit+alpha) = 2/8
        // (Izin Tertunda excluded; here there are none)
        $this->assertEqualsWithDelta(25.0, $studentRow['attendance_rate'], 0.05);

        // Summary attendance rate must match the micro figure
        $this->assertEqualsWithDelta(25.0, $summary['attendance_rate'], 0.05);

        // Macro uses total on-time across all students / (school_days * students)
        $this->assertEqualsWithDelta(12.5, $summary['discipline_rate'], 0.05);
    }
}
