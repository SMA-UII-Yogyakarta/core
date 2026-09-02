<?php

namespace Tests\Feature\Web;

use App\Models\Attendance;
use App\Models\DutySchedule;
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

class TeacherPortalTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ───────────────────────────────────────────────────────────

    private function createPiketTeacher(): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'teacher_type' => 'duty',
        ]);

        return [$user, $teacher];
    }

    private function createWaliTeacher(): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'teacher_type' => 'homeroom',
        ]);
        $schoolClass = SchoolClass::factory()->create([
            'name' => 'X-A',
            'teacher_id' => $teacher->id,
        ]);

        return [$user, $teacher, $schoolClass];
    }

    private function createActiveStudent(int $classId, string $name = 'Ahmad Dahlan'): Student
    {
        return Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => $classId,
            'name' => $name,
            'status' => 'Active',
        ]);
    }

    // ── DutyDashboard Tests ──────────────────────────────────────────────

    public function test_duty_dashboard_renders_with_class_stats(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user, $teacher] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'X-B']);
        $student = $this->createActiveStudent($class->id);

        Attendance::factory()->create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Present',
            'check_in_time' => '06:45:00',
        ]);

        DutySchedule::create([
            'teacher_id' => $teacher->id,
            'duty_day' => 'Tuesday',
        ]);

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->has('teacher')
                ->where('teacher.id', $teacher->id)
                ->where('teacher.name', $teacher->name)
                ->where('isScheduled', true)
                ->has('classStats')
                ->has('attentionStudents')
                ->has('classes'));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_class_stats_contain_class_id(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'XI-IPA-1']);
        $this->createActiveStudent($class->id);

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('classStats.0.class_id', $class->id)
                ->where('classStats.0.class', 'XI-IPA-1')
                ->where('classStats.0.total', 1));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_unscheduled_teacher_gets_is_scheduled_false(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('isScheduled', false));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_attention_students_includes_late(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'X-C']);
        $lateStudent = $this->createActiveStudent($class->id, 'Budi Terlambat');

        Attendance::factory()->create([
            'student_id' => $lateStudent->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Late',
            'check_in_time' => '07:15:00',
        ]);

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('attentionStudents.0.name', 'Budi Terlambat')
                ->where('attentionStudents.0.status', 'late')
                ->has('attentionStudents.0.check_in_time'));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_attention_students_includes_absent(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'X-D']);
        $absentStudent = $this->createActiveStudent($class->id, 'Citra Alpa');

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('attentionStudents.0.name', 'Citra Alpa')
                ->where('attentionStudents.0.status', 'absent'));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_attention_students_includes_pending_leave(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'X-E']);
        $student = $this->createActiveStudent($class->id, 'Dina Izin');

        $guardianUser = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create(['user_id' => $guardianUser->id]);

        LeaveRequest::factory()->create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'approval_status' => 'Pending',
            'category' => 'Activity',
            'start_date' => '2026-08-18',
            'end_date' => '2026-08-18',
        ]);

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('attentionStudents.0.name', 'Dina Izin')
                ->where('attentionStudents.0.status', 'pending')
                ->where('attentionStudents.0.leave_category', 'Activity'));

        Carbon::setTestNow();
    }

    public function test_duty_dashboard_present_student_not_in_attention_list(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user] = $this->createPiketTeacher();

        $class = SchoolClass::factory()->create(['name' => 'X-F']);
        $presentStudent = $this->createActiveStudent($class->id, 'Eka Hadir');

        Attendance::factory()->create([
            'student_id' => $presentStudent->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Present',
            'check_in_time' => '06:30:00',
        ]);

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/DutyDashboard')
                ->where('attentionStudents', []));

        Carbon::setTestNow();
    }

    // ── HomeroomDashboard Tests ──────────────────────────────────────────

    public function test_homeroom_dashboard_renders_with_students_and_stats(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user, $teacher, $schoolClass] = $this->createWaliTeacher();

        $student = $this->createActiveStudent($schoolClass->id, 'Fajar Mulia');

        Attendance::factory()->create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Present',
            'check_in_time' => '06:40:00',
        ]);

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->has('teacher')
                ->where('teacher.id', $teacher->id)
                ->where('class.id', $schoolClass->id)
                ->where('class.name', 'X-A')
                ->has('students', 1)
                ->where('students.0.name', 'Fajar Mulia')
                ->has('students.0.attendances', 1)
                ->has('stats'));

        Carbon::setTestNow();
    }

    public function test_homeroom_dashboard_teacher_without_class_gets_null(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create([
            'user_id' => $user->id,
            'teacher_type' => 'homeroom',
        ]);

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->where('class', null)
                ->where('students', []));
    }

    public function test_homeroom_dashboard_stats_are_accurate(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user, , $schoolClass] = $this->createWaliTeacher();

        $s1 = $this->createActiveStudent($schoolClass->id, 'Siswa Hadir');
        $s2 = $this->createActiveStudent($schoolClass->id, 'Siswa Telat');
        $this->createActiveStudent($schoolClass->id, 'Siswa Alpa');

        Attendance::factory()->create([
            'student_id' => $s1->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Present',
            'check_in_time' => '06:30:00',
        ]);

        Attendance::factory()->create([
            'student_id' => $s2->id,
            'attendance_date' => '2026-08-18',
            'status' => 'Late',
            'check_in_time' => '07:20:00',
        ]);

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->has('students', 3)
                ->where('stats.total', 3)
                ->where('stats.present', 1)
                ->where('stats.late', 1)
                ->where('stats.absent', 1));

        Carbon::setTestNow();
    }

    public function test_homeroom_dashboard_only_shows_active_students(): void
    {
        Carbon::setTestNow('2026-08-18 08:00:00');
        [$user, , $schoolClass] = $this->createWaliTeacher();

        $this->createActiveStudent($schoolClass->id, 'Aktif');
        Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => $schoolClass->id,
            'name' => 'Non-Aktif',
            'status' => 'Inactive',
        ]);

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/HomeroomDashboard')
                ->has('students', 1)
                ->where('students.0.name', 'Aktif'));

        Carbon::setTestNow();
    }

    // ── Cross-Role Access Tests ──────────────────────────────────────────

    public function test_non_teacher_cannot_access_duty_dashboard(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/teacher/duty')
            ->assertForbidden();
    }

    public function test_non_teacher_cannot_access_homeroom_dashboard(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->get('/teacher/homeroom')
            ->assertForbidden();
    }
}
