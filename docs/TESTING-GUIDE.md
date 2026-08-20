# Panduan Lengkap Testing & Quality Assurance (Testing Guide)

> **Dokumentasi Resmi Standar Pengujian Perangkat Lokasi & Visual QA SMART Absen SMA UII Yogyakarta**  
> **Target Audiens:** Backend Engineers, Frontend Engineers, QA Engineers / Software Testers, dan DevOps/CI-CD Maintainers  
> **Terakhir Diperbarui:** Agustus 2026  
> **Penanggung Jawab:** Sandikodev (PM Lead & Architecture Lead)

---

## 💡 Prinsip & Filosofi Sandikodev: "Programmer Adalah Judgement"

> *"Pastikan semuanya passed, namun juga harus dipastikan memang sesuai flow yang dirancang. Cukup gunakan AI dengan bijak, programmer adalah judgement."*  
> *"100% Passed BUKAN BERARTI QA SELESAI. Lihat hasil capture screenshot Playwright untuk mendeteksi UI/UX buruk yang harus diperbaiki."* — **Sandikodev**

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      PEMAHAMAN PENTING AUDIT QA                        │
 ├────────────────────────────────────────────────────────────────────────┤
 │ 1. Status "100 PASSED" hanya membuktikan elemen ada di DOM & HTTP 200. │
 │ 2. "100 PASSED" TIDAK menjamin UI/UX terlihat rapi di mata pengguna.  │
 │ 3. Programmer/QA Wajib melakukan Visual Audit via Playwright Capture.   │
 │ 4. Jika ada Tab overlap, teks terpotong, atau padding yang buruk,      │
 │    itu adalah bukti UI/UX buruk yang WAJIB diperbaiki walau test PASS!  │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 1. Piramida Pengujian (*Testing Pyramid*)

Untuk menjamin keandalan sistem presensi, perizinan, dan master data sekolah dengan nol cacat (*zero defect*), `smauii-core` menerapkan **Piramida Pengujian 4 Layer**:

```
                  /\
                 /  \
                / E2E \          Layer 4: Playwright Multi-Viewport & Multi-Role QA Audit
               / Play- \         (100 Tests: Kamera Selfie, GPS Geofence, Visual Screenshots)
              /  wright \
             /------------\
            /  Component   \     Layer 3: Vitest + React Testing Library + Axe-Core
           /   & A11y UI    \    (Interactive Drawers, Modals, Form States, Aksesibilitas WCAG)
          /------------------\
         /  Unit Schemas &    \  Layer 2: Bun Test (Super-Fast Sub-Millisecond)
        /   DTO TypeScript     \ (Skema Validasi Zod, zodHelper, Haversine Geofence, Utils)
       /------------------------\
      /    Backend PHP Testing   \ Layer 1: PHPUnit / Pest (206 Tests / 971 Assertions)
     /     Services, DB & Auth    \ (Spatie RBAC, S3 Storage RustFS, FormRequests, APIs)
    /------------------------------\
```

### Distribusi Beban Pengujian:
* **Layer 1 (Backend PHPUnit):** 50% — Menguji ketahanan database, aturan bisnis, perizinan, dan transaksi.
* **Layer 2 (Bun Test - Schemas & Utils):** 25% — Menguji validasi client-side, DTO parsing, dan kalkulasi jarak instan.
* **Layer 3 (Vitest - Components & A11y):** 15% — Menguji komponen visual, interaksi Drawer, dan kepatuhan WCAG 2.1 AA.
* **Layer 4 (Playwright - E2E Multi-Role):** 10% — Menguji skenario lintas pengguna nyata dengan simulasi kamera, GPS, dan multi-viewport.

---

## 🧪 2. Layer 1: Backend PHP Testing (PHPUnit)

Backend Laravel 13 diuji menggunakan test runner PHPUnit bawaan yang dioptimalkan untuk pengujian transaksi database di dalam memori/container (`RefreshDatabase`).

