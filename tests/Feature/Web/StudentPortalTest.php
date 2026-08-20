<?php

namespace Tests\Feature\Web;

use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StudentPortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class);
        Storage::fake();
        Storage::fake('public');
        Storage::fake('s3');
    }

    private function createStudentWithClass(): array
    {
        $user = User::factory()->create(['role' => 'student']);
        $schoolClass = SchoolClass::factory()->create(['name' => 'XII-MIPA-1']);
        $student = Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => $schoolClass->id,
            'name' => 'Ahmad Dahlan',
            'nis' => '12345',
            'nisn' => '0012345678',
            'status' => 'Active',
        ]);

        return [$user, $student, $schoolClass];
    }

    public function test_student_dashboard_renders_with_stats_and_student_data(): void
    {
        [$user, $student] = $this->createStudentWithClass();

        $this->actingAs($user)
            ->get('/student/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Dashboard')
                ->has('student')
                ->where('student.id', $student->id)
                ->where('student.name', 'Ahmad Dahlan')
                ->where('student.nis', '12345')
                ->has('stats')
                ->has('recentHistory')
                ->where('todayAttendance', null));
    }

    public function test_student_live_attendance_page_renders_for_student(): void
    {
        [$user, $student] = $this->createStudentWithClass();

        $this->actingAs($user)
            ->get('/student/attendance')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/LiveAttendance')
                ->has('student')
                ->where('student.id', $student->id)
                ->where('todayAttendance', null));
    }

    public function test_student_can_check_in_successfully(): void
    {
        Carbon::setTestNow('2026-08-14 06:30:00'); // Friday 06:30 WIB
        [$user, $student] = $this->createStudentWithClass();

        AttendanceTimeSetting::create([
            'day' => 'Friday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo.jpg',
            ]);

        $response->assertRedirect(route('student.dashboard'));
        $response->assertSessionHas('success', 'Check-in successful.');

        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'status' => 'Present',
        ]);

        Carbon::setTestNow();
    }

    public function test_student_check_in_marks_as_late_when_past_threshold(): void
    {
        Carbon::setTestNow('2026-08-14 07:15:00'); // Friday 07:15 WIB
        [$user, $student] = $this->createStudentWithClass();

        AttendanceTimeSetting::create([
            'day' => 'Friday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo-late.jpg',
            ]);

        $response->assertRedirect(route('student.dashboard'));
        $this->assertDatabaseHas('attendances', [
            'student_id' => $student->id,
            'status' => 'Late',
        ]);

        Carbon::setTestNow();
    }

    public function test_student_cannot_check_in_twice_on_same_day(): void
    {
        Carbon::setTestNow('2026-08-14 06:30:00');
        [$user, $student] = $this->createStudentWithClass();

        AttendanceTimeSetting::create([
            'day' => 'Friday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-14',
            'check_in_time' => '06:25:00',
            'latitude' => -7.797061,
            'longitude' => 110.399583,
            'photo_url' => 'https://example.com/photo.jpg',
            'status' => 'Present',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo2.jpg',
            ]);

        $response->assertSessionHas('error', 'Already checked in today.');

        Carbon::setTestNow();
    }

    public function test_student_cannot_check_in_on_holiday(): void
    {
        Carbon::setTestNow('2026-08-17 06:30:00'); // Independence day
        [$user] = $this->createStudentWithClass();

        AcademicCalendar::create([
            'holiday_date' => '2026-08-17',
            'description' => 'HUT Kemerdekaan RI',
            'is_holiday' => true,
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo.jpg',
            ]);

        $response->assertSessionHas('error', 'Today is a holiday: HUT Kemerdekaan RI');

        Carbon::setTestNow();
    }

    public function test_student_history_renders_with_monthly_attendances(): void
    {
        [$user, $student] = $this->createStudentWithClass();

        Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => '2026-08-01',
            'check_in_time' => '06:40:00',
            'latitude' => -7.797061,
            'longitude' => 110.399583,
            'photo_url' => 'https://example.com/photo.jpg',
            'status' => 'Present',
        ]);

        $this->actingAs($user)
            ->get('/student/history?month=8&year=2026')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/AttendanceHistory')
                ->has('student')
                ->where('student.id', $student->id)
                ->has('attendances', 1)
                ->where('attendances.0.status', 'Present')
                ->where('month', 8)
                ->where('year', 2026));
    }

    public function test_non_student_cannot_access_student_portal(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)
            ->get('/student/dashboard')
            ->assertForbidden();

        $this->actingAs($admin)
            ->get('/student/attendance')
            ->assertForbidden();

        $this->actingAs($admin)
            ->get('/student/history')
            ->assertForbidden();
    }

    public function test_student_cannot_check_in_before_open_time(): void
    {
        Carbon::setTestNow('2026-08-14 05:30:00'); // Friday 05:30 — before 06:00 open
        [$user] = $this->createStudentWithClass();

        AttendanceTimeSetting::create([
            'day' => 'Friday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo.jpg',
            ]);

        $response->assertSessionHas('error', 'Attendance opens at 06:00:00');

        Carbon::setTestNow();
    }

    public function test_student_cannot_check_in_after_close_time(): void
    {
        Carbon::setTestNow('2026-08-14 08:00:00'); // Friday 08:00 — after 07:45 close
        [$user] = $this->createStudentWithClass();

        AttendanceTimeSetting::create([
            'day' => 'Friday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo.jpg',
            ]);

        $response->assertSessionHas('error', 'Attendance closed at 07:45:00');

        Carbon::setTestNow();
    }

    public function test_student_cannot_check_in_on_unscheduled_day(): void
    {
        Carbon::setTestNow('2026-08-14 06:30:00'); // Friday, but no setting for Friday
        [$user] = $this->createStudentWithClass();

        // Only create a Monday setting — Friday has no schedule
        AttendanceTimeSetting::create([
            'day' => 'Monday',
            'check_in_open' => '06:00:00',
            'late_threshold' => '07:00:00',
            'check_in_close' => '07:45:00',
        ]);

        $response = $this->actingAs($user)
            ->post('/student/attendance/check-in', [
                'latitude' => -7.797061,
                'longitude' => 110.399583,
                'photo_url' => 'https://example.com/photo.jpg',
            ]);

        $response->assertSessionHas('error', 'No attendance schedule for Friday');

        Carbon::setTestNow();
    }

    public function test_student_dashboard_renders_for_student_without_class(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        Student::factory()->create([
            'user_id' => $user->id,
            'class_id' => null,
            'name' => 'Tanpa Kelas',
            'nis' => '99999',
            'nisn' => '0099999999',
            'status' => 'Active',
        ]);

        $this->actingAs($user)
            ->get('/student/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Student/Dashboard')
                ->where('student.class', null));
    }
}
