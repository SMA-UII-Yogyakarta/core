<?php

namespace Tests\Feature\Services;

use App\Models\Student;
use App\Services\StudentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentServiceTest extends TestCase
{
    use RefreshDatabase;

    protected StudentService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(StudentService::class);
    }

    public function test_create_creates_student_and_user_account(): void
    {
        $student = $this->service->create([
            'nis' => '2716',
            'nisn' => '0009123456',
            'name' => 'Abimanyu Pandita',
            'email' => 'abimanyu@smauiiyk.sch.id',
        ]);

        $this->assertInstanceOf(Student::class, $student);
        $this->assertEquals('2716', $student->nis);
        $this->assertDatabaseHas('users', [
            'username' => '2716',
            'name' => 'Abimanyu Pandita',
            'role' => 'student',
        ]);
    }

    public function test_update_syncs_username_when_nis_changes(): void
    {
        $student = $this->service->create([
            'nis' => '2716',
            'nisn' => '0009123456',
            'name' => 'Abimanyu Pandita',
        ]);

        $this->assertEquals('2716', $student->user->username);

        $updated = $this->service->update($student->id, [
            'nis' => '2717',
            'name' => 'Abimanyu P. P.',
        ]);

        $this->assertEquals('2717', $updated->nis);
        $this->assertEquals('2717', $updated->user->fresh()->username);
        $this->assertEquals('Abimanyu P. P.', $updated->user->fresh()->name);
    }

    public function test_delete_removes_user_and_student(): void
    {
        $student = $this->service->create([
            'nis' => '2718',
            'nisn' => '0009123457',
            'name' => 'Test Student',
        ]);

        $userId = $student->user_id;
        $studentId = $student->id;

        $this->service->delete($studentId);

        $this->assertDatabaseMissing('students', ['id' => $studentId]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }
}