### 2.1. Struktur File Test Backend
```
tests/
├── TestCase.php                         # Base setup (tanpa CSRF di test environment)
├── Unit/                                # Unit logic murni (tanpa database)
│   ├── ExampleTest.php
│   ├── PermissionRegistryNavTest.php    # Validasi registry navigasi RBAC
│   └── Services/StorageServiceTest.php  # Validasi S3 storage service
└── Feature/                             # Feature & Integration test (DB RefreshDatabase)
    ├── Api/                             # REST API & Sanctum Auth
    │   ├── ApiAuthControlTest.php
    │   ├── ApiContractTest.php
    │   └── AttendanceApiTest.php
    ├── Services/                        # Pengujian Business Service
    │   ├── AcademicCalendarServiceTest.php
    │   ├── AnalyticsServiceTest.php
    │   ├── AttendanceServiceTest.php
    │   ├── AttendanceTimeSettingServiceTest.php
    │   ├── DashboardServiceTest.php
    │   ├── DutyScheduleServiceTest.php
    │   ├── LeaveRequestServiceTest.php
    │   └── SchoolClassServiceTest.php
    ├── Web/                             # Pengujian Controller & Akses Halaman Web
    │   ├── AttendanceSettingWebTest.php # Konfigurasi jam presensi & libur
    │   ├── DashboardRoleTest.php        # Isolasi dashboard per role & overview
    │   ├── ExportPageTest.php           # Unduh laporan Excel & PDF
    │   ├── GuardianAssignmentTest.php   # Penugasan siswa ke wali murid
    │   ├── GuardianLeaveApplicationTest.php # Pengajuan izin wali murid & upload berkas
    │   ├── GuardianPortalTest.php       # Dashboard & riwayat wali murid (168 assertions)
    │   ├── ImportWebTest.php            # Import CSV/Excel master data
    │   ├── LeaveVerificationAccessTest.php  # Izin verifikasi guru piket vs wali
    │   ├── RolePageAccessTest.php       # Proteksi rute 403/404 antar role
    │   ├── StorageProxyTest.php         # Proxy penyajian berkas S3
    │   ├── StudentPortalTest.php        # Dashboard, live attendance, & history siswa
    │   └── TeacherPortalTest.php        # DutyDashboard & HomeroomDashboard guru (13 tests)
    └── UserRoleSyncTest.php             # Sinkronisasi role Spatie vs kolom DB
```

### 2.2. Cara Menjalankan Test Backend
```bash
# Jalankan seluruh test suite backend (206 tests, 971 assertions)
docker exec core-dev-app-1 php artisan test

# Jalankan test file spesifik
docker exec core-dev-app-1 php artisan test --filter=TeacherPortalTest

# Jalankan dengan filter nama method
docker exec core-dev-app-1 php artisan test --filter=test_duty_dashboard_renders_with_class_stats
```

---

## ⚡ 3. Layer 2: Fast TypeScript Unit Testing (Bun Test)

Bun memiliki test runner bawaan yang sangat cepat (*sub-millisecond execution*) untuk memvalidasi logika TypeScript murni, skema validasi Zod, dan fungsi pembantu (*pure utilities*).

### 3.1. Struktur File Test Bun
```
resources/js/__tests__/
├── schemas/                             # Pengujian Skema Zod
│   ├── attendance.schema.test.ts        # Validasi koordinat GPS & photo selfie
│   ├── attendanceCheckIn.schema.test.ts # Validasi payload check-in
│   ├── leaveRequest.schema.test.ts      # Validasi kategori izin & rentang tanggal
│   ├── student.schema.test.ts           # Validasi NIS, NISN, nama, tanggal lahir
│   └── teacher.schema.test.ts           # Validasi kode guru, tipe guru
└── utils/
    ├── geoHelper.test.ts                # Validasi rumus jarak Haversine sekolah
    └── zodHelper.test.ts                # Validasi error formatting helper
```

### 3.2. Cara Menjalankan Bun Test
```bash
# Jalankan seluruh unit test logika TypeScript dengan Bun
bun test resources/js/__tests__/schemas/ resources/js/__tests__/utils/

# Atau via npm script
bun run test:bun
```

---

## 🎨 4. Layer 3: Component & Accessibility Testing (Vitest + Axe-Core)

Untuk komponen React yang membutuhkan DOM lingkungan browser (JSDOM) dan pengujian aksesibilitas (*a11y*), sistem menggunakan **Vitest** yang terintegrasi langsung dengan konfigurasi Vite.

### 4.1. Cakupan Pengujian Komponen:
* **Interactive Action Drawers:** Memastikan Drawer Siswa/Guru/Izin membuka form dengan benar dan menutup saat tombol batal diklik.
* **Form Error States:** Memastikan pesan kesalahan validasi Zod muncul di bawah *input field* terkait.
* **Automated Accessibility (A11y):** Memverifikasi kontras warna, label form, dan navigasi keyboard mematuhi standar WCAG 2.1 AA.

### 4.2. Cara Menjalankan Vitest
```bash
# Jalankan semua test komponen React & A11y
bun run test

# Mode watch interaktif saat development
bun run test:watch

# Pengujian kepatuhan aksesibilitas khusus
bun run test:a11y
```

---

## 🎭 5. Layer 4: End-to-End (E2E) & Multi-Viewport QA Audit (Playwright)

Playwright mensimulasikan interaksi pengguna nyata di browser Chromium dengan fitur simulasi geolokasi GPS, kamera virtual, dan pengujian **5 Viewport Preset**:

