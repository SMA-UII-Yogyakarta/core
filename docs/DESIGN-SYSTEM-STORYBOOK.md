# Panduan Design System, Storybook & Roadmap Porting Multi-Platform

> **Standar Arsitektur UI/UX, Aksesibilitas WCAG 2.1 AA, dan Kekayaan Intelektual SMA UII Yogyakarta**  
> **Target Audiens:** Frontend Engineers, UI/UX Designers, Mobile App Developers, dan Technical Architects  
> **Terakhir Diperbarui:** Agustus 2026  
> **Penanggung Jawab:** Sandikodev (PM Lead & Architecture Lead)

---

## 🎨 1. Visi & Filosofi Design System SMA UII

Design System SMA UII bukan sekadar kumpulan komponen visual, melainkan **Kekayaan Intelektual Terpadu (*Intellectual Property*)** yang mengabadikan identitas visual SMA UII Yogyakarta (*Brand Colors, Urbanist Typography, HSL Harmonious Palettes, Elevation, dan WCAG 2.1 AA Accessibility Standards*).

Tujuan jangka panjang dari standardisasi ini adalah:
1. **Konsistensi Nol-Cacat (*Pixel-Perfect & Single Source of Truth*):** Setiap token warna, radius sudut, bayangan, dan font diselaraskan 100% antara file desain Figma dan implementasi kode.
2. **Kesiapan Decoupled Architecture (*Headless Backend & Frontend Separation*):** `smauii-core` diposisikan sebagai Backend IdP/Dapodik API terpusat, sementara folder **`smauii-aksesekolah`** menjadi *single entrypoint* untuk berbagai platform aplikasi masa depan (Next.js WebApp, React Native iOS/Android, atau Flutter).
3. **Developer Experience (DX) Tertinggi:** Pengembang dapat memvisualisasikan, menguji state interaktif, dan memverifikasi aksesibilitas komponen secara terisolasi menggunakan **Storybook** sebelum dipasang pada halaman produksi.

---

## 🏛️ 2. Arsitektur Struktur Komponen (Atomic Design)

```
resources/js/
├── Components/
│   ├── ui/                      # Atoms & Molecules (Pure Components)
│   │   ├── Button.tsx           # Tombol serbaguna (Primary, Accent, Danger, Outline, Ghost)
│   │   ├── Badge.tsx            # Badge informasi sederhana
│   │   ├── StatusBadge.tsx      # Badge status kehadiran (Hadir, Terlambat, Izin, Sakit)
│   │   ├── StatCard.tsx         # Kartu metrik KPI (Total Siswa, Presensi Hari Ini)
│   │   ├── Input.tsx            # Input teks & angka dengan floating icon & error label
│   │   ├── SelectInput.tsx      # Dropdown custom & searchable select
│   │   ├── NativeSelect.tsx     # Native select untuk mobile fallback
│   │   ├── Table.tsx            # Tabel data interaktif dengan sorting & pagination
│   │   ├── Checkbox.tsx         # Checkbox accessible
│   │   ├── Radio.tsx            # Radio button accessible
│   │   └── CommandPalette.tsx   # Spotlight search (Ctrl+K)
│   ├── common/                  # Organisms (Interactive Wrappers)
│   │   ├── Drawer.tsx           # Sliding Action Drawer (Form CRUD Siswa/Guru/Izin)
│   │   ├── Modal.tsx            # Pop-up konfirmasi & dialog
│   │   ├── Toast.tsx            # Notifikasi umpan balik instan
│   │   ├── FilterBar.tsx        # Bar pencarian & filter tabel
│   │   └── TabSwitcher.tsx      # Tab navigasi (Siswa, Guru, Kelas, Wali)
│   └── features/                # Domain-Specific Complex Components
│       ├── AttendanceCamera.tsx # WebRTC Camera Capture + GPS Geofence Check
│       └── LeaveDrawer.tsx      # Drawer verifikasi surat izin
└── stories/                     # Storybook Component Stories
    ├── Button.stories.tsx
    ├── StatusBadge.stories.tsx
    ├── StatCard.stories.tsx
    └── Drawer.stories.tsx
```

---

## 📖 3. Penggunaan Storybook & Validasi Aksesibilitas (A11y)

Storybook dikonfigurasikan dengan integrasi Vite, Tailwind CSS 4, dan **`@storybook/addon-a11y`** untuk memverifikasi kepatuhan WCAG 2.1 AA secara real-time.

### 3.1. Menjalankan Storybook Lokal
```bash
# Menjalankan Storybook development server (port 6006)
bun run storybook

# Atau via Docker container
docker exec core-bun-1 bun run storybook
```

### 3.2. Membangun Production Static Storybook
```bash
# Membangun bundle statis untuk dokumentasi tim
bun run build-storybook
```
*Output direktori statis tersimpan di `storybook-static/` yang dapat di-deploy ke GitHub Pages atau internal docs server.*

---

## 📱 4. Roadmap Porting Multi-Platform (`smauii-aksesekolah`)

Folder **`smauii-aksesekolah`** disiapkan sebagai gerbang arsitektur (*Architecture Gateway*) ketika `smauii-core` dipisah menjadi Headless Backend API.

```
                              [ SMA UII ECOSYSTEM ]
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
     [ BACKEND CORE (Laravel 13) ]             [ FRONTEND GATEWAY (Aksesekolah) ]
      • Central IdP / SSO (OAuth2)              • Design System Tokens & Storybook
      • Central Dapodik Data Hub                • Multi-Platform Target Applications:
      • Moodle, SLiMS, Lab API                   ├── 1. Web Portal (Next.js / Inertia)
      • RustFS S3 Storage Hub                    ├── 2. Mobile Siswa/Wali (React Native/Flutter)
                                                 └── 3. Kiosk Presensi Gerbang Sekolah
```

### 4.1. Strategi Porting Token & Komponen ke React Native / Flutter
1. **Design Tokens (JSON / CSS Variables):**
   Warna (`--color-primary: #2E3391`, `--color-accent: #FAE62A`), radius, dan tipografi diekspor sebagai JSON token yang dapat dikonsumsi langsung oleh React Native `StyleSheet` atau Flutter `ThemeData`.
2. **Zod Validation Schemas (`resources/js/schemas/`):**
   Skema validasi Zod 100% kompatibel dan dapat langsung digunakan kembali di aplikasi Next.js maupun React Native tanpa perlu menulis ulang logika validasi form.
3. **Resilient Selectors (`dusk="..."` & `data-testid="..."`):**
   Seluruh tombol dan input dilengkapi selector standar sehingga suite pengujian E2E (Appium / Playwright / Detox) dapat menguji platform web maupun mobile dengan format selector yang sama.

---

## 🛡️ 5. Standar Kode & Kepatuhan Hak Cipta
* Setiap komponen yang dibuat di `resources/js/Components/` harus didokumentasikan di `resources/js/stories/`.
* Tidak diperbolehkan menggunakan style inline *ad-hoc*; semua warna dan ukuran wajib menggunakan token tema Tailwind (`bg-primary`, `text-success`, `rounded-xl`, `font-inter`, `font-brand`).
* Setiap perubahan desain wajib diverifikasi kontras warnanya menggunakan tab Accessibility di Storybook.
