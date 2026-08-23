# Alur Lengkap Live Presensi — SMAUII Core

> Dokumen ini bersifat **read-only** — untuk pemahaman, bukan untuk mengubah kode.

---

## Gambaran Besar

```
[Browser Siswa]
     │
     │  1. Buka /login, isi username+password
     ▼
[Web: AuthController@authenticate]
     │  2. Auth::attempt() → session regenerate
     │  3. redirect → /dashboard
     ▼
[Web: DashboardController@index]
     │  4. Cek $user->role → redirect ke /student/dashboard
     ▼
[Web: StudentWebController@dashboard]
     │  5. Render halaman dashboard dengan data siswa
     ▼
[Browser: Student/Dashboard.tsx]
     │  6. Siswa klik tombol "Live Presensi"
     ▼
[Web: StudentWebController@liveAttendance]
     │  7. Render halaman LiveAttendance.tsx
     ▼
[Browser: Student/LiveAttendance.tsx]
     │  8. Siswa klik "Check In" → browser ambil kamera + GPS
     │  9. Foto di-capture → dikirim sebagai base64 (photo_blob)
     │  10. POST /student/live-attendance/checkin
     ▼
[Web: StudentWebController@checkIn]
     │  11. Ambil data student dari user yang login
     │  12. Panggil AttendanceService@checkIn
     ▼
[AttendanceService@checkIn] — BUSINESS LOGIC
     │  13. Triple-layer validation
     │  14. Upload foto ke S3 via StorageService
     │  15. Simpan ke tabel attendances
     │  16. Dispatch 2 event (Pusher broadcast)
     ▼
[Pusher → Guru Piket]
     │  17. AttendanceCreated → channel monitoring.{class_id}
     │  18. AttendanceMarked → channel private attendance-monitoring
     ▼
[Browser Siswa]
     19. Redirect ke /student/dashboard dengan flash "success"
```

---

## Detail Tiap Tahap

### TAHAP 1 — Login

