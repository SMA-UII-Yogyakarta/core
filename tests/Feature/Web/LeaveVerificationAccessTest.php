<?php

namespace Tests\Feature\Web;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaveVerificationAccessTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    public function test_admin_can_access_leave_requests(): void
    {
        $this->actingAs($this->createUser('admin'))
            ->get('/leave-requests')
            ->assertOk();
    }

    public function test_wali_kelas_can_access_leave_requests(): void
    {
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'wali']);

        $this->actingAs($user)
            ->get('/leave-requests')
            ->assertOk();
    }

    public function test_piket_teacher_can_access_leave_requests_pantauan(): void
    {
        // Pantauan Izin: teacher:piket may view /leave-requests (PermissionRegistry).
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'piket']);

        $this->actingAs($user)
            ->get('/leave-requests')
            ->assertOk();
    }

    public function test_piket_teacher_cannot_access_leave_verification(): void
    {
        // Verifikasi Izin remains wali-only (+ admin).
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'piket']);

        $this->actingAs($user)
            ->get('/leave-requests/verification')
            ->assertForbidden();
    }

    public function test_student_cannot_access_leave_requests(): void
    {
        $this->actingAs($this->createUser('student'))
            ->get('/leave-requests')
            ->assertForbidden();
    }

    public function test_teacher_cannot_access_master_data(): void
    {
        $this->actingAs($this->createUser('teacher'))
            ->get('/master-data')
            ->assertForbidden();
    }
}
