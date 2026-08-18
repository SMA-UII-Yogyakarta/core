<?php

namespace Database\Seeders;

use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceTimeSetting;
use App\Models\DutySchedule;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Models\SchoolClass;
use App\Models\SchoolLocationSetting;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with rich, production-grade realistic data
     * simulating the real-world environment of SMA UII Yogyakarta.
     * Contains 245+ realistic students, 85+ guardians, 10 classes, 15 teachers, and full attendance records.
     */
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────────
        // 1. Roles & Permissions (Spatie RBAC)
        // ─────────────────────────────────────────────────────────────
        $roles = ['admin', 'student', 'teacher', 'guardian'];
        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role]);
        }

        $this->call([RolePermissionSeeder::class]);

        // ─────────────────────────────────────────────────────────────
        // 2. Administrators & School Leadership (SMA UII Management)
        // ─────────────────────────────────────────────────────────────
        $adminAccounts = [
            [
                'username' => 'admin',
                'name' => 'Administrator Utama',
                'email' => 'admin@smauii.sch.id',
                'role' => 'admin',
            ],
            [
                'username' => 'kepsek',
                'name' => 'Dra. Hj. Mulyani, M.Pd.',
                'email' => 'kepsek@smauii.sch.id',
                'role' => 'admin',
            ],
            [
                'username' => 'kurikulum',
                'name' => 'Ir. H. Bambang Sujatmiko, M.T.',
                'email' => 'kurikulum@smauii.sch.id',
                'role' => 'admin',
            ],
            [
                'username' => 'kesiswaan',
                'name' => 'Drs. H. Ahmad Sudrajat, M.Si.',
                'email' => 'kesiswaan@smauii.sch.id',
                'role' => 'admin',
            ],
            [
                'username' => 'tatausaha',
                'name' => 'Siti Nurjanah, S.E.',
                'email' => 'tu@smauii.sch.id',
                'role' => 'admin',
            ],
        ];

        foreach ($adminAccounts as $adm) {
            $user = User::updateOrCreate(
                ['username' => $adm['username']],
                [
                    'name' => $adm['name'],
                    'email' => $adm['email'],
                    'role' => $adm['role'],
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('admin');
        }

        // ─────────────────────────────────────────────────────────────
        // 3. Teachers (15 Pengajar & Staf Ahli SMA UII Yogyakarta)
        // ─────────────────────────────────────────────────────────────
        $teacherData = [
            // Wali Kelas Group
            [
                'username' => 'budi',
                'name' => 'Budi Hartono, S.Pd.',
                'email' => 'budi@smauii.sch.id',
                'code' => 'TCH-001',
                'type' => 'wali',
            ],
            [
                'username' => 'siti',
                'name' => 'Siti Aisyah, S.Ag., M.Pd.I.',
                'email' => 'siti@smauii.sch.id',
                'code' => 'TCH-002',
                'type' => 'wali',
            ],
            [
                'username' => 'andi',
                'name' => 'Andi Pratama, S.Pd., M.Hum.',
                'email' => 'andi@smauii.sch.id',
                'code' => 'TCH-003',
                'type' => 'wali',
            ],
            [
                'username' => 'dewi',
                'name' => 'Dwi Lestari, S.Pd., M.Si.',
                'email' => 'dewi@smauii.sch.id',
                'code' => 'TCH-004',
                'type' => 'wali',
            ],
            [
                'username' => 'rudi',
                'name' => 'Rudi Hermawan, S.Si., M.Pd.',
                'email' => 'rudi@smauii.sch.id',
                'code' => 'TCH-005',
                'type' => 'wali',
            ],
            [
                'username' => 'g_ahmad',
                'name' => 'Ahmad Fauzi, S.Pd.',
                'email' => 'ahmad.fauzi@smauii.sch.id',
                'code' => 'TCH-006',
                'type' => 'wali',
            ],
            [
                'username' => 'g_rina',
                'name' => 'Rina Wati, S.Pd., M.A.',
                'email' => 'rina.wati@smauii.sch.id',
                'code' => 'TCH-007',
                'type' => 'wali',
            ],
            [
                'username' => 'eko_n',
                'name' => 'Eko Nugroho, S.Sos., M.Pd.',
                'email' => 'eko.nugroho@smauii.sch.id',
                'code' => 'TCH-008',
                'type' => 'wali',
            ],
            [
                'username' => 'tri_w',
                'name' => 'Tri Wahyuni, S.E., M.M.',
                'email' => 'tri.wahyuni@smauii.sch.id',
                'code' => 'TCH-009',
                'type' => 'wali',
            ],
            // Guru Piket & Pengajar Mapel Khusus
            [
                'username' => 'dimas_kom',
                'name' => 'Dimas Arya, S.Kom., M.Cs.',
                'email' => 'dimas.arya@smauii.sch.id',
                'code' => 'TCH-010',
                'type' => 'piket',
            ],
            [
                'username' => 'hendra_pjok',
                'name' => 'Hendra Wijaya, S.Pd.Kor.',
                'email' => 'hendra.wijaya@smauii.sch.id',
                'code' => 'TCH-011',
                'type' => 'piket',
            ],
            [
                'username' => 'nurul_seni',
                'name' => 'Nurul Hidayati, S.Sn.',
                'email' => 'nurul.hidayati@smauii.sch.id',
                'code' => 'TCH-012',
                'type' => 'piket',
            ],
            [
                'username' => 'fitria_bk',
                'name' => 'Fitria Rahmawati, S.Psi., M.Psi.',
                'email' => 'fitria.bk@smauii.sch.id',
                'code' => 'TCH-013',
                'type' => 'piket',
            ],
            [
                'username' => 'agus_sej',
                'name' => 'Agus Prasetyo, S.Pd.',
                'email' => 'agus.prasetyo@smauii.sch.id',
                'code' => 'TCH-014',
                'type' => 'piket',
            ],
            [
                'username' => 'ustadz_ihsan',
                'name' => 'Ustadz Muhammad Ihsan, Lc., M.H.',
                'email' => 'ihsan.tahfidz@smauii.sch.id',
                'code' => 'TCH-015',
                'type' => 'both',
            ],
        ];

        $teachers = collect();
        foreach ($teacherData as $t) {
            $user = User::updateOrCreate(
                ['username' => $t['username']],
                [
                    'name' => $t['name'],
                    'email' => $t['email'],
                    'role' => 'teacher',
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('teacher');

            $teacher = Teacher::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'teacher_code' => $t['code'],
                    'teacher_type' => $t['type'],
                ],
            );
            $teachers->push($teacher);
        }

        // ─────────────────────────────────────────────────────────────
        // 4. School Classes (10 Rombel Fase E, F Sains, F Sosial SMA UII)
        // ─────────────────────────────────────────────────────────────
        $classDefinitions = [
            ['name' => 'X-A (Fase E - 1)', 'level' => 'X', 'teacher_idx' => 0, 'capacity' => 36],
            ['name' => 'X-B (Fase E - 2)', 'level' => 'X', 'teacher_idx' => 1, 'capacity' => 36],
            ['name' => 'X-C (Fase E - Tahfidz)', 'level' => 'X', 'teacher_idx' => 14, 'capacity' => 32],
            ['name' => 'XI-MIPA 1 (Fase F - Sains 1)', 'level' => 'XI', 'teacher_idx' => 2, 'capacity' => 36],
            ['name' => 'XI-MIPA 2 (Fase F - Sains 2)', 'level' => 'XI', 'teacher_idx' => 3, 'capacity' => 36],
            ['name' => 'XI-IPS 1 (Fase F - Sosial 1)', 'level' => 'XI', 'teacher_idx' => 4, 'capacity' => 36],
            ['name' => 'XI-IPS 2 (Fase F - Sosial 2)', 'level' => 'XI', 'teacher_idx' => 5, 'capacity' => 36],
            ['name' => 'XII-MIPA 1 (Tingkat Akhir Sains 1)', 'level' => 'XII', 'teacher_idx' => 6, 'capacity' => 36],
            ['name' => 'XII-IPS 1 (Tingkat Akhir Sosial 1)', 'level' => 'XII', 'teacher_idx' => 7, 'capacity' => 36],
            ['name' => 'XII-IPS 2 (Tingkat Akhir Sosial 2)', 'level' => 'XII', 'teacher_idx' => 8, 'capacity' => 36],
        ];

        $classes = collect();
        foreach ($classDefinitions as $c) {
            $assignedTeacher = $teachers[$c['teacher_idx']];
            $schoolClass = SchoolClass::updateOrCreate(
                ['name' => $c['name']],
                [
                    'level' => $c['level'],
                    'teacher_id' => $assignedTeacher->id,
                    'capacity' => $c['capacity'],
                ],
            );
            $classes->push($schoolClass);
        }

        // ─────────────────────────────────────────────────────────────
        // 5. Duty Schedules (Jadwal Piket Guru Senin - Jumat)
        // ─────────────────────────────────────────────────────────────
        $dutyAssignments = [
            ['day' => 'Monday', 'teacher_idxs' => [9, 0]],      // Dimas Arya, Budi Hartono
            ['day' => 'Tuesday', 'teacher_idxs' => [10, 1]],     // Hendra Wijaya, Siti Aisyah
            ['day' => 'Wednesday', 'teacher_idxs' => [11, 2]],   // Nurul Hidayati, Andi Pratama
            ['day' => 'Thursday', 'teacher_idxs' => [12, 3]],    // Fitria Rahmawati, Dwi Lestari
            ['day' => 'Friday', 'teacher_idxs' => [13, 14]],     // Agus Prasetyo, Ustadz Ihsan
        ];

        foreach ($dutyAssignments as $duty) {
            foreach ($duty['teacher_idxs'] as $tIdx) {
                DutySchedule::firstOrCreate([
                    'teacher_id' => $teachers[$tIdx]->id,
                    'duty_day' => $duty['day'],
                ]);
            }
        }

        // ─────────────────────────────────────────────────────────────
        // 6. Guardians (85 Profil Orang Tua / Wali Murid Realistis DIY)
        // ─────────────────────────────────────────────────────────────
        $diyLocations = [
            'Jl. Kaliurang KM 14.5, Sleman, Yogyakarta',
            'Jl. Sorowajan Baru No. 12, Banguntapan, Bantul',
            'Purbayan, Kotagede, Kota Yogyakarta',
            'Jl. Wonosari KM 7, Baturetno, Banguntapan',
            'Jl. Gedongkuning No. 45, Rejowinangun, Kotagede',
            'Jl. Glagahsari No. 18, Warungboto, Umbulharjo',
            'Jl. Laksda Adisucipto KM 8, Maguwoharjo, Sleman',
            'Jl. Kusumanegara No. 80, Mujamuju, Umbulharjo',
            'Jl. Janti Gg. Gemak No. 102, Caturtunggal, Depok, Sleman',
            'Jl. Magelang KM 5, Mlati, Sleman',
            'Jl. Tamansiswa No. 110, Mergangsan, Kota Yogyakarta',
            'Jl. Ring Road Selatan, Sewon, Bantul',
            'Jl. Imogiri Timur KM 6, Banguntapan, Bantul',
            'Jl. Veteran No. 33, Pandeyan, Umbulharjo',
            'Jl. Seturan Raya No. 9, Kledokan, Depok, Sleman',
            'Perumahan Sorowajan Indah Blok B-4, Banguntapan',
            'Jl. Balirejo No. 25, Muja Muju, Umbulharjo',
            'Jl. Babarsari No. 14, Tambakbayan, Caturtunggal',
            'Jl. Rejowinangun No. 67, Kotagede, Kota Yogyakarta',
            'Jl. Wirosaban No. 10, Sorosutan, Umbulharjo',
            'Jl. Parangtritis KM 5.5, Sewon, Bantul',
            'Jl. Palagan Tentara Pelajar KM 9, Sariharjo, Ngaglik',
            'Jl. Wates KM 3, Kadipiro, Kasihan, Bantul',
            'Jl. Solo KM 10, Kalitirto, Berbah, Sleman',
            'Jl. Tajem KM 2, Maguwoharjo, Depok, Sleman',
        ];

        $guardianNames = [
            'Ir. Wahyu Hidayat, M.T.', 'Dr. Dra. Sri Rahayu, M.Si.', 'Hendro Gunawan, S.E.', 'Titin Supriyatin, S.Pd.',
            'Agus Salim, S.Kom.', 'Nurul Hidayah, S.Farm., Apt.', 'Dr. Bambang Widjanarko, Sp.A.', 'Dra. Retno Palupi',
            'Yusuf Mansur, S.T.', 'Anita Kusuma, S.Sos.', 'Surya Kencana, S.H., M.Kn.', 'Maya Indraswari, S.E.',
            'Ferry Setiawan, S.Si.', 'Dewi Kartika, S.Pd.', 'Ridwan Kamil, M.Eng.', 'Farida Nuraini, S.Ag.',
            'Lukman Hakim, S.E., Ak.', 'Ratna Sari Dewi, S.Ked.', 'Gunawan Wibisono, S.H.', 'Triana Puspitasari, S.Psi.',
            'H. Ahmad Syukron, M.Ag.', 'Hj. Endang Sulistyowati', 'Dr. Dedi Suryadi, M.T.', 'drg. Rina Kusumawati',
            'Sugeng Riyadi, S.Pd.', 'Haryanto Nugroho, S.T.', 'Nunung Nurhayati, S.E.', 'Wibowo Santoso, M.M.',
            'Priyo Utomo, S.Kom.', 'Dyah Ayu Anggraini, S.Si.', 'Sigit Purnomo, S.H.', 'Kurniawan Dwi, M.Eng.',
            'Erna Widyastuti, S.Pd.', 'Bayu Aji Pratama, S.E.', 'Lestari Handayani, S.Sos.', 'Joko Purwanto, S.T.',
            'Sunarto Hadi, M.Pd.', 'Sri Lestari, S.Kom.', 'Bambang Sudarmono, S.H.', 'Rini Astuti, S.Farm.',
            'Danang Setyawan, S.E.', 'Nur Hidayatullah, M.Si.', 'Fitri Handayani, S.Pd.', 'Teguh Wibowo, S.T.',
            'Anisa Rahmawati, S.Ked.', 'Budi Santoso, S.Sos.', 'Mulyadi, S.E., M.M.', 'Hartini, S.Pd.',
            'Dwi Cahyono, S.Kom.', 'Eko Supriyanto, S.H.', 'Yulianti, S.Si.', 'Aris Munandar, M.Eng.',
            'Wulandari, S.E.', 'Hendra Saputra, S.T.', 'Ratnawati, S.Pd.I.', 'Arief Rahman, S.Kom.',
            'Susanto, S.Sos.', 'Tri Wulandari, S.Farm.', 'Agus Hermawan, S.E.', 'Sri Wahyuni, M.Pd.',
            'Hadi Prayitno, S.T.', 'Dewi Anggraeni, S.H.', 'Rahmat Hidayat, S.Pd.', 'Kusuma Wardani, S.Si.',
            'Slamet Riyadi, S.E.', 'Endah Pujiastuti, S.Kom.', 'Heru Prasetyo, M.T.', 'Yuni Astuti, S.Pd.',
            'Agung Nugroho, S.H.', 'Puji Rahayu, S.Sos.', 'Didik Setiawan, S.T.', 'Nurul Aini, S.Farm.',
            'Widodo, S.Pd., M.Pd.', 'Rina Novita, S.E.', 'Bambang Irawan, S.Kom.', 'Siti Marhamah, S.Ag.',
            'Edi Susanto, S.T.', 'Nur Hasanah, S.Pd.', 'Muh. Zulfikar, S.H.', 'Tatik Maryati, S.E.',
            'Cahyo Pramono, M.Eng.', 'Suwarni, S.Pd.', 'Anton Sujarwo, S.Kom.', 'Sri Mulyani, S.Sos.',
            'Hari Prasetya, S.T.', 'Lilis Suryani, S.Farm.', 'Fauzan Adhim, M.Ag.', 'Rini Widyastuti, S.Pd.',
        ];

        $guardians = collect();
        foreach ($guardianNames as $gIdx => $gName) {
            $uName = 'wali_' . ($gIdx + 1);
            if ($gIdx === 0) {
                $uName = 'wahyu';
            }
            if ($gIdx === 1) {
                $uName = 'sri';
            }

            $user = User::updateOrCreate(
                ['username' => $uName],
                [
                    'name' => $gName,
                    'email' => $uName . '@wali.smauii.sch.id',
                    'role' => 'guardian',
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('guardian');

            $guardian = Guardian::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'phone' => '08' . (11 + ($gIdx % 8)) . fake()->numerify('########'),
                    'address' => $diyLocations[$gIdx % count($diyLocations)],
                ],
            );
            $guardians->push($guardian);
        }

        // ─────────────────────────────────────────────────────────────
        // 7. Students (230 Siswa Terbagi di 10 Kelas + 15 Unassigned)
        // ─────────────────────────────────────────────────────────────
        // 23 Siswa per kelas x 10 kelas = 230 Siswa Terdaftar di Kelas
        // + 15 Siswa Unassigned (Belum masuk kelas) = 245 Total Siswa!

        $firstNamesM = [
            'Ahmad', 'Budi', 'Danang', 'Eko', 'Fajar', 'Gilang', 'Haris', 'Irvan', 'Joko', 'Krisna',
            'Latif', 'Muhammad', 'Naufal', 'Oktafian', 'Pratama', 'Rafi', 'Satria', 'Taufik', 'Umar', 'Wahyu',
            'Yoga', 'Zulham', 'Aditya', 'Bagus', 'Candra', 'Dimas', 'Fandi', 'Galih', 'Hafizh', 'Iqbal',
            'Kevin', 'Lukman', 'Mahendra', 'Niko', 'Pandu', 'Rangga', 'Syahrul', 'Teguh', 'Vino', 'Wisnu',
        ];

        $firstNamesF = [
            'Aisyah', 'Bella', 'Clarissa', 'Diana', 'Elisa', 'Fitri', 'Gita', 'Hani', 'Intan', 'Julia',
            'Kurnia', 'Lisa', 'Megawati', 'Nindi', 'Olivia', 'Putri', 'Qori', 'Rina', 'Sari', 'Tiara',
            'Utami', 'Vina', 'Wulan', 'Yulia', 'Zahra', 'Amalia', 'Berliana', 'Cintya', 'Dinda', 'Farah',
            'Hanifah', 'Indah', 'Jasmine', 'Karina', 'Laksmi', 'Mutiara', 'Nabila', 'Pratiwi', 'Rani', 'Salma',
        ];

        $lastNames = [
            'Pahlevi', 'Maharani', 'Santoso', 'Lestari', 'Utomo', 'Handayani', 'Permana', 'Nurjanah',
            'Maulana', 'Wardhani', 'Nugraha', 'Dewi', 'Jannah', 'Ningrum', 'Cahyo', 'Ayu', 'Fauziah',
            'Pratama', 'Anggraini', 'Hidayatullah', 'Ningsih', 'Salsabila', 'Aji', 'Yudha', 'Zahir',
            'Sudewa', 'Puspita', 'Kusuma', 'Wicaksono', 'Rahmawati', 'Firmansyah', 'Sari', 'Susilo',
            'Melati', 'Rohman', 'Sukmawati', 'Ramadhan', 'Saputra', 'Wibowo', 'Kusumawati',
        ];

        $students = collect();
        $studentCounter = 1;

        // A. Generate 23 Siswa per Kelas (Total 230 Siswa Kelas)
        foreach ($classes as $cIdx => $class) {
            $level = $class->level;
            $enrollmentYear = match ($level) {
                'X' => 2024,
                'XI' => 2023,
                'XII' => 2022,
                default => 2024,
            };
            $nisPrefix = substr((string)$enrollmentYear, 2, 2) . substr((string)($enrollmentYear + 1), 2, 2);
            $birthYear = match ($level) {
                'X' => 2009,
                'XI' => 2008,
                'XII' => 2007,
                default => 2009,
            };

            for ($i = 1; $i <= 23; $i++) {
                $isMale = ($i % 2 === 1);
                $fn = $isMale
                    ? $firstNamesM[($cIdx * 7 + $i) % count($firstNamesM)]
                    : $firstNamesF[($cIdx * 7 + $i) % count($firstNamesF)];
                $ln = $lastNames[($cIdx * 5 + $i * 3) % count($lastNames)];
                $fullName = $fn . ' ' . $ln;

                // Username spesifik untuk akun demo siswa utama:
                $uName = 'siswa_' . $studentCounter;
                if ($cIdx === 0 && $i === 1) {
                    $uName = 'ahmad';
                    $fullName = 'Ahmad Pratama';
                }
                if ($cIdx === 0 && $i === 2) {
                    $uName = 'clara';
                    $fullName = 'Clara Salsabila';
                }

                $nis = $nisPrefix . str_pad((string)$studentCounter, 4, '0', STR_PAD_LEFT);
                $nisn = '00' . substr((string)$birthYear, 2, 2) . str_pad((string)$studentCounter, 6, '0', STR_PAD_LEFT);
                $birthMonth = str_pad((string)(($i % 12) + 1), 2, '0', STR_PAD_LEFT);
                $birthDay = str_pad((string)(($i * 2) % 28 + 1), 2, '0', STR_PAD_LEFT);
                $birthDate = "{$birthYear}-{$birthMonth}-{$birthDay}";

                $guardian = $guardians[($studentCounter - 1) % $guardians->count()];

                $user = User::updateOrCreate(
                    ['username' => $uName],
                    [
                        'name' => $fullName,
                        'email' => $uName . '@siswa.smauii.sch.id',
                        'role' => 'student',
                        'password' => bcrypt('password'),
                    ],
                );
                $user->assignRole('student');

                $student = Student::updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'class_id' => $class->id,
                        'guardian_id' => $guardian->id,
                        'nis' => $nis,
                        'nisn' => $nisn,
                        'name' => $fullName,
                        'birth_date' => $birthDate,
                        'phone' => '088' . fake()->numerify('########'),
                        'address' => $guardian->address,
                        'enrollment_year' => $enrollmentYear,
                        'status' => 'Active',
                    ],
                );
                $students->push($student);
                $studentCounter++;
            }
        }

        // B. Generate 15 Siswa UNASSIGNED (Belum Masuk Kelas) untuk Menguji Enrolment Kelas
        for ($u = 1; $u <= 15; $u++) {
            $isMale = ($u % 2 === 1);
            $fn = $isMale ? $firstNamesM[($u * 3) % count($firstNamesM)] : $firstNamesF[($u * 3) % count($firstNamesF)];
            $ln = $lastNames[($u * 4) % count($lastNames)];
            $fullName = $fn . ' ' . $ln . ' (Siswa Baru)';
            $uName = 'calon_siswa_' . $u;

            $nis = '2425' . str_pad((string)($studentCounter), 4, '0', STR_PAD_LEFT);
            $nisn = '0009' . str_pad((string)($studentCounter), 6, '0', STR_PAD_LEFT);
            $birthDate = '2009-07-' . str_pad((string)($u + 5), 2, '0', STR_PAD_LEFT);

            $guardian = $guardians[($studentCounter - 1) % $guardians->count()];

            $user = User::updateOrCreate(
                ['username' => $uName],
                [
                    'name' => $fullName,
                    'email' => $uName . '@siswa.smauii.sch.id',
                    'role' => 'student',
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('student');

            $student = Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'class_id' => null, // UNASSIGNED!
                    'guardian_id' => $guardian->id,
                    'nis' => $nis,
                    'nisn' => $nisn,
                    'name' => $fullName,
                    'birth_date' => $birthDate,
                    'phone' => '088' . fake()->numerify('########'),
                    'address' => $guardian->address,
                    'enrollment_year' => 2024,
                    'status' => 'Active',
                ],
            );
            $students->push($student);
            $studentCounter++;
        }

        // ─────────────────────────────────────────────────────────────
        // 8. Attendance Time Settings (Jadwal Presensi Standar SMA UII)
        // ─────────────────────────────────────────────────────────────
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

        // ─────────────────────────────────────────────────────────────
        // 8.5 School Location Settings (Titik Lokasi Presensi & Geofencing SMA UII Yogyakarta)
        // ─────────────────────────────────────────────────────────────
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

        // ─────────────────────────────────────────────────────────────
        // 9. Academic Calendar (Hari Libur & Agenda SMA UII Yogyakarta)
        // ─────────────────────────────────────────────────────────────
        $academicEvents = [
            ['holiday_date' => now()->startOfYear()->addMonths(6)->setDay(27)->format('Y-m-d'), 'description' => 'Tahun Baru Islam 1448 H', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(7)->setDay(17)->format('Y-m-d'), 'description' => 'Hari Proklamasi Kemerdekaan RI Ke-81', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(8)->setDay(5)->format('Y-m-d'), 'description' => 'Maulid Nabi Muhammad SAW 1448 H', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(11)->setDay(25)->format('Y-m-d'), 'description' => 'Hari Raya Natal & Cuti Bersama', 'is_holiday' => true],
            ['holiday_date' => now()->startOfYear()->addMonths(6)->setDay(8)->format('Y-m-d'), 'description' => 'Milad Universitas Islam Indonesia (UII) Ke-83', 'is_holiday' => true],
            ['holiday_date' => now()->addDays(14)->format('Y-m-d'), 'description' => 'Penilaian Tengah Semester (PTS) Ganjil', 'is_holiday' => false],
        ];

        foreach ($academicEvents as $event) {
            AcademicCalendar::firstOrCreate(['holiday_date' => $event['holiday_date']], $event);
        }

        // ─────────────────────────────────────────────────────────────
        // 10. Leave Requests (Pengajuan Izin & Sakit Realistis)
        // ─────────────────────────────────────────────────────────────
        $leaveSamples = [
            ['student_idx' => 0, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 2, 'desc' => 'Sakit demam dan batuk pilek, istirahat dokter di RS UII Pandanaran.'],
            ['student_idx' => 2, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 3, 'duration' => 3, 'desc' => 'Demam Berdarah (DBD), dirawat di RS PKU Muhammadiyah Kotagede.'],
            ['student_idx' => 4, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 5, 'duration' => 1, 'desc' => 'Menghadiri pernikahan kakak kandung di Solo.'],
            ['student_idx' => 6, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 7, 'duration' => 3, 'desc' => 'Mewakili SMA UII dalam Olimpiade Sains Nasional (OSN) Tingkat DIY.'],
            ['student_idx' => 8, 'category' => 'Sick', 'status' => 'Rejected', 'days_ago' => 10, 'duration' => 1, 'desc' => 'Izin tidak masuk tanpa surat dokter yang jelas.'],
            ['student_idx' => 10, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 12, 'duration' => 2, 'desc' => 'Acara keluarga silaturahmi ke Jawa Timur.'],
            ['student_idx' => 12, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 15, 'duration' => 2, 'desc' => 'Mengikuti Kejuaraan Futsal Pelajar Tingkat Kabupaten Bantul.'],
            ['student_idx' => 14, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 18, 'duration' => 1, 'desc' => 'Sakit flu dan radang tenggorokan.'],
            ['student_idx' => 16, 'category' => 'Other', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 1, 'desc' => 'Mengurus administrasi paspor untuk pertukaran pelajar.'],
            ['student_idx' => 18, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 22, 'duration' => 2, 'desc' => 'Sakit migrain dan pusing berat.'],
        ];

        foreach ($leaveSamples as $ls) {
            $student = $students[$ls['student_idx']];
            $startDate = now()->subDays($ls['days_ago'])->format('Y-m-d');
            $endDate = now()->subDays($ls['days_ago'])->addDays($ls['duration'] - 1)->format('Y-m-d');

            LeaveRequest::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'start_date' => $startDate,
                ],
                [
                    'guardian_id' => $student->guardian_id,
                    'category' => $ls['category'],
                    'end_date' => $endDate,
                    'description' => $ls['desc'],
                    'approval_status' => $ls['status'],
                    'document_url' => 'https://via.placeholder.com/600x800?text=Surat+Izin+' . urlencode($student->name),
                ],
            );
        }

        // ─────────────────────────────────────────────────────────────
        // 11. Attendances (Presensi Realistis Sepanjang Tahun Berjalan di SMA UII Yogyakarta)
        // ─────────────────────────────────────────────────────────────
        $schoolLat = -7.814257;
        $schoolLng = 110.375944;
        $photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&h=240&q=80';

        // Loop dari awal tahun berjalan (mis. 5 Januari) hingga HARI KEMARIN (agar hari ini siswa bisa uji coba kamera & live presensi)
        $startDate = Carbon::create(now()->year, 1, 5);
        $endDate = now()->subDay();
        $assignedStudents = $students->filter(fn ($s) => $s->class_id !== null)->values();

        $attendanceBatch = [];
        $approvedLeaves = LeaveRequest::where('approval_status', 'Approved')->get();
        $approvedLeaveMap = [];
        foreach ($approvedLeaves as $leave) {
            $curL = Carbon::parse($leave->start_date);
            $endL = Carbon::parse($leave->end_date);
            while ($curL->lte($endL)) {
                $approvedLeaveMap[$leave->student_id . '_' . $curL->format('Y-m-d')] = true;
                $curL->addDay();
            }
        }

        for ($current = $startDate->copy(); $current->lte($endDate); $current->addDay()) {
            if ($current->isWeekend()) {
                continue;
            }

            $dateString = $current->format('Y-m-d');
            $dayOfYear = $current->dayOfYear;

            $monthVariance = [1 => 2, 2 => 4, 3 => 1, 4 => 5, 5 => 3, 6 => 6, 7 => 2, 8 => 4][$current->month] ?? 3;
            $presentCutoff = 84 + $monthVariance;
            $lateCutoff = min(96, $presentCutoff + 6);

            foreach ($assignedStudents as $idx => $student) {
                // Pola probabilistik kehadiran realistis bulanan:
                $prob = ($idx * 7 + $dayOfYear * 13) % 100;

                if (isset($approvedLeaveMap[$student->id . '_' . $dateString])) {
                    continue;
                }

                if ($prob < $presentCutoff) {
                    // HADIR TEPAT WAKTU (06:35 - 06:55)
                    $minute = str_pad((string) (35 + ($idx % 20)), 2, '0', STR_PAD_LEFT);
                    $second = str_pad((string) (($idx * 11) % 60), 2, '0', STR_PAD_LEFT);

                    $attendanceBatch[] = [
                        'student_id' => $student->id,
                        'attendance_date' => $dateString,
                        'check_in_time' => "06:{$minute}:{$second}",
                        'latitude' => (string) ($schoolLat + ((($idx * 3 + $dayOfYear) % 30) - 15) / 100000),
                        'longitude' => (string) ($schoolLng + ((($idx * 5 + $dayOfYear) % 30) - 15) / 100000),
                        'photo_url' => $photoUrl,
                        'status' => 'Present',
                        'created_at' => "{$dateString} 06:{$minute}:{$second}",
                        'updated_at' => "{$dateString} 06:{$minute}:{$second}",
                    ];
                } elseif ($prob < $lateCutoff) {
                    // TERLAMBAT (07:05 - 07:22)
                    $minute = str_pad((string) (5 + ($idx % 18)), 2, '0', STR_PAD_LEFT);
                    $second = str_pad((string) (($idx * 13) % 60), 2, '0', STR_PAD_LEFT);

                    $attendanceBatch[] = [
                        'student_id' => $student->id,
                        'attendance_date' => $dateString,
                        'check_in_time' => "07:{$minute}:{$second}",
                        'latitude' => (string) ($schoolLat + ((($idx * 3 + $dayOfYear) % 30) - 15) / 100000),
                        'longitude' => (string) ($schoolLng + ((($idx * 5 + $dayOfYear) % 30) - 15) / 100000),
                        'photo_url' => $photoUrl,
                        'status' => 'Late',
                        'created_at' => "{$dateString} 07:{$minute}:{$second}",
                        'updated_at' => "{$dateString} 07:{$minute}:{$second}",
                    ];
                }
                // Sisanya (prob >= 94) tidak memiliki record presensi -> Terhitung Absent (Alpa) secara otomatis

                if (count($attendanceBatch) >= 1000) {
                    Attendance::insert($attendanceBatch);
                    $attendanceBatch = [];
                }
            }
        }

        if (! empty($attendanceBatch)) {
            Attendance::insert($attendanceBatch);
        }

        // ─────────────────────────────────────────────────────────────
        // 12. System Notifications (Notifikasi Realistis untuk Multi-Role)
        // ─────────────────────────────────────────────────────────────
        $notifications = [
            [
                'recipient_id' => $students[0]->user_id, // Ahmad
                'title' => 'Presensi Berhasil Diverifikasi',
                'content' => 'Presensi kehadiran Anda hari ini telah dicatat sistem pada pukul 06:42 WIB dengan status Hadir Tepat Waktu.',
                'target_group' => 'student',
            ],
            [
                'recipient_id' => $students[0]->user_id,
                'title' => 'Pengingat Agenda Sekolah',
                'content' => 'Penilaian Tengah Semester (PTS) Ganjil akan dimulai 2 minggu lagi. Pastikan kehadiran dan persiapan belajar Anda optimal.',
                'target_group' => 'student',
            ],
            [
                'recipient_id' => $teachers[0]->user_id, // Budi Hartono (Wali X-A)
                'title' => 'Pengajuan Izin Siswa Baru',
                'content' => 'Siswa Ahmad Reza Pahlevi mengajukan izin kategori Sakit selama 2 hari. Silakan lakukan verifikasi berkas surat dokter.',
                'target_group' => 'teacher',
            ],
            [
                'recipient_id' => $guardians[0]->user_id, // Ir. Wahyu Hidayat
                'title' => 'Laporan Kehadiran Mingguan Ananda',
                'content' => 'Ananda Ahmad Reza Pahlevi tercatat 100% Hadir Tepat Waktu pada pekan ini di kelas X-A SMA UII Yogyakarta.',
                'target_group' => 'guardian',
            ],
            [
                'recipient_id' => 1, // Admin Utama
                'title' => 'Rekapitulasi Presensi Harian Siap',
                'content' => 'Rekap presensi seluruh rombongan belajar per hari ini telah diolah. Tingkat kehadiran sekolah mencapai 94.8%.',
                'target_group' => 'all',
            ],
        ];

        foreach ($notifications as $notif) {
            Notification::create($notif);
        }
    }
}
