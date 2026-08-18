<?php

namespace Tests\Feature\Web;

use App\Models\Attendance;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuardianPortalTest extends TestCase
{
    use RefreshDatabase;

    private function createGuardianWithStudent(): array
    {
        $user = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create(['user_id' => $user->id]);
        $schoolClass = SchoolClass::factory()->create(['name' => 'X-A']);
        $studentUser = User::factory()->create(['role' => 'student']);
        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'class_id' => $schoolClass->id,
            'guardian_id' => $guardian->id,
        ]);

        return [$user, $guardian, $student];
    }

    public function test_guardian_dashboard_page_renders_successfully(): void
    {
        [$user, , $student] = $this->createGuardianWithStudent();

        $this->actingAs($user)->get('/guardian')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/Dashboard')
                ->has('guardian')
                ->has('students', 1)
                ->where('selectedStudentId', $student->id)
                ->has('semesterStats'));
    }

    public function test_guardian_dashboard_displays_today_attendance(): void
    {
        [$user, , $student] = $this->createGuardianWithStudent();

        Attendance::factory()->create([
            'student_id' => $student->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'Present',
            'check_in_time' => '06:45:00',
        ]);

        $this->actingAs($user)->get('/guardian')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/Dashboard')
                ->where('todayAttendance.status', 'Present')
                ->where('todayAttendance.check_in_time', '06:45:00'));
    }

    public function test_guardian_history_page_renders_with_records(): void
    {
        [$user, $guardian, $student] = $this->createGuardianWithStudent();

        Attendance::factory()->create([
            'student_id' => $student->id,
            'attendance_date' => now()->toDateString(),
            'status' => 'Present',
            'check_in_time' => '06:45:00',
        ]);

        LeaveRequest::factory()->create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => 'Approved',
        ]);

        $this->actingAs($user)->get('/guardian/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/History')
                ->has('students', 1)
                ->where('selectedStudentId', $student->id)
                ->has('attendances')
                ->has('leaveRequests'));
    }

    public function test_guardian_history_filters_by_month_and_year(): void
    {
        [$user, , $student] = $this->createGuardianWithStudent();

        $this->actingAs($user)->get("/guardian/history?student_id={$student->id}&month=8&year=2026")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/History')
                ->where('month', 8)
                ->where('year', 2026));
    }

    public function test_guardian_cannot_access_unlinked_student_history(): void
    {
        [$user, , $student] = $this->createGuardianWithStudent();
        $otherStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
        ]);

        // Supplying unlinked student_id falls back to guardian's linked student
        $this->actingAs($user)->get("/guardian/history?student_id={$otherStudent->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/History')
                ->where('selectedStudentId', $student->id));
    }
}
