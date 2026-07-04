<?php

namespace Tests\Feature\Services;

use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use App\Services\LeaveRequestService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeaveRequestServiceTest extends TestCase
{
    use RefreshDatabase;

    protected LeaveRequestService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LeaveRequestService::class);
    }

    public function test_create_creates_leave_request(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
        $guardian = Guardian::create(['user_id' => $user->id, 'name' => 'Test Guardian']);

        $leaveRequest = $this->service->create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Sick',
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(3)->toDateString(),
        ]);

        $this->assertEquals($student->id, $leaveRequest->student_id);
        $this->assertEquals('Pending', $leaveRequest->approval_status);
        $this->assertEquals('Sick', $leaveRequest->category);
    }

    public function test_verify_approves_leave_request(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
        $guardian = Guardian::create(['user_id' => $user->id, 'name' => 'Test Guardian']);

        $leaveRequest = LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Permission',
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'approval_status' => 'Pending',
        ]);

        $verified = $this->service->verify($leaveRequest->id, 'Approved');

        $this->assertEquals('Approved', $verified->approval_status);
    }

    public function test_verify_rejects_leave_request(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
        $guardian = Guardian::create(['user_id' => $user->id, 'name' => 'Test Guardian']);

        $leaveRequest = LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Other',
            'start_date' => now()->addDays(1)->toDateString(),
            'end_date' => now()->addDays(2)->toDateString(),
            'approval_status' => 'Pending',
        ]);

        $verified = $this->service->verify($leaveRequest->id, 'Rejected');

        $this->assertEquals('Rejected', $verified->approval_status);
    }

    public function test_verify_throws_exception_for_invalid_status(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->expectExceptionMessage('Status harus Approved atau Rejected.');

        $this->service->verify(999, 'InvalidStatus');
    }

    public function test_paginate_filters_by_status(): void
    {
        $class = SchoolClass::create(['name' => 'X-A']);
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Test Student',
            'nis' => '12345',
            'nisn' => '1234567890',
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
        $guardian = Guardian::create(['user_id' => $user->id, 'name' => 'Test Guardian']);

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => 'Approved',
        ]);

        LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Permission',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => 'Pending',
        ]);

        $pending = $this->service->paginate(['status' => 'Pending']);
        $approved = $this->service->paginate(['status' => 'Approved']);

        $this->assertEquals(1, $pending->total());
        $this->assertEquals(1, $approved->total());
    }
}
