<?php

namespace Tests\Feature\Api;

use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiAuthControlTest extends TestCase
{
    use RefreshDatabase;

    private function createUser(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function createStudent(): Student
    {
        $schoolClass = SchoolClass::factory()->create();
        $user = $this->createUser('student');

        return Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
        ]);
    }

    private function createGuardian(): Guardian
    {
        $user = $this->createUser('guardian');

        return Guardian::factory()->create(['user_id' => $user->id]);
    }

    private function createLeaveRequest(string $status = 'Pending'): LeaveRequest
    {
        return LeaveRequest::factory()->create([
            'student_id' => $this->createStudent()->id,
            'guardian_id' => $this->createGuardian()->id,
            'approval_status' => $status,
        ]);
    }

    private function studentStorePayload(): array
    {
        $schoolClass = SchoolClass::factory()->create();

        return [
            'nis' => fake()->unique()->numerify('##########'),
            'nisn' => fake()->unique()->numerify('##############'),
            'name' => 'Test Student',
            'class_id' => $schoolClass->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
        ];
    }

    public function test_guest_cannot_access_master_data_api(): void
    {
        $this->getJson('/api/v1/students')
            ->assertStatus(401);
    }

    public function test_guest_cannot_access_leave_requests_api(): void
    {
        $this->getJson('/api/v1/leave-requests')
            ->assertStatus(401);
    }

    public function test_student_cannot_access_master_data_api(): void
    {
        $user = $this->createUser('student');

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertStatus(403);
    }

    public function test_student_cannot_store_master_data_api(): void
    {
        $user = $this->createUser('student');

        $this->actingAs($user)
            ->postJson('/api/v1/students', $this->studentStorePayload())
            ->assertStatus(403);
    }

    public function test_student_cannot_list_leave_requests(): void
    {
        $user = $this->createUser('student');

        $this->actingAs($user)
            ->getJson('/api/v1/leave-requests')
            ->assertStatus(403);
    }

    public function test_student_cannot_verify_leave_request(): void
    {
        $user = $this->createUser('student');
        $leave = $this->createLeaveRequest();

        $this->actingAs($user)
            ->patchJson('/api/v1/leave-requests/' . $leave->id . '/verify', [
                'status' => 'Approved',
            ])
            ->assertStatus(403);
    }

    public function test_student_can_submit_leave_request(): void
    {
        $user = $this->createUser('student');
        $student = $this->createStudent();

        $this->actingAs($user)
            ->postJson('/api/v1/leave-requests', [
                'student_id' => $student->id,
                'guardian_id' => $this->createGuardian()->id,
                'category' => 'Sick',
                'start_date' => '2026-01-05',
                'end_date' => '2026-01-07',
            ])
            ->assertStatus(201);
    }

    public function test_teacher_can_view_attendances(): void
    {
        $user = $this->createUser('teacher');
        \App\Models\Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'piket']);

        $this->actingAs($user)
            ->getJson('/api/v1/attendances')
            ->assertStatus(200);
    }

    public function test_teacher_cannot_access_master_data(): void
    {
        $user = $this->createUser('teacher');

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertStatus(403);
    }

    public function test_teacher_cannot_store_master_data(): void
    {
        $user = $this->createUser('teacher');

        $this->actingAs($user)
            ->postJson('/api/v1/students', $this->studentStorePayload())
            ->assertStatus(403);
    }

    public function test_teacher_can_verify_leave_request(): void
    {
        $user = $this->createUser('teacher');
        \App\Models\Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'wali']);
        $leave = $this->createLeaveRequest();

        $this->actingAs($user)
            ->patchJson('/api/v1/leave-requests/' . $leave->id . '/verify', [
                'status' => 'Approved',
            ])
            ->assertStatus(200)
            ->assertJsonPath('data.approval_status', 'Approved');
    }

    public function test_guardian_can_list_leave_requests(): void
    {
        $user = $this->createUser('guardian');

        $this->actingAs($user)
            ->getJson('/api/v1/leave-requests')
            ->assertStatus(200);
    }

    public function test_guardian_can_submit_leave_request(): void
    {
        $user = $this->createUser('guardian');
        $student = $this->createStudent();

        $this->actingAs($user)
            ->postJson('/api/v1/leave-requests', [
                'student_id' => $student->id,
                'guardian_id' => $this->createGuardian()->id,
                'category' => 'Permission',
                'start_date' => '2026-02-01',
                'end_date' => '2026-02-01',
            ])
            ->assertStatus(201);
    }

    public function test_guardian_cannot_access_master_data(): void
    {
        $user = $this->createUser('guardian');

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertStatus(403);
    }

    public function test_admin_can_access_master_data(): void
    {
        $user = $this->createUser('admin');

        $this->actingAs($user)
            ->getJson('/api/v1/students')
            ->assertStatus(200);
    }

    public function test_admin_can_list_leave_requests(): void
    {
        $user = $this->createUser('admin');

        $this->actingAs($user)
            ->getJson('/api/v1/leave-requests')
            ->assertStatus(200);
    }
}
