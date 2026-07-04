# Master Plan — SMART Absen SMA UII

> Rev: 1.0 | Last Updated: 2026-07-04
> Source: docs/ + brief/ dari monorepo smauii-aksesekolah

---

## DAFTAR ISI

1. [Gambaran Proyek](#1-gambaran-proyek)
2. [Teknologi](#2-teknologi)
3. [Skema Database](#3-skema-database)
4. [Endpoint & Routes](#4-endpoint--routes)
5. [Arsitektur](#5-arsitektur)
6. [Fitur & Modul](#6-fitur--modul)
7. [Functional Requirements (F-01 s/d F-14)](#7-functional-requirements)
8. [Non-Functional Requirements (NF-01 s/d NF-12)](#8-non-functional-requirements)
9. [Role & Permission Matrix](#9-role--permission-matrix)
10. [Triple-Layer Validation Detail](#10-triple-layer-validation-detail)
11. [13 Interface (P0 / P1)](#11-13-interface-p0--p1)
12. [Gap Analysis: Codebase vs Requirement](#12-gap-analysis)
13. [Phased Implementation Plan](#13-phased-implementation-plan)
14. [Key Technical Decisions](#14-key-technical-decisions)
15. [Referensi File](#15-referensi-file)

---

## 1. Gambaran Proyek

**SMART Absen SMA UII** adalah sistem absensi digital berbasis web untuk SMA UII Yogyakarta.

### Target
- **750+** concurrent users pada peak time (06:30-07:00 WIB)
- Foto kompresi **max 20 KB** per siswa
- **Total payload** ~15.2 MB untuk 760 siswa simultan

### Tim
| Person | Role |
|---|---|
| sandikodev | Project Manager & Lead Developer |
| Ahmad Hanif Hasan | Document Developer |
| Fathan Mubina | Junior Frontend Developer (Inertia/React/TS) |
| Ihsan | Junior Backend Developer (Laravel/PostgreSQL) |
| Azis | Learning Mentor |

### Budget: Rp 8.500.000
| Komponen | Biaya |
|---|---|
| Database Architecture & SSO | Rp 1.800.000 |
| Core Attendance Module | Rp 1.500.000 |
| Admin & Master Data | Rp 1.000.000 |
| Duty Teacher & Homeroom Teacher | Rp 1.000.000 |
| Student & Guardian UI/UX | Rp 1.150.000 |
| Object Storage (1 tahun) | Rp 850.000 |
| Server Setup & Deployment | Rp 1.200.000 |

### Timeline: 8 Minggu
| Week | Aktivitas |
|---|---|
| 1 | ✅ Requirement Analysis |
| 2 | Wireframing & ERD |
| 3 | SSO Integration & Server Setup |
| 4 | Admin Dashboard (CRUD, Enrolment) |
| 5 | Attendance Module (WebRTC, Geolocation, Triple-Layer) |
| 6 | Duty Teacher & Integration |
| 7 | Reports & Testing |
| 8 | Bug Fixing, UAT, Deploy, Training |

---

## 2. Teknologi

### Backend
| Teknologi | Versi | Catatan |
|---|---|---|
| PHP | 8.4.22 NTS | Laragon, VS17 x64 |
| Laravel | 13.x | Framework |
| PostgreSQL | 16 | Production (NeonDB) |
| SQLite | — | Testing (in-memory) |
| Redis | — | Cache & Queue |
| Composer | — | PHP package manager |

### Frontend
| Teknologi | Versi | Catatan |
|---|---|---|
| React | 19.x | UI library |
| InertiaJS | 3.x | Server-driven SPA |
| TypeScript | 5.7 | Static typing |
| Tailwind CSS | 4.x | Utility CSS |
| Vite | 8.x | Bundler |
| Bun | — | Package manager (bukan npm) |

### Packages Penting
| Package | Fungsi |
|---|---|
| `laravel/sanctum` | SSO + API token auth |
| `spatie/laravel-permission` | RBAC (4 role) |
| `pusher/pusher-php-server ^7.2` | Real-time broadcasting |
| `openspout/openspout ^5.7` | Import Excel XLSX/XLS/CSV |
| `laravel-echo ^2.3` | Frontend broadcasting |
| `pusher-js ^8.5` | Pusher JS client |
| `react-icons ^5.7` | Icon library |

### Infrastruktur
| Komponen | Spesifikasi |
|---|---|
| VPS | 4 Core, 8GB RAM, 100GB SSD, 1Gbps |
| OS | Ubuntu 24.04 |
| Web Server | Nginx + PHP-FPM |
| Database | NeonDB (serverless PostgreSQL) |
| Object Storage | S3-compatible (Wasabi/Backblaze B2/Cloudflare R2/MinIO) |
| PHP-FPM | pm.max_children=150 |
| PostgreSQL | max_connections=200, shared_buffers=1GB |

---

## 3. Skema Database

### A. Core Tables

#### `users`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| username | varchar(50) | UNIQUE, NOT NULL |
| name | varchar(255) | NOT NULL |
| email | varchar(100) | UNIQUE, nullable |
| email_verified_at | timestamp | nullable |
| password | varchar(255) | NOT NULL |
| role | varchar(20) | NOT NULL (admin/student/teacher/guardian) |
| remember_token | varchar(100) | nullable |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `guardians`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| user_id | bigint | FK→users(id) ON DELETE CASCADE |
| name | varchar(100) | NOT NULL |
| phone | varchar(20) | nullable |
| address | text | nullable |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `teachers`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| user_id | bigint | FK→users(id) ON DELETE CASCADE |
| name | varchar(100) | NOT NULL |
| teacher_code | varchar(20) | UNIQUE, NOT NULL |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `school_classes`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| teacher_id | bigint nullable | FK→teachers(id) ON DELETE SET NULL |
| name | varchar(50) | NOT NULL |
| level | varchar(10) | default 'X' (X, XI, XII) |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `students`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| user_id | bigint | FK→users(id) ON DELETE CASCADE |
| class_id | bigint | FK→school_classes(id) ON DELETE SET NULL |
| nis | varchar(30) | UNIQUE, NOT NULL |
| nisn | varchar(30) | UNIQUE, NOT NULL |
| name | varchar(100) | NOT NULL, indexed |
| birth_date | date | NOT NULL |
| phone | varchar(20) | nullable |
| address | text | nullable |
| enrollment_year | year(4) | NOT NULL |
| status | varchar(20) | NOT NULL (Active/Inactive), indexed |
| guardian_id | bigint nullable | FK→guardians(id) ON DELETE SET NULL |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### B. Transaction Tables

#### `attendances`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| student_id | bigint | FK→students(id) ON DELETE CASCADE |
| attendance_date | date | indexed (renamed from `tanggal`) |
| check_in_time | time | NOT NULL |
| latitude | varchar(20) | NOT NULL |
| longitude | varchar(20) | NOT NULL |
| photo_url | varchar(500) | NOT NULL (URL ke Object Storage) |
| status | varchar(20) | NOT NULL (Present/Late/Absent), indexed |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

**Index**: `(student_id, attendance_date)` composite unique

#### `leave_requests`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| student_id | bigint | FK→students(id) ON DELETE CASCADE, indexed |
| guardian_id | bigint | FK→guardians(id) ON DELETE CASCADE |
| category | varchar(20) | NOT NULL (Sick/Event/Competition/Other) |
| start_date | date | NOT NULL |
| end_date | date | NOT NULL |
| document_url | varchar(500) | nullable (URL ke Object Storage) |
| approval_status | varchar(20) | indexed (Pending/Approved/Rejected) |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `duty_schedules`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| teacher_id | bigint | FK→teachers(id) ON DELETE CASCADE, indexed |
| duty_day | varchar(20) | indexed (Monday/Tuesday/Wednesday/Thursday/Friday) |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### C. Configuration Tables

#### `attendance_time_settings`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| day | varchar(20) | NOT NULL (Monday..Saturday) |
| check_in_open | time | NOT NULL |
| late_threshold | time | NOT NULL |
| check_in_close | time | NOT NULL |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

#### `academic_calendars`
| Kolom | Tipe | Constraint |
|---|---|---|
| id | bigint PK | auto-increment |
| holiday_date | date | NOT NULL |
| description | varchar(200) | nullable |
| is_holiday | boolean | NOT NULL |
| created_at | timestamp | nullable |
| updated_at | timestamp | nullable |

### D. Entity Relationships

```
users ──hasOne──> students, teachers, guardians
students ──belongsTo──> users, school_classes, guardians
students ──hasMany──> attendances, leave_requests
teachers ──belongsTo──> users
teachers ──hasMany──> school_classes, duty_schedules
guardians ──belongsTo──> users
guardians ──hasMany──> students, leave_requests
school_classes ──belongsTo──> teachers (nullable)
school_classes ──hasMany──> students
leave_requests ──belongsTo──> students, guardians
duty_schedules ──belongsTo──> teachers
attendances ──belongsTo──> students
```

---

## 4. Endpoint & Routes

### Web Routes (Inertia) — Session Auth

#### Public
| Method | URI | Controller | Name |
|---|---|---|---|
| GET | `/` | Inertia::render('Welcome') | — |
| GET | `/login` | AuthController@login | login |
| POST | `/login` | AuthController@authenticate | login.authenticate |
| POST | `/logout` | AuthController@logout | logout |

#### Admin (`middleware: auth, role:admin`)
| Method | URI | Controller | Name |
|---|---|---|---|
| GET | /dashboard | DashboardController@index | dashboard |
| GET | /admin/data-master | StudentController@index | admin.data-master |
| POST | /admin/data-master/siswa | StudentController@store | admin.data-master.siswa.store |
| PATCH | /admin/data-master/siswa/{student} | StudentController@update | admin.data-master.siswa.update |
| DELETE | /admin/data-master/siswa/{student} | StudentController@destroy | admin.data-master.siswa.destroy |
| PATCH | /admin/data-master/siswa/{student}/toggle-status | StudentController@toggleStatus | admin.data-master.siswa.toggle |
| GET | /admin/data-master/guru | TeacherController@index | admin.data-master.guru |
| POST | /admin/data-master/guru | TeacherController@store | admin.data-master.guru.store |
| PATCH | /admin/data-master/guru/{teacher} | TeacherController@update | admin.data-master.guru.update |
| DELETE | /admin/data-master/guru/{teacher} | TeacherController@destroy | admin.data-master.guru.destroy |
| GET | /admin/data-master/kelas | SchoolClassController@index | admin.data-master.kelas |
| POST | /admin/data-master/kelas | SchoolClassController@store | admin.data-master.kelas.store |
| PATCH | /admin/data-master/kelas/{schoolClass} | SchoolClassController@update | admin.data-master.kelas.update |
| DELETE | /admin/data-master/kelas/{schoolClass} | SchoolClassController@destroy | admin.data-master.kelas.destroy |
| GET | /admin/data-master/wali | GuardianController@index | admin.data-master.wali |
| POST | /admin/data-master/wali | GuardianController@store | admin.data-master.wali.store |
| PATCH | /admin/data-master/wali/{guardian} | GuardianController@update | admin.data-master.wali.update |
| DELETE | /admin/data-master/wali/{guardian} | GuardianController@destroy | admin.data-master.wali.destroy |
| GET | /admin/monitoring | AttendanceController@monitoring | admin.monitoring |
| GET | /admin/verifikasi-izin | LeaveRequestController@verification | admin.verifikasi-izin |
| PATCH | /admin/verifikasi-izin/{id}/approve | LeaveRequestController@approve | admin.verifikasi-izin.approve |
| PATCH | /admin/verifikasi-izin/{id}/reject | LeaveRequestController@reject | admin.verifikasi-izin.reject |
| GET | /admin/pengajuan-izin | LeaveRequestViewController@index | admin.pengajuan-izin |
| GET | /admin/master-kelas | SchoolClassController@masterIndex | admin.master-kelas |
| POST | /admin/master-kelas | SchoolClassController@store | admin.master-kelas.store |
| PUT | /admin/master-kelas/{id} | SchoolClassController@update | admin.master-kelas.update |
| DELETE | /admin/master-kelas/{id} | SchoolClassController@destroy | admin.master-kelas.destroy |
| GET | /admin/rekap-bulanan | RekapBulananController@index | admin.rekap-bulanan |
| GET | /admin/rekap-harian | RekapHarianController@index | admin.rekap-harian |
| GET | /admin/enrolment-kelas | EnrolmentKelasController@index | admin.enrolment-kelas |
| POST | /admin/enrolment-kelas/assign | EnrolmentKelasController@assignStudent | admin.enrolment-kelas.assign |
| DELETE | /admin/enrolment-kelas/remove/{student} | EnrolmentKelasController@removeStudent | admin.enrolment-kelas.remove |
| GET | /admin/jadwal-piket | DutyScheduleController@index | admin.jadwal-piket |
| POST | /admin/jadwal-piket | DutyScheduleController@store | admin.jadwal-piket.store |
| PATCH | /admin/jadwal-piket/{id} | DutyScheduleController@update | admin.jadwal-piket.update |
| DELETE | /admin/jadwal-piket/{id} | DutyScheduleController@destroy | admin.jadwal-piket.destroy |
| GET | /admin/pengaturan | AttendanceSettingController@index | admin.pengaturan |
| POST | /admin/pengaturan/time-settings | AttendanceSettingController@updateTimeSettings | admin.pengaturan.time-settings |
| POST | /admin/pengaturan/holidays | AttendanceSettingController@storeHoliday | admin.pengaturan.holidays.store |
| DELETE | /admin/pengaturan/holidays/{id} | AttendanceSettingController@deleteHoliday | admin.pengaturan.holidays.delete |

#### Role Pages (login-based redirect, not explicit in web.php)
| Role | Pages |
|---|---|
| Guru | /guru/piket, /guru/wali-kelas |
| Siswa | /siswa/dashboard, /siswa/live-presensi, /siswa/live-presensi/checkin, /siswa/riwayat |
| Wali Murid | /wali-murid/pengajuan-izin, /wali-murid/pengajuan-izin/store |

### API Routes (Sanctum) — Token Auth

#### Public
| Method | URI | Controller | Notes |
|---|---|---|---|
| POST | /api/log-client-error | ClientLogController@__invoke | throttle:60,1 |
| POST | /api/login | AuthController@login | api.login |

#### Authenticated (`middleware: auth:sanctum`)
| Method | URI | Controller |
|---|---|---|
| POST | /api/logout | AuthController@logout |
| GET | /api/user | AuthController@user |
| GET/POST | /api/students | StudentController@apiResource |
| GET/PUT/DELETE | /api/students/{id} | StudentController@apiResource |
| GET/POST | /api/teachers | TeacherController@apiResource |
| GET/PUT/DELETE | /api/teachers/{id} | TeacherController@apiResource |
| GET/POST | /api/classes | SchoolClassController@apiResource |
| GET/PUT/DELETE | /api/classes/{id} | SchoolClassController@apiResource |
| GET/POST | /api/guardians | GuardianController@apiResource |
| GET/PUT/DELETE | /api/guardians/{id} | GuardianController@apiResource |
| GET | /api/attendances | AttendanceApiController@index |
| GET | /api/attendances/today | AttendanceApiController@today |
| POST | /api/attendances/check-in | AttendanceApiController@checkIn |
| GET | /api/attendances/history | AttendanceApiController@history |
| GET | /api/attendances/stats?class_id= | AttendanceApiController@stats |
| GET | /api/leave-requests | LeaveRequestApiController@index |
| POST | /api/leave-requests | LeaveRequestApiController@store |
| GET | /api/leave-requests/{id} | LeaveRequestApiController@show |
| PATCH | /api/leave-requests/{id}/verify | LeaveRequestApiController@verify |
| GET | /api/academic-calendars | AcademicCalendarApiController@index |
| GET | /api/academic-calendars/all | AcademicCalendarApiController@all |
| POST | /api/academic-calendars | AcademicCalendarApiController@store |
| GET | /api/academic-calendars/{id} | AcademicCalendarApiController@show |
| PUT | /api/academic-calendars/{id} | AcademicCalendarApiController@update |
| DELETE | /api/academic-calendars/{id} | AcademicCalendarApiController@destroy |
| GET | /api/attendance-time-settings | AttendanceTimeSettingApiController@index |
| PUT | /api/attendance-time-settings | AttendanceTimeSettingApiController@bulkUpdate |
| GET | /api/duty-schedules | DutyScheduleApiController@index |
| POST | /api/duty-schedules | DutyScheduleApiController@store |
| GET | /api/duty-schedules/{id} | DutyScheduleApiController@show |
| PUT | /api/duty-schedules/{id} | DutyScheduleApiController@update |
| DELETE | /api/duty-schedules/{id} | DutyScheduleApiController@destroy |
| POST | /api/import/students | ImportController@importStudents |
| POST | /api/import/teachers | ImportController@importTeachers |

---

## 5. Arsitektur

### Folder Structure (Backend)
```
app/
├── Console/Commands/LogTailCommand.php
├── Events/AttendanceCreated.php
├── Helpers/ApiResponse.php
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── AcademicCalendarApiController.php
│   │   │   ├── AttendanceApiController.php
│   │   │   ├── AttendanceTimeSettingApiController.php
│   │   │   ├── AuthController.php
│   │   │   ├── ClientLogController.php
│   │   │   ├── DutyScheduleApiController.php
│   │   │   ├── GuardianController.php
│   │   │   ├── ImportController.php
│   │   │   ├── LeaveRequestApiController.php
│   │   │   ├── SchoolClassController.php
│   │   │   ├── StudentController.php
│   │   │   └── TeacherController.php
│   │   └── Web/
│   │       ├── AttendanceController.php
│   │       ├── AttendanceSettingController.php
│   │       ├── AuthController.php
│   │       ├── DashboardController.php
│   │       ├── DutyScheduleController.php
│   │       ├── EnrolmentKelasController.php
│   │       ├── GuardianController.php
│   │       ├── LeaveRequestController.php
│   │       ├── LeaveRequestViewController.php
│   │       ├── RekapBulananController.php
│   │       ├── RekapHarianController.php
│   │       ├── SchoolClassController.php
│   │       ├── StudentController.php
│   │       ├── TeacherController.php
│   │       ├── Guru/GuruDashboardController.php
│   │       ├── Siswa/{SiswaDashboardController, LivePresensiController, RiwayatController}
│   │       └── WaliMurid/PengajuanIzinController.php
│   ├── Middleware/{HandleInertiaRequests, LogContextMiddleware}
│   └── Requests/ (14 FormRequest classes)
├── Imports/{StudentsImport, TeachersImport}
├── Models/ (10 Eloquent models)
├── Policies/ (5 policies)
├── Services/ (11 services)
```

### Folder Structure (Frontend)
```
resources/js/
├── app.tsx
├── bootstrap.ts (Echo)
├── Components/
│   ├── (18 components)
│   └── ui/ (11 primitives: ActionButton, Badge, Button, Checkbox, Input, Radio,
│             Skeleton, StatCard, StatusBadge, Table, Toggle)
├── hooks/ (4: useAttendance, useClasses, useLeaveRequest, useStudents)
├── Layouts/ (6: App, Auth, Admin, Guru, Siswa, WaliMurid)
├── Pages/
│   ├── Admin/ (9: DataMaster, MasterKelas, Monitoring, VerifikasiIzin,
│   │           PengajuanIzin, RekapBulanan, RekapHarian, EnrolmentKelas, AturWaktuLibur)
│   ├── Siswa/ (3: Dashboard, LivePresensi, RiwayatKehadiran)
│   ├── Guru/ (2: DashboardPiket, DashboardWaliKelas)
│   ├── WaliMurid/ (2: Dashboard, PengajuanIzin)
│   └── (Welcome, Login)
├── types/
└── utils/
```

### Design Patterns
1. **Service Layer** — All business logic in `app/Services/`, thin controllers
2. **Dual Controller** — Web (Inertia session) + API (Sanctum token) per feature
3. **Form Request** — Validation separated, `authorize()` returns true (policy handles auth)
4. **Event Broadcasting** — Pusher for real-time monitoring
5. **Policy Authorization** — 5 policies, gated by role
6. **ApiResponse Helper** — Standard JSON format `{success, message, errors, data}`
7. **No Repository** — Services use Eloquent directly

---

## 6. Fitur & Modul

| Modul | Role | Fitur |
|---|---|---|
| SSO Login | All | Login, auto-redirect by role |
| Admin Dashboard | Admin | School statistics, 4-level drill-down |
| Master Data | Admin | CRUD + Import/Export Excel untuk Siswa, Guru, Wali |
| Class Enrolment | Admin | Buat kelas, tunjuk wali kelas, enroll siswa |
| Attendance Settings | Admin | Atur jam buka/tutup absen, hari libur |
| Student Dashboard | Student | Ringkasan absensi pribadi |
| Live Attendance | Student | Selfie (WebRTC) + GPS (Geolocation API) |
| Student Report | Student | Grafik rekap absensi (Harian/Bulanan/Semester) |
| Guardian Dashboard | Guardian | Multi-child profile, rekap absensi anak |
| Leave Submission | Guardian | Form izin (Sakit/Acara/Lomba) + upload bukti |
| Homeroom Dashboard | Homeroom Teacher | Rekap kelas, monitoring |
| Leave Verification | Homeroom Teacher | Approve/Reject izin dari wali |
| Duty Dashboard | Duty Teacher | Live monitoring + filter kelas |
| Reports & Export | Admin, Homeroom, Duty | PDF/Excel export |

---

## 7. Functional Requirements

### F-01: Universal SSO Portal
Sistem harus menyediakan portal autentikasi tunggal (login) untuk semua kategori pengguna.

### F-02: Auto Role Detection
Sistem harus otomatis mendeteksi role setelah login berhasil dan redirect ke dashboard masing-masing.

### F-03: Identity Provider (IdP) Architecture
Arsitektur login harus dirancang sebagai IdP menggunakan Laravel Sanctum agar dapat digunakan aplikasi yayasan lain di masa depan (e-Learning, Financial, Library).

### F-04: Master Data Management (Admin)
CRUD single & bulk (Excel upload/download) untuk entitas Students, Teachers, Guardians.

### F-05: Class Enrolment (Admin)
Membuat kelas, menunjuk wali kelas, enroll siswa ke kelas secara massal.

### F-06: Attendance & Leave Management (Admin Bypass)
Hak akses CRUD penuh untuk koreksi/override data absensi dan izin.

### F-07: 4-Level Drill-Down Analytics (Admin)
- Level 1: Statistik Seluruh Sekolah
- Level 2: Statistik per Kelas
- Level 3: Statistik per Siswa
- Level 4: Detail Absensi by Name

### F-08: Live Attendance (Student)
Selfie (wajib kamera via WebRTC) + mengunci titik koordinat GPS real-time + kompresi client-side (320x240, JPEG 90%, max 20KB).

### F-09: Personal Report (Student)
Grafik dan rekap absensi dengan filter Harian/Bulanan/Semester.

### F-10: Multi-Child Profile (Guardian)
Satu akun bisa mengelola >1 siswa (saudara), dengan fitur profile-switch.

### F-11: Digital Leave Submission (Guardian)
Form izin (Sakit/Acara/Lomba) + pilih anak + durasi + upload bukti (image/PDF max 2MB).

### F-12: Leave Verification Panel (Homeroom Teacher)
Notifikasi pengajuan izin masuk dari wali, bisa Approve/Reject.

### F-13: Class Monitoring & Recap (Homeroom Teacher)
Laporan absensi semua siswa di kelasnya (Harian/Bulanan/Semester) + export PDF/Excel.

### F-14: Live Monitoring Filtered (Duty Teacher)
Rekap absensi semua siswa hari ini dengan filter cepat per kelas.

---

## 8. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NF-01 | Frontend Image Compression | Canvas 320x240, JPEG 90%, max 20KB |
| NF-02 | Database max_connections | Minimal 1000 |
| NF-03 | Database Indexing | Wajib pada kolom kunci (id_student, date, status, nisn, name) |
| NF-04 | Storage Offloading | DILARANG BLOB/Base64 di DB, wajib URL ke Object Storage |
| NF-05 | Responsive Web Design | Mobile: Student/Guardian; Desktop: Admin/Guru |
| NF-06 | No Installation | Cukup browser, tidak perlu install native |
| NF-07 | Instant Updates | Perubahan langsung tersedia tanpa update manual |
| NF-08 | SSO Tokenization | Token aman cegah manipulasi sesi |
| NF-09 | Role-based middleware | User tidak bisa akses luar hak akses |
| NF-10 | Triple-Layer Validation | 3 layer sebelum simpan absensi |
| NF-11 | PDF & Excel Export | Laporan Harian/Bulanan/Semester |
| NF-12 | SSD/NVMe Server | Kecepatan I/O terjamin |

---

## 9. Role & Permission Matrix

### 5 Role
1. **Admin** — Super user, full access
2. **Student** — Self attendance + personal report
3. **Guardian** — Multi-child monitoring + leave submission
4. **Teacher** — Can be Homeroom Teacher (wali kelas) or Duty Teacher (piket)
5. **Super Admin** (future) — Bypass semua policy

### Spatie Permission Definitions
| Permission | Deskripsi |
|---|---|
| `create-attendance` | Bisa absen / mencatat kehadiran |
| `view-reports` | Bisa lihat rekap absensi |
| `manage-user` | CRUD user (admin only) |
| `manage-class` | CRUD kelas + enrolment |
| `approve-leave` | Approve/reject izin |

### Role → Permission Mapping
| Role | Permissions |
|---|---|
| super-admin | ALL (via gate) |
| admin | create-attendance, view-reports, manage-user, manage-class, approve-leave |
| teacher | create-attendance, view-reports, approve-leave |
| student | create-attendance |
| guardian | view-reports, approve-leave |

### Feature vs Role Matrix
| Fitur | Admin | Student | Guardian | Homeroom Teacher | Duty Teacher |
|---|---|---|---|---|---|
| SSO Login | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD Master Data | ✅ | — | — | — | — |
| Upload/Download Excel | ✅ | — | — | — | — |
| Class Enrolment | ✅ | — | — | — | — |
| Configure Attendance Hours | ✅ | — | — | — | — |
| Configure Holiday Calendar | ✅ | — | — | — | — |
| Live Attendance (Selfie+GPS) | — | ✅ | — | — | — |
| View Own Recap | ✅ | ✅ | — | — | — |
| Multi-Child Profile | — | — | ✅ | — | — |
| Submit Leave | — | — | ✅ | — | — |
| Verify Leave | ✅ | — | — | ✅ | — |
| Class Monitoring | ✅ | — | — | ✅ | ✅ |
| Quick Filter per Class | ✅ | — | — | ✅ | ✅ |
| Drill-Down Analytics | ✅ | — | — | — | — |
| Export PDF/Excel | ✅ | — | — | ✅ | ✅ |
| Bypass/Override Data | ✅ | — | — | — | — |

---

## 10. Triple-Layer Validation Detail

### Flow Diagram
```
[Attendance Request]
        │
        ▼
Layer 1: Academic Calendar Check
├── holiday_date == today && is_holiday == true ?
│   ├── YES → Reject 403 "Today is an academic holiday"
│   └── NO  → Continue
        │
        ▼
Layer 2: Active Day Check
├── attendance_time_settings has entry for today's dayName ?
│   ├── NO → Reject 403 "No attendance schedule for today"
│   └── YES → Load setting (open_time, late_threshold, close_time)
        │
        ▼
Layer 3: Time Range Check
├── currentTime < open_time       → Reject 403 "Not yet time for attendance"
├── currentTime <= late_threshold → Status: "Present" ✅
├── currentTime <= close_time     → Status: "Late" ⚠️
└── currentTime > close_time      → Reject 403 "Attendance closed"
```

### Business Rules
```
open_time (06:30) ... late_threshold (07:00) ... close_time (07:30)
     │                      │                         │
     │   "Present"          │     "Late"              │
     │◄────────────────────►│◄───────────────────────►│
     │                      │                         │
   "Too Early"           "Present"                "Closed"
```

### Implementation (Wajib)
```php
// ✅ WAJIB: Dynamic dari database
$setting = AttendanceTimeSetting::where('day', today()->dayName)->first();

// ❌ DILARANG: Hardcode
// if ($currentHour < 6 && $currentHour > 8) { ... }
```

### Attendance Status Logic
```php
if ($currentTime < $setting->check_in_open) {
    // Reject: "Belum waktu absen"
} elseif ($currentTime <= $setting->late_threshold) {
    $status = 'Present';
} elseif ($currentTime <= $setting->check_in_close) {
    $status = 'Late';
} else {
    // Reject: "Absen sudah ditutup"
}
```

---

## 11. 13 Interface (P0 / P1)

| No | Interface | Role | Priority |
|---|---|---|---|
| 1 | SSO Login | All | **P0** |
| 2 | Admin Dashboard | Admin | **P0** |
| 3 | Master Data Management | Admin | **P0** |
| 4 | Class Management & Enrolment | Admin | **P0** |
| 5 | Time & Holiday Settings | Admin | P1 |
| 6 | Student Dashboard | Student | **P0** |
| 7 | Live Attendance Form | Student | **P0** |
| 8 | Guardian Dashboard | Guardian | **P0** |
| 9 | Leave Submission Form | Guardian | **P0** |
| 10 | Homeroom Teacher Dashboard | Homeroom Teacher | **P0** |
| 11 | Leave Verification Panel | Homeroom Teacher | P1 |
| 12 | Duty Teacher Dashboard | Duty Teacher | **P0** |
| 13 | Reports & Export | Admin, Homeroom, Duty | P1 |

**10 interface P0** (wajib sebelum sistem bisa digunakan)
**3 interface P1** (setelah P0 selesai)

---

## 12. Gap Analysis

### ✅ Completed (Codebase sudah sesuai)

| Item | Dokumen Requirement | Status |
|---|---|---|
| F-01: SSO Login | ✅ | AuthController + login page |
| F-03: IdP Sanctum | ✅ | Sanctum terkonfigurasi |
| F-04: CRUD Web | ✅ | Student/Teacher/Guardian/SchoolClass controllers |
| F-04: Import Excel | ✅ | StudentsImport, TeachersImport, ImportService |
| F-05: Class Enrolment | ✅ | EnrolmentKelasController + page |
| F-11: Leave Submission (Guardian) | ✅ | PengajuanIzin forms |
| F-12: Leave Verification | ✅ | VerifikasiIzin page |
| F-14: Live Monitoring | ✅ | Monitoring page + Pusher broadcast event |
| NF-03: Indexing | ✅ | Composite index attendances(student_id, date) |
| NF-05: Responsive | ✅ | Tailwind responsive classes |
| NF-08: Tokenization | ✅ | Sanctum token |
| NF-09: Role middleware | ✅ | Spatie middleware |
| API CRUD (all entities) | ✅ | 13 API controllers |
| 10 Eloquent Models | ✅ | All relations defined |
| 11 Services | ✅ | All business logic in services |
| 25 PHPUnit Tests | ✅ | 5 services tested |

### ⚠️ Sebagian / Perlu Perbaikan

| Item | Status | Gap |
|---|---|---|
| F-02: Auto redirect by role | ⚠️ | Perlu verifikasi middleware redirect |
| F-10: Multi-Child Profile | ⚠️ | Dashboard ada, switch profile belum |
| NF-10: Triple-Layer Validation | ⚠️ | Logic di AttendanceService perlu diverifikasi |
| NF-04: Object Storage | ⚠️ | S3 config ada, upload file via API belum diintegrasikan |

### ❌ Belum Ada

| Item | Dokumen Requirement | Notes |
|---|---|---|
| F-06: Admin Bypass | ❌ | Koreksi/override absensi |
| F-07: 4-Level Drill-Down | ❌ | Chart analytics (Sekolah → Kelas → Siswa → Detail) |
| F-08: Live Attendance Frontend | ❌ | WebRTC kamera + Canvas kompresi belum diimplementasi |
| F-09: Personal Report Chart | ❌ | Grafik rekap pribadi |
| F-13: Export PDF/Excel | ❌ | Laporan Harian/Bulanan/Semester |
| NF-01: Frontend Compression | ❌ | Canvas resize 320x240 + JPEG 90% |
| NF-11: PDF & Excel Export | ❌ | Belum ada export library |
| NF-02: max_connections 1000 | ❌ | Belum dikonfigurasi |

---

## 13. Phased Implementation Plan

### Phase 1 — Core Logic & Foundation (Prioritas Tertinggi)
**Goal**: Memastikan fitur inti absensi berjalan sesuai spek dokumen.

| # | Task | Module | Files |
|---|---|---|---|
| 1.1 | **Triple-Layer Validation** — Verifikasi `AttendanceService::checkIn()` sudah sesuai dokumen (Layer 1, 2, 3) | Attendance | `app/Services/AttendanceService.php` |
| 1.2 | **Object Storage Integration** — Upload foto ke S3, simpan URL, tidak Base64 di DB | Storage | `config/filesystems.php`, `app/Services/AttendanceService.php` |
| 1.3 | **API check-in** — Terima file upload foto, kompresi server-side fallback, upload S3, simpan URL | API | `app/Http/Controllers/Api/AttendanceApiController.php`, `app/Http/Requests/Api/CheckInRequest.php` |
| 1.4 | **Live Attendance Frontend** — WebRTC getUserMedia + Canvas kompresi (320x240, JPEG 90%) + Geolocation API | Frontend | `resources/js/Pages/Siswa/LivePresensi.tsx` |
| 1.5 | **AttendanceService Test Coverage** — Test Triple-Layer Validation + S3 upload mock | Testing | `tests/Feature/Services/AttendanceServiceTest.php` |

### Phase 2 — Drill-Down Analytics & Export
**Goal**: Admin bisa lihat data secara hierarkis + export.

| # | Task | Module | Files |
|---|---|---|---|
| 2.1 | **4-Level Drill-Down Dashboard** — Level 1 (Sekolah) → Level 2 (Kelas) → Level 3 (Siswa) → Level 4 (Detail) | Admin | `app/Services/AnalyticsService.php`, `resources/js/Pages/Admin/Dashboard.tsx` |
| 2.2 | **Export Excel** — Master Data (Students, Teachers) export + Rekap Harian/Bulanan | Export | `app/Exports/`, `app/Services/ExportService.php` |
| 2.3 | **Export PDF** — Rekap absensi dengan format resmi | Export | `barryvdh/laravel-dompdf` atau `spipu/html2pdf` |
| 2.4 | **Admin Bypass** — Koreksi/override data absensi | Admin | `app/Http/Controllers/Admin/AttendanceOverrideController.php` |

### Phase 3 — User Features (Student & Guardian)
**Goal**: Fitur lengkap untuk siswa dan wali murid.

| # | Task | Module | Files |
|---|---|---|---|
| 3.1 | **Guardian Multi-Child** — Switch profile antar anak | Guardian | `resources/js/Pages/WaliMurid/Dashboard.tsx`, `app/Services/GuardianService.php` |
| 3.2 | **Student Personal Report Chart** — Grafik rekap absensi dengan Chart.js/ApexCharts | Student | `resources/js/Pages/Siswa/RiwayatKehadiran.tsx` |
| 3.3 | **Guardian Leave Form Enhancement** — Upload bukti langsung ke S3, validasi tipe/ukuran | Guardian | `app/Services/LeaveRequestService.php` |

### Phase 4 — Security, Monitoring & Polish
**Goal**: Security hardening, real-time, dan final polish.

| # | Task | Module | Files |
|---|---|---|---|
| 4.1 | **Signed URLs for Object Storage** — Temporary URL expiration | Security | `app/Services/StorageService.php` |
| 4.2 | **Rate Limiting** — Endpoint absensi (max 1x per 5 menit per student) | Security | `app/Http/Kernel.php`, route middleware |
| 4.3 | **Real-time Monitoring** — Pusher integration for Duty Teacher dashboard | Monitoring | `resources/js/Pages/Guru/DashboardPiket.tsx` |
| 4.4 | **NF-02: Database max_connections** — Konfigurasi PostgreSQL | Infra | Database setup |
| 4.5 | **Error Handling** — Global error handler untuk API dan Web | Security | `app/Exceptions/Handler.php` |

---

## 14. Key Technical Decisions

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Object Storage | S3-compatible (Wasabi recommended) | Murah ($7/TB), S3 protocol universal |
| Chart Library | Chart.js atau ApexCharts | Sudah ada di requirement docs |
| PDF Export | barryvdh/laravel-dompdf | Paling mature, Blade-based |
| Excel Import | openspout/openspout | Pure PHP, light, works with all Laravel |
| Broadcasting | Pusher | Free tier, mature, well-documented |
| Frontend Package | Bun (not npm) | Lebih cepat, lock project context |
| DB Production | PostgreSQL 16 (NeonDB) | Serverless, scalable, sesuai budget |
| DB Testing | SQLite :memory: | Cepat, no setup required |

### Laravel Package Status
| Package | Status | Action |
|---|---|---|
| laravel/framework ^13.8 | ✅ Installed | — |
| inertiajs/inertia-laravel ^3.1 | ✅ Installed | — |
| laravel/sanctum | ✅ Installed | — |
| spatie/laravel-permission | ✅ Installed | — |
| pusher/pusher-php-server ^7.2 | ✅ Installed | — |
| openspout/openspout ^5.7 | ✅ Installed | — |
| laravel/telescope | ⚠️ Installed | Removed from providers (not needed) |
| dompdf/dompdf | ❌ Not installed | Phase 2 export |
| barryvdh/laravel-dompdf | ❌ Not installed | Phase 2 export |

---

## 15. Referensi File

### Dokumen di smauii-aksesekolah
| File | Isi |
|---|---|
| `docs/03-requirement-analisis.md` | Functional + Non-functional requirements detail |
| `docs/04-erd-database.md` | ERD, index strategy, design principles |
| `docs/05-modul-alur-flow.md` | 6 flow diagrams, 13 interfaces, P0/P1 priority |
| `docs/06-keamanan-sso.md` | SSO IdP, RBAC, Triple-Layer Validation, Permission definitions |
| `docs/08-budget-timeline-roadmap.md` | Budget breakdown, 8-week timeline, 3-phase future roadmap |
| `brief/SMART Absen SMA UII.md` | 13 interface + tools per interface |
| `brief/Rencana ERD.md` | Rancangan ERD awal |
| `brief/LAPORAN ANALISIS KEBUTUHAN SISTEM.md` | Laporan analisis formal |

### File Kunci di smauii-core
| File | Fungsi |
|---|---|
| `routes/web.php` | 40+ Web routes (Inertia) |
| `routes/api.php` | 30+ API routes (Sanctum) |
| `app/Services/AttendanceService.php` | Core attendance logic + Triple-Layer Validation |
| `app/Http/Controllers/Api/AttendanceApiController.php` | API check-in endpoint |
| `resources/js/Pages/Siswa/LivePresensi.tsx` | Live attendance form (WebRTC + Geolocation) |
| `database/migrations/` | 18 migration files (10 domain + 8 system) |
| `tests/Feature/Services/` | 25 PHPUnit tests (5 services) |
