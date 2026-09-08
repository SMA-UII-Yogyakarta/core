<?php

namespace Database\Seeders;

use App\Models\AcademicCalendar;
use App\Models\Attendance;
use App\Models\AttendanceOverride;
use App\Models\AttendanceTimeSetting;
use App\Models\DutySchedule;
use App\Models\Guardian;
use App\Models\LeaveRequest;
use App\Models\Notification;
use App\Models\NotificationRead;
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
            [
                'username' => 'hanif',
                'name' => 'Hanif',
                'email' => 'hanif@smauii.sch.id',
                'role' => 'admin',
            ],
            [
                'username' => 'mahfud',
                'name' => 'Bpk. Mahfud',
                'email' => 'mahfud@smauii.sch.id',
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
                'type' => 'homeroom',
            ],
            [
                'username' => 'siti',
                'name' => 'Siti Aisyah, S.Ag., M.Pd.I.',
                'email' => 'siti@smauii.sch.id',
                'code' => 'TCH-002',
                'type' => 'homeroom',
            ],
            [
                'username' => 'andi',
                'name' => 'Andi Pratama, S.Pd., M.Hum.',
                'email' => 'andi@smauii.sch.id',
                'code' => 'TCH-003',
                'type' => 'homeroom',
            ],
            [
                'username' => 'dewi',
                'name' => 'Dwi Lestari, S.Pd., M.Si.',
                'email' => 'dewi@smauii.sch.id',
                'code' => 'TCH-004',
                'type' => 'homeroom',
            ],
            [
                'username' => 'rudi',
                'name' => 'Rudi Hermawan, S.Si., M.Pd.',
                'email' => 'rudi@smauii.sch.id',
                'code' => 'TCH-005',
                'type' => 'homeroom',
            ],
            [
                'username' => 'g_ahmad',
                'name' => 'Ahmad Fauzi, S.Pd.',
                'email' => 'ahmad.fauzi@smauii.sch.id',
                'code' => 'TCH-006',
                'type' => 'homeroom',
            ],
            [
                'username' => 'g_rina',
                'name' => 'Rina Wati, S.Pd., M.A.',
                'email' => 'rina.wati@smauii.sch.id',
                'code' => 'TCH-007',
                'type' => 'homeroom',
            ],
            [
                'username' => 'eko_n',
                'name' => 'Eko Nugroho, S.Sos., M.Pd.',
                'email' => 'eko.nugroho@smauii.sch.id',
                'code' => 'TCH-008',
                'type' => 'homeroom',
            ],
            [
                'username' => 'tri_w',
                'name' => 'Tri Wahyuni, S.E., M.M.',
                'email' => 'tri.wahyuni@smauii.sch.id',
                'code' => 'TCH-009',
                'type' => 'homeroom',
            ],
            // Guru Piket & Pengajar Mapel Khusus
            [
                'username' => 'dimas_kom',
                'name' => 'Dimas Arya, S.Kom., M.Cs.',
                'email' => 'dimas.arya@smauii.sch.id',
                'code' => 'TCH-010',
                'type' => 'duty',
            ],
            [
                'username' => 'hendra_pjok',
                'name' => 'Hendra Wijaya, S.Pd.Kor.',
                'email' => 'hendra.wijaya@smauii.sch.id',
                'code' => 'TCH-011',
                'type' => 'duty',
            ],
            [
                'username' => 'nurul_seni',
                'name' => 'Nurul Hidayati, S.Sn.',
                'email' => 'nurul.hidayati@smauii.sch.id',
                'code' => 'TCH-012',
                'type' => 'duty',
            ],
            [
                'username' => 'fitria_bk',
                'name' => 'Fitria Rahmawati, S.Psi., M.Psi.',
                'email' => 'fitria.bk@smauii.sch.id',
                'code' => 'TCH-013',
                'type' => 'duty',
            ],
            [
                'username' => 'agus_sej',
                'name' => 'Agus Prasetyo, S.Pd.',
                'email' => 'agus.prasetyo@smauii.sch.id',
                'code' => 'TCH-014',
                'type' => 'duty',
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
                    'teacher_type' => $t['type'] === 'both' ? ['duty', 'homeroom'] : [$t['type']],
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

        $guardianUsernames = [
            0 => 'wahyu',
            1 => 'sri',
            2 => 'hendro',
            3 => 'titin',
            4 => 'agus_w',
            5 => 'nurul_w',
        ];

        $guardians = collect();
        foreach ($guardianNames as $gIdx => $gName) {
            $uName = $guardianUsernames[$gIdx] ?? ('wali_' . ($gIdx + 1));

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

        // Pemetaan eksplisit untuk akun demo siswa UAT sesuai dokumen SEED-DATA-TESTING-GUIDE.md:
        $specialDemoStudents = [
            // Kelas X-A (Index 0)
            '0_1' => ['username' => 'ahmad', 'name' => 'Ahmad Reza Pahlevi', 'guardian_idx' => 0],
            '0_2' => ['username' => 'clara', 'name' => 'Clarissa Maharani', 'guardian_idx' => 1],
            '0_3' => ['username' => 'budi_s', 'name' => 'Budi Santoso', 'guardian_idx' => 2],
            '0_4' => ['username' => 'diana', 'name' => 'Diana Putri Lestari', 'guardian_idx' => 3],
            // Kelas X-B (Index 1)
            '1_1' => ['username' => 'eko', 'name' => 'Eko Prasetyo Utomo', 'guardian_idx' => 4],
            '1_2' => ['username' => 'fitri', 'name' => 'Fitri Handayani', 'guardian_idx' => 5],
            // Kelas X-C Tahfidz (Index 2)
            '2_1' => ['username' => 'irvan', 'name' => 'Muhammad Irvan Maulana', 'guardian_idx' => 6],
            // Kelas XI-MIPA 1 (Index 3)
            '3_1' => ['username' => 'miftah', 'name' => 'Miftahul Huda Jannah', 'guardian_idx' => 7],
            // Kelas XI-MIPA 2 (Index 4)
            '4_1' => ['username' => 'qori', 'name' => 'Qori Amalia Fauziah', 'guardian_idx' => 8],
            // Kelas XI-IPS 1 (Index 5)
            '5_1' => ['username' => 'utami', 'name' => 'Utami Rahayu Ningsih', 'guardian_idx' => 0],
            '5_2' => ['username' => 'vina', 'name' => 'Vina Marvina Salsabila', 'guardian_idx' => 1],
            '5_3' => ['username' => 'wawan', 'name' => 'Wawan Setiawan Aji', 'guardian_idx' => 2],
            '5_4' => ['username' => 'yoga', 'name' => 'Yoga Pratama Yudha', 'guardian_idx' => 3],
            // Kelas XI-IPS 2 (Index 6)
            '6_1' => ['username' => 'zahra', 'name' => 'Zahra Alifia Zahir', 'guardian_idx' => 4],
            '6_2' => ['username' => 'arya', 'name' => 'Arya Bagus Sudewa', 'guardian_idx' => 5],
            // Kelas XII-MIPA 1 (Index 7)
            '7_1' => ['username' => 'danang_s', 'name' => 'Danang Tri Wicaksono', 'guardian_idx' => 9],
            // Kelas XII-IPS 1 (Index 8)
            '8_1' => ['username' => 'haris_s', 'name' => 'Haris Firmansyah', 'guardian_idx' => 10],
            // Kelas XII-IPS 2 (Index 9)
            '9_1' => ['username' => 'latif_s', 'name' => 'Latif Nur Rohman', 'guardian_idx' => 11],
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

                $uName = 'siswa_' . $studentCounter;
                $nis = $nisPrefix . str_pad((string)$studentCounter, 4, '0', STR_PAD_LEFT);
                $nisn = '00' . substr((string)$birthYear, 2, 2) . str_pad((string)$studentCounter, 6, '0', STR_PAD_LEFT);

                // Cadangkan guardian index 0 s/d 74 untuk siswa, index 75 s/d 87 (13 wali) belum ditugaskan
                $availableGuardiansCount = min(75, $guardians->count());
                $guardian = $guardians[($studentCounter - 1) % $availableGuardiansCount];

                $key = "{$cIdx}_{$i}";
                if (isset($specialDemoStudents[$key])) {
                    $demo = $specialDemoStudents[$key];
                    $uName = $demo['username'];
                    $fullName = $demo['name'];
                    if (isset($guardians[$demo['guardian_idx']])) {
                        $guardian = $guardians[$demo['guardian_idx']];
                    }
                }

                // 19 siswa di Kelas XII-IPS 2 (index 9, nomor urut 5-23) dibiarkan belum memiliki wali
                // untuk menguji fungsionalitas & pagination tab 'Belum Punya Wali' di Penugasan Wali Murid
                $hasGuardian = true;
                if ($cIdx === 9 && $i >= 5 && ! isset($specialDemoStudents[$key])) {
                    $hasGuardian = false;
                }

                $birthMonth = str_pad((string)(($i % 12) + 1), 2, '0', STR_PAD_LEFT);
                $birthDay = str_pad((string)(($i * 2) % 28 + 1), 2, '0', STR_PAD_LEFT);
                $birthDate = "{$birthYear}-{$birthMonth}-{$birthDay}";

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
                        'guardian_id' => $hasGuardian ? $guardian->id : null,
                        'nis' => $nis,
                        'nisn' => $nisn,
                        'name' => $fullName,
                        'birth_date' => $birthDate,
                        'phone' => '088' . fake()->numerify('########'),
                        'address' => $hasGuardian ? $guardian->address : 'Jl. Taman Siswa No. 158, Mergangsan, Kota Yogyakarta',
                        'enrollment_year' => $enrollmentYear,
                        'status' => 'Active',
                    ],
                );
                $students->push($student);
                $studentCounter++;
            }
        }

        // B. Generate 15 Siswa UNASSIGNED (Belum Masuk Kelas) untuk Menguji Enrolment Kelas
        // 5 di antaranya (u = 11 s/d 15) juga belum memiliki wali (total 19 + 5 = 24 siswa tanpa wali)
        for ($u = 1; $u <= 15; $u++) {
            $isMale = ($u % 2 === 1);
            $fn = $isMale ? $firstNamesM[($u * 3) % count($firstNamesM)] : $firstNamesF[($u * 3) % count($firstNamesF)];
            $ln = $lastNames[($u * 4) % count($lastNames)];
            $fullName = $fn . ' ' . $ln . ' (Siswa Baru)';
            $uName = 'calon_siswa_' . $u;

            $nis = '2425' . str_pad((string)($studentCounter), 4, '0', STR_PAD_LEFT);
            $nisn = '0009' . str_pad((string)($studentCounter), 6, '0', STR_PAD_LEFT);
            $birthDate = '2009-07-' . str_pad((string)($u + 5), 2, '0', STR_PAD_LEFT);

            $hasGuardian = ($u <= 10);
            $availableGuardiansCount = min(75, $guardians->count());
            $guardian = $hasGuardian ? $guardians[($studentCounter - 1) % $availableGuardiansCount] : null;

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
                    'guardian_id' => $hasGuardian ? $guardian->id : null,
                    'nis' => $nis,
                    'nisn' => $nisn,
                    'name' => $fullName,
                    'birth_date' => $birthDate,
                    'phone' => '088' . fake()->numerify('########'),
                    'address' => $hasGuardian ? $guardian->address : 'Jl. Taman Siswa No. 158, Mergangsan, Kota Yogyakarta',
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
            // Status: Pending (14 pengajuan - menguji antrean verifikasi di Admin, Piket, dan Wali Kelas)
            ['student_idx' => 0, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 2, 'desc' => 'Sakit demam tinggi dan batuk pilek, istirahat dokter di RS UII Pandanaran.'],
            ['student_idx' => 23, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 1, 'desc' => 'Gejala tipes, disarankan dokter istirahat total di rumah.'],
            ['student_idx' => 46, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 2, 'desc' => 'Menghadiri prosesi pemakaman kakek di Magelang.'],
            ['student_idx' => 69, 'category' => 'Competition', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 3, 'desc' => 'Mewakili kontingen DIY dalam Lomba Cerdas Cermat Sains Nasional.'],
            ['student_idx' => 92, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 2, 'desc' => 'Sakit radang tenggorokan akut disertai demam.'],
            ['student_idx' => 115, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 1, 'desc' => 'Izin menghadiri acara syukuran kelulusan keluarga di Kulon Progo.'],
            ['student_idx' => 138, 'category' => 'Competition', 'status' => 'Pending', 'days_ago' => 2, 'duration' => 2, 'desc' => 'Mengikuti turnamen basket antarpelajar SMA se-Jawa Tengah & DIY.'],
            ['student_idx' => 161, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 2, 'duration' => 3, 'desc' => 'Sakit cacar air, disarankan karantina mandiri oleh puskesmas.'],
            ['student_idx' => 184, 'category' => 'Other', 'status' => 'Pending', 'days_ago' => 0, 'duration' => 1, 'desc' => 'Pengurusan visa dan paspor untuk program pertukaran pelajar.'],
            ['student_idx' => 5, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 1, 'desc' => 'Sakit maag kambuh dan muntah-muntah, istirahat dokter.'],
            ['student_idx' => 25, 'category' => 'Event', 'status' => 'Pending', 'days_ago' => 2, 'duration' => 2, 'desc' => 'Upacara adat keluarga besar di Keraton Surakarta.'],
            ['student_idx' => 48, 'category' => 'Competition', 'status' => 'Pending', 'days_ago' => 3, 'duration' => 3, 'desc' => 'Lomba karya ilmiah remaja di Universitas Gadjah Mada.'],
            ['student_idx' => 71, 'category' => 'Other', 'status' => 'Pending', 'days_ago' => 1, 'duration' => 1, 'desc' => 'Pemeriksaan kesehatan mata dan pembuatan kacamata resep dokter.'],
            ['student_idx' => 94, 'category' => 'Sick', 'status' => 'Pending', 'days_ago' => 2, 'duration' => 2, 'desc' => 'Cedera engkel saat latihan olahraga ekstrakurikuler.'],

            // Status: Approved (16 pengajuan - riwayat izin yang telah disetujui)
            ['student_idx' => 2, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 3, 'duration' => 3, 'desc' => 'Demam Berdarah (DBD), dirawat di RS PKU Muhammadiyah Kotagede.'],
            ['student_idx' => 4, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 5, 'duration' => 1, 'desc' => 'Menghadiri akad nikah kakak kandung di Solo.'],
            ['student_idx' => 6, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 7, 'duration' => 3, 'desc' => 'Mewakili SMA UII dalam Olimpiade Sains Nasional (OSN) Tingkat DIY.'],
            ['student_idx' => 10, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 12, 'duration' => 2, 'desc' => 'Acara silaturahmi keluarga tahunan ke Jawa Timur.'],
            ['student_idx' => 12, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 15, 'duration' => 2, 'desc' => 'Mengikuti Kejuaraan Futsal Pelajar Tingkat Kabupaten Bantul.'],
            ['student_idx' => 14, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 18, 'duration' => 1, 'desc' => 'Sakit flu dan radang amandel, surat istirahat terlampir.'],
            ['student_idx' => 18, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 22, 'duration' => 2, 'desc' => 'Sakit migrain parah dan vertigo, pemeriksaan dokter RS Sardjito.'],
            ['student_idx' => 27, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 8, 'duration' => 1, 'desc' => 'Izin urusan keluarga mendesak di Klaten.'],
            ['student_idx' => 29, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 11, 'duration' => 2, 'desc' => 'Lomba pidato bahasa Arab tingkat DIY-Jateng di UIN Sunan Kalijaga.'],
            ['student_idx' => 50, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 14, 'duration' => 2, 'desc' => 'Sakit demam dan batuk berdahak, istirahat dokter klinik.'],
            ['student_idx' => 73, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 17, 'duration' => 1, 'desc' => 'Mengikuti kegiatan keagamaan di Pondok Pesantren Krapyak.'],
            ['student_idx' => 96, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 20, 'duration' => 3, 'desc' => 'Olimpiade Biologi Nasional di Kampus IPB Bogor.'],
            ['student_idx' => 117, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 24, 'duration' => 1, 'desc' => 'Pencabutan gigi bungsu di RSGM UGM, perlu istirahat 1 hari.'],
            ['student_idx' => 140, 'category' => 'Event', 'status' => 'Approved', 'days_ago' => 26, 'duration' => 2, 'desc' => 'Menghadiri wisuda sarjana kakak di Universitas Diponegoro.'],
            ['student_idx' => 163, 'category' => 'Sick', 'status' => 'Approved', 'days_ago' => 28, 'duration' => 2, 'desc' => 'Sakit infeksi saluran pernapasan, istirahat dokter.'],
            ['student_idx' => 186, 'category' => 'Competition', 'status' => 'Approved', 'days_ago' => 30, 'duration' => 2, 'desc' => 'Kejuaraan renang antarpelajar tingkat provinsi DIY.'],

            // Status: Rejected (6 pengajuan - riwayat izin ditolak beserta alasan)
            ['student_idx' => 8, 'category' => 'Sick', 'status' => 'Rejected', 'days_ago' => 10, 'duration' => 1, 'desc' => 'Izin tidak masuk sekolah tanpa surat dokter yang sah.', 'reject_reason' => 'Izin tidak disertai surat keterangan dokter resmi atau bukti pendukung yang sah.'],
            ['student_idx' => 31, 'category' => 'Event', 'status' => 'Rejected', 'days_ago' => 13, 'duration' => 3, 'desc' => 'Izin berlibur bersama teman di luar masa libur sekolah.', 'reject_reason' => 'Alasan liburan pribadi saat hari efektif KBM tidak dapat disetujui sekolah.'],
            ['student_idx' => 52, 'category' => 'Other', 'status' => 'Rejected', 'days_ago' => 16, 'duration' => 1, 'desc' => 'Izin terlambat masuk karena kesiangan bangun tidur.', 'reject_reason' => 'Kategori izin tidak sesuai dan permohonan diajukan melampaui batas waktu hari H.'],
            ['student_idx' => 75, 'category' => 'Competition', 'status' => 'Rejected', 'days_ago' => 19, 'duration' => 2, 'desc' => 'Turnamen game online pribadi di luar agenda resmi sekolah.', 'reject_reason' => 'Bukan kegiatan perlombaan resmi yang terafiliasi atau direkomendasikan Disdikpora.'],
            ['student_idx' => 119, 'category' => 'Sick', 'status' => 'Rejected', 'days_ago' => 23, 'duration' => 2, 'desc' => 'Surat dokter tanggal kadaluarsa dari bulan sebelumnya.', 'reject_reason' => 'Tanggal pada surat keterangan dokter tidak sesuai dengan tanggal ketidakhadiran.'],
            ['student_idx' => 165, 'category' => 'Event', 'status' => 'Rejected', 'days_ago' => 27, 'duration' => 2, 'desc' => 'Menghadiri konser musik saat hari aktif sekolah.', 'reject_reason' => 'Kegiatan hiburan non-akademik di hari efektif sekolah tidak dapat diizinkan.'],
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
                    'rejection_reason' => $ls['reject_reason'] ?? null,
                    'document_url' => 'https://via.placeholder.com/600x800?text=Surat+Izin+' . urlencode($student->name),
                ],
            );
        }

        // ─────────────────────────────────────────────────────────────
        // 10.5 Extra Leave Requests Khusus Kelas X-A (untuk demo rekap Wali Kelas Budi Hartono)
        // ─────────────────────────────────────────────────────────────
        $this->call([LeaveRequestXASeceder::class]);

        // ─────────────────────────────────────────────────────────────
        // 11. Attendances (Presensi Realistis Sepanjang Tahun Berjalan di SMA UII Yogyakarta)
        // ─────────────────────────────────────────────────────────────
        $schoolLat = -7.814257;
        $schoolLng = 110.375944;
        $photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&h=240&q=80';

        // Preload kalender libur ke memori untuk efisiensi eksekusi
        $holidayDates = AcademicCalendar::where('is_holiday', true)
            ->pluck('holiday_date')
            ->map(fn ($d) => substr((string) $d, 0, 10))
            ->flip()
            ->toArray();

        // Loop dari awal tahun berjalan (mis. 5 Januari) hingga HARI INI (agar rekap harian wali kelas langsung terisi)
        $startDate = Carbon::create(now()->year, 1, 5);
        $endDate = now();
        $assignedStudents = $students->filter(fn ($s) => $s->class_id !== null)->values();

        $attendanceBatch = [];
        $leaveMap = LeaveRequest::whereIn('approval_status', ['Approved', 'Pending'])->get();
        $leaveDateMap = [];
        foreach ($leaveMap as $leave) {
            $curL = Carbon::parse($leave->start_date);
            $endL = Carbon::parse($leave->end_date);
            while ($curL->lte($endL)) {
                $leaveDateMap[$leave->student_id . '_' . $curL->format('Y-m-d')] = true;
                $curL->addDay();
            }
        }

        for ($current = $startDate->copy(); $current->lte($endDate); $current->addDay()) {
            if (! $this->isSchoolDay($current, $holidayDates)) {
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

                if (isset($leaveDateMap[$student->id . '_' . $dateString])) {
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
        // 11.5 Attendance Overrides (Koreksi Presensi Realistis untuk UAT)
        // ─────────────────────────────────────────────────────────────
        $overrideSamples = [
            [
                'student_idx' => 0, // Ahmad Reza Pahlevi (X-A)
                'days_ago' => 0,
                'original_status' => 'Late',
                'new_status' => 'Present',
                'reason' => 'Siswa terlambat karena ban sepeda motor bocor di Jl. Gejayan, telah melapor piket dan menyerahkan nota tambal ban.',
            ],
            [
                'student_idx' => 1, // Clarissa Maharani (X-A)
                'days_ago' => 1,
                'original_status' => 'Absent',
                'new_status' => 'Excused',
                'reason' => 'Koreksi alpa menjadi izin karena surat izin orang tua susulan telah diterima tata usaha.',
            ],
            [
                'student_idx' => 2, // Budi Santoso (X-A)
                'days_ago' => 2,
                'original_status' => 'Late',
                'new_status' => 'Present',
                'reason' => 'Mengantar adik ke fasilitas kesehatan terlebih dahulu, surat keterangan dokter puskesmas terlampir.',
            ],
            [
                'student_idx' => 23, // Eko Prasetyo (X-B)
                'days_ago' => 1,
                'original_status' => 'Absent',
                'new_status' => 'Sick',
                'reason' => 'Surat dokter RS Bethesda diserahkan langsung oleh wali murid pada jam istirahat pertama.',
            ],
            [
                'student_idx' => 46, // Muhammad Irvan (X-C)
                'days_ago' => 3,
                'original_status' => 'Late',
                'new_status' => 'Present',
                'reason' => 'Menjalankan tugas sekolah mewakili upacara hari pramuka di Kwarda DIY sebelum tiba di sekolah.',
            ],
            [
                'student_idx' => 69, // Miftahul Huda (XI-MIPA 1)
                'days_ago' => 0,
                'original_status' => 'Absent',
                'new_status' => 'Excused',
                'reason' => 'Dispensasi persiapan lomba karya tulis ilmiah remaja tingkat provinsi.',
            ],
            [
                'student_idx' => 115, // Utami Rahayu (XI-IPS 1)
                'days_ago' => 2,
                'original_status' => 'Late',
                'new_status' => 'Present',
                'reason' => 'Koreksi teknis: sinyal GPS smartphone siswa mengalami distorsi akurasi saat presensi mandiri di gerbang selatan.',
            ],
            [
                'student_idx' => 161, // Danang Tri (XII-MIPA 1)
                'days_ago' => 4,
                'original_status' => 'Absent',
                'new_status' => 'Excused',
                'reason' => 'Mewakili kontingen taekwondo DIY dalam kejurnas pelajar di GOR Popki Jakarta.',
            ],
        ];

        foreach ($overrideSamples as $ov) {
            $student = $students[$ov['student_idx']];
            $date = now()->subDays($ov['days_ago'])->toDateString();

            AttendanceOverride::updateOrCreate(
                [
                    'student_id' => $student->id,
                    'attendance_date' => $date,
                ],
                [
                    'user_id' => 1, // Admin Utama
                    'original_status' => $ov['original_status'],
                    'new_status' => $ov['new_status'],
                    'reason' => $ov['reason'],
                ],
            );
        }

        // ─────────────────────────────────────────────────────────────
        // 12. System Notifications (32 Notifikasi Lengkap untuk Multi-Role & Pagination UAT)
        // ─────────────────────────────────────────────────────────────
        $notificationList = [
            // Target Group: All (12 pengumuman sekolah)
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Pemeliharaan Server Presensi Digital',
                'content' => 'Sistem presensi akan menjalani maintenance rutin pada hari Sabtu pukul 22:00 - 24:00 WIB. Layanan akan normal kembali setelah proses selesai.',
                'created_at' => now()->subDays(1),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Upacara Peringatan Hari Kemerdekaan RI Ke-81',
                'content' => 'Seluruh civitas akademika SMA UII wajib mengikuti upacara bendera HUT RI pada 17 Agustus pukul 07:00 WIB di lapangan utama mengenakan seragam upacara lengkap.',
                'created_at' => now()->subDays(2),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Jadwal Penilaian Tengah Semester (PTS) Ganjil',
                'content' => 'PTS Ganjil tahun pelajaran 2026/2027 akan diselenggarakan mulai tanggal 15 September. Pastikan seluruh siswa mempersiapkan diri dengan baik.',
                'created_at' => now()->subDays(3),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Pemberitahuan Libur Nasional Maulid Nabi Muhammad SAW',
                'content' => 'Kegiatan belajar mengajar diliburkan dalam rangka Maulid Nabi Muhammad SAW. KBM aktif kembali pada hari berikutnya.',
                'created_at' => now()->subDays(5),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Sosialisasi Tertib Waktu & Disiplin Presensi',
                'content' => 'Mengingatkan kembali batas akhir presensi pagi adalah pukul 07:00 WIB. Siswa yang hadir setelah pukul 07:00 WIB tercatat Terlambat secara otomatis.',
                'created_at' => now()->subDays(7),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Milad Universitas Islam Indonesia (UII) Ke-83',
                'content' => 'Selamat Milad UII Ke-83. SMA UII menyelenggarakan serangkaian bakti sosial dan doa bersama di Masjid Kampus Terpadu.',
                'created_at' => now()->subDays(9),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Pelaksanaan Program Gerakan Sekolah Sehat & Bersih',
                'content' => 'Kerja bakti serentak di lingkungan kelas dan laboratorium SMA UII diadakan setiap Jumat pagi pekan pertama setiap bulannya.',
                'created_at' => now()->subDays(11),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Protokol Kesehatan & Kebersihan Lingkungan Sekolah',
                'content' => 'Siswa dan guru yang mengalami gejala demam atau flu dihimbau menggunakan masker atau beristirahat di rumah dengan surat keterangan dokter.',
                'created_at' => now()->subDays(14),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Pembaruan Fitur Geofencing Presensi Mobile',
                'content' => 'Aplikasi presensi kini mendukung radius geofence 100 meter dari titik koordinat SMA UII Yogyakarta untuk memastikan keakuratan lokasi kehadiran.',
                'created_at' => now()->subDays(16),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Kegiatan Sholat Berjamaah Dhuhur & Ashar Terjadwal',
                'content' => 'Seluruh siswa dan guru wajib mengikuti sholat berjamaah di musholla sekolah sesuai jadwal rombel yang telah ditentukan.',
                'created_at' => now()->subDays(18),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Penyelenggaraan Class Meeting & Expo Bakat Minat',
                'content' => 'Class meeting pasca ujian akan mempertandingkan futsal, basket, debat bahasa Inggris, dan tahfidz quran antarkelas.',
                'created_at' => now()->subDays(20),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'all',
                'title' => 'Laporan Rekapitulasi Presensi Bulanan Sekolah Siap',
                'content' => 'Rekap presensi seluruh rombongan belajar bulan lalu telah selesai diarsip dengan rata-rata tingkat kehadiran sekolah mencapai 95.2%.',
                'created_at' => now()->subDays(24),
            ],

            // Target Group: Teacher (8 pengumuman dinas guru & staf)
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Rapat Pleno Dewan Guru Evaluasi KBM',
                'content' => 'Undangan rapat dinas dewan guru pada Kamis pukul 13:30 WIB di Ruang Sidang Utama mengenai capaian kurikulum merdeka.',
                'created_at' => now()->subDays(1),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Batas Akhir Pengunggahan Modul Ajar Semester Ganjil',
                'content' => 'Bapak/Ibu Guru dimohon segera menyelesaikan unggah modul ajar di portal kurikulum paling lambat akhir pekan ini.',
                'created_at' => now()->subDays(3),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Pengingat Tugas Guru Piket Harian Pagi',
                'content' => 'Guru piket bertugas dimohon hadir pukul 06:15 WIB untuk menyambut kedatangan siswa di gerbang utama dan memantau log kehadiran.',
                'created_at' => now()->subDays(4),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Verifikasi Permohonan Izin & Sakit Siswa Rombel',
                'content' => 'Bapak/Ibu Wali Kelas dimohon memeriksa dan memverifikasi dokumen pengajuan izin sakit siswa di portal sebelum pukul 12:00 WIB.',
                'created_at' => now()->subDays(6),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Jadwal Supervisi Pembelajaran Akademik Guru',
                'content' => 'Jadwal pelaksanaan supervisi kelas oleh Kepala Sekolah dan Tim Penjamin Mutu telah diterbitkan di papan pengumuman ruang guru.',
                'created_at' => now()->subDays(8),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Workshop Pemanfaatan Teknologi Pembelajaran AI',
                'content' => 'Pelatihan pemanfaatan AI dalam asesmen diagnostik pembelajaran akan diadakan hari Sabtu di Laboratorium Komputer 1.',
                'created_at' => now()->subDays(10),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Pengisian Buku Jurnal Mengajar dan Presensi Kelas',
                'content' => 'Pastikan jurnal mengajar kelas terisi lengkap setiap pergantian jam pelajaran demi ketertiban administrasi dinas.',
                'created_at' => now()->subDays(13),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'teacher',
                'title' => 'Koordinasi Wali Kelas untuk Siswa Berisiko Presensi Rendah',
                'content' => 'Rapat koordinasi wali kelas dan guru BK mengenai penanganan siswa dengan akumulasi alpa di atas 3 kali pada semester berjalan.',
                'created_at' => now()->subDays(17),
            ],

            // Target Group: Student (6 pengumuman siswa)
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Pemilihan Ketua & Pengurus OSIS Periode 2026/2027',
                'content' => 'Pendaftaran bakal calon ketua OSIS SMA UII telah dibuka di ruang kesiswaan. Siapkan visi, misi, dan program kerja terbaikmu.',
                'created_at' => now()->subDays(2),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Pengembalian Buku Paket Perpustakaan Sekolah',
                'content' => 'Siswa yang masih meminjam buku paket kurikulum semester lalu harap segera mengembalikan atau memperpanjang masa pinjam.',
                'created_at' => now()->subDays(5),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Informasi Beasiswa Prestasi Akademik & Tahfidz Quran',
                'content' => 'Tersedia kuota beasiswa bagi siswa berprestasi ranking 1-3 paralel dan hafalan tahfidz minimal 3 juz. Formulir di ruang TU.',
                'created_at' => now()->subDays(8),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Pendaftaran Ekstrakurikuler Wajib & Pilihan Tahun Ini',
                'content' => 'Silakan pilih ekstrakurikuler favoritmu: Pramuka, PMR, Paskibra, Robotik, Futsal, Basket, Paduan Suara, atau Tahfidz Qur\'an.',
                'created_at' => now()->subDays(12),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Tata Tertib Penampilan & Kelengkapan Seragam Sekolah',
                'content' => 'Siswa wajib mengenakan seragam sesuai jadwal (Senin: Putih Abu-abu, Selasa: Batik SMA UII, Kamis: Pramuka) beserta atribut topi & dasi.',
                'created_at' => now()->subDays(15),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'student',
                'title' => 'Latihan Rutin Tim Paduan Suara & Petugas Upacara',
                'content' => 'Latihan intensif persiapan petugas upacara hari Senin diadakan hari Jumat pukul 15:30 WIB di aula serbaguna.',
                'created_at' => now()->subDays(21),
            ],

            // Target Group: Guardian (6 pengumuman wali murid)
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Pertemuan Orang Tua / Wali Murid Kelas X, XI, XII',
                'content' => 'Undangan silaturahmi komite sekolah dan laporan progres akademik semester ganjil pada hari Sabtu pukul 08:30 WIB di Auditorium.',
                'created_at' => now()->subDays(2),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Pemantauan Kehadiran Real-Time Ananda di Sekolah',
                'content' => 'Bapak/Ibu Wali dapat memantau jam kehadiran dan kepulangan putra/putri secara langsung melalui portal wali murid.',
                'created_at' => now()->subDays(4),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Seminar Parenting: Mendidik Karakter Remaja Era Digital',
                'content' => 'Komite SMA UII mengundang bapak/ibu wali murid menghadiri seminar parenting bersama pakar psikologi pendidikan keluarga.',
                'created_at' => now()->subDays(7),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Tata Cara Pengajuan Izin Tidak Masuk Sekolah',
                'content' => 'Bila putra/putri berhalangan hadir karena sakit atau urusan keluarga, mohon ajukan permohonan izin berlampir surat via aplikasi ini.',
                'created_at' => now()->subDays(10),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Informasi Pembayaran Iuran Komite Sekolah (IPP)',
                'content' => 'Layanan administrasi pembayaran IPP bulan berjalan dapat dilakukan melalui transfer virtual account bank syariah mitra sekolah.',
                'created_at' => now()->subDays(16),
            ],
            [
                'sender_id' => 1,
                'recipient_id' => null,
                'target_group' => 'guardian',
                'title' => 'Jadwal Konsultasi Belajar Bersama Wali Kelas & BK',
                'content' => 'Wali kelas membuka jadwal konsultasi bimbingan karir dan peminatan perkuliahan bagi orang tua siswa kelas XII.',
                'created_at' => now()->subDays(22),
            ],
        ];

        $createdNotifs = collect();
        foreach ($notificationList as $notifData) {
            $notif = Notification::create($notifData);
            $createdNotifs->push($notif);
        }

        // Seed NotificationRead untuk akun demo agar status Terbaca / Belum Terbaca realistis
        $demoUsersToMarkRead = [
            1 => [0, 1, 2, 3], // Admin Utama: membaca notifikasi index 0, 1, 2, 3
            $students[0]->user_id => [0, 1, 20, 21], // Ahmad (Siswa): membaca notif all 0, 1 dan student 20, 21
            $teachers[0]->user_id => [0, 1, 12, 13], // Budi Hartono (Guru): membaca notif all 0, 1 dan teacher 12, 13
            $guardians[0]->user_id => [0, 1, 26, 27], // Ir. Wahyu Hidayat (Wali): membaca notif all 0, 1 dan guardian 26, 27
        ];

        foreach ($demoUsersToMarkRead as $userId => $notifIdxs) {
            foreach ($notifIdxs as $nIdx) {
                if (isset($createdNotifs[$nIdx])) {
                    NotificationRead::updateOrCreate(
                        [
                            'notification_id' => $createdNotifs[$nIdx]->id,
                            'user_id' => $userId,
                        ],
                        [
                            'read_at' => now()->subHours(rand(1, 24)),
                        ],
                    );
                }
            }
        }
    }

    private function isSchoolDay(Carbon $date, array $holidayDates = []): bool
    {
        if ($date->isWeekend()) {
            return false;
        }

        if (! empty($holidayDates)) {
            return ! isset($holidayDates[$date->toDateString()]);
        }

        return ! AcademicCalendar::whereDate('holiday_date', $date->toDateString())
            ->where('is_holiday', true)
            ->exists();
    }
}
