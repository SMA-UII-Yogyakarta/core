<?php

namespace Tests\Feature\Web;

use App\Exports\StudentsExport;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use OpenSpout\Reader\XLSX\Reader;
use Tests\TestCase;

class HomeroomScopeTest extends TestCase
{
    use RefreshDatabase;

    private function makeTeacher(string $type): array
    {
        $user = User::factory()->create(['role' => 'teacher']);
        $teacher = Teacher::factory()->create([
            'user_id' => $user->id,
            'teacher_type' => $type,
        ]);

        return [$user, $teacher];
    }

    private function homeroomClass(Teacher $teacher, string $name): SchoolClass
    {
        return SchoolClass::factory()->create([
            'name' => $name,
            'teacher_id' => $teacher->id,
        ]);
    }

    private function otherClass(string $name = 'Z-OTHER'): SchoolClass
    {
        [$otherUser, $otherTeacher] = $this->makeTeacher('wali');

        return SchoolClass::factory()->create([
            'name' => $name,
            'teacher_id' => $otherTeacher->id,
        ]);
    }

    private function activeStudent(SchoolClass $class, string $nis): Student
    {
        return Student::create([
            'user_id' => User::factory()->create(['role' => 'student'])->id,
            'name' => 'Student-' . $nis,
            'nis' => $nis,
            'nisn' => '99' . $nis,
            'class_id' => $class->id,
            'birth_date' => '2010-01-01',
            'enrollment_year' => 2025,
            'status' => 'Active',
        ]);
    }

    private function leave(Student $student, string $status = 'Pending'): LeaveRequest
    {
        $guardian = Guardian::create([
            'user_id' => User::factory()->create(['role' => 'guardian'])->id,
            'name' => 'Guardian of ' . $student->name,
        ]);

        return LeaveRequest::create([
            'student_id' => $student->id,
            'guardian_id' => $guardian->id,
            'category' => 'Sick',
            'start_date' => now()->toDateString(),
            'end_date' => now()->toDateString(),
            'approval_status' => $status,
        ]);
    }

    public function test_wali_cannot_view_other_class_monthly_report(): void
    {
        [$user] = $this->makeTeacher('wali');
        $other = $this->otherClass();

        $this->actingAs($user)
            ->get('/reports/monthly?month=8&year=2026&class_id=' . $other->id)
            ->assertForbidden();
    }

    public function test_wali_can_view_own_class_monthly_report(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');

        $this->actingAs($this->teacherUser($teacher))
            ->get('/reports/monthly?month=8&year=2026&class_id=' . $own->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('selectedClassId', $own->id));
    }

    public function test_wali_cannot_view_other_class_daily_report(): void
    {
        [$user] = $this->makeTeacher('wali');
        $other = $this->otherClass();

        $this->actingAs($user)
            ->get('/reports/daily?date=2026-08-18&class_id=' . $other->id)
            ->assertForbidden();
    }

    public function test_wali_cannot_view_other_class_semester_report(): void
    {
        [$user] = $this->makeTeacher('wali');
        $other = $this->otherClass();

        $this->actingAs($user)
            ->get('/reports/semester?year=2026&semester=1&class_id=' . $other->id)
            ->assertForbidden();
    }

    public function test_wali_export_preview_rejects_other_class(): void
    {
        [$user] = $this->makeTeacher('wali');
        $other = $this->otherClass();

        $this->actingAs($user)
            ->get('/export?period=harian&date=2026-08-18&class_id=' . $other->id)
            ->assertForbidden();
    }

    public function test_students_export_is_scoped_to_homeroom_for_wali(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');
        $other = $this->otherClass();
        $ownStudent = $this->activeStudent($own, '10001');
        $foreignStudent = $this->activeStudent($other, '20002');

        $tmp = tempnam(sys_get_temp_dir(), 'students_') . '.xlsx';
        (new StudentsExport([$own->id]))->export($tmp);

        $rows = $this->readXlsxRows($tmp);
        $this->assertCount(2, $rows);
        $this->assertSame('10001', $rows[1][0]);
        $this->assertNotContains('20002', array_map(
            fn ($r) => (string) ($r[0] ?? ''),
            $rows,
        ));

        $this->actingAs($this->teacherUser($teacher))
            ->get('/export/students')
            ->assertOk();
    }

