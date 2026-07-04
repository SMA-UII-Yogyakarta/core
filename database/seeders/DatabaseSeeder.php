<?php

namespace Database\Seeders;

use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─── 1. Roles ───
        $roles = ['admin', 'student', 'teacher', 'guardian'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $this->call([RolePermissionSeeder::class]);

        // ─── 2. Admin User ───
        $admin = User::factory()->create([
            'username' => 'admin',
            'name' => 'Administrator',
            'email' => 'admin@smauii.sch.id',
            'role' => 'admin',
            'password' => bcrypt('password'),
        ]);
        $admin->assignRole('admin');

        // ─── 3. Teachers (5) ───
        $teacherUsers = collect();
        $teacherNames = [
            [
                'username' => 'budi',
                'name' => 'Budi Hartono, S.Pd.',
                'email' => 'budi@smauii.sch.id',
            ],
            [
                'username' => 'siti',
                'name' => 'Siti Aisyah, S.Pd.',
                'email' => 'siti@smauii.sch.id',
            ],
            [
                'username' => 'andi',
                'name' => 'Andi Pratama, S.Pd.',
                'email' => 'andi@smauii.sch.id',
            ],
            [
                'username' => 'dewi',
                'name' => 'Dwi Lestari, S.Pd.',
                'email' => 'dewi@smauii.sch.id',
            ],
            [
                'username' => 'rudi',
                'name' => 'Rudi Hermawan, S.Pd.',
                'email' => 'rudi@smauii.sch.id',
            ],
        ];

        foreach ($teacherNames as $t) {
            $user = User::factory()->create([
                'username' => $t['username'],
                'name' => $t['name'],
                'email' => $t['email'],
                'role' => 'teacher',
                'password' => bcrypt('password'),
            ]);
            $user->assignRole('teacher');
            $teacherUsers->push($user);
        }

        $teachers = collect();
        foreach ($teacherUsers as $i => $user) {
            $teachers->push(
                Teacher::factory()->create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'teacher_code' =>
                        'TCH-' .
                        str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                ]),
            );
        }

        // ─── 4. School Classes (5) ───
        $classNames = [
            'X-A (Reguler)',
            'X-B (Reguler)',
            'XI-A (Reguler)',
            'XI-B (Reguler)',
            'XII-A (Reguler)',
        ];
        $classes = collect();
        foreach ($classNames as $i => $name) {
            $classes->push(
                SchoolClass::factory()->create([
                    'name' => $name,
                    'teacher_id' => $teachers[$i]->id,
                ]),
            );
        }

        // ─── 5. Guardians (6) ───
        $guardianUsers = collect();
        $guardianNames = [
            [
                'username' => 'wahyu',
                'name' => 'Wahyu Hidayat',
                'email' => 'wahyu@mail.com',
            ],
            [
                'username' => 'sri',
                'name' => 'Sri Rahayu',
                'email' => 'sri@mail.com',
            ],
            [
                'username' => 'hendro',
                'name' => 'Hendro Gunawan',
                'email' => 'hendro@mail.com',
            ],
            [
                'username' => 'titin',
                'name' => 'Titin Supriyatin',
                'email' => 'titin@mail.com',
            ],
            [
                'username' => 'agus',
                'name' => 'Agus Salim',
                'email' => 'agus@mail.com',
            ],
            [
                'username' => 'nurul',
                'name' => 'Nurul Hidayah',
                'email' => 'nurul@mail.com',
            ],
        ];

        foreach ($guardianNames as $g) {
            $user = User::factory()->create([
                'username' => $g['username'],
                'name' => $g['name'],
                'email' => $g['email'],
                'role' => 'guardian',
                'password' => bcrypt('password'),
            ]);
            $user->assignRole('guardian');
            $guardianUsers->push($user);
        }

        $guardians = collect();
        foreach ($guardianUsers as $i => $user) {
            $guardians->push(
                Guardian::factory()->create([
                    'user_id' => $user->id,
                    'name' => $user->name,
                ]),
            );
        }

        // ─── 6. Students (25) ───
        $studentUsers = collect();
        $studentData = [
            ['username' => 'ahmad', 'name' => 'Ahmad Reza Pahlevi'],
            ['username' => 'clara', 'name' => 'Clarissa Maharani'],
            ['username' => 'budi_s', 'name' => 'Budi Santoso'],
            ['username' => 'diana', 'name' => 'Diana Putri'],
            ['username' => 'eko', 'name' => 'Eko Prasetyo'],
            ['username' => 'fitri', 'name' => 'Fitri Handayani'],
            ['username' => 'gilang', 'name' => 'Gilang Permana'],
            ['username' => 'hani', 'name' => 'Hani Nurjanah'],
            ['username' => 'irvan', 'name' => 'Irvan Maulana'],
            ['username' => 'julia', 'name' => 'Julia Safitri'],
            ['username' => 'krisna', 'name' => 'Krisna Aditya'],
            ['username' => 'lisa', 'name' => 'Lisa Aryani'],
            ['username' => 'miftah', 'name' => 'Miftahul Jannah'],
            ['username' => 'nindi', 'name' => 'Nindi Lestari'],
            ['username' => 'okta', 'name' => 'Oktafian Dwi'],
            ['username' => 'putri', 'name' => 'Putri Ayu'],
            ['username' => 'qori', 'name' => 'Qori Amalia'],
            ['username' => 'reza', 'name' => 'Reza Fahlevi'],
            ['username' => 'sari', 'name' => 'Sari Dewi'],
            ['username' => 'taufik', 'name' => 'Taufik Hidayat'],
            ['username' => 'utami', 'name' => 'Utami Rahayu'],
            ['username' => 'vina', 'name' => 'Vina Marvina'],
            ['username' => 'wawan', 'name' => 'Wawan Setiawan'],
            ['username' => 'yoga', 'name' => 'Yoga Pratama'],
            ['username' => 'zahra', 'name' => 'Zahra Alifia'],
        ];

        foreach ($studentData as $s) {
            $user = User::factory()->create([
                'username' => $s['username'],
                'name' => $s['name'],
                'email' => $s['username'] . '@smauii.sch.id',
                'role' => 'student',
                'password' => bcrypt('password'),
            ]);
            $user->assignRole('student');
            $studentUsers->push($user);
        }

        $students = collect();
        foreach ($studentUsers as $i => $user) {
            $class = $classes[$i % $classes->count()];
            $guardian = $guardians[$i % $guardians->count()];

            $students->push(
                Student::factory()->create([
                    'user_id' => $user->id,
                    'class_id' => $class->id,
                    'guardian_id' => $guardian->id,
                    'nis' =>
                        '2324' .
                        str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                    'nisn' =>
                        '00' .
                        str_pad((string) ($i + 1), 12, '0', STR_PAD_LEFT),
                    'name' => $user->name,
                    'status' => $i < 23 ? 'Active' : 'Inactive',
                ]),
            );
        }

        // ─── 7. Attendance Time Settings (Monday–Friday) ───
        $days = [
            [
                'day' => 'Monday',
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
            ],
            [
                'day' => 'Tuesday',
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
            ],
            [
                'day' => 'Wednesday',
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
            ],
            [
                'day' => 'Thursday',
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
            ],
            [
                'day' => 'Friday',
                'check_in_open' => '06:30:00',
                'late_threshold' => '07:00:00',
                'check_in_close' => '07:30:00',
            ],
        ];

        foreach ($days as $d) {
            AttendanceTimeSetting::factory()->create($d);
        }

        // ─── 8. Academic Calendars (5 holidays) ───
        $holidayDates = [
            [
                'holiday_date' => now()->addDays(5)->format('Y-m-d'),
                'description' => 'Libur Nasional',
            ],
            [
                'holiday_date' => now()->addDays(30)->format('Y-m-d'),
                'description' => 'Cuti Bersama',
            ],
            [
                'holiday_date' => now()->subDays(10)->format('Y-m-d'),
                'description' => 'Hari Raya',
            ],
            [
                'holiday_date' => now()->addDays(60)->format('Y-m-d'),
                'description' => 'Libur Semester',
            ],
            [
                'holiday_date' => now()->addDays(90)->format('Y-m-d'),
                'description' => 'Hari Besar Keagamaan',
            ],
        ];

        foreach ($holidayDates as $h) {
            AcademicCalendar::factory()->create($h);
        }

        // ─── 9. Attendances (samples for active students) ───
        $activeStudents = $students->where('status', 'Active');
        $today = now()->format('Y-m-d');

        foreach ($activeStudents as $student) {
            $rand = fake()->numberBetween(1, 100);

            if ($rand <= 70) {
                // Present
                Attendance::factory()->create([
                    'student_id' => $student->id,
                    'attendance_date' => $today,
                    'check_in_time' => fake()->randomElement([
                        '06:45:00',
                        '06:48:00',
                        '06:50:00',
                        '06:52:00',
                        '06:55:00',
                    ]),
                    'status' => 'Present',
                ]);
            } elseif ($rand <= 85) {
                // Late
                Attendance::factory()->create([
                    'student_id' => $student->id,
                    'attendance_date' => $today,
                    'check_in_time' => fake()->randomElement([
                        '07:05:00',
                        '07:10:00',
                        '07:15:00',
                    ]),
                    'status' => 'Late',
                ]);
            }
            // else: Absent (no attendance record)
        }

        // ─── 10. Leave Requests (samples) ───
        $leaveData = [
            [
                'student_index' => 0,
                'guardian_index' => 0,
                'category' => 'Sick',
                'status' => 'Pending',
            ],
            [
                'student_index' => 2,
                'guardian_index' => 1,
                'category' => 'Sick',
                'status' => 'Pending',
            ],
            [
                'student_index' => 4,
                'guardian_index' => 2,
                'category' => 'Event',
                'status' => 'Approved',
            ],
            [
                'student_index' => 6,
                'guardian_index' => 3,
                'category' => 'Competition',
                'status' => 'Approved',
            ],
            [
                'student_index' => 8,
                'guardian_index' => 4,
                'category' => 'Sick',
                'status' => 'Rejected',
            ],
            [
                'student_index' => 10,
                'guardian_index' => 0,
                'category' => 'Event',
                'status' => 'Pending',
            ],
            [
                'student_index' => 12,
                'guardian_index' => 1,
                'category' => 'Sick',
                'status' => 'Approved',
            ],
        ];

        foreach ($leaveData as $ld) {
            $student = $students[$ld['student_index']];
            $guardian = $guardians[$ld['guardian_index']];

            LeaveRequest::factory()->create([
                'student_id' => $student->id,
                'guardian_id' => $guardian->id,
                'category' => $ld['category'],
                'approval_status' => $ld['status'],
                'start_date' => now()
                    ->addDays(fake()->numberBetween(1, 10))
                    ->format('Y-m-d'),
                'end_date' => now()
                    ->addDays(fake()->numberBetween(11, 14))
                    ->format('Y-m-d'),
            ]);
        }
    }
}
