# Panduan Audit Metodologis & Peta Jalan Konsistensi UI/UX Role Portal

> **Dokumen Spesifikasi Standarisasi Frontend & Auditing Layer-by-Layer**  
> **Repositori:** `SMA-UII-Yogyakarta/core`  
> **Penulis / Lead Engineer:** Sandikodev & Antigravity  
> **Tanggal Selesai:** Agustus 2026  
> **Status Akhir:** **100% SELESAI & LULUS AUDIT QUALITY GATE**  

---

## 📐 1. Prinsip Arsitektur & Standar Konsistensi UI/UX

Untuk menjamin kualitas antarmuka yang presisi, kaya fitur, dan profesional di seluruh portal pengguna (**Guru Piket, Wali Kelas, Orang Tua, Siswa, dan Admin**), seluruh pengembangan komponen wajib mematuhi **4 Aturan Utama Arsitektur UI**:

```
 ┌────────────────────────────────────────────────────────────────────────────┐
 │                  4 ATURAN UTAMA ARSITEKTUR UI SANIKODEV                    │
 ├────────────────────────────────────────────────────────────────────────────┤
 │ 1. TABEL HARUS BERDIRI SENDIRI (STANDALONE TABLE)                         │
 │    Tabel TIDAK BOLEH dibungkus di dalam komponen Card. Tabel berdiri       │
 │    mandiri dengan wrapper overflow-x-auto dan pembatas border semantik.    │
 │                                                                            │
 │ 2. KOMPOSABILITAS & REUSABILITAS KOMPONEN ATOMIK / MOLEKUL                 │
 │    Wajib menggunakan 100% komponen UI resmi dari `@/Components`:           │
 │    - Layout & Container : PageHeader, StickyContainer, Card, StatCard      │
 │    - Data Display       : Table, StatusBadge, LiveBadge, MetricPill, Avatar  │
 │    - Controls & Inputs  : Button, Input, SelectInput, NativeSelect, SearchBar│
 │                           Checkbox, Radio, Toggle, FormError, EmptyState   │
 │                           FilterBar                                        │
 │    - Overlays & Popups  : Modal, Drawer, ConfirmDialog, NotificationPopover│
 │    - Navigation & Pages : Pagination, FAB                                  │
 │                                                                            │
 │ 3. ELIMINASI HARDCODED STYLES & DIRECT INLINE HEX COLORS                   │
 │    Hapus semua warna hex manual (#1E293B, #2E3391, #E2E8F0, dll.).          │
 │    Gunakan token Tailwind CSS v4 semantik dari `app.css`                   │
 │    (`bg-surface`, `bg-background`, `bg-muted`, `text-text-primary`,       │
 │     `text-text-secondary`, `border-border`, `bg-primary`, `bg-accent`,     │
 │     `text-warning`, `text-success`, `text-danger`).                        │
 │                                                                            │
 │ 4. AUDIT RESPONSIVITAS 5 VIEWPORT (VISUAL AUDIT PLAYWRIGHT)                │
 │    Tampilan harus 100% presisi dan tidak overflow/patah pada 5 viewport:   │
 │    - Mobile Portrait  : 375px                                              │
 │    - Mobile Landscape : 667px                                              │
 │    - Tablet           : 768px                                              │
 │    - Laptop           : 1024px                                             │
 │    - Desktop FHD      : 1920px                                             │
 └────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ 2. Peta Jalan Audit Layer-by-Layer & Status Pelaksanaan

Audit dan refactoring telah dieksekusi secara terstruktur melalui 4 Layer Portal:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    STRUKTUR LAYER AUDIT & REFACTORING                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ LAYER 1: PORTAL GURU (Teacher - Piket & Wali Kelas) [SELESAI — PR #76]       │
│ ├── DutyDashboard.tsx       : Dashboard Pantauan & Kehadiran Guru Piket     │
│ └── HomeroomDashboard.tsx   : Dashboard Rekapitulasi & Statistik Wali Kelas  │
├──────────────────────────────────────────────────────────────────────────────┤
│ LAYER 2: PORTAL ORANG TUA (Guardian) [SELESAI — PR #77]                      │
│ ├── Dashboard.tsx           : Ringkasan Status Kehadiran Anak & Quick Action│
│ ├── History.tsx             : Riwayat Kehadiran Anak & Filter Bulan/Tahun   │
│ └── LeaveApplication.tsx    : Form Pengajuan Izin Anak & Unggah Dokumen    │
├──────────────────────────────────────────────────────────────────────────────┤
│ LAYER 3: PORTAL SISWA (Student) [SELESAI — PR #78, #83, #84]                 │
│ ├── Dashboard.tsx           : Ringkasan Presensi & Statistik Siswa           │
│ ├── LiveAttendance.tsx      : Presensi Kamera (Max 20KB) & Geofence GPS     │
│ └── AttendanceHistory.tsx   : Riwayat & Log Presensi Bulanan Siswa           │
├──────────────────────────────────────────────────────────────────────────────┤
│ LAYER 4: PORTAL ADMIN & REVIEWS/REPORTS [SELESAI — PR #75, #79, #81, #86]    │
│ ├── MasterData & Enrolment  : Master Data, Class Enrolment, Guardian Assign   │
│ ├── Verification & Correction: Leave Verification & Attendance Correction   │
│ └── Reports/Export.tsx      : Eliminasi Pembungkusan Tabel dalam Card & Hex  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 3. Matriks Audit Detail per Komponen UI

Seluruh komponen UI pada portal terverifikasi lulus evaluasi berikut:

| Komponen | Spesifikasi & Aturan Refactoring | Status Audit |
|:---|:---|:---:|
| **PageHeader** | Menggunakan `PageHeader` resmi di bagian atas halaman. Menyajikan judul, deskripsi kontekstual, dan tombol aksi di kanan atas (`children`). | **PASSED ✅** |
| **Card & StatCard** | `StatCard` digunakan untuk menampilkan metrik angka (Hadir, Telat, Alpa, Izin). `Card` HANYA untuk kontainer ringkasan atau form. **Dilarang membungkus `<Table>` di dalam `<Card>`**. | **PASSED ✅** |
| **Table** | Menggunakan komponen `Table` mandiri dengan wrapper `overflow-x-auto`, header `bg-muted`, baris `hover:bg-muted/50`, dan `Table.EmptyState` jika data kosong. | **PASSED ✅** |
| **Pagination** | `Pagination` ditempatkan di luar dan di bawah komponen `Table`, menyajikan status *"Menampilkan X - Y dari Z data"*. | **PASSED ✅** |
| **Tab Halaman & Filter** | Menggunakan `StickyContainer` & `MetricPill` atau `FilterBar` untuk memfilter status/periode. | **PASSED ✅** |
| **Form Inputs & Selects** | Menggunakan `Input`, `SelectInput`, `NativeSelect`, `SearchBar` dengan `FormError` terintegrasi untuk pesan validasi. | **PASSED ✅** |
| **Buttons & Badges** | Menggunakan `Button` (`variant="primary" \| "outline" \| "ghost" \| "danger"`) dan `StatusBadge` / `LiveBadge` untuk indikator status. | **PASSED ✅** |
| **Drawer & Modal** | Menggunakan `Drawer` untuk detail di layar seluler/tablet dan `Modal` / `ConfirmDialog` untuk tindakan konfirmasi di desktop. | **PASSED ✅** |
| **EmptyState & FilterBar** | Menggunakan `EmptyState` untuk tampilan data kosong tanpa duplikasi interface dan warna semantik `text-danger`. `FilterBar` menggunakan `FiSearch` konsisten. | **PASSED ✅** |

---

## 🔍 4. Spesifikasi & Hasil Audit Layer 1: Portal Guru (Teacher)

### 4.1. `Teacher/DutyDashboard.tsx` (Dashboard Guru Piket)
- [x] Ganti pembungkus tabel atau list manual dengan komponen `Table` mandiri.
- [x] Ganti pencarian manual dengan komponen `SearchBar`.
- [x] Ganti badge status manual dengan `StatusBadge`.
- [x] Pastikan 5 `StatCard` (Total, Hadir, Telat, Sakit/Izin, Alpa) tersusun rapi dalam grid 5 kolom di desktop dan 4 kolom di mobile.
- [x] Pastikan tidak ada hardcoded class warna hex (`#1E293B`, `#2E3391`, `#E2E8F0`, `#10B981`, `#F59E0B`, `#EF4444`).

