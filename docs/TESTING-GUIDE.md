# Panduan Lengkap Testing & Quality Assurance (Testing Guide)

> **Dokumentasi Resmi Standar Pengujian Perangkat Lunak SMART Absen SMA UII Yogyakarta**  
> **Target Audiens:** Backend Engineers, Frontend Engineers, QA Engineers / Software Testers, dan DevOps/CI-CD Maintainers  
> **Terakhir Diperbarui:** Agustus 2026  
> **Penanggung Jawab:** Sandikodev (PM Lead & Architecture Lead)

---

## 🎯 1. Filosofi & Piramida Pengujian (*Testing Pyramid*)

Untuk menjamin keandalan sistem presensi, perizinan, dan master data sekolah dengan nol cacat (*zero defect*), `smauii-core` menerapkan **Piramida Pengujian 4 Layer**:

```
                  /\
                 /  \
                / E2E \          Layer 4: Playwright End-to-End Testing
               / Play- \         (Simulasi Kamera Selfie, GPS Geofence, Multi-Role Journey)
              /  wright \
             /------------\
            /  Component   \     Layer 3: Vitest + React Testing Library + Axe-Core
           /   & A11y UI    \    (Interactive Drawers, Modals, Form States, Aksesibilitas)
          /------------------\
         /  Unit Schemas &    \  Layer 2: Bun Test (Super-Fast Sub-Millisecond)
        /   DTO TypeScript     \ (Skema Validasi Zod, zodHelper, Haversine Geofence, Utils)
       /------------------------\
      /    Backend PHP Testing   \ Layer 1: PHPUnit / Pest (160+ Test Suite)
     /     Services, DB & Auth    \ (Spatie RBAC, S3 Storage RustFS, FormRequests, APIs)
    /------------------------------\
```

### Distribusi Beban Pengujian:
* **Layer 1 (Backend PHPUnit):** 50% — Menguji ketahanan database, aturan bisnis, perizinan, dan transaksi.
* **Layer 2 (Bun Test - Schemas & Utils):** 25% — Menguji validasi client-side, DTO parsing, dan kalkulasi jarak instan.
* **Layer 3 (Vitest - Components & A11y):** 15% — Menguji komponen visual, interaksi Drawer, dan kepatuhan WCAG 2.1 AA.
* **Layer 4 (Playwright - E2E Multi-Role):** 10% — Menguji skenario lintas pengguna nyata dengan simulasi kamera & GPS.

---

## 🧪 2. Layer 1: Backend PHP Testing (PHPUnit)

Backend Laravel 13 diuji menggunakan test runner PHPUnit bawaan yang dioptimalkan untuk pengujian transaksi database di dalam memori/container.

### 2.1. Struktur File Test Backend
```
tests/
├── TestCase.php                         # Base setup (tanpa CSRF di test environment)
├── Unit/                                # Unit logic murni (tanpa database)
└── Feature/                             # Feature & Integration test (dengan DB RefreshDatabase)
    ├── Services/                        # Pengujian Business Service
    │   ├── AttendanceServiceTest.php
    │   ├── DashboardServiceTest.php
    │   ├── DutyScheduleServiceTest.php
    │   ├── LeaveRequestServiceTest.php
    │   └── SchoolClassServiceTest.php
    ├── Web/                             # Pengujian Controller & Akses Halaman Web
    │   ├── DashboardRoleTest.php        # Isolasi dashboard per role
    │   ├── ExportPageTest.php           # Unduh laporan Excel & PDF
    │   ├── GuardianLeaveApplicationTest.php # Pengajuan izin wali murid & upload berkas
    │   ├── LeaveVerificationAccessTest.php  # Izin verifikasi guru piket vs wali
    │   └── RolePageAccessTest.php       # Proteksi rute 403/404 antar role
    └── UserRoleSyncTest.php             # Sinkronisasi role Spatie vs kolom DB
```

### 2.2. Cara Menjalankan Test Backend
```bash
# Jalankan seluruh test suite backend (160 tests)
docker exec core-app-1 php artisan test

# Jalankan test file spesifik
docker exec core-app-1 php artisan test tests/Feature/Web/DashboardRoleTest.php

# Jalankan dengan filter nama method
docker exec core-app-1 php artisan test --filter=test_admin_dashboard_renders_admin_view
```

---

## ⚡ 3. Layer 2: Fast TypeScript Unit Testing (Bun Test)

Bun memiliki test runner bawaan yang sangat cepat (*sub-millisecond execution*) untuk memvalidasi logika TypeScript murni, skema validasi Zod, dan fungsi pembantu (*pure utilities*).