    public function test_piket_cannot_download_teachers_export(): void
    {
        [$user] = $this->makeTeacher('piket');

        $this->actingAs($user)
            ->get('/export/teachers')
            ->assertForbidden();
    }

    public function test_admin_can_download_teachers_export(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/export/teachers')
            ->assertOk();
    }

    public function test_wali_leave_index_hides_other_class_leaves(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');
        $other = $this->otherClass();
        $ownLeave = $this->leave($this->activeStudent($own, '30001'));
        $foreignLeave = $this->leave($this->activeStudent($other, '40002'));

        $this->actingAs($this->teacherUser($teacher))
            ->get('/leave-requests')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('leaveRequests.data', 1)
                ->where('leaveRequests.data.0.id', $ownLeave->id));
    }

    public function test_piket_leave_index_sees_school_wide(): void
    {
        [$user] = $this->makeTeacher('piket');
        $first = $this->leave($this->activeStudent($this->otherClass('O-1'), '50001'));
        $second = $this->leave($this->activeStudent($this->otherClass('O-2'), '60002'));

        $this->actingAs($user)
            ->get('/leave-requests')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('leaveRequests.data', 2));
    }

    public function test_wali_cannot_approve_other_class_leave(): void
    {
        [$user] = $this->makeTeacher('wali');
        $foreignLeave = $this->leave($this->activeStudent($this->otherClass(), '70001'));

        $this->actingAs($user)
            ->patch('/leave-requests/' . $foreignLeave->id . '/approve')
            ->assertForbidden();

        $this->assertSame('Pending', $foreignLeave->fresh()->approval_status);
    }

    public function test_wali_can_approve_own_class_leave(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');
        $ownLeave = $this->leave($this->activeStudent($own, '80001'));

        $this->actingAs($this->teacherUser($teacher))
            ->patch('/leave-requests/' . $ownLeave->id . '/approve')
            ->assertStatus(302);

        $this->assertSame('Approved', $ownLeave->fresh()->approval_status);
    }

    public function test_bulk_verify_rejects_ids_outside_scope(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');
        $ownLeave = $this->leave($this->activeStudent($own, '90001'));
        $foreignLeave = $this->leave($this->activeStudent($this->otherClass(), '95002'));

        $this->actingAs($this->teacherUser($teacher))
            ->post('/leave-requests/bulk-verify', [
                'ids' => [$ownLeave->id, $foreignLeave->id],
                'status' => 'Approved',
            ])
            ->assertForbidden();

        $this->assertSame('Pending', $ownLeave->fresh()->approval_status);
        $this->assertSame('Pending', $foreignLeave->fresh()->approval_status);
    }

    public function test_show_redirects_to_index_after_scope_check(): void
    {
        [, $teacher] = $this->makeTeacher('wali');
        $own = $this->homeroomClass($teacher, 'X-A');
        $ownLeave = $this->leave($this->activeStudent($own, '97001'));

        $this->actingAs($this->teacherUser($teacher))
            ->get('/leave-requests/' . $ownLeave->id)
            ->assertRedirect(route('leave-requests.index'));
    }

    private function teacherUser(Teacher $teacher): User
    {
        return User::findOrFail($teacher->user_id);
    }

    /**
     * @return list<list<string|null>>
     */
    private function readXlsxRows(string $path): array
    {
        $reader = new Reader();
        $reader->open($path);

        $rows = [];
        foreach ($reader->getSheetIterator() as $sheet) {
            foreach ($sheet->getRowIterator() as $row) {
                $rows[] = [...$row->toArray()];
            }
        }
        $reader->close();

        return $rows;
    }
}
