<?php

namespace Tests\Feature\Web;

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

    public function test_admin_can_access_leave_verification(): void
    {
        $this->actingAs($this->createUser('admin'))
            ->get('/admin/leave-verification')
            ->assertOk();
    }

    public function test_teacher_can_access_leave_verification(): void
    {
        $this->actingAs($this->createUser('teacher'))
            ->get('/admin/leave-verification')
            ->assertOk();
    }

    public function test_student_cannot_access_leave_verification(): void
    {
        $this->actingAs($this->createUser('student'))
            ->get('/admin/leave-verification')
            ->assertForbidden();
    }

    public function test_teacher_cannot_access_leave_requests_admin_view(): void
    {
        $this->actingAs($this->createUser('teacher'))
            ->get('/admin/leave-requests')
            ->assertForbidden();
    }
}
