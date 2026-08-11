<?php

namespace Tests\Unit;

use App\Models\Teacher;
use App\Models\User;
use App\Permissions\PermissionRegistry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionRegistryNavTest extends TestCase
{
    use RefreshDatabase;

    private function navHrefs(string $teacherType): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => $teacherType]);

        return $this->hrefsFor($user);
    }

    private function hrefsFor(User $user): array
    {
        return collect(PermissionRegistry::getNavFor($user))
            ->flatMap(fn ($section) => collect($section['items'])->pluck('href'))
            ->all();
    }

    public function test_wali_teacher_nav_includes_homeroom_but_not_duty(): void
    {
        $hrefs = $this->navHrefs('wali');

        $this->assertContains('/teacher/homeroom', $hrefs);
        $this->assertNotContains('/teacher/duty', $hrefs);
    }

    public function test_piket_teacher_nav_includes_duty_but_not_homeroom(): void
    {
        $hrefs = $this->navHrefs('piket');

        $this->assertContains('/teacher/duty', $hrefs);
        $this->assertNotContains('/teacher/homeroom', $hrefs);
    }

    public function test_both_teacher_nav_includes_duty_and_homeroom(): void
    {
        $hrefs = $this->navHrefs('both');

        $this->assertContains('/teacher/duty', $hrefs);
        $this->assertContains('/teacher/homeroom', $hrefs);
    }

    public function test_admin_nav_matches_figma_sidebar(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertSame([
            '/dashboard',
            '/master-data',
            '/class-enrolment',
            '/settings',
            '/export',
        ], $this->hrefsFor($user));
    }

    public function test_admin_nav_excludes_overview_monitoring_and_attendance_correction(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $hrefs = $this->hrefsFor($user);

        $this->assertNotContains('/overview', $hrefs);
        $this->assertNotContains('/monitoring', $hrefs);
        $this->assertNotContains('/attendance-correction', $hrefs);
    }

    public function test_piket_teacher_nav_matches_figma_sidebar(): void
    {
        $this->assertSame([
            '/teacher/duty',
            '/leave-requests',
            '/reports/daily',
        ], $this->navHrefs('piket'));
    }

    public function test_wali_teacher_nav_matches_figma_sidebar(): void
    {
        $this->assertSame([
            '/teacher/homeroom',
            '/leave-requests/verification',
            '/reports/daily',
            '/reports/monthly',
            '/reports/semester',
        ], $this->navHrefs('wali'));
    }

    public function test_guardian_nav_matches_figma_sidebar(): void
    {
        $user = User::factory()->create(['role' => 'guardian']);

        $this->assertSame([
            '/guardian',
            '/guardian/leave-application',
            '/guardian/history',
        ], $this->hrefsFor($user));
    }

    public function test_student_nav_matches_figma_sidebar(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $this->assertSame([
            '/student/dashboard',
            '/student/attendance',
            '/student/history',
        ], $this->hrefsFor($user));
    }
}