**File:** [`Login.tsx`](file:///c:/laragon/www/core/resources/js/Pages/Login.tsx) → [`LoginCard.tsx`](file:///c:/laragon/www/core/resources/js/Components/LoginCard.tsx) → [`AuthController@authenticate`](file:///c:/laragon/www/core/app/Http/Controllers/Web/AuthController.php)

**Cara kerja:**

1. Halaman `/login` merender komponen `Login.tsx`
2. `Login.tsx` menggunakan hook `useForm` dari InertiaJS untuk mengelola state form:
   ```
   { username: "", password: "", remember: false }
   ```
3. Saat submit, InertiaJS mengirim `POST /login` (bukan fetch/axios biasa — InertiaJS menggunakan XHR dengan header `X-Inertia`)
4. Di backend, `AuthController@authenticate`:
   - Validasi input (`username` dan `password` required)
   - `Auth::attempt()` → cari user di tabel `users` berdasarkan kolom `username`
   - Jika cocok → `$request->session()->regenerate()` (generate session ID baru untuk keamanan, cegah session fixation)
   - Redirect ke `/dashboard` (dengan `intended` — jika ada URL yang dituju sebelumnya, redirect ke situ)
   - Jika gagal → back dengan error `'Incorrect username or password.'`

**Komponen UI (`LoginCard.tsx`):**
- Panel kiri: branding "Portal SSO Mandiri" (desktop only)
- Panel kanan: form username + password + checkbox "Ingat saya"
- Error ditampilkan di atas form jika login gagal

---

### TAHAP 2 — Routing Dashboard (Role Detection)

**File:** [`DashboardController@index`](file:///c:/laragon/www/core/app/Http/Controllers/Web/DashboardController.php#L21-L31)

Setelah login, semua user diarahkan ke `/dashboard`. Controller ini bertindak sebagai **traffic router** berdasarkan role:

```php
return match ($user->role) {
    'teacher'  => redirect()->route('teacher.homeroom'),
    'guardian' => redirect()->route('guardian.dashboard'),
    'student'  => redirect()->route('student.dashboard'),
    default    => $this->adminDashboard($request),  // role: admin
};
```

> **Catatan penting:** Ini menggunakan kolom `$user->role` (string di tabel `users`), **bukan** Spatie Permission. Sedangkan middleware route (`role:student`, dll.) menggunakan Spatie Permission. Keduanya harus sinkron.

**Middleware di routes:**
- Route `/student/*` dilindungi `middleware('role:student')`
- `role:student` ditangani Spatie Permission, yang mengecek tabel `model_has_roles`

---

### TAHAP 3 — Dashboard Siswa

**File:** [`StudentWebController@dashboard`](file:///c:/laragon/www/core/app/Http/Controllers/Web/StudentWebController.php#L21-L50) → [`Student/Dashboard.tsx`](file:///c:/laragon/www/core/resources/js/Pages/Student/Dashboard.tsx)

Controller mengumpulkan data dan mengirimnya ke React via `Inertia::render()`:

```
Props yang dikirim ke frontend:
├── student         → { id, nis, nisn, name, class }
├── todayAttendance → { id, status, check_in_time, attendance_date } atau null
├── recentHistory   → 10 absen terakhir
└── stats           → { total_days, present, late, absent }
```

Jika `$student` tidak ditemukan (user belum punya data di tabel `students`), controller redirect ke `/dashboard` dengan pesan error.

---

### TAHAP 4 — Halaman Live Presensi

**File:** [`StudentWebController@liveAttendance`](file:///c:/laragon/www/core/app/Http/Controllers/Web/StudentWebController.php#L52-L76) → [`Student/LiveAttendance.tsx`](file:///c:/laragon/www/core/resources/js/Pages/Student/LiveAttendance.tsx)

Props yang dikirim:
```
├── student         → { id, nis, name, class }
└── todayAttendance → data absen hari ini (null jika belum absen)
```

**Kondisi tampilan:**
- Jika `todayAttendance !== null` → tampilkan badge "Checked In — {jam}" (tombol check-in disembunyikan)
- Jika `todayAttendance === null` → tampilkan tombol "Check In"

---

### TAHAP 5 — Proses Check-In di Frontend

**File:** [`LiveAttendance.tsx`](file:///c:/laragon/www/core/resources/js/Pages/Student/LiveAttendance.tsx#L85-L156) — fungsi `handleCheckIn()`

Urutan eksekusi saat tombol "Check In" diklik:

```
1. setLoading(true) — tampilkan "Processing..."
2. Cek apakah browser mendukung navigator.geolocation
3. Jika kamera belum aktif → panggil startCamera()
      └── navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width:320, height:240 } })
          → stream video ditampilkan di <video ref={videoRef}>
4. setTimeout 500ms (tunggu kamera siap)
5. capturePhoto():
      └── canvas.drawImage(video, 0, 0, 320, 240)
      └── canvas.toDataURL("image/jpeg", 0.9)
      └── Return base64 string "data:image/jpeg;base64,..."
6. navigator.geolocation.getCurrentPosition():
      ├── Sukses → latitude & longitude dari GPS
      └── Gagal (ditolak/timeout) → latitude:0, longitude:0 (tetap lanjut!)
7. Kirim POST /student/live-attendance/checkin via router.post() (InertiaJS):
      ├── FormData: latitude, longitude, photo_blob (base64 tanpa prefix)
      └── preserveState: true (tidak reset state React)
```

> **Penting:** Jika GPS ditolak user, latitude/longitude diisi `"0"` dan proses tetap jalan. Ini desain sadar — presensi tidak dibatalkan hanya karena GPS diblokir.

---

### TAHAP 6 — Controller Menerima Request

**File:** [`StudentWebController@checkIn`](file:///c:/laragon/www/core/app/Http/Controllers/Web/StudentWebController.php#L78-L92)

```php
public function checkIn(Request $request)
{
    // 1. Cari data student berdasarkan user yang sedang login
    $student = $this->studentService->findByUserId(auth()->id());

    // 2. Guard: jika student tidak ditemukan → back dengan error
    if (!$student) {
        return redirect()->back()->with('error', 'Student data not found.');
    }

    try {
        // 3. Delegate ke service layer
        $this->attendanceService->checkIn($student->id, $request->all());

        // 4. Sukses → redirect ke dashboard dengan flash message
        return redirect()->route('student.dashboard')->with('success', 'Check-in successful.');

    } catch (\RuntimeException $e) {
        // 5. Validasi gagal → back dengan pesan error dari service
        return redirect()->back()->with('error', $e->getMessage());
    }
}
```

**Throttle Middleware:** Route ini dilindungi `throttle:attendance-checkin` — membatasi berapa kali endpoint ini bisa dipanggil dalam periode tertentu.

---

### TAHAP 7 — Business Logic: Triple-Layer Validation

**File:** [`AttendanceService@checkIn`](file:///c:/laragon/www/core/app/Services/AttendanceService.php#L61-L136)

Ini adalah inti dari sistem presensi. Ada **3 lapis validasi** yang harus dilewati sebelum absen bisa disimpan:

#### Layer 1 — Kalender Akademik (Hari Libur?)
```php
$holiday = AcademicCalendar::whereDate('holiday_date', $today)
    ->where('is_holiday', true)
    ->first();

if ($holiday) {
    throw new RuntimeException('Today is a holiday: ' . $holiday->description);
}
```
Cek tabel `academic_calendars`. Jika hari ini ditandai libur → **tolak**.

#### Layer 2 — Hari Aktif (Ada Jadwal?)
```php
$dayName = now()->format('l');  // "Monday", "Tuesday", dst
$setting = AttendanceTimeSetting::where('day', $dayName)->first();

if (!$setting) {
    throw new RuntimeException('No attendance schedule for ' . $dayName);
}
```
Cek tabel `attendance_time_settings`. Jika tidak ada setting untuk hari ini (misal Sabtu/Minggu tidak dikonfigurasi) → **tolak**.

#### Layer 3 — Rentang Waktu
```php
$currentTime = now()->format('H:i:s');
$openTime  = $setting->check_in_open->format('H:i:s');    // e.g. "06:30:00"
$lateTime  = $setting->late_threshold->format('H:i:s');   // e.g. "07:15:00"
$closeTime = $setting->check_in_close->format('H:i:s');   // e.g. "08:00:00"

if ($currentTime < $openTime)  → throw "Attendance opens at {openTime}"
if ($currentTime > $lateTime)  → $status = 'Late'  (tapi tetap boleh absen)
if ($currentTime > $closeTime) → throw "Attendance closed at {closeTime}"
```

Penentuan status otomatis:
| Waktu | Status |
|---|---|
| `openTime` ≤ jam ≤ `lateTime` | **Present** |
| `lateTime` < jam ≤ `closeTime` | **Late** |
| jam > `closeTime` | Ditolak (attendance closed) |

#### Cek Duplikasi
```php
$existing = Attendance::where('student_id', $studentId)
    ->whereDate('attendance_date', $today)
    ->first();

if ($existing) {
    throw new RuntimeException('Already checked in today.');
}
```

---

### TAHAP 8 — Upload Foto ke S3

**File:** [`StorageService@uploadAttendancePhoto`](file:///c:/laragon/www/core/app/Services/StorageService.php)

Foto dikirim dari frontend sebagai **base64 string** (`photo_blob`). Di `AttendanceService`:

```php
// Jika photo_blob ada (base64 dari frontend)
$tempPath = tempnam(sys_get_temp_dir(), 'attendance_') . '.jpg';
file_put_contents($tempPath, base64_decode($data['photo_blob']));
$uploadedFile = new UploadedFile($tempPath, 'photo.jpg', 'image/jpeg', null, true);
$photoUrl = $this->storageService->uploadAttendancePhoto($uploadedFile, $studentId);
```

Di `StorageService@compress()`:
1. Baca gambar dengan `imagecreatefromjpeg()`
2. Resize ke maksimum **320×240 pixel**
3. Compress ke JPEG quality 90
4. Jika hasilnya masih > **20 KB** → turunkan quality 10 per iterasi (maks 5x) sampai ≤ 20 KB
5. Upload ke S3: path `attendance/{tanggal}/{studentId}_{random8char}.jpg`

---

### TAHAP 9 — Simpan & Broadcast

Setelah foto diupload, record disimpan:

```php
$attendance = Attendance::create([
    'student_id'      => $studentId,
    'attendance_date' => $today,
    'check_in_time'   => now()->format('H:i:s'),
    'latitude'        => $data['latitude'],
    'longitude'       => $data['longitude'],
    'photo_url'       => $photoUrl,
    'status'          => $status,  // 'Present' atau 'Late'
]);
```

Lalu **2 event** langsung di-dispatch:

#### Event 1: `AttendanceCreated` (Pusher Public Channel)
**File:** [`AttendanceCreated.php`](file:///c:/laragon/www/core/app/Events/AttendanceCreated.php)
- Channel: `monitoring.{class_id}` (public channel, per kelas)
- Broadcast ke guru piket yang sedang buka halaman monitoring kelas itu
- Data: id, student_name, student_nis, class_id, class_name, status, check_in_time, latitude, longitude

#### Event 2: `AttendanceMarked` (Pusher Private Channel)
**File:** [`AttendanceMarked.php`](file:///c:/laragon/www/core/app/Events/AttendanceMarked.php)
- Channel: `private attendance-monitoring` (private, perlu auth)
- Data: id, student_id, student_name, status, check_in_time, class_name

---

### TAHAP 10 — Feedback ke User

Setelah `AttendanceService@checkIn` berhasil, `StudentWebController` melakukan:
```php
return redirect()->route('student.dashboard')->with('success', 'Check-in successful.');
```

Di frontend, `HandleInertiaRequests` middleware secara otomatis membagikan flash message ke semua halaman:
```php
'flash' => [
    'success' => fn() => $request->session()->get('success'),
    'error'   => fn() => $request->session()->get('error'),
]
```

Komponen `Toast.tsx` (di dalam `StudentLayout`) menangkap flash ini dan menampilkan notifikasi.

---

## Struktur Komponen Frontend (Student)

```
StudentLayout.tsx (wrapper)
├── <Head title="..." />          → set <title> halaman
├── <Toast />                     → menangkap flash.success / flash.error dari Inertia shared props
├── <header>                      → navbar atas (desktop & mobile)
│   ├── back button (jika showBack=true)
│   └── user initial avatar
├── <main>
│   └── <ErrorBoundary>
│       └── {children}            → halaman aktif (LiveAttendance.tsx, dll.)
└── <nav> (bottom, mobile only)
    ├── Beranda  → /student/dashboard
    ├── Presensi → /student/live-attendance
    └── Riwayat  → /student/history
```

---

## Shared Data (Semua Halaman)

`HandleInertiaRequests@share()` mengirim data ini ke **setiap** halaman React secara otomatis:

```js
{
  locale: "id",          // bahasa aktif
  auth: {
    user: {              // null jika guest
      id, name, email
    }
  },
  flash: {
    success: "...",      // dari session()->get('success')
    error:   "...",
    warning: "...",
  }
}
```

---

## Ringkasan Tabel Model yang Terlibat

| Model | Tabel | Peran dalam Flow |
|---|---|---|
| `User` | `users` | Autentikasi, menyimpan kolom `role` |
| `Student` | `students` | Data siswa, relasi ke `User` dan `SchoolClass` |
| `SchoolClass` | `school_classes` | Kelas siswa, dipakai untuk broadcast channel |
| `AcademicCalendar` | `academic_calendars` | Validasi layer 1: hari libur |
| `AttendanceTimeSetting` | `attendance_time_settings` | Validasi layer 2 & 3: jadwal & jam |
| `Attendance` | `attendances` | Record hasil absen (output akhir) |
| `LeaveRequest` | `leave_requests` | Dipakai di stats dashboard (hitung sakit/izin) |

---

## Catatan Arsitektur Penting

1. **InertiaJS bukan REST API biasa.** Saat `router.post()` dipanggil dari React, request dikirim ke server Laravel dengan header `X-Inertia: true`. Server merespons dengan JSON berisi komponen dan props baru (bukan full HTML), lalu React me-render ulang komponen yang berubah. Ini membuat navigasi terasa seperti SPA tanpa perlu API terpisah untuk web.

2. **Session-based auth untuk web, token-based untuk API.** Halaman web (`/student/*`) menggunakan Laravel session cookie. Endpoint API (`/api/*`) menggunakan Sanctum bearer token — untuk aplikasi mobile.

3. **Controller thin, logic di Service.** Controller hanya: ambil input → panggil service → return response. Semua business rule ada di `AttendanceService`, `StorageService`, dll. Ini memudahkan testing dan pemeliharaan.

4. **Foto diproses di dua tempat:**
   - Frontend (React): capture via `<canvas>` dari `<video>`, encode ke base64 — kualitas awal 90%
   - Backend (PHP): decode base64 → buat `UploadedFile` → `StorageService::compress()` resize & compress hingga ≤ 20 KB → upload ke S3

5. **GPS opsional.** Jika user menolak izin GPS, koordinat `0,0` tetap dikirim. Sistem tidak memblokir presensi karena GPS — ini keputusan desain untuk mengakomodasi perangkat atau browser yang tidak mendukung geolocation.
