<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'homeroom']);

        $this->actingAs($user)
            ->get('/leave-requests')
            ->assertOk();
    }

    public function test_piket_teacher_can_access_leave_requests_pantauan(): void
    {
        // Pantauan Izin: teacher:piket may view /leave-requests (PermissionRegistry).
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'duty']);

        $this->actingAs($user)
            ->get('/leave-requests')
            ->assertOk();
    }

    public function test_piket_teacher_cannot_access_leave_verification(): void
    {
        // Verifikasi Izin remains wali-only (+ admin).
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'duty']);

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

    public function test_admin_verification_renders_admin_page(): void
    {
        $this->actingAs($this->createUser('admin'))
            ->get('/leave-requests/verification')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/LeaveVerification')
                ->has('leaveRequests.data')
                ->has('filters'));
    }

    public function test_wali_verification_renders_teacher_page(): void
    {
        $user = $this->createUser('teacher');
        $teacher = Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'homeroom']);
        $schoolClass = SchoolClass::factory()->create(['teacher_id' => $teacher->id]);

        $this->actingAs($user)
            ->get('/leave-requests/verification')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/LeaveVerification')
                ->has('teacher')
                ->has('class')
                ->has('leaveRequests'));
    }

    public function test_wali_verification_scoped_to_own_class(): void
    {
        $user = $this->createUser('teacher');
        $teacher = Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'homeroom']);
        $ownClass = SchoolClass::factory()->create(['teacher_id' => $teacher->id]);
        $otherUser = $this->createUser('teacher');
        $otherTeacher = Teacher::factory()->create(['user_id' => $otherUser->id, 'teacher_type' => 'homeroom']);
        $otherClass = SchoolClass::factory()->create(['teacher_id' => $otherTeacher->id]);

        $ownStudent = Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'name' => 'Own Student',
            'nis' => '10001',
            'nisn' => '9910001',
            'class_id' => $ownClass->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
        $otherStudent = Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'name' => 'Other Student',
            'nis' => '20002',
            'nisn' => '9920002',
            'class_id' => $otherClass->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $guardian = Guardian::create([
            'user_id' => User::factory()->create(['role' => 'guardian'])->id,
            'name' => 'Guardian Test',
        ]);

        $ownLeave = LeaveRequest::create([
            'student_id' => $ownStudent->id,
            'guardian_id' => $guardian->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => 'Pending',
        ]);
        LeaveRequest::create([
            'student_id' => $otherStudent->id,
            'guardian_id' => $guardian->id,
            'category' => 'Event',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => 'Pending',
        ]);

        $this->actingAs($user)
            ->get('/leave-requests/verification')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/LeaveVerification')
                ->where('class.id', $ownClass->id)
                ->has('leaveRequests', 1)
                ->where('leaveRequests.0.id', $ownLeave->id));
    }

    public function test_wali_verification_empty_when_no_class(): void
    {
        $user = $this->createUser('teacher');
        Teacher::factory()->create(['user_id' => $user->id, 'teacher_type' => 'homeroom']);

        $this->actingAs($user)
            ->get('/leave-requests/verification')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Teacher/LeaveVerification')
                ->where('class', null)
                ->where('leaveRequests', []));
    }
}