### 5.1. Presets Viewports (`playwright.config.ts`)
```typescript
projects: [
  { name: 'mobile-portrait', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  { name: 'mobile-landscape', use: { ...devices['Pixel 7'], viewport: { width: 844, height: 390 } } },
  { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
  { name: 'laptop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  { name: 'desktop-fhd', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
]
```

### 5.2. Konfigurasi Simulasi GPS & Kamera
```typescript
use: {
  baseURL: 'http://localhost:8800',
  geolocation: { latitude: -7.797061, longitude: 110.399583 },
  permissions: ['geolocation', 'camera'],
  launchOptions: {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
}
```

### 5.3. File Spec Playwright:
1. **`e2e/auth.spec.ts`:** Login Admin, Guru Piket, Wali Kelas, Wali Murid, Siswa & verifikasi gateway `/overview`.
2. **`e2e/responsive-admin.spec.ts`:** Audit responsifitas halaman Master Data & Laporan Admin.
3. **`e2e/responsive-teacher.spec.ts`:** Audit responsifitas Duty Dashboard (Piket) & Homeroom Dashboard (Wali).
4. **`e2e/responsive-guardian.spec.ts`:** Audit responsifitas Dashboard, History, & Leave Application Wali Murid.
5. **`e2e/responsive-student.spec.ts`:** Audit responsifitas Dashboard, Live Presensi (WebRTC/GPS), & History Siswa.
6. **`e2e/admin-master-data.spec.ts`:** Drawer Tambah Data & Tab Switcher.
7. **`e2e/attendance-flow.spec.ts`:** Skenario presensi siswa dari awal hingga akhir.

### 5.4. Cara Menjalankan Playwright & Buka Laporan Visual
```bash
# 1. Jalankan seluruh 100 E2E tests across 5 viewports
bun x playwright test

# 2. Buka Laporan Visual HTML Report (akses via laptop di http://localhost:9300)
bun x playwright show-report --host 0.0.0.0 --port 9300
```

---

## 🎨 6. Layer Tambahan: Storybook Visual & A11y Testing

Storybook mengisolasi komponen UI dari backend untuk memverifikasi varian visual dan kepatuhan aksesibilitas WCAG 2.1 AA via `@storybook/addon-a11y`.

```bash
# Jalankan Storybook dev server (port 6006)
bun run storybook

# Bangun bundle statis Storybook
bun run build-storybook
```

Panduan lengkap Design System dan Storybook:  
👉 **[DESIGN-SYSTEM-STORYBOOK.md](DESIGN-SYSTEM-STORYBOOK.md)**

---

## 📋 7. Panduan untuk Berbagai Divisi

| Divisi | Tanggung Jawab Pengujian | Tool Utama | Perintah Cepat |
|---|---|---|---|
| **Backend Dev** | Memastikan controller, domain service, dan database transaction aman & terisolasi. | PHPUnit & Pint | `docker exec core-dev-app-1 php artisan test` |
| **Frontend Dev** | Memastikan skema Zod valid, Drawer responsif, dan komponen bebas error rendering. | Bun Test, Vitest & Storybook | `bun run test:bun` & `bun run test` & `bun run storybook` |
| **QA / Tester** | Menguji skenario alur nyata, audit visual Playwright screenshot, dan kepatuhan UI/UX. | Playwright & HTML Report | `bun x playwright test` & `bun x playwright show-report --host 0.0.0.0 --port 9300` |
| **DevOps / CI** | Menjalankan seluruh test matrix otomatis sebelum PR di-merge ke `develop`. | GitHub Actions CI | `bun run lint && bun run typecheck && php artisan test` |

---

## 🚀 8. Quality Gate Checklist Sebelum Pull Request

Sebelum membuat PR ke branch `develop`, setiap pengembang wajib memastikan seluruh perintah berikut lulus (*0 error*):

```bash
# 1. Backend Linting & Standar Kode PSR-12
docker exec core-dev-app-1 ./vendor/bin/pint --test

# 2. Backend Static Analysis (PHPStan Level 6)
docker exec core-dev-app-1 ./vendor/bin/phpstan analyse --memory-limit=2G

# 3. Backend Test Suite (PHPUnit - 206 Tests, 971 Assertions)
docker exec core-dev-app-1 php artisan test

# 4. Frontend Linting & Formatting
bun run lint
bun run format

# 5. Frontend Typecheck
bun run typecheck

# 6. Frontend Unit & Component Tests (Bun Test & Vitest)
bun run test:bun
bun run test

# 7. Playwright E2E Multi-Viewport Test (100 Tests Passed)
bun x playwright test

# 8. Storybook Production Build
bun run build-storybook
```
