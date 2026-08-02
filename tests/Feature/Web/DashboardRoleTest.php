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
        $response->assertInertia(fn (Assert $page) => $page->component('Dashboard'));
    }

    public function test_teacher_dashboard_redirects_to_homeroom(): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get('/dashboard')
            ->assertRedirect(route('teacher.homeroom'));

        $this->actingAs($user)->get('/teacher/homeroom')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('Teacher/HomeroomDashboard'));
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
    }
}
