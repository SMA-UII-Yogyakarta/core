<?php

namespace Tests\Feature\Api;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminMasterDataApiCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createUser(string $role): User
    {
        return User::factory()->create(['role' => $role]);
    }

    private function createStudentFixture(): Student
    {
        $user = $this->createUser('student');
        $class = SchoolClass::factory()->create();

        return Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $class->id,
        ]);
    }

    private function createTeacherFixture(): Teacher
    {
        return Teacher::factory()->create(['user_id' => $this->createUser('teacher')->id]);
    }

    private function createGuardianFixture(): Guardian
    {
        return Guardian::factory()->create(['user_id' => $this->createUser('guardian')->id]);
    }

    private function studentPayload(array $overrides = []): array
    {
        return array_merge([
            'nis' => fake()->unique()->numerify('##########'),
            'nisn' => fake()->unique()->numerify('##############'),
            'name' => 'Api Test Student',
            'class_id' => null,
            'birth_date' => '2011-02-02',
            'phone' => null,
            'address' => null,
            'enrollment_year' => 2025,
            'guardian_id' => null,
            'status' => 'Active',
            'email' => null,
            'password' => null,
        ], $overrides);
    }

    private function teacherPayload(array $overrides = []): array
    {
        return array_merge([
            'teacher_code' => fake()->unique()->numerify('NIP-####'),
            'name' => 'Api Test Teacher',
            'email' => null,
            'teacher_type' => ['duty'],
            'password' => null,
        ], $overrides);
    }

    private function classPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'IPK-1',
            'teacher_id' => null,
            'capacity' => 36,
        ], $overrides);
    }

    private function guardianPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Api Test Guardian',
            'phone' => '087711223344',
            'address' => 'Sorowajan Baru',
            'email' => null,
            'password' => null,
        ], $overrides);
    }

    private function payloadFor(string $entity): array
    {
        return match ($entity) {
            'students' => $this->studentPayload(),
            'teachers' => $this->teacherPayload(),
            'classes' => $this->classPayload(),
            'guardians' => $this->guardianPayload(),
            default => throw new \InvalidArgumentException("Unsupported master data entity: {$entity}"),
        };
    }

    private function fixtureFor(string $entity)
    {
        return match ($entity) {
            'students' => $this->createStudentFixture(),
            'teachers' => $this->createTeacherFixture(),
            'classes' => SchoolClass::factory()->create(),
            'guardians' => $this->createGuardianFixture(),
            default => throw new \InvalidArgumentException("Unsupported master data entity: {$entity}"),
        };
    }

    public function test_admin_can_list_students(): void
    {
        $student = $this->createStudentFixture();

        $this->actingAs($this->admin())
            ->getJson('/api/v1/students')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.total', 1)
            ->assertJsonPath('data.data.0.nis', $student->nis);
    }

    public function test_admin_can_list_teachers(): void
    {
        $this->createTeacherFixture();

        $this->actingAs($this->admin())
            ->getJson('/api/v1/teachers')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.total', 1);
    }

    public function test_admin_can_list_classes(): void
    {
        $this->actingAs($this->admin())
            ->getJson('/api/v1/classes')
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_admin_can_list_guardians(): void
    {
        $this->createGuardianFixture();

        $this->actingAs($this->admin())
            ->getJson('/api/v1/guardians')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.meta.total', 1);
    }

    public function test_admin_can_show_student(): void
    {
        $student = $this->createStudentFixture();

        $this->actingAs($this->admin())
            ->getJson("/api/v1/students/{$student->id}")
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nis', $student->nis)
            ->assertJsonPath('data.name', $student->name);
    }

    public function test_show_student_returns_404_for_missing_id(): void
    {
        $this->actingAs($this->admin())
            ->getJson('/api/v1/students/999999')
            ->assertNotFound()
            ->assertJsonPath('success', false);
    }

    public function test_admin_can_store_student(): void
    {
        $schoolClass = SchoolClass::factory()->create();
        $payload = $this->studentPayload([
            'nis' => '2402020202',
            'nisn' => '001122334455',
            'name' => 'Api Siswa Baru',
            'class_id' => $schoolClass->id,
        ]);

        $this->actingAs($this->admin())
            ->postJson('/api/v1/students', $payload)
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.nis', '2402020202')
            ->assertJsonPath('data.name', 'Api Siswa Baru');

        $this->assertDatabaseHas('students', [
            'nis' => '2402020202',
            'nisn' => '001122334455',
            'class_id' => $schoolClass->id,
        ]);

        $this->assertDatabaseHas('users', [
            'username' => '2402020202',
            'name' => 'Api Siswa Baru',
            'role' => 'student',
        ]);

        $student = Student::where('nis', '2402020202')->first();
        $this->assertTrue($student->user->hasRole('student'));
        $this->assertSame('web', $student->user->roles->first()->guard_name);
    }

    public function test_admin_can_update_student(): void
    {
        $student = $this->createStudentFixture();

        $this->actingAs($this->admin())
            ->putJson("/api/v1/students/{$student->id}", $this->studentPayload([
                'name' => 'Api Update',
                'status' => 'Inactive',
            ]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Api Update')
            ->assertJsonPath('data.status', 'Inactive');

        $student->refresh();
        $this->assertSame('Api Update', $student->name);
        $this->assertSame('Inactive', $student->status);
        $this->assertSame('Api Update', $student->user->name);
    }

    public function test_admin_can_destroy_student(): void
    {
        $student = $this->createStudentFixture();

        $this->actingAs($this->admin())
            ->deleteJson("/api/v1/students/{$student->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
        $this->assertDatabaseMissing('users', ['id' => $student->user_id]);
    }

    public function test_destroy_student_returns_404_for_missing_id(): void
    {
        $this->actingAs($this->admin())
            ->deleteJson('/api/v1/students/999999')
            ->assertNotFound();
    }

    public function test_admin_can_store_teacher(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/teachers', $this->teacherPayload([
                'teacher_code' => 'NIP-9001',
                'name' => 'Api Guru',
            ]))
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.teacher_code', 'NIP-9001');

        $this->assertDatabaseHas('teachers', ['teacher_code' => 'NIP-9001']);
        $this->assertDatabaseHas('users', [
            'username' => 'NIP-9001',
            'name' => 'Api Guru',
            'role' => 'teacher',
        ]);

        $teacher = Teacher::where('teacher_code', 'NIP-9001')->first();
        $this->assertTrue($teacher->user->hasRole('teacher'));
        $this->assertSame('web', $teacher->user->roles->first()->guard_name);
    }

    public function test_admin_can_update_teacher(): void
    {
        $teacher = $this->createTeacherFixture();
        $newCode = fake()->unique()->numerify('NIP-##00');

        $this->actingAs($this->admin())
            ->putJson("/api/v1/teachers/{$teacher->id}", $this->teacherPayload([
                'teacher_code' => $newCode,
                'name' => 'Api Update Guru',
            ]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Api Update Guru');

        $teacher->refresh();
        $this->assertSame($newCode, $teacher->teacher_code);
        $this->assertSame($newCode, $teacher->user->username);
        $this->assertSame('Api Update Guru', $teacher->user->name);
    }

    public function test_admin_can_destroy_teacher(): void
    {
        $teacher = $this->createTeacherFixture();

        $this->actingAs($this->admin())
            ->deleteJson("/api/v1/teachers/{$teacher->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
        $this->assertDatabaseMissing('users', ['id' => $teacher->user_id]);
    }

    public function test_admin_can_store_class(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/classes', $this->classPayload([
                'name' => 'IPK-1',
                'capacity' => 40,
            ]))
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'IPK-1');

        $this->assertDatabaseHas('school_classes', ['name' => 'IPK-1', 'capacity' => 40]);
    }

    public function test_admin_can_update_class(): void
    {
        $schoolClass = SchoolClass::factory()->create();

        $this->actingAs($this->admin())
            ->putJson("/api/v1/classes/{$schoolClass->id}", $this->classPayload([
                'name' => 'IPK-2',
                'capacity' => 32,
            ]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'IPK-2');

        $this->assertDatabaseHas('school_classes', [
            'id' => $schoolClass->id,
            'name' => 'IPK-2',
            'capacity' => 32,
        ]);
    }

    public function test_admin_can_destroy_class(): void
    {
        $schoolClass = SchoolClass::factory()->create();

        $this->actingAs($this->admin())
            ->deleteJson("/api/v1/classes/{$schoolClass->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('school_classes', ['id' => $schoolClass->id]);
    }

    public function test_admin_can_store_guardian(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/guardians', $this->guardianPayload([
                'name' => 'Api Wali',
                'phone' => '081234567890',
            ]))
            ->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Api Wali');

        $this->assertDatabaseHas('guardians', ['name' => 'Api Wali', 'phone' => '081234567890']);
        $this->assertDatabaseHas('users', [
            'username' => '081234567890',
            'name' => 'Api Wali',
            'role' => 'guardian',
        ]);

        $guardian = Guardian::where('phone', '081234567890')->first();
        $this->assertTrue($guardian->user->hasRole('guardian'));
        $this->assertSame('web', $guardian->user->roles->first()->guard_name);
    }

    public function test_admin_can_update_guardian(): void
    {
        $guardian = $this->createGuardianFixture();

        $this->actingAs($this->admin())
            ->putJson("/api/v1/guardians/{$guardian->id}", $this->guardianPayload([
                'name' => 'Api Update Wali',
                'phone' => '085512345678',
            ]))
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Api Update Wali');

        $guardian->refresh();
        $this->assertSame('Api Update Wali', $guardian->name);
        $this->assertSame('085512345678', $guardian->user->username);
    }

    public function test_admin_can_update_guardian_email_and_password(): void
    {
        $guardian = $this->createGuardianFixture();

        $this->actingAs($this->admin())
            ->putJson("/api/v1/guardians/{$guardian->id}", $this->guardianPayload([
                'email' => 'wali.api@example.com',
                'password' => 'rahasia456',
            ]))
            ->assertOk()
            ->assertJsonPath('success', true);

        $guardian->refresh();
        $this->assertSame('wali.api@example.com', $guardian->user->email);
        $this->assertTrue(Hash::check('rahasia456', $guardian->user->password));
    }

    public function test_update_guardian_rejects_duplicate_email(): void
    {
        $guardian = $this->createGuardianFixture();
        $other = $this->createGuardianFixture();
        $other->user->update(['email' => 'dipakai@example.com']);

        $this->actingAs($this->admin())
            ->putJson("/api/v1/guardians/{$guardian->id}", $this->guardianPayload([
                'email' => 'dipakai@example.com',
            ]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        $this->assertNotSame('dipakai@example.com', $guardian->refresh()->user->email);
    }

    public function test_admin_can_destroy_guardian(): void
    {
        $guardian = $this->createGuardianFixture();

        $this->actingAs($this->admin())
            ->deleteJson("/api/v1/guardians/{$guardian->id}")
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseMissing('guardians', ['id' => $guardian->id]);
        $this->assertDatabaseMissing('users', ['id' => $guardian->user_id]);
    }

    public function test_store_student_returns_422_on_validation_failure(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/students', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['nis', 'nisn', 'name', 'enrollment_year']);
    }

    public function test_store_teacher_returns_422_on_validation_failure(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/teachers', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['teacher_code', 'name']);
    }

    public function test_store_class_returns_422_on_validation_failure(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/classes', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_guardian_returns_422_on_validation_failure(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/api/v1/guardians', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    public function test_only_admin_can_access_master_data_api(): void
    {
        $users = [
            'student' => $this->createUser('student'),
            'teacher' => $this->createUser('teacher'),
            'guardian' => $this->createUser('guardian'),
        ];

        $fixtures = [];
        foreach (['students', 'teachers', 'classes', 'guardians'] as $entity) {
            $fixtures[$entity] = $this->fixtureFor($entity);
        }

        foreach ($users as $user) {
            foreach ($fixtures as $entity => $fixture) {
                $id = $fixture->id;

                $this->actingAs($user)
                    ->getJson("/api/v1/{$entity}")
                    ->assertForbidden();

                $this->actingAs($user)
                    ->getJson("/api/v1/{$entity}/{$id}")
                    ->assertForbidden();

                $this->actingAs($user)
                    ->postJson("/api/v1/{$entity}", $this->payloadFor($entity))
                    ->assertForbidden();

                $this->actingAs($user)
                    ->putJson("/api/v1/{$entity}/{$id}", $this->payloadFor($entity))
                    ->assertForbidden();

                $this->actingAs($user)
                    ->deleteJson("/api/v1/{$entity}/{$id}")
                    ->assertForbidden();
            }
        }
    }
}
