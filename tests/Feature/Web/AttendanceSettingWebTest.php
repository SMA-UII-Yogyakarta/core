<?php

namespace Tests\Feature\Web;

use App\Models\AcademicCalendar;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceSettingWebTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $student;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->student = User::factory()->create(['role' => 'student']);
    }

    public function test_admin_can_access_operational_settings_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('operational-settings'));
        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Admin/HolidaySettings')
            ->has('timeSettings')
            ->has('holidays'),
        );
    }

    public function test_admin_can_access_system_settings_page(): void
    {
        $response = $this->actingAs($this->admin)->get(route('settings'));
        $response->assertOk();
        $response->assertInertia(
            fn ($page) => $page
            ->component('Admin/SystemSettings')
            ->has('systemInfo'),
        );
    }

    public function test_non_admin_cannot_access_settings_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('settings'));
        $response->assertForbidden();
    }

    public function test_admin_can_update_time_settings_including_saturday(): void
    {
        $settings = [
            ['day' => 'Monday', 'check_in_open' => '06:30', 'late_threshold' => '07:00', 'check_in_close' => '07:30', 'is_active' => true],
            ['day' => 'Tuesday', 'check_in_open' => '06:30', 'late_threshold' => '07:00', 'check_in_close' => '07:30', 'is_active' => true],
            ['day' => 'Wednesday', 'check_in_open' => '06:30', 'late_threshold' => '07:00', 'check_in_close' => '07:30', 'is_active' => true],
            ['day' => 'Thursday', 'check_in_open' => '06:30', 'late_threshold' => '07:00', 'check_in_close' => '07:30', 'is_active' => true],
            ['day' => 'Friday', 'check_in_open' => '06:30', 'late_threshold' => '07:00', 'check_in_close' => '07:30', 'is_active' => true],
            ['day' => 'Saturday', 'check_in_open' => '07:00', 'late_threshold' => '07:30', 'check_in_close' => '08:00', 'is_active' => true],
        ];

        $response = $this->actingAs($this->admin)->post(route('operational-settings.time-settings'), [
            'settings' => $settings,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('attendance_time_settings', [
            'day' => 'Saturday',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_store_and_delete_holiday(): void
    {
        $storeResponse = $this->actingAs($this->admin)->post(route('operational-settings.holidays'), [
            'holiday_date' => '2026-08-17',
            'description' => 'Hari Kemerdekaan RI',
        ]);

        $storeResponse->assertRedirect();
        $this->assertDatabaseHas('academic_calendars', [
            'holiday_date' => '2026-08-17 00:00:00',
            'description' => 'Hari Kemerdekaan RI',
        ]);

        $holiday = AcademicCalendar::whereDate('holiday_date', '2026-08-17')->first();

        $deleteResponse = $this->actingAs($this->admin)->delete(route('operational-settings.holidays.destroy', ['id' => $holiday->id]));
        $deleteResponse->assertRedirect();
        $this->assertDatabaseMissing('academic_calendars', [
            'id' => $holiday->id,
        ]);
    }

    public function test_admin_can_update_and_persist_system_settings(): void
    {
        $payload = [
            'schoolName' => 'SMA UII Unggulan Yogyakarta',
            'npsn' => '20403999',
            'accreditation' => 'A (Paripurna)',
            'academicYear' => '2026/2027 - Genap',
            'principalName' => 'Dr. H. Bambang Irawan, M.Pd.',
            'address' => 'Jl. Kaliurang KM 14.5, Sleman, DIY',
            'phone' => '(0274) 898444',
            'email' => 'contact@smauii.sch.id',
            'defaultPageLimit' => 25,
            'sessionTimeoutMinutes' => 60,
            'maintenanceMode' => false,
            'mfaEnforced' => true,
        ];

        $response = $this->actingAs($this->admin)->post(route('settings.update'), $payload);
        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('app_settings', [
            'key' => 'school_name',
            'value' => 'SMA UII Unggulan Yogyakarta',
        ]);
        $this->assertDatabaseHas('app_settings', [
            'key' => 'npsn',
            'value' => '20403999',
        ]);
        $this->assertDatabaseHas('app_settings', [
            'key' => 'principal_name',
            'value' => 'Dr. H. Bambang Irawan, M.Pd.',
        ]);

        $getPage = $this->actingAs($this->admin)->get(route('settings'));
        $getPage->assertOk();
        $getPage->assertInertia(
            fn ($page) => $page
            ->component('Admin/SystemSettings')
            ->where('systemInfo.schoolName', 'SMA UII Unggulan Yogyakarta')
            ->where('systemInfo.npsn', '20403999')
            ->where('systemInfo.principalName', 'Dr. H. Bambang Irawan, M.Pd.')
            ->where('systemInfo.defaultPageLimit', 25)
            ->where('systemInfo.sessionTimeoutMinutes', 60),
        );
    }
}
