<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RolePageAccessTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function teacher(string $type): User
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => $type]);

        return $user;
    }

    private function guardianWithStudents(): User
    {
        $user = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create(['user_id' => $user->id]);
        $schoolClass = SchoolClass::factory()->create();
        Student::factory()->count(2)->create([
            'class_id' => $schoolClass->id,
            'guardian_id' => $guardian->id,
            'user_id' => User::factory()->create(['role' => 'student'])->id,
        ]);

        return $user;
    }

    private function student(): User
    {
        $user = User::factory()->create(['role' => 'student']);
        $schoolClass = SchoolClass::factory()->create();
        Student::factory()->create(['user_id' => $user->id, 'class_id' => $schoolClass->id]);

        return $user;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    public static function adminAllowedPages(): array
    {
        return [
            '/dashboard', '/monitoring',
            '/master-data',
            '/class-enrolment', '/settings',
            '/leave-requests', '/leave-requests/verification',
            '/attendance-correction', '/reports/daily', '/reports/monthly', '/reports/semester',
            '/export', '/profile',
        ];
    }

    public static function piketAllowedPages(): array
    {
        return ['/teacher/duty', '/leave-requests', '/monitoring', '/reports/daily', '/export', '/profile'];
    }

    public static function waliAllowedPages(): array
    {
        return [
            '/teacher/homeroom', '/leave-requests', '/leave-requests/verification',
            '/reports/daily', '/reports/monthly', '/reports/semester', '/export', '/profile',
        ];
    }

    public static function guardianAllowedPages(): array
    {
        return ['/guardian', '/guardian/leave-application', '/guardian/history', '/profile'];
    }

    public static function studentAllowedPages(): array
    {
        return ['/student/dashboard', '/student/attendance', '/student/history', '/profile'];
    }

    public function test_admin_can_access_all_admin_pages(): void
    {
        foreach (self::adminAllowedPages() as $uri) {
            $this->actingAs($this->admin())->get($uri)->assertOk();
        }
    }

    public function test_piket_teacher_can_access_all_piket_pages(): void
    {
        foreach (self::piketAllowedPages() as $uri) {
            $this->actingAs($this->teacher('piket'))->get($uri)->assertOk();
        }
    }

    public function test_wali_teacher_can_access_all_wali_pages(): void
    {
        foreach (self::waliAllowedPages() as $uri) {
            $this->actingAs($this->teacher('wali'))->get($uri)->assertOk();
        }
    }

    public function test_both_teacher_can_access_duty_and_homeroom(): void
    {
        $user = $this->teacher('both');

        $this->actingAs($user)->get('/teacher/duty')->assertOk();
        $this->actingAs($user)->get('/teacher/homeroom')->assertOk();
    }

    public function test_guardian_can_access_all_guardian_pages(): void
    {
        foreach (self::guardianAllowedPages() as $uri) {
            $this->actingAs($this->guardianWithStudents())->get($uri)->assertOk();
        }
    }

    public function test_student_can_access_all_student_pages(): void
    {
        foreach (self::studentAllowedPages() as $uri) {
            $this->actingAs($this->student())->get($uri)->assertOk();
        }
    }

    public function test_student_check_in_route_is_authorized(): void
    {
        $response = $this->actingAs($this->student())->post('/student/attendance/check-in', [
            'latitude' => -7.78,
            'longitude' => 110.37,
        ]);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_roles_cannot_access_each_others_dashboards(): void
    {
        $this->actingAs($this->teacher('piket'))->get('/teacher/homeroom')->assertForbidden();
        $this->actingAs($this->teacher('wali'))->get('/teacher/duty')->assertForbidden();
        $this->actingAs($this->guardianWithStudents())->get('/student/attendance')->assertForbidden();
        $this->actingAs($this->student())->get('/guardian')->assertForbidden();
        $this->actingAs($this->student())->get('/teacher/duty')->assertForbidden();
        $this->actingAs($this->student())->get('/monitoring')->assertForbidden();
        $this->actingAs($this->student())->get('/master-data')->assertForbidden();
    }

    public function test_guardian_cannot_access_leave_request_management(): void
    {
        $guardian = $this->guardianWithStudents();
        $guardianModel = \App\Models\Guardian::where('user_id', $guardian->id)->firstOrFail();
        $student = \App\Models\Student::where('guardian_id', $guardianModel->id)->firstOrFail();
        $leave = \App\Models\LeaveRequest::factory()->create([
            'student_id' => $student->id,
            'guardian_id' => $guardianModel->id,
        ]);

        $this->actingAs($guardian)->get('/leave-requests')->assertForbidden();
        $this->actingAs($guardian)->get("/leave-requests/{$leave->id}")->assertForbidden();
        $this->actingAs($guardian)->patch("/leave-requests/{$leave->id}/approve")->assertForbidden();
        $this->actingAs($guardian)->patch("/leave-requests/{$leave->id}/reject")->assertForbidden();
    }

    public function test_wali_teacher_cannot_access_monitoring(): void
    {
        $this->actingAs($this->teacher('wali'))->get('/monitoring')->assertForbidden();
    }

    public function test_piket_teacher_cannot_verify_leave_requests(): void
    {
        $this->actingAs($this->teacher('piket'))->get('/leave-requests/verification')->assertForbidden();
        $this->actingAs($this->teacher('piket'))->get('/leave-requests')->assertOk();
        $this->actingAs($this->teacher('piket'))->patch('/leave-requests/1/approve')->assertForbidden();
        $this->actingAs($this->teacher('piket'))->patch('/leave-requests/1/reject')->assertForbidden();
    }

    public function test_admin_cannot_access_guardian_or_student_pages(): void
    {
        $this->actingAs($this->admin())->get('/guardian')->assertForbidden();
        $this->actingAs($this->admin())->get('/guardian/history')->assertForbidden();
        $this->actingAs($this->admin())->get('/student/attendance')->assertForbidden();
    }

    public function test_guardian_history_renders_guardian_history_component(): void
    {
        $this->actingAs($this->guardianWithStudents())
            ->get('/guardian/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Guardian/History'));
    }

    public function test_guardian_leave_application_renders_guardian_component(): void
    {
        $this->actingAs($this->guardianWithStudents())
            ->get('/guardian/leave-application')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Guardian/LeaveApplication'));
    }

    public function test_student_pages_render_student_components(): void
    {
        $student = $this->student();

        $this->actingAs($student)->get('/student/history')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Student/AttendanceHistory'));

        $this->actingAs($student)->get('/student/attendance')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Student/LiveAttendance'));
    }

    public function test_removed_flat_routes_return_not_found(): void
    {
        $user = $this->guardianWithStudents();

        $this->actingAs($user)->get('/leave-application')->assertNotFound();
        $this->actingAs($user)->get('/history')->assertNotFound();

        $this->actingAs($this->student())->get('/attendance')->assertNotFound();
    }
}
