# Panduan Logger Laravel Full-Stack — SMAUII Core

> Dokumen ini adalah panduan **logging yang baik dan benar** untuk seluruh ekosistem Laravel SMAUII Core — mencakup backend murni (Service + Controller), full-stack (Blade & Inertia), queue & schedule, hingga console commands.
>
> Ini **bukan** dokumentasi ulang dari `development-workflow.md` atau `error-handling-patterns.md`. Dokumen ini fokus pada **satu hal**: bagaimana menulis, mengelola, dan memonitor log secara profesional di Laravel.
>
> Target pembaca: sandikodev, Fathan, Hanif, Ihsan, Azis.

---

## Daftar Isi

1. [Pendahuluan & Filosofi](#1-pendahuluan--filosofi)
2. [Fundamental Laravel Logging](#2-fundamental-laravel-logging)
3. [Log Levels — Pedoman Penggunaan](#3-log-levels--pedoman-penggunaan)
4. [Structured Logging & Context](#4-structured-logging--context)
5. [Logging Pattern per Layer](#5-logging-pattern-per-layer)
   - 5.1. Service Layer
   - 5.2. Controller (Web + API)
   - 5.3. Blade (Full-Stack Traditional)
   - 5.4. Inertia (Modern Full-Stack)
   - 5.5. Queue & Schedule
   - 5.6. Console Commands
   - 5.7. Event & Listener
   - 5.8. Middleware
6. [Correlation ID & Request Tracing](#6-correlation-id--request-tracing)
7. [Logging Sensitive Data — Checklist](#7-logging-sensitive-data--checklist)
8. [Log Viewer & Monitoring Tools](#8-log-viewer--monitoring-tools)
9. [Environment Strategy](#9-environment-strategy)
10. [Custom Logger Channel](#10-custom-logger-channel)
11. [Troubleshooting Logger](#11-troubleshooting-logger)
12. [Checklist Implementasi](#12-checklist-implementasi)
13. [Referensi](#13-referensi)

---

## 1. Pendahuluan & Filosofi

### 1.1. Mengapa Logger Harus Diurus Serius?

Log adalah **single source of truth** ketika terjadi error di production. Saat user melapor "Saya tidak bisa presensi", log adalah tempat pertama kita cari jawaban — bukan bertanya ke user "Apa yang kamu lihat?"

**Tanpa log yang baik:**
```
[2026-07-03 10:00:00] production.ERROR: Something went wrong
```

**Dengan log yang baik:**
```json
{
    "timestamp": "2026-07-03T10:00:00.000000Z",
    "level": "ERROR",
    "message": "Check-in gagal: Siswa sudah presensi hari ini",
    "context": {
        "student_id": 42,
        "nisn": "1234567890",
        "class": "X-A",
        "method": "App\\Services\\AttendanceService::checkIn",
        "line": 156,
        "request_id": "abc-123-def-456",
        "duration_ms": 45.2
    }
}
```

### 1.2. Filosofi: TIGA Aturan Emas Logging

| Aturan | Maksud |
|--------|--------|
| **1. Log dengan konteks, bukan sekadar string** | Setiap log harus bisa menjawab: apa, siapa, kapan, di mana |
| **2. Log di layer yang tepat** | Service layer yang paling banyak log, Controller minimal, View tidak pernah |
| **3. Jangan log data sensitif** | Password, token, key, data pribadi berlebihan — tidak boleh |

### 1.3. Istilah Penting

| Istilah | Arti |
|---------|------|
| **Log Entry** | Satu baris log (satu kejadian) |
| **Log Channel** | Tujuan log (file, Slack, database, syslog) |
| **Log Level** | Tingkat keparahan (debug → emergency) |
| **Context** | Data tambahan yang menyertai log (array) |
| **Structured Logging** | Log dalam format terstruktur (JSON), bukan teks bebas |
| **Correlation ID** | ID unik yang menghubungkan semua log dalam satu request |

---

## 2. Fundamental Laravel Logging

### 2.1. Cara Pakai Log Facade

```php
<?php

use Illuminate\Support\Facades\Log;

// Basic — tanpa konteks (hanya untuk debug sementara)
Log::info('User login berhasil');

// Dengan konteks — INI YANG BAIK
Log::info('User login berhasil', [
    'user_id' => $user->id,
    'role' => $user->role,
    'ip' => request()->ip(),
]);

// Helper function (sama saja)
logger()->info('User login berhasil', ['user_id' => $user->id]);
```

### 2.2. Helper `logger()` vs Facade `Log`

| Cara | Kelebihan | Kekurangan |
|------|-----------|------------|
| `Log::info(...)` | IDE autocomplete, explicit | Butuh `use` import |
| `logger()->info(...)` | Tidak perlu import | Tidak ada autocomplete |
| `logger('message')` | Sangat cepat (langsung `debug` level) | Tidak explicit level-nya |

**Rekomendasi tim:**
- **Service Layer** → `Log::info()` / `Log::error()` (explicit)
- **Controller** → `Log::info()` (explicit)
- **Closure / helper** → `logger()->info()` (tidak perlu import)
- **Hindari** `logger('message')` saja — selalu tentukan level

### 2.3. Log Channel — Kemana Log Ditulis?

Konfigurasi di `config/logging.php`:

```php
// config/logging.php — WAJIB DIPAHAMI

return [
    'default' => env('LOG_CHANNEL', 'stack'),

    'channels' => [
        // ─── Single File ───
        // Semua log di satu file. Cocok untuk development.
        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
        ],

        // ─── Daily File ───
        // Rotasi file per hari. Retensi 14 hari.
        // Cocok untuk production skala kecil.
        'daily' => [
            'driver' => 'daily',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'days' => env('LOG_DAILY_DAYS', 14),
        ],

        // ─── Stack ───
        // Kirim ke MULTIPLE channel sekaligus.
        // Contoh: daily + slack + json
        'stack' => [
            'driver' => 'stack',
            'channels' => explode(',', env('LOG_STACK', 'daily')),
            'ignore_exceptions' => false,
        ],

        // ─── Slack ───
        // Kirim error ke Slack channel. Hanya untuk production.
        'slack' => [
            'driver' => 'slack',
            'url' => env('LOG_SLACK_WEBHOOK_URL'),
            'username' => 'SMAUII Error Bot',
            'emoji' => ':boom:',
            'level' => env('LOG_LEVEL_SLACK', 'critical'),
        ],
    ],
];
```

**Konfigurasi `.env` yang Direkomendasikan:**

```ini
# =====================
# LOGGING
# =====================

# Development: daily + debug
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=debug

# Production: daily (error ke atas) + slack (critical saja)
# LOG_CHANNEL=stack
# LOG_STACK=daily,slack
# LOG_LEVEL=error
# LOG_LEVEL_SLACK=critical
# LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
# LOG_DAILY_DAYS=14
```

### 2.4. Bagaimana Laravel (Monolog) Bekerja?

```
Kode kita
    │
    ├── Log::info('User login', ['user_id' => 42])
    │
    ▼
Laravel Log Facade
    │
    ▼
Monolog Logger
    │
    ├── Proses: format pesan + context → string/JSON
    │
    ▼
Handler (sesuai channel)
    │
    ├── StreamHandler  → writeln ke file
    ├── SlackHandler   → HTTP POST ke Slack API
    │
    ▼
Formatter
    ├── LineFormatter  → "[2026-07-03] production.INFO: User login..."
    └── JsonFormatter  → {"message":"User login...","level":"INFO",...}
```

---

## 3. Log Levels — Pedoman Penggunaan

### 3.1. Panduan Praktis per Level

```php
// ═══════════════════════════════════════════
// DEBUG — Informasi development detail
// HIDUPKAN hanya di development/mode debug
// ═══════════════════════════════════════════

// ✅ BAIK: parameter yang masuk ke method
Log::debug('checkIn dipanggil', [
    'student_id' => $studentId,
    'data' => $data,
]);

// ✅ BAIK: query yang dijalankan (untuk tracing)
Log::debug('Query: mengambil data presensi', [
    'query' => $query->toSql(),
    'bindings' => $query->getBindings(),
]);

// ❌ JANGAN: log data besar (seluruh collection)
Log::debug('Data presensi', ['students' => $students->toArray()]);
// Jika 1000 siswa, log jadi 10MB!

// ═══════════════════════════════════════════
// INFO — Informasi umum yang berguna
// Boleh hidup di production (jarang: 1-2 per request)
// ═══════════════════════════════════════════

// ✅ BAIK: event penting
Log::info('Siswa check-in berhasil', [
    'student_id' => $attendance->student_id,
    'status' => $attendance->status,
    'time' => $attendance->check_in_time,
]);

// ✅ BAIK: user login/logout
Log::info('User login', ['user_id' => $user->id, 'role' => $user->role]);

// ✅ BAIK: cron job selesai
Log::info('Cron: generate rekap harian selesai', [
    'total_siswa' => $count,
]);

// ═══════════════════════════════════════════
// NOTICE — Kondisi normal tapi patut dicatat
// Jarang dipakai — alternatif info untuk hal penting
// ═══════════════════════════════════════════

Log::notice('Siswa check-in terlambat', [
    'student_id' => $studentId,
    'terlambat_menit' => $menit,
]);

// ═══════════════════════════════════════════
// WARNING — Potensi masalah, bukan error
// ═══════════════════════════════════════════

// ✅ BAIK: rate limit mendekati batas
Log::warning('Rate limit mendekati batas', [
    'user_id' => $user->id,
    'requests_last_minute' => 55,
]);

// ✅ BAIK: query lambat (> 100ms)
Log::warning('Query lambat terdeteksi', [
    'query' => $query->toSql(),
    'duration_ms' => $duration,
]);

// ✅ BAIK: retry queue
Log::warning('Queue job retry', [
    'job_id' => $job->id,
    'attempt' => $job->attempts(),
]);

// ═══════════════════════════════════════════
// ERROR — Error yang tertangani
// PRIORITAS: setiap error HARUS punya context cukup
// ═══════════════════════════════════════════

try {
    // logic...
} catch (\Exception $e) {
    Log::error('Check-in gagal', [
        'student_id' => $studentId,
        'error_message' => $e->getMessage(),
        'error_class' => get_class($e),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString(), // hanya untuk debug
    ]);

    throw new \RuntimeException('Gagal check-in: ' . $e->getMessage());
}

// ═══════════════════════════════════════════
// CRITICAL — Sistem tidak bisa berfungsi
// ═══════════════════════════════════════════

// ✅ BAIK: database connection failed
Log::critical('Database connection failed', [
    'connection' => config('database.default'),
    'host' => config('database.connections.pgsql.host'),
    'error' => $e->getMessage(),
]);

// ═══════════════════════════════════════════
// ALERT — Harus segera di-notify manusia
// ═══════════════════════════════════════════

Log::alert('Disk storage hampir penuh', [
    'disk' => 'public',
    'usage_percent' => 95,
]);

// ═══════════════════════════════════════════
// EMERGENCY — Sistem down total
// ═══════════════════════════════════════════

Log::emergency('Aplikasi tidak bisa diakses', [
    'reason' => 'Database server unreachable',
    'server' => gethostname(),
]);
```

### 3.2. Matriks Keputusan Level

| Situasi | Level | Ada di Production? |
|---------|:-----:|:------------------:|
| Query SQL dijalankan | `debug` | ❌ Tidak |
| Parameter masuk method | `debug` | ❌ Tidak |
| User login/logout | `info` | ✅ Ya |
| Cron job selesai | `info` | ✅ Ya (jarang) |
| Check-in berhasil | `info` | ✅ Ya |
| Check-in terlambat | `notice` | ✅ Ya |
| Query lambat > 100ms | `warning` | ✅ Ya |
| Queue retry | `warning` | ✅ Ya |
| Validasi form gagal | `warning` | ✅ Ya |
| Exception tertangani | `error` | ✅ WAJIB |
| Database connection failed | `critical` | ✅ WAJIB |
| Disk hampir penuh | `alert` | ✅ WAJIB |
| Server down | `emergency` | ✅ WAJIB |

### 3.3. Aturan Emas: Jangan Terlalu Banyak Log

> **Log `info` ke atas maksimal 3-5 log per request.**
> Log `debug` bisa 10-20, tapi hanya di development.

Jika satu request menghasilkan 50 log `info`, itu sudah **log polusi**. Sulit mencari yang penting.

---

## 4. Structured Logging & Context

### 4.1. Kenapa Structured Logging?

**Tanpa structured (LineFormatter):**
```
[2026-07-03 10:00:00] production.ERROR: Check-in gagal: Siswa sudah presensi hari ini
```

**Dengan structured (JsonFormatter):**
```json
{
    "message": "Check-in gagal",
    "level": "ERROR",
    "level_name": "ERROR",
    "channel": "daily",
    "datetime": "2026-07-03T10:00:00.000000Z",
    "context": {
        "student_id": 42,
        "reason": "Siswa sudah presensi hari ini",
        "method": "App\\Services\\AttendanceService::checkIn",
        "request_id": "abc-123"
    },
    "extra": {
        "user_id": 42,
        "ip": "192.168.1.1",
        "url": "/api/attendance/check-in"
    }
}
```

**Keuntungan JSON:**
- Bisa di-parse oleh log aggregation tools (Logstash, Loki, Datadog)
- Bisa di-query: `cari semua error dengan student_id=42`
- Bisa dibuat grafik: `total error per jam`

### 4.2. Konfigurasi JSON Logger

```php
// config/logging.php
'json' => [
    'driver' => 'single',
    'path' => storage_path('logs/laravel-json.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'formatter' => Monolog\Formatter\JsonFormatter::class,
],
```

Atau dengan `tap` untuk kustomisasi lebih lanjut:

```php
'json' => [
    'driver' => 'single',
    'path' => storage_path('logs/laravel-json.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'tap' => [App\Logging\JsonLogger::class],
],
```

### 4.3. Context Global — `Log::withContext()`

**Apa itu?**  
Menambahkan konteks ke SEMUA log yang ditulis selama request berlangsung. Cocok untuk correlation ID, user ID, IP address.

**Pasang di Middleware:**

```php
<?php
// app/Http/Middleware/LogContextMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class LogContextMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Generate atau ambil correlation ID dari header
        $correlationId = $request->header('X-Correlation-ID') ?? (string) Str::uuid();

        // Context global — semua log di request ini akan punya ini
        Log::withContext([
            'request_id' => $correlationId,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Waktu mulai
        $start = microtime(true);

        $response = $next($request);

        // Durasi
        $duration = (microtime(true) - $start) * 1000;
        Log::withContext(['duration_ms' => round($duration, 2)]);

        return $response;
    }
}
```

**Daftarkan di `Kernel.php`:**
```php
// app/Http/Kernel.php
protected $middleware = [
    // ...
    \App\Http\Middleware\LogContextMiddleware::class,
];
```

**Setelah middleware ini aktif:**
```php
// Dimanapun di request ini, log OTOMATIS punya konteks:
Log::info('Check-in berhasil', ['student_id' => 42]);
// → {
//     "message": "Check-in berhasil",
//     "context": {
//         "student_id": 42,
//         "request_id": "abc-123",  ← OTOMATIS
//         "url": "/api/check-in",   ← OTOMATIS
//         "ip": "192.168.1.1",      ← OTOMATIS
//         "duration_ms": 45.2       ← OTOMATIS
//     }
// }
```

### 4.4. Context di Queue Job

Queue job punya `Request` yang berbeda (tidak ada HTTP request). Maka context harus diset manual:

```php
<?php
// app/Jobs/ProcessAttendancePhoto.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAttendancePhoto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;
    public int $tries = 3;

    public function __construct(
        private readonly int $attendanceId,
    ) {}

    public function handle(): void
    {
        // Set context khusus untuk queue
        Log::withContext([
            'job_id' => $this->job?->getJobId(),
            'attendance_id' => $this->attendanceId,
            'attempt' => $this->attempts(),
            'queue' => $this->queue,
        ]);

        Log::info('Memproses foto presensi');

        try {
            // ... proses foto ...
            Log::info('Foto berhasil diproses');
        } catch (\Exception $e) {
            Log::error('Gagal memproses foto', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Biarkan job gagal — akan diretry otomatis
            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::critical('Job foto presensi gagal total', [
            'attendance_id' => $this->attendanceId,
            'all_attempts' => $this->tries,
            'error' => $e->getMessage(),
        ]);
    }
}
```

### 4.5. Log Context di Schedule

```php
// app/Console/Kernel.php
use Illuminate\Support\Facades\Log;

protected function schedule(Schedule $schedule): void
{
    $schedule->call(function () {
        Log::withContext(['schedule' => 'generate-daily-recap']);
        Log::info('Generate rekap harian dimulai');

        try {
            app(RecapService::class)->generateDaily();
            Log::info('Rekap harian berhasil digenerate');
        } catch (\Exception $e) {
            Log::error('Gagal generate rekap harian', [
                'error' => $e->getMessage(),
            ]);
        }
    })->dailyAt('23:55')->name('generate-daily-recap');
}
```

---

## 5. Logging Pattern per Layer

### 5.1. Service Layer

**Ini adalah layer PALING PENTING untuk logging.** Service adalah tempat logic bisnis berada — semua keputusan penting terjadi di sini.

**Pattern Umum:**

```php
<?php
// app/Services/AttendanceService.php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Student;
use App\Models\Schedule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AttendanceService
{
    /**
     * Check-in presensi siswa.
     *
     * Log pattern: START → PROCESS → SUCCESS / FAIL
     */
    public function checkIn(int $studentId, array $data): Attendance
    {
        // 1. START — log debug parameter masuk
        Log::debug('AttendanceService::checkIn — START', [
            'student_id' => $studentId,
        ]);

        try {
            // 2. Validasi — cek duplikat
            $existing = Attendance::where('student_id', $studentId)
                ->whereDate('attendance_date', today())
                ->exists();

            if ($existing) {
                Log::notice('Check-in ditolak: sudah presensi hari ini', [
                    'student_id' => $studentId,
                ]);
                throw new \RuntimeException('Siswa sudah melakukan presensi hari ini.');
            }

            // 3. Cek jadwal — apakah hari ini masuk?
            // ...

            // 4. Simpan
            DB::beginTransaction();
            try {
                $attendance = Attendance::create([
                    'student_id' => $studentId,
                    'status' => $data['status'] ?? 'Present',
                    'check_in_time' => now(),
                    'attendance_date' => today(),
                    'latitude' => $data['latitude'] ?? null,
                    'longitude' => $data['longitude'] ?? null,
                    'photo_url' => $data['photo_url'] ?? null,
                ]);

                // Dispatch job untuk proses foto
                if ($data['photo_url'] ?? false) {
                    ProcessAttendancePhoto::dispatch($attendance->id);
                    Log::debug('Job ProcessAttendancePhoto dispatched', [
                        'attendance_id' => $attendance->id,
                    ]);
                }

                DB::commit();
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e; // Akan ditangkap catch luar
            }

            // 5. SUCCESS
            Log::info('Check-in berhasil', [
                'student_id' => $studentId,
                'attendance_id' => $attendance->id,
                'status' => $attendance->status,
                'time' => $attendance->check_in_time,
            ]);

            return $attendance;

        } catch (\RuntimeException $e) {
            // 6. FAIL — log dengan level sesuai
            Log::error('Check-in gagal', [
                'student_id' => $studentId,
                'reason' => $e->getMessage(),
                'method' => __METHOD__,
                'line' => __LINE__,
            ]);
            throw $e;
        }
    }

    /**
     * Ambil statistik presensi.
     *
     * Log pattern: cukup info di awal + debug query saja
     */
    public function getStats(array $filters): array
    {
        Log::debug('AttendanceService::getStats', ['filters' => $filters]);

        $query = Attendance::query();

        if (!empty($filters['class_id'])) {
            $query->whereHas('student', fn ($q) => $q->where('class_id', $filters['class_id']));
        }

        if (!empty($filters['date'])) {
            $query->whereDate('attendance_date', $filters['date']);
        }

        $stats = [
            'total' => (clone $query)->count(),
            'present' => (clone $query)->where('status', 'Present')->count(),
            'late' => (clone $query)->where('status', 'Late')->count(),
            'absent' => (clone $query)->where('status', 'Absent')->count(),
        ];

        Log::info('Statistik presensi diambil', [
            'filters' => $filters,
            'stats' => $stats,
        ]);

        return $stats;
    }
}
```

**Ringkasan Pattern Service Layer:**

| Method | Log di Awal | Log di Sukses | Log di Error |
|--------|:-----------:|:-------------:|:------------:|
| Query/Read | `debug` (params) | `info` (ringkasan) | `error` |
| Write (create/update) | `debug` (params) | `info` (result) | `error` |
| Delete | `debug` (id) | `info` (id dihapus) | `error` |
| Batch/Process | `info` (mulai) | `info` (selesai + ringkasan) | `error` |

### 5.2. Controller (Web + API)

**Controller LOG minimal — hanya untuk tracing alur.** Service yang log detail.

```php
<?php
// app/Http/Controllers/Web/AttendanceController.php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Services\AttendanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {}

    /**
     * Check-in via Inertia (form submit).
     */
    public function checkIn(CheckInRequest $request): RedirectResponse
    {
        // Controller hanya: validasi + panggil service + redirect
        // Log minimal — cukup untuk tracing
        Log::info('Check-in request masuk', [
            'user_id' => $request->user()->id,
            'student_id' => $request->validated('student_id'),
        ]);

        try {
            $attendance = $this->attendanceService->checkIn(
                $request->validated('student_id'),
                $request->validated()
            );

            return redirect()->back()->with('success', 'Presensi berhasil dicatat.');
        } catch (\RuntimeException $e) {
            // Error sudah di-log oleh Service
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}
```

**API Controller:**

```php
<?php
// app/Http/Controllers/Api/AttendanceController.php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\CheckInRequest;
use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AttendanceController extends Controller
{
    public function __construct(
        private readonly AttendanceService $attendanceService,
    ) {}

    public function checkIn(CheckInRequest $request): JsonResponse
    {
        Log::info('API Check-in request', [
            'user_id' => $request->user()->id,
            'student_id' => $request->validated('student_id'),
        ]);

        try {
            $attendance = $this->attendanceService->checkIn(
                $request->validated('student_id'),
                $request->validated()
            );

            return ApiResponse::success($attendance, 'Presensi berhasil');
        } catch (\RuntimeException $e) {
            return ApiResponse::error($e->getMessage(), 422);
        }
    }
}
```

### 5.3. Blade (Full-Stack Traditional)

**Logging di Blade — JANGAN PERNAH.**

View adalah tempat rendering HTML, bukan tempat logic atau logging. Jika Anda merasa perlu log di Blade, itu tanda bahwa logic harus dipindahkan ke Controller atau Service.

```blade
{{-- ❌ SALAH: log di Blade --}}
@php
    Log::info('User melihat halaman dashboard');
@endphp

{{-- ✅ BENAR: Controller yang log sebelum render --}}
{{-- Controller: --}}
{{-- Log::info('User melihat dashboard', ['user_id' => $user->id]); --}}
{{-- return view('dashboard', compact('data')); --}}
```

**Satu-satunya pengecualian:** Jika ada partial view yang di-render via AJAX (bukan Inertia) dan Anda perlu log bahwa partial tersebut dimuat. Itu pun lebih baik di Controller yang meng-handle AJAX request.

### 5.4. Inertia (Modern Full-Stack)

Inertia adalah jembatan antara Laravel (backend) dan React (frontend). Logging di Inertia mencakup dua sisi.

**5.4.1. Backend Side — Inertia Middleware & Controller**

```php
<?php
// app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Log;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        // Log: data apa yang dishare ke semua halaman
        Log::debug('Inertia shared data', [
            'user_id' => $request->user()?->id,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ]);

        return array_merge(parent::share($request), [
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
            ],
        ]);
    }
}
```

**5.4.2. Frontend Side — Logger di React**

Untuk error di sisi React (bukan Inertia), logging dikirim ke backend via API endpoint.

```tsx
// resources/js/utils/logger.ts — sudah dijelaskan di error-handling-patterns.md
// Ringkasan:
export async function sendLogToBackend(entry: {
    level: string;
    message: string;
    context?: Record<string, unknown>;
}) {
    try {
        await fetch("/api/log-client-error", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entry),
        });
    } catch {
        // Silent fail — jangan bikin error tambahan
    }
}
```

**Backend endpoint untuk menerima log dari frontend:**

```php
<?php
// app/Http/Controllers/Api/ClientLogController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ClientLogController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $data = $request->validate([
            'level' => 'required|in:debug,info,warn,error',
            'message' => 'required|string|max:500',
            'context' => 'nullable|array',
        ]);

        $level = match ($data['level']) {
            'warn' => 'warning',
            default => $data['level'],
        };

        // Gunakan level yang sesuai
        Log::{$level}('[CLIENT] ' . $data['message'], $data['context'] ?? []);

        return response()->json(['success' => true]);
    }
}
```

**Route:**
```php
// routes/api.php
Route::post('/log-client-error', [ClientLogController::class, '__invoke'])
    ->middleware('throttle:60,1'); // max 60 log per menit
```

### 5.5. Queue & Schedule

**5.5.1. Queue Job Pattern**

```php
<?php
// app/Jobs/GenerateDailyRecap.php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateDailyRecap implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 300;    // 5 menit
    public int $tries = 3;        // 3 kali percobaan
    public int $backoff = 60;     // tunggu 60 detik antar retry

    public function __construct(
        private readonly string $date,
    ) {}

    public function handle(): void
    {
        $start = microtime(true);

        Log::info('GenerateDailyRecap: START', [
            'date' => $this->date,
            'job_id' => $this->job?->getJobId(),
            'attempt' => $this->attempts(),
        ]);

        try {
            // ... proses generate ...

            $duration = (microtime(true) - $start) * 1000;

            Log::info('GenerateDailyRecap: SUCCESS', [
                'date' => $this->date,
                'duration_ms' => round($duration, 2),
                'total_records' => $count ?? 0,
            ]);
        } catch (\Exception $e) {
            Log::error('GenerateDailyRecap: FAILED', [
                'date' => $this->date,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e; // Biarkan job gagal — akan retry
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::critical('GenerateDailyRecap: ALL ATTEMPTS FAILED', [
            'date' => $this->date,
            'tries' => $this->tries,
            'error' => $e->getMessage(),
        ]);
    }
}
```

**5.5.2. Schedule Logging**

```php
// app/Console/Kernel.php
use Illuminate\Support\Facades\Log;

protected function schedule(Schedule $schedule): void
{
    // Harian — generate rekap jam 23:55
    $schedule->job(new GenerateDailyRecap(now()->toDateString()))
        ->dailyAt('23:55')
        ->name('generate-daily-recap')
        ->onSuccess(function () {
            Log::info('Schedule: generate-daily-recap completed');
        })
        ->onFailure(function (\Throwable $e) {
            Log::error('Schedule: generate-daily-recap failed', [
                'error' => $e->getMessage(),
            ]);
        });

    // Setiap jam — bersihkan temporary files
    $schedule->call(function () {
        Log::debug('Schedule: cleanup-temp dimulai');
        // ... cleanup ...
        Log::info('Schedule: cleanup-temp selesai');
    })->hourly()->name('cleanup-temp');
}
```

### 5.6. Console Commands

```php
<?php
// app/Console/Commands/CheckAttendanceStatus.php

namespace App\Console\Commands;

use App\Services\AttendanceService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckAttendanceStatus extends Command
{
    protected $signature = 'attendance:check-status
                          {--date= : Tanggal yang dicek (default: hari ini)}
                          {--notify : Kirim notifikasi jika ada siswa bolos}';

    protected $description = 'Cek status presensi dan kirim notifikasi jika ada anomali';

    public function handle(AttendanceService $service): int
    {
        $date = $this->option('date') ?? now()->toDateString();

        Log::info('Command: attendance:check-status START', [
            'date' => $date,
            'notify' => (bool) $this->option('notify'),
        ]);

        $this->info("Memeriksa presensi tanggal: {$date}");

        try {
            $result = $service->checkAnomalies($date);

            $this->info("Siswa tanpa presensi: {$result['absent_count']}");
            $this->info("Siswa terlambat: {$result['late_count']}");

            Log::info('Command: attendance:check-status SUCCESS', [
                'date' => $date,
                'absent_count' => $result['absent_count'],
                'late_count' => $result['late_count'],
                'notified' => $result['notified'] ?? false,
            ]);

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error: {$e->getMessage()}");

            Log::error('Command: attendance:check-status FAILED', [
                'date' => $date,
                'error' => $e->getMessage(),
            ]);

            return Command::FAILURE;
        }
    }
}
```

### 5.7. Event & Listener

Log di Event/Listener berguna untuk tracing alur event-driven.

```php
<?php
// app/Events/AttendanceRecorded.php

namespace App\Events;

use App\Models\Attendance;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class AttendanceRecorded
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly Attendance $attendance,
    ) {
        Log::debug('Event dispatched: AttendanceRecorded', [
            'attendance_id' => $attendance->id,
            'student_id' => $attendance->student_id,
            'status' => $attendance->status,
        ]);
    }
}
```

```php
<?php
// app/Listeners/HandleLateAttendance.php

namespace App\Listeners;

use App\Events\AttendanceRecorded;
use Illuminate\Support\Facades\Log;

class HandleLateAttendance
{
    public function handle(AttendanceRecorded $event): void
    {
        if ($event->attendance->status !== 'Late') {
            return;
        }

        Log::notice('Listener: HandleLateAttendance — siswa terlambat', [
            'attendance_id' => $event->attendance->id,
            'student_id' => $event->attendance->student_id,
            'check_in_time' => $event->attendance->check_in_time,
        ]);

        // ... kirim notifikasi ke wali kelas ...
    }
}
```

### 5.8. Middleware

```php
<?php
// app/Http/Middleware/LogRequestMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class LogRequestMiddleware
{
    /**
     * Log setiap request yang masuk — untuk audit trail.
     * Hanya untuk request penting (bukan asset static).
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip jika bukan route aplikasi
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        $start = microtime(true);

        $response = $next($request);

        $duration = (microtime(true) - $start) * 1000;

        // Log request yang lambat (> 1 detik) atau error
        if ($duration > 1000 || $response->isServerError()) {
            Log::warning('Request lambat atau error', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'status' => $response->getStatusCode(),
                'duration_ms' => round($duration, 2),
                'user_id' => $request->user()?->id,
            ]);
        }

        return $response;
    }

    private function shouldSkip(Request $request): bool
    {
        // Skip asset static, telescope, dll
        return str_starts_with($request->path(), 'telescope')
            || $request->is('build/*')
            || $request->is('hot')
            || $request->is('_debugbar/*');
    }
}
```

---

## 6. Correlation ID & Request Tracing

### 6.1. Konsep

Correlation ID adalah **ID unik per request** yang di-passing ke semua layer:

```
Browser (React)
    │  X-Correlation-ID: abc-123
    ▼
Laravel Middleware → Log::withContext(['request_id' => 'abc-123'])
    │
    ├── Controller → Log::info('...')  ← otomatis punya request_id
    ├── Service    → Log::info('...')  ← otomatis punya request_id
    ├── Job        → Log::info('...')  ← otomatis punya request_id (jika di-set manual)
    │
    ▼
Browser (React) ← Response header: X-Correlation-ID: abc-123
```

### 6.2. Implementasi

Middleware sudah disediakan di section 4.3. Berikut implementasi lengkap dengan response header:

```php
<?php
// app/Http/Middleware/LogContextMiddleware.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class LogContextMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $correlationId = $request->header('X-Correlation-ID')
            ?? $request->header('X-Request-ID')
            ?? (string) Str::uuid();

        Log::withContext([
            'correlation_id' => $correlationId,
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($user = $request->user()) {
            Log::withContext([
                'user_id' => $user->id,
                'user_role' => $user->role,
            ]);
        }

        $start = microtime(true);
        $response = $next($request);
        $duration = (microtime(true) - $start) * 1000;

        // Set correlation ID di response header
        $response->headers->set('X-Correlation-ID', $correlationId);

        // Tambah durasi ke context
        Log::withContext(['duration_ms' => round($duration, 2)]);

        // Log selesai — cukup satu baris per request
        Log::info('Request completed', [
            'status' => $response->getStatusCode(),
        ]);

        return $response;
    }
}
```

### 6.3. Correlation ID di Frontend React

```tsx
// resources/js/app.tsx
import { router } from "@inertiajs/react";
import { v4 as uuidv4 } from "uuid"; // atau crypto.randomUUID()

// Generate sekali per sesi
const correlationId = crypto.randomUUID?.() ?? uuidv4();

// Set header untuk semua request Inertia
router.on("start", (event) => {
    event.detail.visit.headers["X-Correlation-ID"] = correlationId;
});
```

Dengan ini, setiap request dari browser ke server punya ID yang sama — melacak error dari frontend sampai ke log backend jadi mudah.

---

## 7. Logging Sensitive Data — Checklist

### 7.1. Data yang TIDAK BOLEH Pernah di-Log

```php
// ⛔ JANGAN PERNAH log ini:

// Password
Log::info('User register', ['password' => $request->password]);

// Token
Log::info('Token generated', ['token' => $plainTextToken]);

// Data pembayaran (jika ada)
Log::info('Pembayaran', ['card_number' => '4111-1111-1111-1111']);

// Data pribadi berlebihan
Log::info('Siswa', [
    'full_address' => 'Jl. Merdeka No. 42, RT 01 RW 02, Kel. X, Kec. Y',
    'phone' => '0812-3456-7890',
    'birth_date' => '2000-01-01',
    'mother_name' => 'Siti',
]);
```

### 7.2. Checklist Sebelum Commit

```
☐ Apakah ada password, token, atau API key di log context?
☐ Apakah ada nomor telepon, alamat lengkap, atau data pribadi lain?
☐ Apakah log mencatat data yang bisa digunakan untuk impersonasi?
☐ Apakah data sensitif sudah di-scrub/dimasak-kan?
```

### 7.3. Scrubber Helper

```php
<?php
// app/Helpers/LogSanitizer.php

namespace App\Helpers;

class LogSanitizer
{
    private const SENSITIVE_KEYS = [
        'password',
        'password_confirmation',
        'token',
        'api_key',
        'secret',
        'credit_card',
        'cvv',
        'pin',
    ];

    /**
     * Scrub sensitive data dari array context sebelum di-log.
     */
    public static function scrub(array $data): array
    {
        foreach ($data as $key => $value) {
            if (in_array(strtolower($key), self::SENSITIVE_KEYS, true)) {
                $data[$key] = '[REDACTED]';
            } elseif (is_array($value)) {
                $data[$key] = self::scrub($value);
            }
        }
        return $data;
    }
}
```

**Cara pakai:**
```php
use App\Helpers\LogSanitizer;

Log::info('User data', LogSanitizer::scrub([
    'name' => 'John',
    'password' => 'secret123',       // → '[REDACTED]'
    'token' => 'abc-def-ghi',         // → '[REDACTED]'
    'address' => 'Jl. Merdeka No. 1', // → tetap (tidak sensitif)
]));
```

---

## 8. Log Viewer & Monitoring Tools

### 8.1. Laravel Telescope (Development)

Telescope adalah tools #1 untuk melihat log di development.

```bash
# Akses
http://smauii-core.test/telescope

# Tab yang berguna untuk logging:
# - Logs: semua log yang ditulis
# - Exceptions: error + stack trace
# - Dumps: output dump() — tidak perlu cek terminal
```

**Logging ke Telescope tanpa menulis ke file:**
```php
// Telescope menyimpan SEMUA log, tidak perlu filter
// Cukup jalankan Log::info() biasa, Telescope akan menangkapnya

// Untuk debug cepat — tanpa file log:
telescope()->log('debug', 'Sedang debug fungsi X', ['key' => 'value']);
```

### 8.2. Log Tail Real-time (Windows-Compatible)

Tooling dari `development-workflow.md` section 3.6:

```bash
# Semua log
php artisan log:tail

# Hanya error ke atas
php artisan log:tail --level=error

# Filter kata kunci
php artisan log:tail --level=error --timeout=60
```

### 8.3. Production Monitoring Strategy

Untuk production, log harus di-aggregate ke satu tempat:

```
Opsi 1: PaaS (termudah)
├── Laravel Log → file
├── File → Logtail / Papertrail / Logdna (agent)
└── Dashboard → Real-time log viewer

Opsi 2: Self-hosted (rekomendasi untuk tim)
├── Laravel Log → JSON file
├── JSON → Filebeat / Promtail
├── Filebeat → Elasticsearch / Loki
└── Dashboard → Kibana / Grafana

Opsi 3: Simple (untuk skala kecil)
├── Laravel Log → daily file
├── PHP script → parse + kirim ke database log sendiri
└── Dashboard → Halaman admin: /admin/logs
```

---

## 9. Environment Strategy

### 9.1. Konfigurasi per Environment

```ini
# .env (development)
LOG_CHANNEL=stack
LOG_STACK=daily
LOG_LEVEL=debug
LOG_DAILY_DAYS=7

# .env.production
LOG_CHANNEL=stack
LOG_STACK=json
LOG_LEVEL=warning
LOG_DAILY_DAYS=30
```

### 9.2. Yang Berbeda per Environment

| Aspek | Development | Production |
|-------|:-----------:|:----------:|
| **Channel** | `daily` | `json` (untuk aggregation) |
| **Level** | `debug` (semua) | `warning` (hanya penting) |
| **Formatter** | `LineFormatter` (teks) | `JsonFormatter` (JSON) |
| **Retensi** | 7 hari | 30 hari |
| **Slack** | Tidak | Ya (critical saja) |
| **Telescope** | Aktif | Nonaktif |

### 9.3. Best Practice

- **Jangan gunakan `APP_DEBUG=true` di production** — ini mengekspos stack trace ke user
- **Gunakan `LOG_LEVEL=warning` di production** — `debug` dan `info` hanya untuk development
- **Gunakan `JsonFormatter` di production** — untuk integrasi dengan log aggregation
- **Rotasi log otomatis** — `driver: daily` dengan `days: 30`

---

## 10. Custom Logger Channel

### 10.1. Channel Database

Untuk kasus tertentu, log bisa ditulis ke database (misalnya: audit trail).

```php
<?php
// app/Logging/DatabaseLogger.php

namespace App\Logging;

use App\Models\Log as LogModel;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\LogRecord;

class DatabaseLogger extends AbstractProcessingHandler
{
    protected function write(LogRecord $record): void
    {
        try {
            LogModel::create([
                'level' => $record->level->name,
                'message' => $record->message,
                'context' => json_encode($record->context),
                'ip' => request()->ip() ?? 'console',
                'user_agent' => request()->userAgent() ?? 'cli',
                'created_at' => $record->datetime,
            ]);
        } catch (\Exception $e) {
            // Silent fail — jangan bikin error tambahan
            // Jika database bermasalah, log ke file akan tetap jalan
        }
    }
}
```

**Daftarkan di `config/logging.php`:**
```php
'database' => [
    'driver' => 'monolog',
    'handler' => App\Logging\DatabaseLogger::class,
    'level' => env('LOG_LEVEL', 'warning'),
],
```

**Model:**
```php
<?php
// app/Models/Log.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $fillable = [
        'level', 'message', 'context', 'ip', 'user_agent',
    ];

    protected $casts = [
        'context' => 'array',
    ];
}
```

### 10.2. Channel dengan Multiple Handler

Mengirim error ke file + Slack sekaligus:

```php
// config/logging.php
'stack' => [
    'driver' => 'stack',
    'channels' => explode(',', env('LOG_STACK', 'daily')),
    'ignore_exceptions' => false,
],

// .env
LOG_STACK=daily,slack
LOG_LEVEL_SLACK=critical
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
```

---

## 11. Troubleshooting Logger

### 11.1. Log Tidak Tertulis

```
1. Cek permission folder:
   chmod -R 775 storage/logs
   chown -R www-data:www-data storage/logs

2. Cek disk space:
   df -h

3. Cek konfigurasi .env:
   LOG_CHANNEL=stack
   LOG_LEVEL=debug  ← jangan error, nanti yang di bawah error tidak muncul

4. Coba tulis manual:
   php artisan tinker
   > Log::info('test log');
   > exit;
   cat storage/logs/laravel.log | grep "test log"
```

### 11.2. Log Terlalu Besar

```
1. Ganti ke channel 'daily' (rotasi otomatis per hari)

2. Atur retensi:
   'days' => env('LOG_DAILY_DAYS', 14)

3. Naikkan minimum level:
   LOG_LEVEL=warning  ← hanya warning ke atas

4. Hapus log lama:
   php artisan log:clear  ← custom command

5. Cron job kompresi:
   0 0 * * * gzip /path/to/storage/logs/laravel-*.log
```

### 11.3. Error "LOG_LEVELSLACK" / "Slack not configured"

Slack channel akan error jika webhook URL tidak dikonfigurasi:

```bash
# Solusi: pastikan channel slack tidak di stack jika tidak dipakai
LOG_STACK=daily  ← tanpa slack
# atau
LOG_STACK=daily,slack
LOG_SLACK_WEBHOOK_URL=https://hooks.slack.com/...  ← diisi
```

### 11.4. Log Berisi Data Sensitif

Jika terlanjur log data sensitif:

```bash
# 1. Segera hapus log
rm storage/logs/laravel.log

# 2. Rotasi manual
php artisan log:rotate  ← custom command

# 3. Evaluasi — tambahkan key ke LogSanitizer
# 4. Briefing tim — ingatkan checklist sensitive data
```

---

## 12. Checklist Implementasi

### Status Logger SMAUII Core

| # | Item | Status | Keterangan |
|:-:|------|:------:|------------|
| 1 | **Middleware Log Context** (correlation ID) | ✅ **SUDAH** | `app/Http/Middleware/LogContextMiddleware.php` |
| 2 | **Service Layer logging** | ⚠️ Parsial | Ada di beberapa service, belum konsisten |
| 3 | **Controller logging** | ❌ Belum | Hampir tidak ada log di controller |
| 4 | **Queue job logging** | ❌ Belum | Job belum punya log start/success/fail |
| 5 | **Schedule logging** | ❌ Belum | Schedule tidak log |
| 6 | **Event/Listener logging** | ❌ Belum | Event tidak terlog |
| 7 | **Console command logging** | ❌ Belum | Command tidak log |
| 8 | **Frontend → Backend client log** | ❌ Belum | Logger utility ada, endpoint belum |
| 9 | **Custom Exception Handler** | ⚠️ Parsial | Ada renderable, belum lengkap |
| 10 | **HTTP Error Pages** | ✅ **SUDAH** | 403, 404, 419, 500 — kustom SMAUII branding |
| 11 | **JSON logger untuk production** | ❌ Belum | Masih pakai daily (teks) |
| 12 | **LogSanitizer helper** | ❌ Belum | Perlu dibuat |
| 13 | **Log Viewer (admin panel)** | ❌ Belum | Telescope hanya development |
| 14 | **Log rotation & retention** | ✅ **Sudah** | Driver daily otomatis |

### ✅ Selesai

| No | Item | Detail |
|:--:|------|--------|
| 1 | Middleware LogContext (correlation ID) | ✅ `app/Http/Middleware/LogContextMiddleware.php` |
| 2 | Daftarkan middleware | ✅ `bootstrap/app.php` — global middleware |
| 3 | HTTP Error Pages | ✅ Kustom SMAUII branding (403, 404, 419, 500) |
| 4 | Client Log endpoint | ✅ `ClientLogController.php` + route |

### 🟡 Prioritas Sedang (Sprint Ini)

| No | Item | Estimasi |
|:--:|------|:--------:|
| 5 | Service Layer logging pattern | 2 jam |
| 6 | LogSanitizer helper | 15 menit |
| 7 | Queue job logging | 1 jam |
| 8 | Console command logging | 30 menit |
| 9 | Event/Listener logging | 30 menit |

### 🟡 Prioritas Sedang (Sprint Ini)

| No | Item | Estimasi |
|:--:|------|:--------:|
| 5 | Client Log endpoint + route | 1 jam |
| 6 | Queue job logging pattern | 1 jam |
| 7 | Console command logging | 30 menit |
| 8 | Event/Listener logging | 30 menit |

### 🟢 Prioritas Rendah (Sprint Depan)

| No | Item | Estimasi |
|:--:|------|:--------:|
| 9 | JSON logger channel | 15 menit |
| 10 | Database logger channel (opsional) | 1 jam |
| 11 | Admin log viewer page | 3 jam |

---

## 13. Referensi

### Dokumen Terkait
- [`development-workflow.md`](development-workflow.md) — Tooling, testing, workflow utama
- [`error-handling-patterns.md`](error-handling-patterns.md) — Runtime error patterns (melengkapi dokumen ini)

### Source Code Referensi
- `config/logging.php` — Konfigurasi channel logger
- `app/Exceptions/Handler.php` — Exception handler
- `app/Http/Middleware/HandleInertiaRequests.php` — Inertia shared data

### Dokumentasi Resmi
- [Laravel Logging Docs](https://laravel.com/docs/13.x/logging) — Dokumentasi resmi Laravel
- [Monolog Docs](https://seldaek.github.io/monolog/) — Library logging di bawah Laravel
- [PSR-3 Logger Interface](https://www.php-fig.org/psr/psr-3/) — Standar interface logger PHP
- [12 Factor App — Logs](https://12factor.net/logs) — Filosofi log sebagai event stream

---

> Dokumen ini hidup — akan terus diperbarui seiring perkembangan pattern dan kebutuhan tim.
>
> Terakhir diperbarui: 3 Juli 2026
> Oleh: sandikodev