### 4.2. `Teacher/HomeroomDashboard.tsx` (Dashboard Wali Kelas)
- [x] Ganti tabel daftar siswa wali kelas dengan komponen `Table` mandiri dan `Pagination`.
- [x] Ganti filter status kehadiran dengan `MetricPill` / filter tab.
- [x] Gunakan `PageHeader` di bagian paling atas halaman.
- [x] Pastikan responsif di 5 viewport (Mobile Portrait hingga Desktop FHD).

---

## 🔍 5. Spesifikasi & Hasil Audit Layer 2: Portal Orang Tua (Guardian)

### 5.1. `Guardian/Dashboard.tsx`
- [x] Ganti kartu status kehadiran dengan `StatCard` dan `StatusBadge`.
- [x] Ganti dropdown pemilih anak terhubung dengan `NativeSelect`.
- [x] Gunakan `Button` standar untuk tombol aksi pengajuan izin.
- [x] Gunakan `PageHeader` di bagian paling atas halaman.

### 5.2. `Guardian/History.tsx`
- [x] Ekstrak daftar riwayat presensi anak dari pembungkus `Card` ke dalam komponen `Table` mandiri dengan `Pagination`.
- [x] Gunakan `FilterBar` dan `Button` untuk filter bulan dan tahun.
- [x] Standarisasi prop `StatCard` dan komponen `Avatar`.

