<?php

namespace Tests\Feature\Web;

use App\Models\Attendance;
use App\Models\AttendanceOverride;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class AttendanceOverrideTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $studentUser;
    protected Student $student;
    protected SchoolClass $class;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->studentUser = User::factory()->create(['role' => 'student']);

        $this->class = SchoolClass::factory()->create();
        $this->student = Student::factory()->create([
            'user_id' => $this->studentUser->id,
            'class_id' => $this->class->id,
            'status' => 'Active',
        ]);
    }

    public function test_admin_can_access_attendance_correction_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('attendance-correction'));
        $response->assertOk();
    }

    public function test_non_admin_cannot_access_attendance_correction_page(): void
    {
        $response = $this->actingAs($this->studentUser)->get(route('attendance-correction'));
        $response->assertForbidden();
    }

    public function test_override_creates_record_and_synchronizes_attendances_table(): void
    {
        $date = '2026-09-10';

        $this->assertDatabaseMissing('attendances', [
            'student_id' => $this->student->id,
            'attendance_date' => $date,
        ]);

        $response = $this->actingAs($this->admin)->post(route('attendance-correction.store'), [
            'student_id' => $this->student->id,
            'date' => $date,
            'new_status' => 'Present',
            'reason' => 'Perbaikan data presensi manual',
        ]);

        $response->assertRedirect();

        // Check override row created
        $this->assertDatabaseHas('attendance_overrides', [
            'student_id' => $this->student->id,
            'original_status' => null,
            'new_status' => 'Present',
            'reason' => 'Perbaikan data presensi manual',
        ]);

        $override = AttendanceOverride::where('student_id', $this->student->id)->first();
        $this->assertNotNull($override);
        $this->assertEquals($date, $override->attendance_date->format('Y-m-d'));

        // Check attendances table synchronized
        $this->assertDatabaseHas('attendances', [
            'student_id' => $this->student->id,
            'status' => 'Present',
        ]);
        $attendance = Attendance::where('student_id', $this->student->id)->first();
        $this->assertNotNull($attendance);
        $this->assertEquals($date, $attendance->attendance_date->format('Y-m-d'));
    }

    public function test_override_updates_existing_attendance_record_status(): void
    {
        $date = '2026-09-10';

        $attendance = Attendance::create([
            'student_id' => $this->student->id,
            'attendance_date' => $date,
            'check_in_time' => '07:15:00',
            'latitude' => '-7.782800',
            'longitude' => '110.367000',
            'photo_url' => 'https://example.com/photo.jpg',
            'status' => 'Late',
        ]);

        $response = $this->actingAs($this->admin)->post(route('attendance-correction.store'), [
            'student_id' => $this->student->id,
            'date' => $date,
            'new_status' => 'Present',
            'reason' => 'Dikonfirmasi hadir tepat waktu oleh piket',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('attendance_overrides', [
            'student_id' => $this->student->id,
            'original_status' => 'Late',
            'new_status' => 'Present',
        ]);

        $this->assertDatabaseHas('attendances', [
            'id' => $attendance->id,
            'status' => 'Present',
        ]);
    }

    public function test_delete_override_reverts_attendance_status_to_original(): void
    {
        $date = '2026-09-10';

        $attendance = Attendance::create([
            'student_id' => $this->student->id,
            'attendance_date' => $date,
            'check_in_time' => '07:15:00',
            'latitude' => '-7.782800',
            'longitude' => '110.367000',
            'photo_url' => 'https://example.com/photo.jpg',
            'status' => 'Late',
        ]);

        $this->actingAs($this->admin)->post(route('attendance-correction.store'), [
            'student_id' => $this->student->id,
            'date' => $date,
            'new_status' => 'Present',
            'reason' => 'Koreksi sementara',
        ]);

        $override = AttendanceOverride::where('student_id', $this->student->id)->firstOrFail();

        $response = $this->actingAs($this->admin)->delete(route('attendance-correction.destroy', $override->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('attendance_overrides', ['id' => $override->id]);

        $this->assertDatabaseHas('attendances', [
            'id' => $attendance->id,
            'status' => 'Late',
        ]);
    }

    public function test_delete_override_deletes_synthetic_attendance_when_no_prior_record(): void
    {
        $date = '2026-09-10';

        $this->actingAs($this->admin)->post(route('attendance-correction.store'), [
            'student_id' => $this->student->id,
            'date' => $date,
            'new_status' => 'Sick',
            'reason' => 'Siswa sakit tanpa absen mandiri',
        ]);

        $override = AttendanceOverride::where('student_id', $this->student->id)->firstOrFail();

        $this->assertDatabaseHas('attendances', [
            'student_id' => $this->student->id,
            'status' => 'Sick',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('attendance-correction.destroy', $override->id));
        $response->assertRedirect();

        $this->assertDatabaseMissing('attendance_overrides', ['id' => $override->id]);
        $this->assertDatabaseMissing('attendances', [
            'student_id' => $this->student->id,
        ]);
    }

    public function test_unnamed_route_under_authorize_middleware_is_rejected_with_403(): void
    {
        Route::middleware(['auth', 'authorize'])->get('/test-unnamed-secure-route', fn () => 'secure content');

        $response = $this->actingAs($this->admin)->get('/test-unnamed-secure-route');
        $response->assertForbidden();

        $jsonResponse = $this->actingAs($this->admin)->getJson('/test-unnamed-secure-route');
        $jsonResponse->assertForbidden()
            ->assertJson([
                'success' => false,
                'message' => 'Akses ditolak: rute tidak terdefinisi.',
            ]);
    }
}
