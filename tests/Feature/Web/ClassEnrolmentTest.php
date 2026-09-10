<?php

namespace Tests\Feature\Web;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassEnrolmentTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $studentUser;
    protected SchoolClass $class;
    protected Student $student;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->studentUser = User::factory()->create(['role' => 'student']);

        $this->class = SchoolClass::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'class_id' => null,
            'status' => 'Active',
        ]);
    }

    public function test_admin_can_access_class_enrolment_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('class-enrolment'));
        $response->assertOk();
    }

    public function test_non_admin_cannot_access_class_enrolment_page(): void
    {
        $response = $this->actingAs($this->studentUser)->get(route('class-enrolment'));
        $response->assertForbidden();
    }

    public function test_assign_student_validates_input(): void
    {
        $response = $this->actingAs($this->admin)->post(route('class-enrolment.assign'), [
            'class_id' => 99999, // non-existent
            'student_id' => 99999, // non-existent
        ]);

        $response->assertSessionHasErrors(['class_id', 'student_id']);
    }

    public function test_assign_student_successfully_assigns_class(): void
    {
        $response = $this->actingAs($this->admin)->post(route('class-enrolment.assign'), [
            'class_id' => $this->class->id,
            'student_id' => $this->student->id,
        ]);

        $response->assertRedirect();
        $this->assertEquals($this->class->id, $this->student->fresh()->class_id);
    }

    public function test_remove_student_removes_student_from_class(): void
    {
        $this->student->update(['class_id' => $this->class->id]);

        $response = $this->actingAs($this->admin)->delete(route('class-enrolment.remove', $this->student->id));
        $response->assertRedirect();
        $this->assertNull($this->student->fresh()->class_id);
    }

    public function test_bulk_assign_and_bulk_remove(): void
    {
        $student2 = Student::factory()->create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'class_id' => null,
            'status' => 'Active',
        ]);

        // Bulk assign
        $response = $this->actingAs($this->admin)->post(route('class-enrolment.bulk-assign'), [
            'class_id' => $this->class->id,
            'student_ids' => [$this->student->id, $student2->id],
        ]);
        $response->assertRedirect();
        $this->assertEquals($this->class->id, $this->student->fresh()->class_id);
        $this->assertEquals($this->class->id, $student2->fresh()->class_id);

        // Bulk remove
        $response = $this->actingAs($this->admin)->post(route('class-enrolment.bulk-remove'), [
            'student_ids' => [$this->student->id, $student2->id],
        ]);
        $response->assertRedirect();
        $this->assertNull($this->student->fresh()->class_id);
        $this->assertNull($student2->fresh()->class_id);
    }
}
