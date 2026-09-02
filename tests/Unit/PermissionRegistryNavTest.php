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

    private function navHrefs(string $teacherType, ?string $activeRole = null): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => $teacherType]);

        return $this->hrefsFor($user, $activeRole);
    }

    private function hrefsFor(User $user, ?string $activeRole = null): array
    {
        return collect(PermissionRegistry::getNavFor($user, $activeRole))
            ->flatMap(fn ($section) => collect($section['items'])->pluck('href'))
            ->all();
    }

    public function test_wali_teacher_nav_includes_homeroom_but_not_duty(): void
    {
        $hrefs = $this->navHrefs('homeroom');

        $this->assertContains('/teacher/homeroom', $hrefs);
        $this->assertNotContains('/teacher/duty', $hrefs);
    }

    public function test_piket_teacher_nav_includes_duty_but_not_homeroom(): void
    {
        $hrefs = $this->navHrefs('duty');

        $this->assertContains('/teacher/duty', $hrefs);
        $this->assertNotContains('/teacher/homeroom', $hrefs);
    }

    public function test_both_teacher_nav_filters_by_active_role(): void
    {
        $dutyHrefs = $this->navHrefs('both', 'duty');
        $this->assertContains('/teacher/duty', $dutyHrefs);
        $this->assertNotContains('/teacher/homeroom', $dutyHrefs);

        $homeroomHrefs = $this->navHrefs('both', 'homeroom');
        $this->assertContains('/teacher/homeroom', $homeroomHrefs);
        $this->assertNotContains('/teacher/duty', $homeroomHrefs);
    }

    public function test_admin_nav_matches_figma_sidebar(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertSame([
            '/dashboard',
            '/master-data',
            '/class-enrolment',
            '/guardian-assignment',
            '/operational-settings',
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
            '/export',
            '/leave-requests',
            '/reports?tab=daily',
        ], $this->navHrefs('duty'));
    }

    public function test_wali_teacher_nav_uses_reports_instead_of_global_export(): void
    {
        $this->assertSame([
            '/teacher/homeroom',
            '/leave-requests/verification',
            '/reports',
        ], $this->navHrefs('homeroom'));
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
