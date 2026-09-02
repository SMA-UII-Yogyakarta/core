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

class DashboardRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_renders_admin_view(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->component('Admin/Dashboard'));
    }

    public function test_teacher_dashboard_redirects_to_homeroom(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'homeroom']);

        $this->actingAs($user)->get('/dashboard')
            ->assertRedirect(route('teacher.homeroom'));

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Teacher/HomeroomDashboard'));
    }

    public function test_piket_teacher_dashboard_redirects_to_duty(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'duty']);

        $this->actingAs($user)->get('/dashboard')
            ->assertRedirect(route('teacher.duty'));

        $this->actingAs($user)->get('/teacher/duty')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Teacher/DutyDashboard'));
    }

    public function test_guardian_dashboard_redirects_to_guardian_view(): void
    {
        $user = User::factory()->create(['role' => 'guardian']);
        Guardian::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/dashboard')
            ->assertRedirect(route('guardian.dashboard'));

        $this->actingAs($user)->get('/guardian')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Guardian/Dashboard'));
    }

    public function test_guardian_dashboard_redirect_preserves_student_id_query(): void
    {
        $user = User::factory()->create(['role' => 'guardian']);
        Guardian::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/dashboard?student_id=42')
            ->assertRedirect('/guardian?student_id=42');
    }

    public function test_student_dashboard_redirects_to_student_view(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $schoolClass = SchoolClass::factory()->create();
        Student::factory()->create(['user_id' => $user->id, 'class_id' => $schoolClass->id]);

        $this->actingAs($user)->get('/dashboard')
            ->assertRedirect(route('student.dashboard'));

        $this->actingAs($user)->get('/student/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Student/Dashboard'));

        $this->actingAs($user)->get('/student/overview')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Student/Dashboard'));
    }

    public function test_overview_route_dispatches_smartly_per_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/overview')
            ->assertRedirect(route('dashboard'));

        $waliUser = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $waliUser->id, 'teacher_type' => 'homeroom']);
        $this->actingAs($waliUser)->get('/overview')
            ->assertRedirect(route('teacher.homeroom'));

        $piketUser = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $piketUser->id, 'teacher_type' => 'duty']);
        $this->actingAs($piketUser)->get('/overview')
            ->assertRedirect(route('teacher.duty'));

        $guardianUser = User::factory()->create(['role' => 'guardian']);
        Guardian::factory()->create(['user_id' => $guardianUser->id]);
        $this->actingAs($guardianUser)->get('/overview')
            ->assertRedirect(route('guardian.dashboard'));

        $studentUser = User::factory()->create(['role' => 'student']);
        $schoolClass = SchoolClass::factory()->create();
        Student::factory()->create(['user_id' => $studentUser->id, 'class_id' => $schoolClass->id]);
        $this->actingAs($studentUser)->get('/overview')
            ->assertRedirect(route('student.dashboard'));
    }

    public function test_dual_role_teacher_switches_role_and_redirects_appropriately(): void
    {
        $teacherUser = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $teacherUser->id, 'teacher_type' => ['homeroom', 'duty']]);

        // Default redirects to homeroom
        $this->actingAs($teacherUser)->get('/dashboard')
            ->assertRedirect(route('teacher.homeroom'));

        // Switch to duty
        $this->actingAs($teacherUser)->post('/profile/switch-role', ['role' => 'duty'])
            ->assertSessionHas('active_teacher_role', 'duty');

        // Now dashboard redirects to duty
        $this->actingAs($teacherUser)->get('/dashboard')
            ->assertRedirect(route('teacher.duty'));

        // Switch to homeroom from duty dashboard redirects to homeroom dashboard
        $this->actingAs($teacherUser)
            ->from('/teacher/duty')
            ->post('/profile/switch-role', ['role' => 'homeroom'])
            ->assertRedirect(route('teacher.homeroom'))
            ->assertSessionHas('active_teacher_role', 'homeroom');

        // Unauthorized switch attempt fails
        $this->actingAs($teacherUser)
            ->post('/profile/switch-role', ['role' => 'invalid_role'])
            ->assertSessionHasErrors(['role']);
    }
}
