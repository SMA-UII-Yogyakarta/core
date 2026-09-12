<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminMasterDataCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createStudent(): Student
    {
        $user = User::factory()->create(['role' => 'student']);
        $schoolClass = SchoolClass::factory()->create();

        return Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
        ]);
    }

    private function createTeacher(): Teacher
    {
        $user = User::factory()->create(['role' => 'teacher']);

        return Teacher::factory()->create(['user_id' => $user->id]);
    }

    private function createGuardian(): Guardian
    {
        $user = User::factory()->create(['role' => 'guardian']);

        return Guardian::factory()->create(['user_id' => $user->id]);
    }

    private function studentPayload(array $overrides = []): array
    {
        return array_merge([
            'nis' => fake()->unique()->numerify('##########'),
            'nisn' => fake()->unique()->numerify('##############'),
            'name' => 'Test Siswa',
            'class_id' => null,
            'birth_date' => '2010-01-01',
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
            'name' => 'Test Guru',
            'email' => null,
            'teacher_type' => ['duty', 'homeroom'],
            'password' => null,
        ], $overrides);
    }

    private function classPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'IPS-1',
            'level' => 'X',
            'academic_year' => '2025/2026',
            'teacher_id' => null,
            'capacity' => 36,
        ], $overrides);
    }

    private function guardianPayload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Wali',
            'phone' => '081298989898',
            'address' => 'Sorowajan Baru',
            'email' => null,
            'password' => null,
        ], $overrides);
    }

    private function mutationUrl(string $entity, string $action, int $id): string
    {
        $base = match ($entity) {
            'students' => '/master-data/students',
            'teachers' => '/master-data/teachers',
            'classes' => '/master-data/classes',
            'guardians' => '/master-data/guardians',
            default => throw new \InvalidArgumentException("Unsupported master data entity: {$entity}"),
        };

        return match ($action) {
            'store' => $base,
            'update' => "{$base}/{$id}",
            'delete' => "{$base}/{$id}",
            'bulk' => "{$base}/bulk-destroy",
            'toggle' => "{$base}/{$id}/toggle-status",
            default => throw new \InvalidArgumentException("Unsupported master data action: {$action}"),
        };
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

    private function entityFor(string $entity)
    {
        return match ($entity) {
            'students' => $this->createStudent(),
            'teachers' => $this->createTeacher(),
            'classes' => SchoolClass::factory()->create(),
            'guardians' => $this->createGuardian(),
            default => throw new \InvalidArgumentException("Unsupported master data entity: {$entity}"),
        };
    }

    public static function masterDataWriteRoutes(): array
    {
        return [
            'student store' => ['students', 'store'],
            'student update' => ['students', 'update'],
            'student delete' => ['students', 'delete'],
            'student bulk' => ['students', 'bulk'],
            'student toggle' => ['students', 'toggle'],
            'teacher store' => ['teachers', 'store'],
            'teacher update' => ['teachers', 'update'],
            'teacher delete' => ['teachers', 'delete'],
            'teacher bulk' => ['teachers', 'bulk'],
            'class store' => ['classes', 'store'],
            'class update' => ['classes', 'update'],
            'class delete' => ['classes', 'delete'],
            'class bulk' => ['classes', 'bulk'],
            'guardian store' => ['guardians', 'store'],
            'guardian update' => ['guardians', 'update'],
            'guardian delete' => ['guardians', 'delete'],
            'guardian bulk' => ['guardians', 'bulk'],
        ];
    }

    public function test_admin_can_store_student_creates_student_and_user_account(): void
    {
        $payload = $this->studentPayload([
            'name' => 'Ahmad Hanif',
            'nis' => '2401010101',
        ]);

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', $payload)
            ->assertRedirect('/master-data?tab=students')
            ->assertSessionHas('success', __('messages.student_added'));

        $this->assertDatabaseHas('students', [
            'nis' => '2401010101',
            'nisn' => $payload['nisn'],
            'name' => 'Ahmad Hanif',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $this->assertDatabaseHas('users', [
            'username' => '2401010101',
            'name' => 'Ahmad Hanif',
            'email' => 'ahmad2401010101@smauiiyk.sch.id',
            'role' => 'student',
        ]);
    }

    public function test_admin_can_update_student_and_syncs_user_account(): void
    {
        $student = $this->createStudent();
        $newNis = fake()->unique()->numerify('##########');

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->patch("/master-data/students/{$student->id}", $this->studentPayload([
                'nis' => $newNis,
                'name' => 'Nama Siswa Baru',
                'email' => 'siswa.baru@example.com',
                'status' => 'Active',
            ]))
            ->assertRedirect('/master-data?tab=students')
            ->assertSessionHas('success', __('messages.student_updated'));

        $student->refresh();

        $this->assertSame($newNis, $student->nis);
        $this->assertSame('Nama Siswa Baru', $student->name);
        $this->assertSame($newNis, $student->user->username);
        $this->assertSame('Nama Siswa Baru', $student->user->name);
        $this->assertSame('siswa.baru@example.com', $student->user->email);
    }

    public function test_admin_can_reset_student_password_on_update(): void
    {
        $student = $this->createStudent();

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->patch("/master-data/students/{$student->id}", $this->studentPayload([
                'password' => 'rahasia123',
            ]))
            ->assertRedirect();

        $this->assertTrue(Hash::check('rahasia123', $student->refresh()->user->password));
    }

    public function test_admin_can_destroy_student_and_cascades_user(): void
    {
        $student = $this->createStudent();
        $userId = $student->user_id;

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->delete("/master-data/students/{$student->id}")
            ->assertRedirect('/master-data?tab=students')
            ->assertSessionHas('success', __('messages.student_deleted'));

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_can_bulk_destroy_students(): void
    {
        $studentA = $this->createStudent();
        $studentB = $this->createStudent();

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students/bulk-destroy', [
                'ids' => [$studentA->id, $studentB->id],
            ])
            ->assertRedirect('/master-data?tab=students')
            ->assertSessionHas('success', trans_choice('messages.student_deleted', 2, ['count' => 2]));

        $this->assertDatabaseMissing('students', ['id' => $studentA->id]);
        $this->assertDatabaseMissing('students', ['id' => $studentB->id]);
        $this->assertDatabaseMissing('users', ['id' => $studentA->user_id]);
        $this->assertDatabaseMissing('users', ['id' => $studentB->user_id]);
    }

    public function test_bulk_destroy_students_rejects_non_existent_id(): void
    {
        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students/bulk-destroy', ['ids' => [999999]])
            ->assertSessionHasErrors('ids.0');
    }

    public function test_admin_can_toggle_student_status(): void
    {
        $student = $this->createStudent();
        $this->assertSame('Active', $student->status);

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->patch("/master-data/students/{$student->id}/toggle-status")
            ->assertRedirect('/master-data?tab=students')
            ->assertSessionHas('success', __('messages.student_status_updated'));

        $this->assertSame('Inactive', $student->refresh()->status);

        $this->actingAs($this->admin())
            ->patch("/master-data/students/{$student->id}/toggle-status");

        $this->assertSame('Active', $student->refresh()->status);
    }

    public function test_admin_can_store_teacher_creates_user_with_fallback_email(): void
    {
        $payload = $this->teacherPayload([
            'teacher_code' => 'NIP-1001',
            'name' => 'Sri Rahayu',
        ]);

        $this->from('/master-data?tab=teachers')
            ->actingAs($this->admin())
            ->post('/master-data/teachers', $payload)
            ->assertRedirect('/master-data?tab=teachers')
            ->assertSessionHas('success', __('messages.teacher_added'));

        $this->assertDatabaseHas('teachers', [
            'teacher_code' => 'NIP-1001',
            'name' => 'Sri Rahayu',
        ]);

        $this->assertDatabaseHas('users', [
            'username' => 'NIP-1001',
            'name' => 'Sri Rahayu',
            'email' => 'sri.nip1001@smauiiyk.sch.id',
            'role' => 'teacher',
        ]);
    }

    public function test_admin_can_update_teacher_and_syncs_user_account(): void
    {
        $teacher = $this->createTeacher();
        $newCode = fake()->unique()->numerify('NIP-##00');

        $this->from('/master-data?tab=teachers')
            ->actingAs($this->admin())
            ->patch("/master-data/teachers/{$teacher->id}", $this->teacherPayload([
                'teacher_code' => $newCode,
                'name' => 'Guru Update',
                'email' => 'guru.update@example.com',
            ]))
            ->assertRedirect('/master-data?tab=teachers')
            ->assertSessionHas('success', __('messages.teacher_updated'));

        $teacher->refresh();

        $this->assertSame($newCode, $teacher->teacher_code);
        $this->assertSame('Guru Update', $teacher->name);
        $this->assertSame($newCode, $teacher->user->username);
        $this->assertSame('Guru Update', $teacher->user->name);
        $this->assertSame('guru.update@example.com', $teacher->user->email);
    }

    public function test_admin_can_destroy_teacher_and_cascades_user(): void
    {
        $teacher = $this->createTeacher();
        $userId = $teacher->user_id;

        $this->from('/master-data?tab=teachers')
            ->actingAs($this->admin())
            ->delete("/master-data/teachers/{$teacher->id}")
            ->assertRedirect('/master-data?tab=teachers')
            ->assertSessionHas('success', __('messages.teacher_deleted'));

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_can_bulk_destroy_teachers(): void
    {
        $teacherA = $this->createTeacher();
        $teacherB = $this->createTeacher();

        $this->from('/master-data?tab=teachers')
            ->actingAs($this->admin())
            ->post('/master-data/teachers/bulk-destroy', [
                'ids' => [$teacherA->id, $teacherB->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('teachers', ['id' => $teacherA->id]);
        $this->assertDatabaseMissing('teachers', ['id' => $teacherB->id]);
        $this->assertDatabaseMissing('users', ['id' => $teacherA->user_id]);
        $this->assertDatabaseMissing('users', ['id' => $teacherB->user_id]);
    }

    public function test_admin_can_store_class(): void
    {
        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->post('/master-data/classes', $this->classPayload([
                'name' => 'IPS-1',
                'level' => 'X',
                'academic_year' => '2025/2026',
                'capacity' => 40,
            ]))
            ->assertRedirect('/master-data?tab=class')
            ->assertSessionHas('success', __('messages.class_added'));

        $this->assertDatabaseHas('school_classes', [
            'name' => 'IPS-1',
            'level' => 'X',
            'academic_year' => '2025/2026',
            'capacity' => 40,
        ]);
    }

    public function test_class_name_is_unique_per_academic_year(): void
    {
        SchoolClass::factory()->create([
            'name' => 'IPS-1',
            'level' => 'X',
            'academic_year' => '2025/2026',
        ]);

        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->post('/master-data/classes', $this->classPayload())
            ->assertSessionHasErrors('name');
    }

    public function test_class_name_can_repeat_across_academic_years(): void
    {
        SchoolClass::factory()->create([
            'name' => 'IPS-1',
            'level' => 'X',
            'academic_year' => '2025/2026',
        ]);

        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->post('/master-data/classes', $this->classPayload([
                'academic_year' => '2026/2027',
            ]))
            ->assertRedirect('/master-data?tab=class');

        $this->assertDatabaseHas('school_classes', [
            'name' => 'IPS-1',
            'academic_year' => '2026/2027',
        ]);
    }

    public function test_admin_can_update_class(): void
    {
        $schoolClass = SchoolClass::factory()->create();

        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->patch("/master-data/classes/{$schoolClass->id}", $this->classPayload([
                'name' => 'IPA-2',
                'capacity' => 30,
            ]))
            ->assertRedirect('/master-data?tab=class')
            ->assertSessionHas('success', __('messages.class_updated'));

        $this->assertDatabaseHas('school_classes', [
            'id' => $schoolClass->id,
            'name' => 'IPA-2',
            'capacity' => 30,
        ]);
    }

    public function test_admin_can_destroy_class(): void
    {
        $schoolClass = SchoolClass::factory()->create();

        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->delete("/master-data/classes/{$schoolClass->id}")
            ->assertRedirect('/master-data?tab=class')
            ->assertSessionHas('success', __('messages.class_deleted'));

        $this->assertDatabaseMissing('school_classes', ['id' => $schoolClass->id]);
    }

    public function test_admin_can_bulk_destroy_classes(): void
    {
        $classA = SchoolClass::factory()->create();
        $classB = SchoolClass::factory()->create();

        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->post('/master-data/classes/bulk-destroy', [
                'ids' => [$classA->id, $classB->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('school_classes', ['id' => $classA->id]);
        $this->assertDatabaseMissing('school_classes', ['id' => $classB->id]);
    }

    public function test_admin_can_store_guardian_creates_user(): void
    {
        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->post('/master-data/guardians', $this->guardianPayload([
                'name' => 'Budi Santoso',
                'phone' => '081298989898',
            ]))
            ->assertRedirect('/master-data?tab=guardians')
            ->assertSessionHas('success', __('messages.guardian_added'));

        $this->assertDatabaseHas('guardians', [
            'name' => 'Budi Santoso',
            'phone' => '081298989898',
            'address' => 'Sorowajan Baru',
        ]);

        $this->assertDatabaseHas('users', [
            'username' => '081298989898',
            'name' => 'Budi Santoso',
            'role' => 'guardian',
        ]);
    }

    public function test_admin_can_update_guardian_and_syncs_user_account(): void
    {
        $guardian = $this->createGuardian();
        $originalEmail = $guardian->user->email;

        $payload = $this->guardianPayload([
            'name' => 'Wali Update',
            'phone' => '087711223344',
            'address' => 'Alamat Baru',
        ]);
        unset($payload['email'], $payload['password']);

        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->patch("/master-data/guardians/{$guardian->id}", $payload)
            ->assertRedirect('/master-data?tab=guardians')
            ->assertSessionHas('success', __('messages.guardian_updated'));

        $guardian->refresh();

        $this->assertSame('Wali Update', $guardian->name);
        $this->assertSame('087711223344', $guardian->phone);
        $this->assertSame('Alamat Baru', $guardian->address);
        $this->assertSame('Wali Update', $guardian->user->name);
        $this->assertSame('087711223344', $guardian->user->username);
        $this->assertSame($originalEmail, $guardian->user->email);
    }

    public function test_admin_can_update_guardian_email_and_password(): void
    {
        $guardian = $this->createGuardian();

        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->patch("/master-data/guardians/{$guardian->id}", $this->guardianPayload([
                'name' => 'Wali Update',
                'phone' => '087711223344',
                'email' => 'wali.update@example.com',
                'password' => 'rahasia123',
            ]))
            ->assertRedirect();

        $guardian->refresh();

        $this->assertSame('wali.update@example.com', $guardian->user->email);
        $this->assertTrue(Hash::check('rahasia123', $guardian->user->password));
    }

    public function test_admin_cannot_set_guardian_email_to_another_guardians_email(): void
    {
        $other = $this->createGuardian();
        $other->user->update(['email' => 'dipakai@example.com']);
        $guardian = $this->createGuardian();
        $originalEmail = $guardian->user->email;

        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->patch("/master-data/guardians/{$guardian->id}", $this->guardianPayload([
                'email' => 'dipakai@example.com',
            ]))
            ->assertSessionHasErrors('email');

        $this->assertSame($originalEmail, $guardian->refresh()->user->email);
    }

    public function test_admin_can_destroy_guardian_and_cascades_user(): void
    {
        $guardian = $this->createGuardian();
        $userId = $guardian->user_id;

        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->delete("/master-data/guardians/{$guardian->id}")
            ->assertRedirect('/master-data?tab=guardians')
            ->assertSessionHas('success', __('messages.guardian_deleted'));

        $this->assertDatabaseMissing('guardians', ['id' => $guardian->id]);
        $this->assertDatabaseMissing('users', ['id' => $userId]);
    }

    public function test_admin_can_bulk_destroy_guardians(): void
    {
        $guardianA = $this->createGuardian();
        $guardianB = $this->createGuardian();

        $this->from('/master-data?tab=guardians')
            ->actingAs($this->admin())
            ->post('/master-data/guardians/bulk-destroy', [
                'ids' => [$guardianA->id, $guardianB->id],
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('guardians', ['id' => $guardianA->id]);
        $this->assertDatabaseMissing('guardians', ['id' => $guardianB->id]);
        $this->assertDatabaseMissing('users', ['id' => $guardianA->user_id]);
        $this->assertDatabaseMissing('users', ['id' => $guardianB->user_id]);
    }

    public function test_store_student_requires_required_fields(): void
    {
        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', [])
            ->assertSessionHasErrors(['nis', 'nisn', 'name', 'enrollment_year']);
    }

    public function test_store_student_rejects_duplicate_nis(): void
    {
        SchoolClass::factory()->create();
        $first = $this->studentPayload(['nis' => '2401010101']);
        $this->actingAs($this->admin())->post('/master-data/students', $first);

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', $this->studentPayload(['nis' => '2401010101']))
            ->assertSessionHasErrors('nis');
    }

    public function test_store_student_rejects_duplicate_nisn(): void
    {
        $first = $this->studentPayload(['nisn' => '001234567890']);
        $this->actingAs($this->admin())->post('/master-data/students', $first);

        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', $this->studentPayload(['nisn' => '001234567890']))
            ->assertSessionHasErrors('nisn');
    }

    public function test_store_student_rejects_invalid_status(): void
    {
        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', $this->studentPayload(['status' => 'Beku']))
            ->assertSessionHasErrors('status');
    }

    public function test_store_student_rejects_short_password(): void
    {
        $this->from('/master-data?tab=students')
            ->actingAs($this->admin())
            ->post('/master-data/students', $this->studentPayload(['password' => '123']))
            ->assertSessionHasErrors('password');
    }

    public function test_store_teacher_rejects_duplicate_teacher_code(): void
    {
        $first = $this->teacherPayload(['teacher_code' => 'NIP-1001']);
        $this->actingAs($this->admin())->post('/master-data/teachers', $first);

        $this->from('/master-data?tab=teachers')
            ->actingAs($this->admin())
            ->post('/master-data/teachers', $this->teacherPayload(['teacher_code' => 'NIP-1001']))
            ->assertSessionHasErrors('teacher_code');
    }

    public function test_store_class_rejects_invalid_level(): void
    {
        $this->from('/master-data?tab=class')
            ->actingAs($this->admin())
            ->post('/master-data/classes', $this->classPayload(['level' => 'V']))
            ->assertSessionHasErrors('level');
    }

    #[DataProvider('masterDataWriteRoutes')]
    public function test_teacher_cannot_mutate_master_data(string $entity, string $action): void
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $this->assertMutationForbidden($user, $entity, $action);
    }

    #[DataProvider('masterDataWriteRoutes')]
    public function test_student_cannot_mutate_master_data(string $entity, string $action): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $this->assertMutationForbidden($user, $entity, $action);
    }

    #[DataProvider('masterDataWriteRoutes')]
    public function test_guardian_cannot_mutate_master_data(string $entity, string $action): void
    {
        $user = User::factory()->create(['role' => 'guardian']);
        $this->assertMutationForbidden($user, $entity, $action);
    }

    private function assertMutationForbidden(User $user, string $entity, string $action): void
    {
        $id = $this->entityFor($entity)->id;
        $url = $this->mutationUrl($entity, $action, $id);

        $request = $this->from('/master-data?tab=students')->actingAs($user);

        $response = match ($action) {
            'store' => $request->post($url, $this->payloadFor($entity)),
            'update' => $request->patch($url, $this->payloadFor($entity)),
            'delete' => $request->delete($url),
            'bulk' => $request->post($url, ['ids' => [$id]]),
            'toggle' => $request->patch($url),
            default => throw new \InvalidArgumentException("Unsupported master data action: {$action}"),
        };

        $response->assertForbidden();
    }
}
