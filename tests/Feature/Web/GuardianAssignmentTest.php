<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuardianAssignmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Guardian $guardian;
    protected Student $student;
    protected SchoolClass $schoolClass;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);

        $guardianUser = User::factory()->create(['role' => 'guardian']);
        $this->guardian = Guardian::create([
            'user_id' => $guardianUser->id,
            'name' => 'Wali Test',
            'phone' => '08123456789',
        ]);

        $this->schoolClass = SchoolClass::create([
            'name' => 'X-A',
            'level' => 'X',
            'capacity' => 36,
        ]);

        $studentUser = User::factory()->create(['role' => 'student']);
        $this->student = Student::create([
            'user_id' => $studentUser->id,
            'class_id' => $this->schoolClass->id,
            'nis' => '12345',
            'nisn' => '0012345',
            'name' => 'Siswa Test',
            'birth_date' => '2008-01-01',
            'enrollment_year' => 2024,
            'status' => 'Active',
        ]);
    }

    public function test_admin_can_access_guardian_assignment_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('guardian-assignment'));
        $response->assertOk();
    }

    public function test_admin_can_assign_student_to_guardian(): void
    {
        $response = $this->actingAs($this->admin)->post(route('guardian-assignment.assign'), [
            'guardian_id' => $this->guardian->id,
            'student_id' => $this->student->id,
        ]);

        $response->assertRedirect();
        $this->student->refresh();
        $this->assertEquals($this->guardian->id, $this->student->guardian_id);
    }

    public function test_admin_can_remove_student_from_guardian(): void
    {
        $this->student->update(['guardian_id' => $this->guardian->id]);

        $response = $this->actingAs($this->admin)->delete(route('guardian-assignment.remove', ['studentId' => $this->student->id]));

        $response->assertRedirect();
        $this->student->refresh();
        $this->assertNull($this->student->guardian_id);
    }

    public function test_non_admin_cannot_assign_student_to_guardian(): void
    {
        $studentUser = User::factory()->create(['role' => 'student']);
        $response = $this->actingAs($studentUser)->post(route('guardian-assignment.assign'), [
            'guardian_id' => $this->guardian->id,
            'student_id' => $this->student->id,
        ]);

        $response->assertForbidden();
    }
}