### 3.1. Struktur File Test Bun
```
resources/js/__tests__/
├── schemas/                             # Pengujian Skema Zod
│   ├── attendance.schema.test.ts        # Validasi koordinat GPS & photo selfie
│   ├── student.schema.test.ts           # Validasi NIS, NISN, nama, tanggal lahir
│   ├── teacher.schema.test.ts           # Validasi kode guru, tipe guru
│   └── leaveRequest.schema.test.ts      # Validasi kategori izin & rentang tanggal
└── utils/
    ├── zodHelper.test.ts                # Validasi error formatting helper
    └── geofence.test.ts                 # Validasi rumus jarak Haversine sekolah
```

### 3.2. Cara Menjalankan Bun Test
```bash
# Jalankan seluruh unit test logika TypeScript dengan Bun
bun test resources/js/__tests__/schemas/

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

## 🎭 5. Layer 4: End-to-End (E2E) Testing (Playwright)

Playwright mensimulasikan interaksi pengguna nyata di browser Chromium/Firefox/WebKit dengan fitur simulasi khusus untuk sistem presensi:

### 5.1. Konfigurasi Simulasi Geolokasi GPS SMA UII
Playwright secara otomatis menginjeksikan koordinat GPS SMA UII Yogyakarta (`lat: -7.797061, lng: 110.399583`):

```typescript
// e2e/fixtures.ts
export const schoolLocation = {
  latitude: -7.797061,
  longitude: 110.399583,
  accuracy: 10,
};

// Pengujian di dalam radius (SUKSES)
test.use({
  geolocation: schoolLocation,
  permissions: ['geolocation', 'camera'],
});
```

### 5.2. Konfigurasi Virtual Camera (*Mocking Selfie*)
Playwright dijalankan dengan argumen Chromium untuk mengaktifkan video kamera virtual:
```typescript
// playwright.config.ts
use: {
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',     // Otomatis klik "Allow Camera"
      '--use-fake-device-for-media-stream', // Injeksi dummy video kamera
    ],
  },
}
```

### 5.3. Skenario Uji E2E Utama:
1. **`e2e/auth.spec.ts`:** Pengujian login Admin, Guru Piket, Wali Kelas, Wali Murid, dan Siswa.
2. **`e2e/attendance-flow.spec.ts`:** Siswa login ➔ kamera aktif ➔ ambil selfie ➔ presensi berhasil terkirim.
3. **`e2e/admin-master-data.spec.ts`:** Admin login ➔ buka Drawer Siswa ➔ simpan data ➔ data muncul di tabel.
4. **`e2e/leave-approval-flow.spec.ts`:** Wali murid ajukan izin sakit ➔ Wali kelas login ➔ setujui izin via Drawer.

### 5.4. Resilient Selectors Standard (Playwright & Laravel Dusk Compatibility)
Seluruh elemen interaktif dilengkapi atribut `dusk` dan `data-testid` agar pengujian tidak rapuh terhadap perubahan kelas CSS / Tailwind:
```html
<button type="submit" dusk="student-submit-btn" data-testid="student-submit-btn">Simpan Siswa</button>
```
* **Playwright:** `await page.locator('[dusk="student-submit-btn"]').click();`
* **Laravel Dusk:** `$browser->click('@student-submit-btn');`

### 5.5. Cara Menjalankan Playwright E2E
```bash
# Jalankan semua skenario E2E (Headless)
bun run test:e2e

# Jalankan dengan antarmuka UI interaktif Playwright
bun run test:e2e:ui
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
| **Backend Dev** | Memastikan controller, domain service, dan database transaction aman & terisolasi. | PHPUnit & Pint | `docker exec core-app-1 php artisan test` |
| **Frontend Dev** | Memastikan skema Zod valid, Drawer responsif, dan komponen bebas error rendering. | Bun Test, Vitest & Storybook | `bun run test:bun` & `bun run test` & `bun run storybook` |
| **QA / Tester** | Menguji skenario alur nyata, kepatuhan formulir, dan eksekusi UAT bersama sekolah. | Playwright & Manual UAT | `bun run test:e2e` & [Panduan Akun Mockup](SEED-DATA-TESTING-GUIDE.md) |
| **DevOps / CI** | Menjalankan seluruh test matrix otomatis sebelum PR di-merge ke `develop`. | GitHub Actions CI | `bun run lint && bun run typecheck && php artisan test` |

---

## 🚀 8. Quality Gate Checklist Sebelum Pull Request

Sebelum membuat PR ke branch `develop`, setiap pengembang wajib memastikan seluruh perintah berikut lulus (*0 error*):

```bash
# 1. Backend Linting & Standar Kode PSR-12
docker exec core-app-1 ./vendor/bin/pint --test

# 2. Backend Static Analysis (PHPStan Level 6)
docker exec core-app-1 ./vendor/bin/phpstan analyse --memory-limit=2G

# 3. Backend Test Suite (PHPUnit)
docker exec core-app-1 php artisan test

# 4. Frontend Linting & Formatting
bun run lint
bun run format

# 5. Frontend Typecheck
bun run typecheck

# 6. Frontend Unit & Component Tests
bun run test:bun
bun run test

# 7. Storybook Production Build
bun run build-storybook
```
