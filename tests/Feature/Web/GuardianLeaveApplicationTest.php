<?php

namespace Tests\Feature\Web;

use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GuardianLeaveApplicationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
    }

    private function guardianWithStudent(): array
    {
        $user = User::factory()->create(['role' => 'guardian']);
        $guardian = Guardian::factory()->create(['user_id' => $user->id]);
        $schoolClass = SchoolClass::factory()->create();
        $student = Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => $schoolClass->id,
            'guardian_id' => $guardian->id,
        ]);

        return [$user, $guardian, $student];
    }

    public function test_guardian_leave_application_page_renders_with_students(): void
    {
        [$user, , $student] = $this->guardianWithStudent();

        $this->actingAs($user)->get('/guardian/leave-application')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Guardian/LeaveApplication')
                ->has('students', 1)
                ->where('students.0.id', $student->id));
    }

    public function test_guardian_can_submit_leave_application(): void
    {
        [$user, , $student] = $this->guardianWithStudent();

        $this->actingAs($user)->post('/guardian/leave-application', [
            'student_id' => $student->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
            'description' => 'Sakit demam',
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('leave_requests', [
            'student_id' => $student->id,
            'category' => 'Sick',
            'approval_status' => 'Pending',
        ]);
    }

    public function test_guardian_leave_application_accepts_document_upload(): void
    {
        Storage::fake('public');
        [$user, , $student] = $this->guardianWithStudent();

        $this->actingAs($user)->post('/guardian/leave-application', [
            'student_id' => $student->id,
            'category' => 'Event',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'document' => UploadedFile::fake()->create('surat.pdf', 100, 'application/pdf'),
        ])->assertSessionHas('success');

        $this->assertDatabaseHas('leave_requests', [
            'student_id' => $student->id,
            'category' => 'Event',
            'approval_status' => 'Pending',
        ]);
        $leave = LeaveRequest::where('student_id', $student->id)->first();
        $this->assertNotNull($leave->document_url);
    }

    public function test_guardian_cannot_submit_for_unlinked_student(): void
    {
        [$user, , ] = $this->guardianWithStudent();
        $otherGuardian = Guardian::factory()->create(['user_id' => User::factory()->create(['role' => 'guardian'])->id]);
        $schoolClass = SchoolClass::factory()->create();
        $otherStudent = Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => $schoolClass->id,
            'guardian_id' => $otherGuardian->id,
        ]);

        $this->actingAs($user)->post('/guardian/leave-application', [
            'student_id' => $otherStudent->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
        ])->assertSessionHasErrors('student_id');

        $this->assertDatabaseCount('leave_requests', 0);
    }

    public function test_guardian_leave_application_validates_category(): void
    {
        [$user, , $student] = $this->guardianWithStudent();

        $this->actingAs($user)->post('/guardian/leave-application', [
            'student_id' => $student->id,
            'category' => 'Personal',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
        ])->assertSessionHasErrors('category');
    }
}
