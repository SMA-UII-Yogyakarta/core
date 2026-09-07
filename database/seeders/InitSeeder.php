<?php

namespace Database\Seeders;

use App\Models\AcademicCalendar;
use App\Models\AttendanceTimeSetting;
use App\Models\SchoolLocationSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class InitSeeder extends Seeder
{
    /**
     * Run initial clean setup for Admin and fundamental system configurations.
     * Leaves all Master Data (students, teachers, classes, guardians, attendances) empty.
     */
    public function run(): void
    {
        // 1. Roles & Permissions (Spatie RBAC)
        $roles = ['admin', 'student', 'teacher', 'guardian'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $this->call([RolePermissionSeeder::class]);

        // 2. Administrators
        $admins = [
            [
                'username' => 'admin',
                'name' => 'Administrator Utama',
                'email' => 'admin@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
            [
                'username' => 'hanif',
                'name' => 'Hanif',
                'email' => 'hanif@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
            [
                'username' => 'mahfud',
                'name' => 'Bpk. Mahfud',
                'email' => 'mahfud@smauii.sch.id',
                'role' => 'admin',
                'password' => bcrypt('password'),
            ],
        ];

        foreach ($admins as $adm) {
            $user = User::updateOrCreate(
                ['username' => $adm['username']],
                $adm,
            );
            $user->syncRoles(['admin']);
        }

        // 3. Baseline Attendance Time Settings (Senin s.d. Jumat)
        $attendanceTimes = [
            ['day' => 'Monday', 'check_in_open' => '06:30:00', 'late_threshold' => '07:00:00', 'check_in_close' => '07:30:00', 'is_active' => true],
            ['day' => 'Tuesday', 'check_in_open' => '06:30:00', 'late_threshold' => '07:00:00', 'check_in_close' => '07:30:00', 'is_active' => true],
            ['day' => 'Wednesday', 'check_in_open' => '06:30:00', 'late_threshold' => '07:00:00', 'check_in_close' => '07:30:00', 'is_active' => true],
            ['day' => 'Thursday', 'check_in_open' => '06:30:00', 'late_threshold' => '07:00:00', 'check_in_close' => '07:30:00', 'is_active' => true],
            ['day' => 'Friday', 'check_in_open' => '06:30:00', 'late_threshold' => '07:00:00', 'check_in_close' => '07:30:00', 'is_active' => true],
            ['day' => 'Saturday', 'check_in_open' => '07:00:00', 'late_threshold' => '07:30:00', 'check_in_close' => '08:00:00', 'is_active' => false],
            ['day' => 'Sunday', 'check_in_open' => '07:00:00', 'late_threshold' => '07:30:00', 'check_in_close' => '08:00:00', 'is_active' => false],
        ];

        foreach ($attendanceTimes as $time) {
            AttendanceTimeSetting::updateOrCreate(['day' => $time['day']], $time);
        }

        // 4. Baseline School Geofence Location (SMA UII Yogyakarta)
        SchoolLocationSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'SMA UII Yogyakarta',
                'address' => 'Jl. Taman Siswa No.158, Wirogunan, Kec. Mergangsan, Kota Yogyakarta, D.I. Yogyakarta 55151',
                'latitude' => -7.814257,
                'longitude' => 110.375944,
                'radius_meters' => 100,
                'is_active' => true,
            ],
        );

        // 5. Baseline Academic Calendar Events
        $academicEvents = [
            ['holiday_date' => now()->startOfYear()->addMonths(6)->setDay(27)->format('Y-m-d'), 'description' => 'Tahun Baru Islam 1448 H', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(7)->setDay(17)->format('Y-m-d'), 'description' => 'Hari Proklamasi Kemerdekaan RI Ke-81', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(8)->setDay(5)->format('Y-m-d'), 'description' => 'Maulid Nabi Muhammad SAW 1448 H', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(11)->setDay(25)->format('Y-m-d'), 'description' => 'Hari Raya Natal & Cuti Bersama', 'is_holiday' => true],
        ];

        foreach ($academicEvents as $event) {
            AcademicCalendar::firstOrCreate(['holiday_date' => $event['holiday_date']], $event);
        }
    }
}
