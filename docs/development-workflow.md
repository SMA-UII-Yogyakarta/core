# Panduan Development Workflow — SMART Absen SMA UII

> Dokumen ini berisi panduan lengkap untuk seluruh tim (sandikodev, Azis, Fathan, Ihsan, Hanif) dalam mengevaluasi, menyempurnakan, mengelola kode, dan memantau aplikasi secara terukur dan terarah.

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Arsitektur dan Alur Kerja Developer](#2-arsitektur-dan-alur-kerja-developer)
3. [Laravel Tooling — PHP Backend](#3-laravel-tooling--php-backend)
   - 3.1. Larastan (PHPStan)
   - 3.2. Laravel IDE Helper
   - 3.3. Laravel Pint
   - 3.4. PHPUnit
   - 3.5. Laravel Telescope
   - 3.6. Log Tail (log:tail)
4. [Frontend Tooling — React / TypeScript / Vite](#4-frontend-tooling--react--typescript--vite)
   - 4.1. TypeScript Strict Mode
   - 4.2. ESLint + typescript-eslint
   - 4.3. vite-plugin-checker
5. [Runtime Monitoring](#5-runtime-monitoring)
   - 5.1. Logging Terstruktur
   - 5.2. Error Tracking
   - 5.3. Performance Monitoring
6. [Alur Evaluasi dan Review Code](#6-alur-evaluasi-dan-review-code)
7. [Panduan Penggunaan Harian](#7-panduan-penggunaan-harian)
8. [Troubleshooting](#8-troubleshooting)
9. [Referensi](#9-referensi)

---

## 1. Pendahuluan

### 1.1. Tujuan

Dokumen ini bertujuan menyamakan pemahaman dan keterampilan seluruh tim pengembang SMART Absen SMA UII dalam:

- **Mengevaluasi** kualitas kode sebelum dirilis
- **Menyempurnakan** kode secara bertahap dan terukur
- **Mengelola** kode dengan standar yang konsisten
- **Memantau** aplikasi saat development dan produksi

### 1.2. Target Pembaca

| Peran | Nama | Fokus |
|---|---|---|
| Project Manager & Lead Developer | sandikodev | Arsitektur, review, CI/CD |
| Learning Mentor | Azis | Review kode, mentoring tim |
| Junior Frontend Developer | Fathan Mubina | React/Inertia/TypeScript |
| Junior Backend Developer | Ihsan | Laravel/PostgreSQL |
| Junior Frontend Developer | Hanif | React/Inertia/TypeScript |

### 1.3. Prasyarat Sistem

| Komponen | Spesifikasi |
|---|---|
| OS (rekomendasi) | Linux (Ubuntu 24.04 / WSL2) |
| OS (alternatif) | Windows + Laragon |
| PHP | 8.4.22 NTS |
| Database | PostgreSQL 16 (production) / SQLite (development) |
| Node.js | 22 LTS |
| Package Manager | Bun |
| IDE | VS Code / PhpStorm |

---

## 2. Arsitektur dan Alur Kerja Developer

### 2.1. Stack Teknologi

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│              React 19 + InertiaJS 3              │
│              TypeScript 5.7, Tailwind 4          │
└────────────────────┬────────────────────────────┘
                     │ HTTP (Inertia)
┌────────────────────▼────────────────────────────┐
│              Vite 8 (Dev Server)                  │
│              laravel-vite-plugin                  │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│           Laravel 13 (Backend API)                │
│     Sanctum Auth | Service Layer | Eloquent       │
│     PostgreSQL | Redis | S3 (Wasabi/MinIO)        │
└─────────────────────────────────────────────────┘
```

### 2.2. Alur Developer — "Prevent Before Runtime"

Filosofi utama: **menangkap error sebelum runtime**, bukan setelah user melaporkan.

```
MENULIS KODE
    │
    ├── Larastan (static analysis) ───→ error terminal
    ├── ESLint (linting) ─────────────→ error terminal
    ├── TS Checker (overlay) ────────→ overlay browser
    │
    ▼
COMMIT & PUSH
    │
    ├── Laravel Pint (style fix) ────→ otomatis
    │
    ▼
PULL REQUEST / REVIEW
    │
    ├── PHPUnit (test) ──────────────→ pass/fail
    ├── Manual review ───────────────→ comment/approve
    │
    ▼
MERGE & DEPLOY
    │
    ├── Telescope (debug)
    ├── log:tail (real-time)
    └── Error tracking
```

### 2.3. Dual Controller Pattern

Setiap fitur memiliki dua controller:

```
Fitur: Check-in Presensi

app/Http/Controllers/Web/AttendanceController.php   ← Inertia (session)
app/Http/Controllers/Api/AttendanceController.php   ← API (Sanctum token)

Keduanya memanggil service yang sama:
app/Services/AttendanceService.php                  ← Logic bisnis
```

### 2.4. Service Layer Pattern

Controller tidak boleh mengandung logic bisnis. Semua logic harus di Service:

```
Controller (tipis) → memvalidasi input (Form Request)
                   → memanggil Service
                   → mengembalikan response (Inertia render / JSON)

Service (tebal)    → logic bisnis
                   → query database via Eloquent
                   → throw exception jika error
```

---

## 3. Laravel Tooling — PHP Backend

### 3.1. Larastan (PHPStan)

**Apa itu?**  
Static analysis untuk Laravel. Mendeteksi potensi bug tanpa perlu menjalankan kode.

**Kemampuan:**
- Missing return type
- Undefined variable / property
- Wrong type hint
- Dead code (parameter tidak terpakai)
- Call to undefined method
- Array shape mismatch

**Level Static Analysis (Level 1–10):**

| Level | Cakupan |
|---|---|
| 1 | Basic: undefined variable, unknown class, wrong number of arguments |
| 2 | Unknown methods, unknown properties |
| 3 | Return type checking, dead code detection |
| 4–5 | Type checking lebih ketat (array shapes, generics) |
| 6+ | Strict type checking maksimal |

**Cara Install:**
```bash
composer require --dev larastan/larastan:^3.0
```

**Cara Konfigurasi (phpstan.neon):**
```neon
includes:
    - vendor/larastan/larastan/extension.neon

parameters:
    level: 5
    paths:
        - app
        - config
        - database
        - tests
    excludePaths:
        - tests/Fixtures
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: false
    databaseMigrationsPath:
        - database/migrations
```

**Cara Menjalankan:**
```bash
# Analisis seluruh project
./vendor/bin/phpstan analyse

# Analisis folder tertentu
./vendor/bin/phpstan analyse app/Services

# Analisis dengan output progres
./vendor/bin/phpstan analyse --progress

# Generate baseline (untuk project existing dengan banyak error)
./vendor/bin/phpstan analyse --generate-baseline
```

**Tips untuk tim:**
- Mulai dari level 2, naikkan 1 level per sprint
- Jalankan sebelum commit (`composer.json` scripts)
- Gunakan `--generate-baseline` jika project sudah besar agar tidak kewalahan
- Error baru tidak boleh masuk — baseline hanya untuk error lama

### 3.2. Laravel IDE Helper

**Apa itu?**  
Generator PHPDoc untuk IDE (VS Code / PhpStorm). Membuat autocomplete akurat untuk Facade, Model, Query Builder.

**Kemampuan:**
- Autocomplete method Facade (`Cache::remember()`, `DB::table()`)
- Autocomplete kolom database di Model (`User::where('email', ...)`)
- Autocomplete factory, relation, scope
- PhpStorm metadata

**Cara Install:**
```bash
composer require --dev barryvdh/laravel-ide-helper
php artisan vendor:publish --provider="Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider" --tag=config
```

**Generate Helper:**
```bash
# Generate semua helper
php artisan ide-helper:generate

# Generate model PHPDoc (timpa file)
php artisan ide-helper:models -RW

# Generate PhpStorm metadata
php artisan ide-helper:meta

# Generate Eloquent mixin
php artisan ide-helper:eloquent
```

**Contoh hasil — Sebelum:**
```php
$user = User::find(1);
$user->  // ← IDE tidak tahu kolom apa saja
```

**Contoh hasil — Sesudah (dengan helper):**
```php
$user = User::find(1);
$user->  // ← IDE otomatis menampilkan: name, email, role, created_at, dll
```

**Best Practice:**
- Jalankan setiap kali ada migration baru
- Commit file `_ide_helper.php` dan `_ide_helper_models.php` ke repository (agar semua anggota tim dapat)
- Tambahkan `post-update-cmd` di composer.json:

```json
"post-update-cmd": [
    "@php artisan ide-helper:generate",
    "@php artisan ide-helper:meta",
    "@php artisan vendor:publish --tag=laravel-assets --ansi --force"
]
```

### 3.3. Laravel Pint

**Apa itu?**  
Code style fixer otomatis — PSR-12 compliance.

**Cara Menjalankan:**
```bash
# Fix semua file
./vendor/bin/pint

# Dry run (lihat perubahan tanpa menulis)
./vendor/bin/pint --test

# Folder spesifik
./vendor/bin/pint app/Services
```

**Konfigurasi (pint.json):**
```json
{
    "preset": "psr12",
    "rules": {
        "no_unused_imports": true,
        "ordered_imports": {
            "sort_algorithm": "alpha"
        },
        "concat_space": {
            "spacing": "one"
        },
        "single_quote": true
    }
}
```

**Integrasi dengan pre-commit hook:**
```bash
# Git hook (contoh untuk *nix)
echo '#!/bin/sh
./vendor/bin/pint --test' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### 3.4. PHPUnit

**Apa itu?**  
Framework testing bawaan Laravel.

**Jenis Test:**
- **Unit Test** — test class/function secara isolated
- **Feature Test** — test HTTP request, database, authentication
- **Browser Test** — test UI (Laravel Dusk)

**Cara Menjalankan:**
```bash
# Semua test
php artisan test

# Test spesifik
php artisan test --filter="AttendanceServiceTest"

# Test dengan coverage (butuh Xdebug/PCOV)
php artisan test --coverage
```

**Standar Penulisan Test:**
```php
public function test_check_in_creates_attendance(): void
{
    // Arrange — setup data
    $class = SchoolClass::create(['name' => 'X-A']);
    $user = User::factory()->create();
    $student = Student::factory()->for($user)->for($class)->create();

    // Act — lakukan aksi
    $attendance = $this->service->checkIn($student->id, [...]);

    // Assert — verifikasi hasil
    $this->assertEquals($student->id, $attendance->student_id);
    $this->assertEquals('Present', $attendance->status);
}
```

**Pattern Naming Convention:**
```
test_{method}_{skenario}_{expected_result}
Contoh: test_checkIn_duplicate_throwsException
         test_stats_withNoAttendance_returnsZero
```

**Coverage Minimum Target:**
- Service layer: 80%+
- Controller: 60%+
- Total project: 70%+

### 3.5. Laravel Telescope

**Apa itu?**  
Debug assistant untuk development. Merekam request, query, exception, log, mail, notification, cache, queue, schedule, dump.

**Akses:**
```
http://smauii-core.test/telescope
```

**Yang Bisa Dipantau:**
| Tab | Fungsi |
|---|---|
| Request | Detail setiap HTTP request (method, URI, duration) |
| Commands | Artisan command yang dijalankan |
| Queries | Semua SQL query + binding + duration |
| Exceptions | Error + stack trace lengkap |
| Logs | Semua log level |
| Mail | Email yang dikirim |
| Notifications | Notifikasi (database/mail) |
| Cache | Cache hit/miss |
| Jobs | Queue job status |
| Dumps | `dump()` output — nggak perlu cek terminal |

**Filter (Hanya Local):**
```php
// app/Providers/TelescopeServiceProvider.php
protected function gate(): void
{
    Gate::define('viewTelescope', fn ($user) => true);
}
```

Cocok untuk:
- Debug query N+1
- Investigasi exception
- Cek performa endpoint
- Verifikasi email terkirim

### 3.6. Log Tail (log:tail)

**Apa itu?**  
Custom Artisan command untuk real-time log monitoring. Alternatif `php artisan pail` yang kompatibel dengan Windows.

**Cara Pakai:**
```bash
# Default (ikuti log terbaru)
php artisan log:tail

# Filter level
php artisan log:tail --level=error

# Timeout
php artisan log:tail --timeout=60

# Mode Production (filter error saja)
php artisan log:tail --level=error --timeout=0
```

**Cara Kerja:**
- Linux/macOS: delegasi ke `php artisan pail` (menggunakan `pcntl`)
- Windows: polling file `storage/logs/laravel.log` via PHP (`fseek` loop 500ms)

**Dev Script (sudah di composer.json):**
```bash
# Jalankan semua service development sekaligus
php artisan dev
# = server, queue, logs, vite
```

---

## 4. Frontend Tooling — React / TypeScript / Vite

### 4.1. TypeScript Strict Mode

**Apa itu?**  
Mode TypeScript paling ketat. Menangkap error tipe data sebelum kode dijalankan.

**Konfigurasi Saat Ini (tsconfig.json):**
```json
{
    "compilerOptions": {
        "strict": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "exactOptionalPropertyTypes": false,
        "noUncheckedIndexedAccess": true
    }
}
```

**Apa yang Strict Mode Cegah:**
```typescript
// ❌ Akan error
const x: number = "hello";           // Type 'string' is not assignable to type 'number'
let y; y = 5; y = "test";           // noImplicitAny: error
function fn(a) {}                    // Parameter 'a' implicitly has 'any' type

// ✅ Harusnya
const x: number = 42;
function fn(a: string): void {}
```

### 4.2. ESLint + typescript-eslint

**Apa itu?**  
Linter untuk TypeScript/React. Menerapkan best practice dan mencegah potensi bug.

**Cara Install:**
```bash
bun add -d eslint @eslint/js typescript typescript-eslint eslint-plugin-react-hooks
```

**Konfigurasi (eslint.config.mjs):**
```javascript
// @ts-check
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
    { ignores: ["**/vendor/**", "**/public/**", "**/bootstrap.js"] },
    js.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        plugins: {
            "react-hooks": reactHooks,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-floating-promises": "error",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
);
```

**Cara Menjalankan:**
```bash
# Lint semua file
bunx eslint .

# Lint dengan auto-fix
bunx eslint . --fix

# Cek saja (tanpa fix)
bunx eslint . --no-fix
```

**Rules Penting untuk Tim:**
| Rule | Level | Fungsi |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | error | Mencegah variable tidak terpakai |
| `@typescript-eslint/no-explicit-any` | warn | Mencegah penggunaan `any` (harusnya diketik) |
| `@typescript-eslint/no-floating-promises` | error | Mencegah Promise yang tidak di-await |
| `react-hooks/exhaustive-deps` | warn | Mencegah missing dependency di useEffect |
| `react-hooks/rules-of-hooks` | error | Hooks hanya boleh dipanggil di komponen React |

### 4.3. vite-plugin-checker

**Apa itu?**  
Plugin Vite yang menampilkan TypeScript/ESLint error sebagai overlay di browser saat development.

**Cara Install:**
```bash
bun add -d vite-plugin-checker
```

**Konfigurasi (vite.config.js):**
```javascript
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import checker from "vite-plugin-checker";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/css/app.css", "resources/js/app.tsx"],
            refresh: true,
        }),
        react(),
        tailwindcss(),
        checker({
            typescript: {
                tsconfigPath: "./tsconfig.json",
            },
            eslint: {
                lintCommand: 'eslint "./resources/js/**/*.{ts,tsx}"',
            },
            overlay: {
                initialIsOpen: "error",
                position: "br",
            },
            terminal: true,
            enableBuild: true,
        }),
    ],
});
```

**Yang Terjadi Saat Development:**
```
┌────────────────────────────────────────┐
│  Browser window                        │
│                                        │
│   ┌───[vite-plugin-checker]───┐        │
│   │                           │        │
│   │ ⛔ src/App.tsx:42:5       │        │
│   │   Type 'string' is not    │        │
│   │   assignable to type      │        │
│   │   'number'.               │        │
│   │                           │        │
│   │ ⚠ src/Component.tsx:15:7 │        │
│   │   'onClick' is missing    │        │
│   │   in props.               │        │
│   │                           │        │
│   └───────────────────────────┘        │
│                                        │
│  [Halaman aplikasi berjalan normal]    │
└────────────────────────────────────────┘
```

**Keuntungan:**
- Error TypeScript langsung terlihat di browser — tidak perlu buka terminal
- Bisa filter: hanya error (initialIsOpen: "error") atau error + warning
- Jalan di thread terpisah — tidak mempengaruhi performa HMR

---

## 5. Runtime Monitoring

### 5.1. Logging Terstruktur

**Konfigurasi Saat Ini (.env):**
```ini
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=debug
```

**Level Log (dari paling rendah):**
| Level | Contoh Penggunaan |
|---|---|
| `debug` | Informasi debugging detail |
| `info` | Informasi umum (user login, cron job selesai) |
| `notice` | Kondisi normal tapi penting |
| `warning` | Potensi masalah (query lambat, retry queue) |
| `error` | Error yang perlu segera ditangani |
| `critical` | Sistem tidak bisa berfungsi |
| `alert` | Perlu tindakan segera |
| `emergency` | Sistem down total |

**Cara Logging di Laravel:**
```php
use Illuminate\Support\Facades\Log;

Log::info('User logged in', ['user_id' => $user->id, 'ip' => request()->ip()]);
Log::error('Check-in failed', ['student_id' => $studentId, 'reason' => $e->getMessage()]);

// Atau helper
logger()->debug('Processing attendance batch', ['count' => count($students)]);
```

**Prinsip Logging:**
- Log di Service Layer, bukan Controller
- Sertakan context (ID, data relevan) — jangan log string saja
- Jangan log data sensitif (password, token)
- Gunakan level yang sesuai

### 5.2. Error Tracking

**Saat Development:**
```
php artisan log:tail --level=error
```
Menampilkan semua error secara real-time di terminal.

**Saat Debugging:**
```
Buka http://smauii-core.test/telescope → tab Exceptions
```
Lihat stack trace lengkap, request data, session, query yang dijalankan.

**Error Handling Pattern:**
```php
// Service Layer
public function checkIn(int $studentId, array $data): Attendance
{
    try {
        // ... logic
    } catch (\Exception $e) {
        Log::error('Check-in gagal', [
            'student_id' => $studentId,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        throw new \RuntimeException('Gagal melakukan presensi: ' . $e->getMessage());
    }
}
```

### 5.3. Performance Monitoring

**Dengan Telescope (tab Queries):**
```
http://smauii-core.test/telescope/queries
```
Cari query dengan durasi > 100ms — indikasi N+1 atau missing index.

**Indikator Performa:**
| Metrik | Target | Cara Cek |
|---|---|---|
| Query time | <50ms | Telescope Queries tab |
| Response time | <500ms | Telescope Request tab |
| Memory usage | <64MB | Telescope Request tab |
| N+1 query | 0 | Telescope Queries tab (cari duplicate query) |

**Mendeteksi N+1 Query:**
```php
// ❌ N+1 — panggil query dalam loop
$students = Student::all();
foreach ($students as $student) {
    echo $student->user->name; // ← query terpisah setiap iterasi
}

// ✅ Eager loading
$students = Student::with('user')->get();
foreach ($students as $student) {
    echo $student->user->name; // ← 1 query JOIN
}
```

---

## 6. Alur Evaluasi dan Review Code

### 6.1. Checklist Evaluasi Code

**Sebelum Commit — Ceklis Developer:**

```
☐ php artisan test (semua passing)
☐ ./vendor/bin/pint --test (tidak ada style issue)
☐ ./vendor/bin/phpstan analyse --level=5 (level sesuai baseline)
☐ bunx eslint . (tidak ada error)
☐ Tidak ada komentar kode yang tidak perlu
☐ Tidak ada data sensitif (.env, key, token)
☐ Sesuai konvensi: Controller tipis, Service tebal
☐ Eager loading untuk relasi (cegah N+1)
☐ Form Request untuk validasi
☐ Migration sudah ada (jika ubah schema)
```

**Saat Pull Request — Reviewer Checklist:**

```
☐ Kode berfungsi sesuai spesifikasi?
☐ Ada test untuk kode baru?
☐ Tidak ada duplikasi kode?
☐ Naming sesuai konvensi?
☐ Error handling sudah benar?
☐ Logging sudah cukup?
☐ Security: input tervalidasi, SQL injection tercegah?
☐ Performance: query efficient, no N+1?
```

### 6.2. Kriteria "Ready to Merge"

| Kriteria | Wajib? | Keterangan |
|---|---|---|
| PHPUnit pass | ✅ Wajib | Semua test harus hijau |
| Larastan level 5 | ✅ Wajib | Tidak ada error baru |
| ESLint zero error | ✅ Wajib | Warning boleh, error tidak |
| Pint style check pass | ✅ Wajib | PSR-12 compliance |
| Review minimal 1 orang | ✅ Wajib | sandikodev / Azis |
| Coverage test > 80% (service) | 🎯 Target | Untuk file yang diubah |

### 6.3. Siklus Evaluasi per Sprint

```
Hari 1-3: Development
  - Tulis kode
  - Jalankan tooling (Larastan, ESLint, Pint, PHPUnit)
  - Commit

Hari 4: Review
  - Kirim PR
  - Reviewer cek checklist
  - Diskusi jika ada issue

Hari 5: Perbaikan + Merge
  - Perbaiki sesuai review
  - Re-run semua tooling
  - Merge ke main

Setiap sprint review:
  - Evaluasi baseline Larastan (naik level jika siap)
  - Review coverage test
  - Catat error yang lolos ke production
```

---

## 7. Panduan Penggunaan Harian

### 7.1. Setup Development

**Pertama Kali Clone:**
```bash
composer run setup
```

**Yang Dilakukan Setup:**
1. `composer install` — install PHP dependencies
2. Copy `.env.example` ke `.env`
3. `php artisan key:generate` — generate APP_KEY
4. `php artisan migrate` — buat semua tabel
5. `bun install` — install Node dependencies
6. `bun run build` — build frontend

### 7.2. Daily Workflow

```bash
# 1. Jalankan environment development
php artisan dev
# (menjalankan server + queue + logs + vite secara bersamaan)

# 2. Buka browser
# http://smauii-core.test:8000

# 3. Telescope
# http://smauii-core.test:8000/telescope

# 4. Saat coding, lihat overlay browser untuk TypeScript error
#    Lihat terminal untuk PHP error (log:tail)

# 5. Sebelum commit:
php artisan test
./vendor/bin/pint --test
```

### 7.3. Common Commands

**PHP/Laravel:**
```bash
php artisan test                         # Jalankan semua test
php artisan test --filter="ServiceTest"  # Test spesifik
./vendor/bin/pint                        # Fix code style
./vendor/bin/phpstan analyse             # Static analysis
php artisan log:tail                     # Real-time log
php artisan telescope:clear              # Bersihkan data Telescope
```

**Frontend:**
```bash
bun run dev                              # Vite dev server
bun run build                            # Build production
bunx eslint .                           # Linting
bunx tsc --noEmit                       # Type check (tanpa overlay)
```

**Database:**
```bash
php artisan migrate:fresh --seed         # Reset DB + seed
php artisan db:seed                      # Seed ulang
php artisan make:migration create_xxx_table
php artisan make:model Xxx -m
```

### 7.4. Membuat Fitur Baru — Langkah-langkah

```bash
# 1. Migration
php artisan make:migration create_xxx_table

# 2. Model
php artisan make:model Xxx

# 3. Service
# Buat manual: app/Services/XxxService.php

# 4. Form Request
php artisan make:request StoreXxxRequest

# 5. Controller (Web + API)
php artisan make:controller Web/XxxController --invokable
php artisan make:controller Api/XxxController --invokable

# 6. Route
# routes/web.php + routes/api.php

# 7. Test
php artisan make:test Services/XxxServiceTest

# 8. Frontend Page (Inertia + React)
# resources/js/Pages/Xxx/Index.tsx

# 9. Run tooling
php artisan test
./vendor/bin/pint --test
./vendor/bin/phpstan analyse
bunx eslint .
```

### 7.5. Tips Produktivitas

| Aktivitas | Tool | Command |
|---|---|---|
| Cari file | VS Code / `glob` | `rg "function checkIn"` |
| Cek query | Telescope | `/telescope/queries` |
| Debug variabel | Telescope dumps | `dump($var)` di controller |
| Cek error | Telescope | `/telescope/exceptions` |
| Cek log | log:tail | `php artisan log:tail --level=error` |
| Format otomatis | Pint | `./vendor/bin/pint` |
| Cek type script | TS Checker | Overlay browser |

---

## 8. Troubleshooting

### 8.1. Windows vs Linux

| Issue | Solusi |
|---|---|
| `php artisan pail` error (pcntl) | Gunakan `php artisan log:tail` |
| Queue worker stuck | `php artisan queue:restart` |
| Vite HMR lambat di WSL2 | Set `server.watch.usePolling: true` di vite.config |
| Permission storage | `chmod -R 777 storage bootstrap/cache` (Linux) |
| SQLite vs PostgreSQL | Development: SQLite. Production: PostgreSQL |

### 8.2. Error Umum

```
Error: Target class [xxx] does not exist.
→ Service Provider belum register, atau nama class typo.

Error: SQLSTATE[23000] Integrity constraint violation
→ Field NOT NULL tidak diisi saat create.

Error: Call to undefined method App\Models\Xxx::xxx()
→ Method tidak ada, atau relasi belum didefinisikan.

Error: N+1 query detected
→ Tambah with() di query.

Telescope blank (404)
→ php artisan telescope:publish
```

### 8.3. Debugging Cepat

```php
// 1. Dump and die (hentikan eksekusi)
dd($variable);

// 2. Dump (lanjut eksekusi, hasil di Telescope)
dump($variable);

// 3. Log ke file
Log::debug('Context', ['key' => $value]);

// 4. Log ke Telescope (tanpa file)
telescope()->log('debug', 'message');

// 5. Query log
DB::enableQueryLog();
// ... query ...
dd(DB::getQueryLog());
```

### 8.4. Saat Production Issue

```
1. Cek log:     php artisan log:tail --level=error
2. Cek Telescope: /telescope/exceptions
3. Cek database:  Apakah ada migration yang belum jalan? php artisan migrate:status
4. Cek queue:     php artisan queue:listen --tries=3
5. Cek cache:     php artisan optimize:clear
```

---

## 9. Referensi

### Dokumentasi Resmi
- [Laravel 13 Docs](https://laravel.com/docs/13.x)
- [InertiaJS 3 Docs](https://inertiajs.com/)
- [React 19 Docs](https://react.dev/)
- [TypeScript 5.7 Docs](https://www.typescriptlang.org/docs/)
- [Vite 8 Docs](https://vite.dev/)
- [Tailwind CSS 4 Docs](https://tailwindcss.com/docs/)

### Tooling yang Digunakan
- [Larastan (PHPStan)](https://github.com/larastan/larastan)
- [Laravel IDE Helper](https://github.com/barryvdh/laravel-ide-helper)
- [Laravel Pint](https://github.com/laravel/pint)
- [Laravel Telescope](https://github.com/laravel/telescope)
- [ESLint](https://eslint.org/)
- [typescript-eslint](https://typescript-eslint.io/)
- [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker)

### Project-Specific
- `composer.json` — Daftar dependency + scripts
- `package.json` — Daftar dependency frontend + scripts
- `.opencode/SHARED/project-context.md` — Konteks project untuk AI agent
- `.opencode/SHARED/agent-rules.md` — Aturan untuk AI agent
- `playbook` repo — SOP, workflow, ADR

---

> Dokumen ini hidup — akan terus diperbarui seiring perkembangan tooling dan kebutuhan tim.
> Terakhir diperbarui: 2 Juli 2026
> Oleh: sandikodev