### 5.3. `Guardian/LeaveApplication.tsx`
- [x] Gunakan `Input`, `NativeSelect`, dan `FormError` untuk form pengajuan izin.
- [x] Integrasikan komponen preview dokumen unggahan dengan `StatusBadge` indikator kategori izin (Sakit/Izin/Dinas).
- [x] Gunakan `PageHeader` di bagian atas halaman dengan tombol kembali ke Overview.

---

## 🔍 6. Spesifikasi & Hasil Audit Layer 3: Portal Siswa (Student)

### 6.1. `Student/Dashboard.tsx`
- [x] Gunakan `PageHeader`, `StatCard`, dan `StatusBadge` untuk menyajikan status presensi hari ini.
- [x] Konsistensikan navigasi quick action ke Live Presensi & Riwayat dengan `react-icons/fi`.
- [x] Gunakan digital clock live badge dan design tokens Tailwind v4.

### 6.2. `Student/LiveAttendance.tsx`
- [x] Pastikan validasi kompresi citra 20KB (`imageCompressor.ts`) memberikan respons UI dengan `FormError` / Toast yang jelas.
- [x] Gunakan `Button` dengan status *loading spinner* bawaan saat mengirimkan lokasi GPS & foto.

### 6.3. `Student/AttendanceHistory.tsx`
- [x] Migrasi tabel riwayat presensi siswa ke komponen `Table` mandiri.
- [x] Gunakan `FilterBar`, `EmptyState`, dan `react-icons/fi`.
- [x] Integrasikan `AttendanceCalendar` dan `Modal` pratinjau foto bukti selfie.

---

## 🔍 7. Spesifikasi & Hasil Audit Layer 4: Portal Admin & Reports

### 7.1. `Reports/Export.tsx` & `Daily.tsx`
- [x] Hapus pembungkus `<Card>` di sekeliling tabel rekapitulasi.
- [x] Jadikan komponen `Table` berdiri sendiri dengan `overflow-x-auto` dan tempatkan `Pagination` di luar tabel.
- [x] Standarisasi `LeaveRequestCard.tsx` dengan slot modular.
- [x] Eliminasi warna hex dan gunakan token `text-text-muted`, `text-warning`, `text-success`, `text-danger`, dan `bg-surface`.

### 7.2. `Admin/HolidaySettings.tsx` & Master Data Pages
- [x] Eliminasi warna hex `#D97706` dan ganti dengan token `text-warning`.
- [x] Verifikasi bahwa seluruh tabel pada `MasterData`, `Monitoring`, `LeaveVerification`, `AttendanceCorrection`, `ClassEnrolment`, `GuardianAssignment`, `Notifications`, dan `Reports` berdiri sendiri tanpa pembungkus Card.

---

## 🧪 8. Hasil Quality Gate & Verifikasi Empiris

Seluruh pengujian otomatis dan manual telah dilaksanakan dengan hasil **100% PASS**:

```bash
# 1. Verifikasi Linter & Typecheck
bun run typecheck && bun run lint
# RESULT: 0 Errors / 0 Warnings (PASSED ✅)

# 2. Verifikasi Test Suite PHP Unit
docker exec core-dev-app-1 php artisan test
# RESULT: 238 / 238 Tests Passed — 1.076 Assertions (PASSED ✅)

# 3. Verifikasi Vite Production Build
bun run build
# RESULT: 1.403 Modules Transformed Cleanly (PASSED ✅)

# 4. Audit Visual Playwright Multi-Viewport (5 Viewports)
npx playwright test
# RESULT: 100 / 100 E2E Responsive Tests Passed across 5 Viewports (PASSED ✅)
```

---

## 🔀 9. Log Penggabungan Pull Request (PR Log)

