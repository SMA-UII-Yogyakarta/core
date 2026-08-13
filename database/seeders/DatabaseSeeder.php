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
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with rich, production-grade realistic data
     * simulating the real-world environment of SMA UII Yogyakarta.
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
        // 6. Guardians (25 Profil Orang Tua / Wali Murid Realistis)
        // ─────────────────────────────────────────────────────────────
        $guardianData = [
            ['username' => 'wahyu', 'name' => 'Ir. Wahyu Hidayat, M.T.', 'email' => 'wahyu.hidayat@mail.com', 'phone' => '081223344551', 'address' => 'Jl. Kaliurang KM 14.5, Sleman, Yogyakarta'],
            ['username' => 'sri', 'name' => 'Dr. Dra. Sri Rahayu, M.Si.', 'email' => 'sri.rahayu@mail.com', 'phone' => '081324354652', 'address' => 'Jl. Sorowajan Baru No. 12, Banguntapan, Bantul'],
            ['username' => 'hendro', 'name' => 'Hendro Gunawan, S.E.', 'email' => 'hendro.gunawan@mail.com', 'phone' => '081535465753', 'address' => 'Purbayan, Kotagede, Kota Yogyakarta'],
            ['username' => 'titin', 'name' => 'Titin Supriyatin, S.Pd.', 'email' => 'titin.supriyatin@mail.com', 'phone' => '081746576854', 'address' => 'Jl. Wonosari KM 7, Baturetno, Banguntapan'],
            ['username' => 'agus_w', 'name' => 'Agus Salim, S.Kom.', 'email' => 'agus.salim@mail.com', 'phone' => '081957687955', 'address' => 'Jl. Gedongkuning No. 45, Rejowinangun, Kotagede'],
            ['username' => 'nurul_w', 'name' => 'Nurul Hidayah, S.Farm., Apt.', 'email' => 'nurul.hidayah@mail.com', 'phone' => '082168798056', 'address' => 'Jl. Glagahsari No. 18, Warungboto, Umbulharjo'],
            ['username' => 'bambang_w', 'name' => 'Dr. Bambang Widjanarko, Sp.A.', 'email' => 'bambang.widjanarko@mail.com', 'phone' => '082279809157', 'address' => 'Jl. Laksda Adisucipto KM 8, Maguwoharjo, Sleman'],
            ['username' => 'retno_w', 'name' => 'Dra. Retno Palupi', 'email' => 'retno.palupi@mail.com', 'phone' => '082380910258', 'address' => 'Jl. Kusumanegara No. 80, Mujamuju, Umbulharjo'],
            ['username' => 'yusuf_w', 'name' => 'Yusuf Mansur, S.T.', 'email' => 'yusuf.mansur@mail.com', 'phone' => '082491021359', 'address' => 'Jl. Janti Gg. Gemak No. 102, Caturtunggal, Depok, Sleman'],
            ['username' => 'anita_w', 'name' => 'Anita Kusuma, S.Sos.', 'email' => 'anita.kusuma@mail.com', 'phone' => '082502132460', 'address' => 'Jl. Magelang KM 5, Mlati, Sleman'],
            ['username' => 'surya_w', 'name' => 'Surya Kencana, S.H., M.Kn.', 'email' => 'surya.kencana@mail.com', 'phone' => '082613243561', 'address' => 'Jl. Tamansiswa No. 110, Mergangsan, Kota Yogyakarta'],
            ['username' => 'maya_w', 'name' => 'Maya Indraswari, S.E.', 'email' => 'maya.indraswari@mail.com', 'phone' => '082724354662', 'address' => 'Jl. Ring Road Selatan, Sewon, Bantul'],
            ['username' => 'ferry_w', 'name' => 'Ferry Setiawan, S.Si.', 'email' => 'ferry.setiawan@mail.com', 'phone' => '082835465763', 'address' => 'Jl. Imogiri Timur KM 6, Banguntapan, Bantul'],
            ['username' => 'dewi_kartika', 'name' => 'Dewi Kartika, S.Pd.', 'email' => 'dewi.kartika@mail.com', 'phone' => '082946576864', 'address' => 'Jl. Veteran No. 33, Pandeyan, Umbulharjo'],
            ['username' => 'ridwan_w', 'name' => 'Ridwan Kamil, M.Eng.', 'email' => 'ridwan.kamil@mail.com', 'phone' => '083057687965', 'address' => 'Jl. Seturan Raya No. 9, Kledokan, Depok, Sleman'],
            ['username' => 'farida_w', 'name' => 'Farida Nuraini, S.Ag.', 'email' => 'farida.nuraini@mail.com', 'phone' => '083168798066', 'address' => 'Perumahan Sorowajan Indah Blok B-4, Banguntapan'],
            ['username' => 'lukman_w', 'name' => 'Lukman Hakim, S.E., Ak.', 'email' => 'lukman.hakim@mail.com', 'phone' => '083279809167', 'address' => 'Jl. Balirejo No. 25, Muja Muju, Umbulharjo'],
            ['username' => 'ratna_w', 'name' => 'Ratna Sari Dewi, S.Ked.', 'email' => 'ratna.dewi@mail.com', 'phone' => '083380910268', 'address' => 'Jl. Babarsari No. 14, Tambakbayan, Caturtunggal'],
            ['username' => 'gunawan_w', 'name' => 'Gunawan Wibisono, S.H.', 'email' => 'gunawan.wibisono@mail.com', 'phone' => '083491021369', 'address' => 'Jl. Rejowinangun No. 67, Kotagede, Kota Yogyakarta'],
            ['username' => 'triana_w', 'name' => 'Triana Puspitasari, S.Psi.', 'email' => 'triana.puspita@mail.com', 'phone' => '083502132470', 'address' => 'Jl. Wirosaban No. 10, Sorosutan, Umbulharjo'],
        ];

        $guardians = collect();
        foreach ($guardianData as $g) {
            $user = User::updateOrCreate(
                ['username' => $g['username']],
                [
                    'name' => $g['name'],
                    'email' => $g['email'],
                    'role' => 'guardian',
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('guardian');

            $guardian = Guardian::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'phone' => $g['phone'],
                    'address' => $g['address'],
                ],
            );
            $guardians->push($guardian);
        }

        // ─────────────────────────────────────────────────────────────
        // 7. Students (40 Siswa Realistis Terbagi di 10 Kelas)
        // ─────────────────────────────────────────────────────────────
        $studentList = [
            // Kelas X-A (Fase E - 1)
            ['username' => 'ahmad', 'name' => 'Ahmad Reza Pahlevi', 'gender' => 'L', 'class_idx' => 0, 'guardian_idx' => 0, 'nis' => '24250001', 'nisn' => '0081234501', 'birth' => '2009-04-12'],
            ['username' => 'clara', 'name' => 'Clarissa Maharani', 'gender' => 'P', 'class_idx' => 0, 'guardian_idx' => 1, 'nis' => '24250002', 'nisn' => '0081234502', 'birth' => '2009-08-23'],
            ['username' => 'budi_s', 'name' => 'Budi Santoso', 'gender' => 'L', 'class_idx' => 0, 'guardian_idx' => 2, 'nis' => '24250003', 'nisn' => '0081234503', 'birth' => '2009-01-15'],
            ['username' => 'diana', 'name' => 'Diana Putri Lestari', 'gender' => 'P', 'class_idx' => 0, 'guardian_idx' => 3, 'nis' => '24250004', 'nisn' => '0081234504', 'birth' => '2009-11-04'],

            // Kelas X-B (Fase E - 2)
            ['username' => 'eko', 'name' => 'Eko Prasetyo Utomo', 'gender' => 'L', 'class_idx' => 1, 'guardian_idx' => 4, 'nis' => '24250005', 'nisn' => '0081234505', 'birth' => '2009-03-18'],
            ['username' => 'fitri', 'name' => 'Fitri Handayani', 'gender' => 'P', 'class_idx' => 1, 'guardian_idx' => 5, 'nis' => '24250006', 'nisn' => '0081234506', 'birth' => '2009-05-20'],
            ['username' => 'gilang', 'name' => 'Gilang Ramadhan Permana', 'gender' => 'L', 'class_idx' => 1, 'guardian_idx' => 6, 'nis' => '24250007', 'nisn' => '0081234507', 'birth' => '2009-09-09'],
            ['username' => 'hani', 'name' => 'Hani Nurjanah', 'gender' => 'P', 'class_idx' => 1, 'guardian_idx' => 7, 'nis' => '24250008', 'nisn' => '0081234508', 'birth' => '2009-12-14'],

            // Kelas X-C (Fase E - Tahfidz)
            ['username' => 'irvan', 'name' => 'Muhammad Irvan Maulana', 'gender' => 'L', 'class_idx' => 2, 'guardian_idx' => 8, 'nis' => '24250009', 'nisn' => '0081234509', 'birth' => '2009-02-28'],
            ['username' => 'julia', 'name' => 'Julia Safitri Wardhani', 'gender' => 'P', 'class_idx' => 2, 'guardian_idx' => 9, 'nis' => '24250010', 'nisn' => '0081234510', 'birth' => '2009-07-07'],
            ['username' => 'krisna', 'name' => 'Krisna Aditya Nugraha', 'gender' => 'L', 'class_idx' => 2, 'guardian_idx' => 10, 'nis' => '24250011', 'nisn' => '0081234511', 'birth' => '2009-06-19'],
            ['username' => 'lisa', 'name' => 'Lisa Aryani Dewi', 'gender' => 'P', 'class_idx' => 2, 'guardian_idx' => 11, 'nis' => '24250012', 'nisn' => '0081234512', 'birth' => '2009-10-30'],

            // Kelas XI-MIPA 1 (Fase F - Sains 1)
            ['username' => 'miftah', 'name' => 'Miftahul Huda Jannah', 'gender' => 'P', 'class_idx' => 3, 'guardian_idx' => 12, 'nis' => '23240001', 'nisn' => '0071234601', 'birth' => '2008-03-22'],
            ['username' => 'nindi', 'name' => 'Nindi Lestari Ningrum', 'gender' => 'P', 'class_idx' => 3, 'guardian_idx' => 13, 'nis' => '23240002', 'nisn' => '0071234602', 'birth' => '2008-06-15'],
            ['username' => 'okta', 'name' => 'Oktafian Dwi Cahyo', 'gender' => 'L', 'class_idx' => 3, 'guardian_idx' => 14, 'nis' => '23240003', 'nisn' => '0071234603', 'birth' => '2008-10-10'],
            ['username' => 'putri', 'name' => 'Putri Ayu Maharani', 'gender' => 'P', 'class_idx' => 3, 'guardian_idx' => 15, 'nis' => '23240004', 'nisn' => '0071234604', 'birth' => '2008-01-08'],

            // Kelas XI-MIPA 2 (Fase F - Sains 2)
            ['username' => 'qori', 'name' => 'Qori Amalia Fauziah', 'gender' => 'P', 'class_idx' => 4, 'guardian_idx' => 16, 'nis' => '23240005', 'nisn' => '0071234605', 'birth' => '2008-04-17'],
            ['username' => 'reza', 'name' => 'Reza Fahlevi Pratama', 'gender' => 'L', 'class_idx' => 4, 'guardian_idx' => 17, 'nis' => '23240006', 'nisn' => '0071234606', 'birth' => '2008-09-03'],
            ['username' => 'sari', 'name' => 'Sari Dewi Anggraini', 'gender' => 'P', 'class_idx' => 4, 'guardian_idx' => 18, 'nis' => '23240007', 'nisn' => '0071234607', 'birth' => '2008-07-25'],
            ['username' => 'taufik', 'name' => 'Taufik Hidayatullah', 'gender' => 'L', 'class_idx' => 4, 'guardian_idx' => 19, 'nis' => '23240008', 'nisn' => '0071234608', 'birth' => '2008-11-29'],

            // Kelas XI-IPS 1 (Fase F - Sosial 1)
            ['username' => 'utami', 'name' => 'Utami Rahayu Ningsih', 'gender' => 'P', 'class_idx' => 5, 'guardian_idx' => 0, 'nis' => '23240009', 'nisn' => '0071234609', 'birth' => '2008-02-14'],
            ['username' => 'vina', 'name' => 'Vina Marvina Salsabila', 'gender' => 'P', 'class_idx' => 5, 'guardian_idx' => 1, 'nis' => '23240010', 'nisn' => '0071234610', 'birth' => '2008-08-18'],
            ['username' => 'wawan', 'name' => 'Wawan Setiawan Aji', 'gender' => 'L', 'class_idx' => 5, 'guardian_idx' => 2, 'nis' => '23240011', 'nisn' => '0071234611', 'birth' => '2008-12-05'],
            ['username' => 'yoga', 'name' => 'Yoga Pratama Yudha', 'gender' => 'L', 'class_idx' => 5, 'guardian_idx' => 3, 'nis' => '23240012', 'nisn' => '0071234612', 'birth' => '2008-05-31'],

            // Kelas XI-IPS 2 (Fase F - Sosial 2)
            ['username' => 'zahra', 'name' => 'Zahra Alifia Zahir', 'gender' => 'P', 'class_idx' => 6, 'guardian_idx' => 4, 'nis' => '23240013', 'nisn' => '0071234613', 'birth' => '2008-03-09'],
            ['username' => 'arya_s', 'name' => 'Arya Bagus Sudewa', 'gender' => 'L', 'class_idx' => 6, 'guardian_idx' => 5, 'nis' => '23240014', 'nisn' => '0071234614', 'birth' => '2008-07-12'],
            ['username' => 'bella_s', 'name' => 'Bella Safira Puspita', 'gender' => 'P', 'class_idx' => 6, 'guardian_idx' => 6, 'nis' => '23240015', 'nisn' => '0071234615', 'birth' => '2008-09-27'],
            ['username' => 'candra_s', 'name' => 'Candra Wijaya Kusuma', 'gender' => 'L', 'class_idx' => 6, 'guardian_idx' => 7, 'nis' => '23240016', 'nisn' => '0071234616', 'birth' => '2008-11-16'],

            // Kelas XII-MIPA 1 (Tingkat Akhir Sains 1)
            ['username' => 'danang_s', 'name' => 'Danang Tri Wicaksono', 'gender' => 'L', 'class_idx' => 7, 'guardian_idx' => 8, 'nis' => '22230001', 'nisn' => '0061234701', 'birth' => '2007-01-20'],
            ['username' => 'elisa_s', 'name' => 'Elisa Rahmawati', 'gender' => 'P', 'class_idx' => 7, 'guardian_idx' => 9, 'nis' => '22230002', 'nisn' => '0061234702', 'birth' => '2007-04-14'],
            ['username' => 'fajar_s', 'name' => 'Fajar Sidik Permana', 'gender' => 'L', 'class_idx' => 7, 'guardian_idx' => 10, 'nis' => '22230003', 'nisn' => '0061234703', 'birth' => '2007-08-08'],
            ['username' => 'gita_s', 'name' => 'Gita Gutawa Putri', 'gender' => 'P', 'class_idx' => 7, 'guardian_idx' => 11, 'nis' => '22230004', 'nisn' => '0061234704', 'birth' => '2007-12-01'],

            // Kelas XII-IPS 1 (Tingkat Akhir Sosial 1)
            ['username' => 'haris_s', 'name' => 'Haris Firmansyah', 'gender' => 'L', 'class_idx' => 8, 'guardian_idx' => 12, 'nis' => '22230005', 'nisn' => '0061234705', 'birth' => '2007-02-11'],
            ['username' => 'intan_s', 'name' => 'Intan Permata Sari', 'gender' => 'P', 'class_idx' => 8, 'guardian_idx' => 13, 'nis' => '22230006', 'nisn' => '0061234706', 'birth' => '2007-05-24'],
            ['username' => 'joko_s', 'name' => 'Joko Susilo Hadiningrat', 'gender' => 'L', 'class_idx' => 8, 'guardian_idx' => 14, 'nis' => '22230007', 'nisn' => '0061234707', 'birth' => '2007-09-17'],
            ['username' => 'kurnia_s', 'name' => 'Kurnia Melati Putri', 'gender' => 'P', 'class_idx' => 8, 'guardian_idx' => 15, 'nis' => '22230008', 'nisn' => '0061234708', 'birth' => '2007-10-05'],

            // Kelas XII-IPS 2 (Tingkat Akhir Sosial 2)
            ['username' => 'latif_s', 'name' => 'Latif Nur Rohman', 'gender' => 'L', 'class_idx' => 9, 'guardian_idx' => 16, 'nis' => '22230009', 'nisn' => '0061234709', 'birth' => '2007-03-30'],
            ['username' => 'megawati_s', 'name' => 'Megawati Sukmawati', 'gender' => 'P', 'class_idx' => 9, 'guardian_idx' => 17, 'nis' => '22230010', 'nisn' => '0061234710', 'birth' => '2007-06-21'],
            ['username' => 'naufal_s', 'name' => 'Naufal Rizky Ramadhan', 'gender' => 'L', 'class_idx' => 9, 'guardian_idx' => 18, 'nis' => '22230011', 'nisn' => '0061234711', 'birth' => '2007-07-19'],
            ['username' => 'oliv_s', 'name' => 'Olivia Putri Anggraini', 'gender' => 'P', 'class_idx' => 9, 'guardian_idx' => 19, 'nis' => '22230012', 'nisn' => '0061234712', 'birth' => '2007-11-28'],
        ];

        $students = collect();
        foreach ($studentList as $s) {
            $user = User::updateOrCreate(
                ['username' => $s['username']],
                [
                    'name' => $s['name'],
                    'email' => $s['username'] . '@siswa.smauii.sch.id',
                    'role' => 'student',
                    'password' => bcrypt('password'),
                ],
            );
            $user->assignRole('student');

            $class = $classes[$s['class_idx']];
            $guardian = $guardians[$s['guardian_idx']];
            $enrollmentYear = (int) substr($s['nis'], 0, 2) + 2000;

            $student = Student::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'class_id' => $class->id,
                    'guardian_id' => $guardian->id,
                    'nis' => $s['nis'],
                    'nisn' => $s['nisn'],
                    'name' => $s['name'],
                    'birth_date' => $s['birth'],
                    'phone' => '088' . fake()->numerify('########'),
                    'address' => $guardian->address,
                    'enrollment_year' => $enrollmentYear,
                    'status' => 'Active',
                ],
            );
            $students->push($student);
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
        // 11. Attendances (Presensi Realistis 30 Hari Terakhir di SMA UII)
        // ─────────────────────────────────────────────────────────────
        // Koordinat SMA UII Yogyakarta (Sorowajan Baru, Banguntapan, Bantul):
        $schoolLat = -7.797061;
        $schoolLng = 110.399583;

        // Loop 30 hari ke belakang
        for ($daysAgo = 29; $daysAgo >= 0; $daysAgo--) {
            $date = now()->subDays($daysAgo);
            $dayName = $date->format('l');

            // Hanya hari sekolah aktif (Senin - Jumat)
            if (in_array($dayName, ['Saturday', 'Sunday'])) {
                continue;
            }

            $dateString = $date->format('Y-m-d');

            foreach ($students as $idx => $student) {
                // Pola probabilistik kehadiran realistis:
                // 82% Hadir Tepat Waktu (Present), 10% Terlambat (Late), 8% Sakit/Izin/Alpha
                $prob = ($idx * 7 + $daysAgo * 13) % 100;

                // Cek apakah siswa sedang izin/sakit pada tanggal ini
                $hasApprovedLeave = LeaveRequest::where('student_id', $student->id)
                    ->where('approval_status', 'Approved')
                    ->whereDate('start_date', '<=', $dateString)
                    ->whereDate('end_date', '>=', $dateString)
                    ->exists();

                if ($hasApprovedLeave) {
                    // Siswa sakit/izin yang disetujui tidak membuat record attendance
                    continue;
                }

                if ($prob < 82) {
                    // HADIR TEPAT WAKTU (06:35 - 06:55)
                    $minute = str_pad((string) (35 + ($idx % 20)), 2, '0', STR_PAD_LEFT);
                    $second = str_pad((string) (($idx * 11) % 60), 2, '0', STR_PAD_LEFT);

                    Attendance::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'attendance_date' => $dateString,
                        ],
                        [
                            'check_in_time' => "06:{$minute}:{$second}",
                            'latitude' => $schoolLat + (fake()->numberBetween(-15, 15) / 100000),
                            'longitude' => $schoolLng + (fake()->numberBetween(-15, 15) / 100000),
                            'photo_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&h=240&q=80',
                            'status' => 'Present',
                        ],
                    );
                } elseif ($prob < 92) {
                    // TERLAMBAT (07:05 - 07:22)
                    $minute = str_pad((string) (5 + ($idx % 18)), 2, '0', STR_PAD_LEFT);
                    $second = str_pad((string) (($idx * 13) % 60), 2, '0', STR_PAD_LEFT);

                    Attendance::updateOrCreate(
                        [
                            'student_id' => $student->id,
                            'attendance_date' => $dateString,
                        ],
                        [
                            'check_in_time' => "07:{$minute}:{$second}",
                            'latitude' => $schoolLat + (fake()->numberBetween(-20, 20) / 100000),
                            'longitude' => $schoolLng + (fake()->numberBetween(-20, 20) / 100000),
                            'photo_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&h=240&q=80',
                            'status' => 'Late',
                        ],
                    );
                }
                // Sisa 8%: Tidak presensi (Alpha)
            }
        }

        // ─────────────────────────────────────────────────────────────
        // 12. System Notifications (Broadcast & Role-Targeted)
        // ─────────────────────────────────────────────────────────────
        $notifications = [
            [
                'target_group' => 'all',
                'title' => 'Peringatan Milad UII Ke-83 & Hari Libur Akademik',
                'content' => 'Diberitahukan kepada seluruh bapak/ibu guru, siswa-siswi, dan wali murid bahwa dalam rangka Milad Universitas Islam Indonesia (UII) ke-83, kegiatan belajar mengajar ditiadakan.',
            ],
            [
                'target_group' => 'guardian',
                'title' => 'Laporan Rekapitulasi Presensi Bulanan Siswa Telah Tersedia',
                'content' => 'Bapak/Ibu Wali Murid dapat memantau grafik rekapitulasi kehadiran putra/putri tercinta pada menu Riwayat Presensi di portal SMA UII.',
            ],
            [
                'target_group' => 'teacher',
                'title' => 'Pengingat Jadwal Piket & Monitoring Presensi Siswa',
                'content' => 'Bapak/Ibu Guru Piket dimohon untuk melakukan monitoring dan konfirmasi presensi harian siswa melalui menu Dashboard Piket sebelum pukul 08:00 WIB.',
            ],
            [
                'target_group' => 'student',
                'title' => 'Informasi Pelaksanaan Penilaian Tengah Semester (PTS)',
                'content' => 'Persiapkan diri kalian untuk menghadapi PTS Ganjil. Pastikan hadir tepat waktu di sekolah dan presensi menggunakan kamera selfie sebelum pukul 07:00 WIB.',
            ],
        ];

        $adminUser = User::where('username', 'admin')->first();

        foreach ($notifications as $notif) {
            Notification::firstOrCreate(
                ['title' => $notif['title']],
                [
                    'sender_id' => $adminUser?->id,
                    'target_group' => $notif['target_group'],
                    'content' => $notif['content'],
                ],
            );
        }
    }
}
