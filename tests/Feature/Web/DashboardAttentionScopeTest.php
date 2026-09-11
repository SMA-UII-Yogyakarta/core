<?php

namespace Tests\Feature\Web;

use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardAttentionScopeTest extends TestCase
{
    use RefreshDatabase;

    private function makeActiveSchoolDay(): void
    {
        AttendanceTimeSetting::firstOrCreate(
            ['day' => now()->format('l')],
            [
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
                'is_active' => true,
            ],
        );
    }

    private function makeWaliClassContext(): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'wali']);
        $class = SchoolClass::factory()->create(['teacher_id' => $teacher->id]);
        $this->makeActiveSchoolDay();

        return [$user, $teacher, $class];
    }

    private function makeStudent(SchoolClass $class): Student
    {
        $guardianUser = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create(['user_id' => $guardianUser->id]);
        $user = User::factory()->create(['role' => 'student']);

        return Student::factory()->create([
            'user_id' => $user->id,
            'guardian_id' => $guardian->id,
            'class_id' => $class->id,
            'status' => 'Active',
        ]);
    }

    private function makeLeave(
        Student $student,
        string $status,
        ?string $start = null,
        ?string $end = null,
        string $category = 'Sick',
    ): LeaveRequest {
        $start = $start ?? now()->toDateString();
        $end = $end ?? $start;

        return LeaveRequest::factory()->create([
            'student_id' => $student->id,
            'guardian_id' => $student->guardian_id,
            'approval_status' => $status,
            'start_date' => $start,
            'end_date' => $end,
            'category' => $category,
        ]);
    }

    public function test_stale_approved_leave_is_excluded_from_today_attention(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $student = $this->makeStudent($class);
        $this->makeLeave(
            $student,
            'Approved',
            now()->subDays(10)->toDateString(),
            now()->subDays(9)->toDateString(),
        );

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->where('approvedLeaves', [])
                ->where('students.0.id', $student->id)
                ->where('students.0.pendingLeave', null));
    }

    public function test_active_approved_leave_is_included_in_today_attention(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $student = $this->makeStudent($class);
        $leave = $this->makeLeave($student, 'Approved', now()->toDateString(), now()->addDay()->toDateString());

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('approvedLeaves', 1)
                ->where('isSchoolDay', true)
                ->where('approvedLeaves.' . $student->id . '.category', 'Sick')
                ->where('approvedLeaves.' . $student->id . '.start_date', now()->toDateString())
                ->where('approvedLeaves.' . $student->id . '.guardian_name', $student->guardian->name)
                ->where('approvedLeaves.' . $student->id . '.updated_at', $leave->updated_at->toIso8601String()));
    }

    public function test_stale_pending_leave_falls_back_and_counts_as_expired(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $student = $this->makeStudent($class);
        $this->makeLeave(
            $student,
            'Pending',
            now()->subDays(5)->toDateString(),
            now()->subDays(4)->toDateString(),
        );

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('students.0.pendingLeave', null)
                ->where('expiredPendingCount', 1)
                ->where('approvedLeaves', []));
    }

    public function test_active_pending_leave_is_kept_in_today_attention(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $student = $this->makeStudent($class);
        $leave = $this->makeLeave($student, 'Pending', now()->toDateString(), now()->addDay()->toDateString());

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('students.0.pendingLeave.id', $leave->id)
                ->where('students.0.pendingLeave.approval_status', 'Pending')
                ->where('students.0.pendingLeave.start_date', now()->toDateString())
                ->where('students.0.pendingLeave.end_date', now()->addDay()->toDateString())
                ->where('expiredPendingCount', 0));
    }

    public function test_alpa_student_payload_includes_guardian_contact(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $student = $this->makeStudent($class);
        $student->guardian->update(['phone' => '081234567890']);

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('students.0.guardian_name', $student->guardian->name)
                ->where('students.0.guardian_phone', '081234567890'));
    }

    public function test_non_school_day_renders_idle_state(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();
        $this->makeStudent($class);

        AttendanceTimeSetting::query()->delete();

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->where('isSchoolDay', false)
                ->where('students', [])
                ->where('stats', null)
                ->where('class.id', $class->id));
    }

    public function test_late_attendance_exposes_delay_minutes(): void
    {
        [$user, , $class] = $this->makeWaliClassContext();

        $late = $this->makeStudent($class);
        Attendance::factory()->create([
            'student_id' => $late->id,
            'attendance_date' => now()->toDateString(),
            'check_in_time' => '07:22:00',
            'status' => 'Late',
        ]);

        $present = $this->makeStudent($class);
        Attendance::factory()->create([
            'student_id' => $present->id,
            'attendance_date' => now()->toDateString(),
            'check_in_time' => '06:55:00',
            'status' => 'Present',
        ]);

        $this->actingAs($user)
            ->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('students.0.attendances.0.status', 'Late')
                ->where('students.0.attendances.0.check_in_time', '07:22:00')
                ->where('students.0.attendances.0.late_minutes', 22)
                ->where('lateThreshold', '07:00')
                ->where('students.1.attendances.0.late_minutes', null));
    }
}