| PR # | Branch | Perubahan Utama / Ruang Lingkup | Status Merge |
| :---: | :--- | :--- | :---: |
| **[#75](https://github.com/SMA-UII-Yogyakarta/core/pull/75)** | `refactor/ui-components-standardization` | Standardisasi `LeaveRequestCard`, integrasi Table di Reports, dan perbaikan SPA filter. | **MERGED** ✅ |
| **[#76](https://github.com/SMA-UII-Yogyakarta/core/pull/76)** | `refactor/teacher-portal-reusable-components` | Refactoring Layer 1: Portal Guru (`DutyDashboard.tsx` & `HomeroomDashboard.tsx`). Menghapus tabel dalam Card, menyajikan Standalone Table, PageHeader, StatCard, StatusBadge, NativeSelect. Closes #61, #62. | **MERGED** ✅ |
| **[#77](https://github.com/SMA-UII-Yogyakarta/core/pull/77)** | `refactor/guardian-portal-reusable-components` | Refactoring Layer 2: Portal Orang Tua (`Dashboard.tsx`, `History.tsx`, `LeaveApplication.tsx`). Menstandarkan FormError, NativeSelect, PageHeader, dan Standalone Table. | **MERGED** ✅ |
| **[#78](https://github.com/SMA-UII-Yogyakarta/core/pull/78)** | `refactor/student-portal-reusable-components` | Refactoring Layer 3: Portal Siswa (`Dashboard.tsx` & `AttendanceHistory.tsx`). Standalone Table, PageHeader, StatCard, NativeSelect, dan AttendanceCalendar. | **MERGED** ✅ |
| **[#79](https://github.com/SMA-UII-Yogyakarta/core/pull/79)** | `style/final-hex-color-cleanup` | Refactoring Layer 4: Eliminasi sisa warna hex hardcoded pada `HolidaySettings.tsx` & `Reports/Export.tsx`. | **MERGED** ✅ |
| **[#80](https://github.com/SMA-UII-Yogyakarta/core/pull/80)** | `docs/update-audit-role-portal-docs` | Pembaruan Dokumen `AUDIT-KONSISTENSI-UI-ROLE-PORTAL.md` dengan status audit lengkap dan log PR. | **MERGED** ✅ |
| **[#81](https://github.com/SMA-UII-Yogyakarta/core/pull/81)** | `style/design-tokens-full-compliance` | Standarisasi 100% Tailwind v4 semantic tokens pada seluruh Page components. | **MERGED** ✅ |
| **[#82](https://github.com/SMA-UII-Yogyakarta/core/pull/82)** | `docs/sync-figma-react-guide` | Sinkronisasi `PANDUAN-KONVERSI-FIGMA-KE-REACT.md` dengan konvensi ikon FA CDN vs React-Icons dan Canonical Types. | **MERGED** ✅ |
| **[#83](https://github.com/SMA-UII-Yogyakarta/core/pull/83)** | `refactor/student-attendance-history-ui` | Integrasi `FilterBar`, `EmptyState`, dan `react-icons/fi` di `AttendanceHistory.tsx`. Closes #59. | **MERGED** ✅ |
| **[#84](https://github.com/SMA-UII-Yogyakarta/core/pull/84)** | `refactor/student-dashboard-live-attendance` | Standarisasi `react-icons/fi` di Student Dashboard & LiveAttendance. Closes #60. | **MERGED** ✅ |
| **[#86](https://github.com/SMA-UII-Yogyakarta/core/pull/86)** | `fix/daily-class-summary-tokens` | Pemulihan token semantik pada kolom ringkasan kelas `Daily.tsx`. | **MERGED** ✅ |
| **[#89](https://github.com/SMA-UII-Yogyakarta/core/pull/89)** | `fix/security-storage-geofence` | Hardening storage proxy authorization & server-side GPS geofence validation. Closes #87. | **MERGED** ✅ |
| **[#90](https://github.com/SMA-UII-Yogyakarta/core/pull/90)** | `fix/homeroom-scope-least-privilege` | Enforce least-privilege scoping authorization untuk Wali Kelas. Closes #88. | **MERGED** ✅ |
| **[#91](https://github.com/SMA-UII-Yogyakarta/core/pull/91)** | `refactor/cleanup-empty-state-filter-bar` | Hapus duplikasi interface & warna hardcode di `EmptyState.tsx`, konsistensikan `FiSearch` di `FilterBar.tsx`. Closes #85. | **MERGED** ✅ |

---

> **Kesimpulan:** Dokumen audit UI/UX Role Portal ini telah sepenuhnya diperbarui untuk mencerminkan hasil akhir arsitektur frontend yang presisi, kaya komponen, responsif sempurna, dan siap untuk tahap produksi (*production-ready*).
