<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StorageProxyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');
        config(['filesystems.default' => 's3']);
    }

    public function test_guest_cannot_access_storage_proxy(): void
    {
        $path = $this->putAttendancePhoto(42);

        $this->get('/storage-s3/' . $path)->assertRedirect(route('login'));
    }

    public function test_student_can_access_own_attendance_photo(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $class = SchoolClass::create(['name' => 'X-A']);
        $student = Student::create([
            'user_id' => $user->id,
            'name' => 'Student',
            'nis' => str()->random(5),
            'nisn' => str()->random(10),
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $path = $this->putAttendancePhoto($student->id);

        $response = $this->actingAs($user)->get('/storage-s3/' . $path);

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'image/jpeg');
        $this->assertStringContainsString('private', (string) $response->headers->get('Cache-Control'));
    }

    public function test_student_cannot_access_other_students_photo(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $class = SchoolClass::create(['name' => 'X-B']);
        Student::create([
            'user_id' => $user->id,
            'name' => 'Student',
            'nis' => str()->random(5),
            'nisn' => str()->random(10),
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);

        $path = $this->putAttendancePhoto(999999);

        $this->actingAs($user)->get('/storage-s3/' . $path)->assertStatus(403);
    }

    public function test_guardian_can_access_own_child_photo_but_not_others(): void
    {
        $guardianUser = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::create([
            'user_id' => $guardianUser->id,
            'name' => 'Guardian Test',
        ]);
        $class = SchoolClass::create(['name' => 'X-C']);
        $child = Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'name' => 'Child',
            'nis' => str()->random(5),
            'nisn' => str()->random(10),
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
            'guardian_id' => $guardian->id,
        ]);

        $ownPath = $this->putAttendancePhoto($child->id);
        $otherPath = $this->putAttendancePhoto(888888);

        $this->actingAs($guardianUser)->get('/storage-s3/' . $ownPath)->assertStatus(200);
        $this->actingAs($guardianUser)->get('/storage-s3/' . $otherPath)->assertStatus(403);
    }

    public function test_admin_and_teacher_can_access_any_photo(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $path = $this->putAttendancePhoto(777777);

        $this->actingAs($admin)->get('/storage-s3/' . $path)->assertStatus(200);
        $this->actingAs($teacher)->get('/storage-s3/' . $path)->assertStatus(200);
    }

    public function test_paths_outside_allowlist_are_rejected_even_when_file_exists(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Storage::disk('s3')->put('private/secrets.txt', 'top secret');

        $this->actingAs($admin)->get('/storage-s3/private/secrets.txt')->assertStatus(404);
    }

    public function test_documents_remain_accessible_to_authenticated_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $path = Storage::disk('s3')->putFile(
            'documents/' . now()->toDateString(),
            UploadedFile::fake()->create('leave.pdf', 100, 'application/pdf'),
        );

        $this->actingAs($admin)->get('/storage-s3/' . $path)
            ->assertStatus(200)
            ->assertHeader('Content-Type', 'application/pdf');
    }

    public function test_returns_404_when_proxying_non_existent_file(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)->get('/storage-s3/non-existent-file.jpg')->assertStatus(404);
    }

    private const SAMPLE_JPEG = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAACAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AVN//2Q==';

    private function putAttendancePhoto(int $studentId): string
    {
        $path = sprintf(
            'attendance/%s/%d_%s.jpg',
            now()->toDateString(),
            $studentId,
            str()->random(8),
        );

        Storage::disk('s3')->put($path, base64_decode(self::SAMPLE_JPEG));

        return $path;
    }
}
