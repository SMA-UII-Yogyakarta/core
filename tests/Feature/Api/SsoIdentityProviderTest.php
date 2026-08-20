<?php

namespace Tests\Feature\Api;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SsoIdentityProviderTest extends TestCase
{
    use RefreshDatabase;

    public function test_sso_login_returns_token_and_idp_user_payload(): void
    {
        $user = User::factory()->create([
            'username' => 'admin_idp',
            'password' => bcrypt('password123'),
            'role' => 'admin',
        ]);

        $response = $this->postJson('/api/v1/login', [
            'username' => 'admin_idp',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => [
                    'id',
                    'username',
                    'name',
                    'email',
                    'role',
                    'persona',
                ],
            ])
            ->assertJsonPath('user.role', 'admin')
            ->assertJsonPath('user.persona', null);
    }

    public function test_sso_me_endpoint_returns_student_persona(): void
    {
        $schoolClass = SchoolClass::factory()->create(['name' => 'XI IPA 2']);
        $user = User::factory()->create(['role' => 'student']);
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
            'nis' => '12345',
            'nisn' => '0098765432',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/me')
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'student')
            ->assertJsonPath('data.persona.student_id', $student->id)
            ->assertJsonPath('data.persona.nis', '12345')
            ->assertJsonPath('data.persona.nisn', '0098765432')
            ->assertJsonPath('data.persona.class_name', 'XI IPA 2');
    }

    public function test_sso_me_endpoint_returns_teacher_persona(): void
    {
        $schoolClass = SchoolClass::factory()->create(['name' => 'X IPS 1']);
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'teacher_code' => 'TCH-99',
            'teacher_type' => 'piket',
        ]);

        $schoolClass->update(['teacher_id' => $teacher->id]);

        $this->actingAs($user)
            ->getJson('/api/v1/me')
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'teacher')
            ->assertJsonPath('data.persona.teacher_id', $teacher->id)
            ->assertJsonPath('data.persona.code', 'TCH-99')
            ->assertJsonPath('data.persona.is_piket', true)
            ->assertJsonPath('data.persona.is_wali', false);
    }

    public function test_sso_me_endpoint_returns_guardian_persona_with_linked_students(): void
    {
        $schoolClass = SchoolClass::factory()->create(['name' => 'XII MIPA 1']);
        $guardianUser = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create([
            'user_id' => $guardianUser->id,
            'phone' => '081234567890',
        ]);

        $studentUser = User::factory()->create(['role' => 'student']);
        $student = Student::factory()->create([
            'user_id' => $studentUser->id,
            'guardian_id' => $guardian->id,
            'class_id' => $schoolClass->id,
            'name' => 'Anak Kandung',
            'nis' => '554433',
        ]);

        $this->actingAs($guardianUser)
            ->getJson('/api/v1/me')
            ->assertStatus(200)
            ->assertJsonPath('data.role', 'guardian')
            ->assertJsonPath('data.persona.guardian_id', $guardian->id)
            ->assertJsonPath('data.persona.phone', '081234567890')
            ->assertJsonPath('data.persona.linked_students.0.student_id', $student->id)
            ->assertJsonPath('data.persona.linked_students.0.name', 'Anak Kandung')
            ->assertJsonPath('data.persona.linked_students.0.class_name', 'XII MIPA 1');
    }

    public function test_sso_logout_revokes_current_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/v1/logout')
            ->assertStatus(200)
            ->assertJsonPath('message', 'Logged out successfully.');

        $this->assertCount(0, $user->tokens);
    }
}
