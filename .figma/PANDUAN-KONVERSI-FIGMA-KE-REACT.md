# Panduan Konversi Figma → React/TSX + Tailwind CSS 4

**Dari:** Sandiko (Lead Developer)
**Untuk:** Fathan (Junior Frontend Developer)
**Tujuan:** Membantu memahami file CSS mentah dari Figma dan cara mengonversinya ke kode React yang proper.

---

## Lokasi File

```
resources/draft-figma/
├── desktop.css     (63 KB — 63.440 baris)
├── mobile.css      (27 KB — 26.997 baris)
└── component.css   (5 KB — 5.076 baris)
```

File-file ini adalah **hasil ekspor mentah dari Figma** — bukan CSS untuk dipakai langsung. Setiap blok CSS mewakili satu _layer_ desain dengan posisi absolut (`position: absolute`) dan ukuran pixel tetap. Ini _design spec_, bukan production code.

---

## Cara Membaca File Ini

### Pola Umum Satu Blok Figma

```css
/* Nama Layer (dari Figma) */
property: value;
property: value;
```

Contoh nyata:
```css
/* Button */              /* Nama layer di Figma */
/* Auto layout */         /* Figma auto-layout */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 12px 117.9px;

width: 285.79px;
height: 40px;

/* Bay of Many */         /* Nama warna di Figma (bukan CSS color name) */
background: #2E3391;
border-radius: 6px;
```

### Yang Perlu Diperhatikan

| Di Figma | Artinya |
|----------|---------|
| `/* Auto layout */` | Frame pake Flexbox |
| `/* Inside auto layout */` | Anak dari flex container |
| `/* Semantic/Button */` | Text style (button) |
| `/* Bay of Many */` | Warna brand `#2E3391` |
| `/* Candlelight */` | Warna aksen `#FAE62A` |
| `/* identical to box height */` | `line-height` sama dengan `font-size` |

### Abaikan Properti Ini

- `position: absolute` + `left`/`right`/`top`/`bottom` — Figma pake absolute layout, kita ganti pake flexbox Tailwind
- `width`/`height` piksel — nanti jadi `w-*`/`h-*` atau ukuran relatif
- `/* Inside auto layout */`, `flex: none`, `order: 0`, `flex-grow: 0` — boilerplate Figma

---

## Design System / Design Tokens

### Warna (via `@theme` di `app.css`)

| Figma Name | Hex | Fungsi |
|------------|-----|--------|
| Bay of Many | `#2E3391` | Primary (header, sidebar, button) |
| Candlelight | `#FAE62A` | Accent (active menu, logo, tab) |
| Flamingo | `#EF4444` | Danger / badge |
| Mountain Meadow | `#10B981` | Success (ijin) |
| Catskill White | `#F1F5F9` / `#F8FAFC` | Background halaman |
| Mystic | `#E2E8F0` | Border default |
| Geyser | `#CBD5E1` | Border input |
| Slate Gray | `#64748B` | Muted text |
| Fiord | `#475569` | Label/strong text |
| Gull Gray | `#94A3B8` | Inactive tab |
| Boulder | `#757575` | Placeholder text |

### Font

| Font | Kegunaan |
|------|----------|
| **Inter** | Semua teks UI |
| **Urbanist** | Brand "SMA UII YOGYAKARTA" |
| **Font Awesome 5 Free** | Icon |

### Text Styles (dari Figma)

| Figma Style | Font | Weight | Size | Tailwind |
|-------------|------|--------|------|----------|
| Semantic/Heading 3 | Inter | 700 | 18.7px | `text-lg font-bold` |
| Semantic/Strong | Inter | 700 | 14px | `text-sm font-bold` |
| Semantic/Button | Inter | 700 | 13.3px | `text-xs font-bold` |
| Semantic/Input | Inter | 400 | 13.3px | `text-xs` |
| Semantic/Data | Inter | 700 | 13px | `text-xs font-bold` |
| Semantic/Options | Inter | 600 | 13px | `text-xs font-semibold` |

### Border Radius

| Figma | Nilai | Tailwind |
|-------|-------|----------|
| Button/Input | 6px | `rounded-md` |
| Card | 8px / 10px / 12px | `rounded-lg` / `rounded-xl` |
| Logo/Avatar | 50% (lingkaran) | `rounded-full` |
| Badge | 10px | `rounded-full` |
| Modal/Dialog | 12px | `rounded-xl` |

### Shadow

| Figma | Nilai | Tailwind |
|-------|-------|----------|
| Card | `0px 4px 10px rgba(0,0,0,0.05)` | `shadow-sm` |
| Modal | `0px 20px 40px rgba(0,0,0,0.2)` | `shadow-2xl` |

---

## Halaman yang Ada di Figma

### Desktop (`desktop.css`)

| Baris | Halaman | Role |
|-------|---------|------|
| 1 | Login | Public |
| 644 | Dashboard Admin | Admin |
| 3855 | Pengajuan Izin Sakit | Admin |
| 4139 | Pengajuan Izin Diterima | Admin |
| 4231 | Manajemen Data Master | Admin |
| 8529 | Rekap Bulanan | Admin |
| 14004 | Enrolment Siswa Kelas | Admin |
| 16482 | Riwayat Kehadiran | Siswa |
| 19057 | Live Presensi | Siswa |
| 20182 | Dashboard Siswa | Siswa |
| 21843 | Pengajuan Izin | Wali Murid |
| 26383 | Manajemen Master Kelas | Admin |
| 29537 | Pengaturan Waktu & Libur | Admin |
| 41642 | Rekap Harian | Admin |
| 58852 | Verifikasi Izin & Sakit | Guru/Wali Kelas |

### Mobile (`mobile.css`)

| Baris | Halaman | Role |
|-------|---------|------|
| 1 | Dashboard Admin | Admin |
| 853 | Login | Public |
| 1198 | Data Master | Admin |
| 2209 | Ekspor Laporan | Admin |
| 4203 | Enrolment Kelas | Admin |
| 5068 | Dashboard Siswa | Siswa |
| 5865 | Live Presensi | Siswa |
| 6495 | Riwayat Kehadiran | Siswa |
| 7759 | Pengaturan Jadwal Presensi | Admin |
| 13667 | Edit Kelas | Admin |
| 15146 | Dashboard Wali Murid | Wali Murid |
| 16316 | Pengajuan Izin | Wali Murid |
| 17954 | Dashboard Guru Piket | Guru |
| 19785 | Dashboard Wali Kelas | Guru |
| 21471 | Ekspor Harian | Admin |
| 21644 | Filters (shared) | Shared |
| 24158 | Verif Izin | Guru/Wali Kelas |

---

## Panduan Konversi

### Langkah 1: Identifikasi Komponen dalam Satu Halaman

Ambil contoh Login desktop. Dari `desktop.css` baris 1-642:

```
Login Page (Desktop)
├── Card Utama (white card with shadow)
│   ├── Left Panel (bg Bay of Many)
│   │   ├── Logo UII (circle Candlelight)
│   │   ├── "Portal SSO Mandiri"
│   │   └── Deskripsi "Satu identitas digital..."
│   └── Right Panel (white)
│       ├── Logo UII kecil (circle Bay of Many)
│       ├── "Sign In Institusi"
│       ├── Input Username / NISN
│       ├── Input Password
│       └── Button MASUK
└── Footer "© 2026 SMA UII Yogyakarta"
```

### Langkah 2: Konversi CSS Figma ke Tailwind

**CSS Figma (Input):**
```css
box-sizing: border-box;
display: flex;
flex-direction: column;
align-items: flex-start;
padding: 11px 12px;
width: 284.67px;
height: 40px;
background: #FFFFFF;
border: 1px solid #CBD5E1;
border-radius: 6px;

/* Username / NISN */
font-family: 'Inter';
font-weight: 400;
font-size: 13.3px;
color: #757575;
```

**Hasil React + Tailwind:**
```tsx
<input
  type="text"
  placeholder="Username / NISN"
  className="w-full h-10 px-3 py-[11px] bg-white border border-geyser rounded-md
             text-xs text-slate-gray font-primary placeholder:text-boulder
             focus:outline-none focus:ring-2 focus:ring-bay-of-many/20 focus:border-bay-of-many"
/>
```

### Langkah 3: Pisahkan ke Komponen Reusable

```tsx
// Components/TextInput.tsx
interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function TextInput({ label, className, ...props }: TextInputProps) {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-xs text-boulder font-primary">{label}</label>
      )}
      <input
        className={clsx(
          "w-full h-10 px-3 py-[11px] bg-white border border-geyser rounded-md",
          "text-xs font-primary",
          "focus:outline-none focus:ring-2 focus:ring-bay-of-many/20 focus:border-bay-of-many",
          className
        )}
        {...props}
      />
    </div>
  );
}
```

### Langkah 4: Rakit Halaman dari Komponen

```tsx
// Pages/Auth/Login.tsx
import TextInput from '@/Components/TextInput';
import Button from '@/Components/Button';
import BrandLogo from '@/Components/BrandLogo';

export default function Login() {
  return (
    <div className="min-h-screen bg-catskill-white flex items-center justify-center p-4">
      <div className="flex w-[650px] h-[420px] bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Left Panel */}
        <div className="w-[283px] bg-bay-of-many p-10 flex flex-col justify-center">
          <BrandLogo variant="light" />
          <h1 className="text-lg font-bold text-white mt-4">Portal SSO Mandiri</h1>
          <p className="text-xs text-white/70 mt-3 leading-relaxed">
            Satu identitas digital resmi untuk seluruh civitas akademika SMA UII.
          </p>
        </div>
        {/* Right Panel */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-4">
          <BrandLogo variant="dark" />
          <p className="text-sm font-bold text-bay-of-many text-center">Sign In Institusi</p>
          <TextInput label="Username / NISN" placeholder="Username / NISN" />
          <TextInput label="Password" type="password" placeholder="Password" />
          <Button className="w-full">MASUK</Button>
        </div>
      </div>
    </div>
  );
}
```

---

## Struktur File yang Diharapkan

```
resources/js/
├── Pages/
│   ├── Auth/
│   │   └── Login.tsx
│   ├── Admin/
│   │   ├── Dashboard.tsx
│   │   ├── DataMaster.tsx
│   │   ├── EnrolmentKelas.tsx
│   │   ├── MasterKelas.tsx
│   │   ├── PengaturanWaktuLibur.tsx
│   │   ├── RekapBulanan.tsx
│   │   └── RekapHarian.tsx
│   ├── Siswa/
│   │   ├── Dashboard.tsx
│   │   ├── LivePresensi.tsx
│   │   └── RiwayatKehadiran.tsx
│   ├── WaliMurid/
│   │   ├── Dashboard.tsx
│   │   └── PengajuanIzin.tsx
│   └── Guru/
│       ├── DashboardPiket.tsx
│       ├── DashboardWaliKelas.tsx
│       └── VerifikasiIzin.tsx
├── Layouts/
│   ├── AppLayout.tsx         (sudah ada)
│   ├── AdminLayout.tsx       sidebar + header + content
│   ├── AuthLayout.tsx        layout login
│   ├── SiswaLayout.tsx       layout siswa
│   └── GuruLayout.tsx        layout guru
├── Components/
│   ├── Button.tsx
│   ├── TextInput.tsx
│   ├── Sidebar.tsx
│   ├── SidebarItem.tsx
│   ├── StatCard.tsx
│   ├── FilterBar.tsx
│   ├── TabSwitcher.tsx
│   ├── Badge.tsx
│   ├── BrandLogo.tsx
│   ├── DataTable.tsx
│   └── StudentCard.tsx
├── Layouts/
│   └── AppLayout.tsx         (yang sudah ada di Welcome)
└── types/
    ├── index.ts
    ├── global.d.ts
    └── inertia.d.ts
```

---

## Checklist Pengerjaan (Prioritas)

### Phase 1 — Foundation (Design Tokens + Komponen Dasar)
- [ ] Registrasi design tokens di `app.css` via `@theme` (warna, font, border-radius, shadow)
- [ ] Buat `Components/Button.tsx` (variant: primary/secondary)
- [ ] Buat `Components/TextInput.tsx`
- [ ] Buat `Components/BrandLogo.tsx`
- [ ] Buat `Components/Badge.tsx`
- [ ] Update `app.css` dengan `@import "tailwindcss"` + `@theme`

### Phase 2 — Layout & Navigasi
- [ ] Buat `Components/SidebarItem.tsx` (state: active/default)
- [ ] Buat `Components/Sidebar.tsx`
- [ ] Buat `Layouts/AdminLayout.tsx` (header + sidebar + content area)
- [ ] Buat `Layouts/AuthLayout.tsx`

### Phase 3 — Halaman Prioritas Tinggi
- [ ] **Login** — pakai AuthLayout
- [ ] **Dashboard Admin** — StatCard, FilterBar, TabSwitcher
- [ ] **Data Master** — daftar siswa/guru/wali dengan StudentCard

### Phase 4 — Halaman Lanjutan
- [ ] Enrolment Kelas
- [ ] Pengaturan Waktu & Libur
- [ ] Live Presensi Siswa
- [ ] Riwayat Kehadiran
- [ ] Verifikasi Izin
- [ ] Pengajuan Izin
- [ ] Dashboard Siswa / Wali Murid / Guru

### Phase 5 — Mobile Responsive
- [ ] Pastikan semua halaman desktop responsif di mobile
- [ ] Buat mobile-specific layout jika perlu (sidebar jadi dropdown)

---

## Tips Penting

### 1. Jangan Salin CSS Mentah Langsung
CSS Figma pake `position: absolute` dan ukuran fix. Di Tailwind kita pake flexbox/grid yang responsif. Ambil **nilai-nilainya** (warna, font-size, spacing, border-radius), bukan properti layout-nya.

### 2. Mulai dari Komponen Kecil
Kerjakan komponen kecil dulu (`Button`, `TextInput`, `BrandLogo`), baru naik ke komponen besar (`Sidebar`, `FilterBar`), lalu ke halaman utuh (`Login`, `Dashboard`).

### 3. Gunakan `@theme` — Jangan Hex Langsung
Gunakan Tailwind utility classes seperti `bg-bay-of-many`, `text-candlelight`, `border-mystic` — bukan `bg-[#2E3391]`.

### 4. Perhatikan State
Figma mendefinisikan 2 state per komponen:
- **Active** vs **Default** — sidebar menu
- **Hover: true** vs **Hover: false** — button detail

Buat prop seperti `isActive` atau `variant` untuk membedakan.

### 5. Ikon Font Awesome
Figma pakai Font Awesome 5 Free. Opsi untuk React:
- `lucide-react` (ringan, populer di ekosistem React)
- `@fortawesome/react-fontawesome`

### 6. Layout Utama Dulu
Bikin `AdminLayout.tsx` (header + sidebar) dulu sebelum mengerjakan halaman-halaman admin. Struktur sidebar ada di `desktop.css` baris 1030-1479.

### 7. Dev Server
```bash
bun run dev
```
Vite HMR — perubahan langsung kelihatan di browser tanpa reload manual.

### 8. File Figma-nya Kepanjangan?
Cari aja `/* Nama Halaman */` yang mau dikerjakan, lalu baca blok di bawahnya sampai ketemu `/* Nama Halaman */` berikutnya. Atau cari pake Ctrl+F nama komponen (misal "Button", "Input").

### 9. Ukuran Piksel Beda?
Wajar. Figma pake 1x scale. Di browser nanti pake unit relatif Tailwind (`px-4`, `py-3`, `gap-2`, dll). Jangan kaku ikut ukuran persis Figma.

### 10. Mentok?
Tanya Sandiko atau Azis. Jangan nebak sendiri kalau mentok >30 menit.

---

## Contoh Lengkap: Konversi 1 Komponen

### Figma (desktop.css baris 596-641)

```css
/* Button */
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
padding: 12px 117.9px 12px 117.89px;
width: 285.79px;
height: 40px;
background: #2E3391;
border-radius: 6px;

/* MASUK */
width: 50px;
height: 16px;
font-family: 'Inter';
font-weight: 700;
font-size: 13.3px;
line-height: 16px;
color: #FFFFFF;
```

### Step 1: Buat Design Token di app.css

```css
@import "tailwindcss";

@theme {
  --color-bay-of-many: #2E3391;
  --color-candlelight: #FAE62A;
  --color-flamingo: #EF4444;
  --color-mountain-meadow: #10B981;
  --color-catskill-white: #F1F5F9;
  --color-mystic: #E2E8F0;
  --color-geyser: #CBD5E1;
  --color-slate-gray: #64748B;
  --color-fiord: #475569;
  --color-gull-gray: #94A3B8;
  --color-boulder: #757575;
  --font-primary: 'Inter', sans-serif;
  --font-brand: 'Urbanist', sans-serif;
}
```

### Step 2: Buat Komponen Button

```tsx
// Components/Button.tsx
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "flex items-center justify-center font-bold rounded-md transition-colors",
        "font-primary",
        {
          'bg-bay-of-many text-white hover:bg-bay-of-many/90': variant === 'primary',
          'bg-catskill-white text-bay-of-many border border-mystic hover:bg-white': variant === 'secondary',
        },
        {
          'px-6 py-2 text-xs': size === 'sm',
          'px-[117px] py-3 text-xs': size === 'md',
          'px-8 py-4 text-sm': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Step 3: Pakai di Halaman

```tsx
<Button>MASUK</Button>
<Button variant="secondary" size="sm">Detail</Button>
```

---

## Referensi Cepat

### Navigasi File Desktop

| Mau cari | Cari komentar |
|----------|---------------|
| Login | `/* Dekstop Login */` (baris 1) |
| Dashboard Admin | `/* Admin Dekstop Dashboard */` (baris 644) |
| Sidebar | `/* Background */` di baris 1030 |
| Global Filter | `/* GLOBAL FILTER */` (baris 1519) |
| Data Master | `/* Admin Manajemen Data Master */` (baris 4231) |
| Rekap Bulanan | `/* Admin Rekap Bulanan */` (baris 8529) |
| Enrolment Kelas | `/* Admin Enrolment Siswa Kelas */` (baris 14004) |
| Pengaturan Waktu | `/* Admin Pengaturan Waktu dan Libur */` (baris 29537) |
| Verifikasi Izin | `/* Verifikasi Izin & Sakit */` (baris 58852) |

### Navigasi File Mobile

| Mau cari | Cari komentar |
|----------|---------------|
| Login | `/* Mobile Login */` (baris 853) |
| Dashboard Admin | `/* Mobile Admin Dashboard */` (baris 1) |
| Data Master | `/* Mobile Admin Data Master */` (baris 1198) |
| Dashboard Siswa | `/* Mobile Siswa Dashboard */` (baris 5068) |
| Live Presensi | `/* Mobile Siswa Live Presensi */` (baris 5865) |
| Riwayat | `/* Mobile Siswa Riwayat Kehadiran */` (baris 6495) |
| Dashboard Wali Murid | `/* Mobile Wali Murid Dashboard */` (baris 15146) |
| Dashboard Wali Kelas | `/* Mobile Wali Kelas Dashboard */` (baris 19785) |

---

> _"Kerjakan komponen kecil dulu, satu per satu. Nanti nyambung sendiri jadi halaman utuh."_

---

## 🔄 Design Token Mapping: Figma → `app.css`

**PENTING:** File `app.css` sudah memiliki design tokens lengkap via `@theme`. Jangan pakai nama Figma (`bay-of-many`) langsung — pakai nama yang sudah terdaftar di `@theme`.

| Figma Name | Hex | `@theme` Token | Contoh Pakai |
|------------|-----|----------------|--------------|
| Bay of Many | `#2E3391` | `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| Candlelight | `#FAE62A` | `--color-accent` | `bg-accent`, `text-accent` |
| Flamingo | `#EF4444` | `--color-danger` | `bg-danger`, `text-danger` |
| Mountain Meadow | `#10B981` | `--color-success` | `bg-success`, `text-success` |
| Catskill White | `#F1F5F9` | `--color-background` | `bg-background` |
| Catskill White (variant) | `#F8FAFC` | `--color-muted` | `bg-muted` |
| White | `#FFFFFF` | `--color-surface` | `bg-surface` |
| Mystic | `#E2E8F0` | `--color-border` | `border-border` |
| Geyser | `#CBD5E1` | `--color-border-input` | `border-border-input` |
| Mirage | `#1E293B` | `--color-text-primary` | `text-text-primary` |
| Fiord | `#475569` | `--color-text-secondary` | `text-text-secondary` |
| Slate Gray | `#64748B` | `--color-text-muted` | `text-text-muted` |
| Gull Gray | `#94A3B8` | `--color-text-inactive` | `text-text-inactive` |
| Boulder | `#757575` | `--color-text-placeholder` | `placeholder:text-text-placeholder` |
| Tahiti Gold | `#D97706` | — | `text-amber-600`, `bg-amber-100` |
| Beeswax / Sweet Corn | `#FEF3C7` / `#FDE68A` | — | `bg-amber-50`, `border-amber-200` |
| Cinderella / Your Pink | `#FEE2E2` / `#FECACA` | `--color-danger-light` / … | `bg-danger-light`, `border-danger-light` |
| Zumthor | `#E0E7FF` | `--color-primary-light` | `bg-primary-light` |
| Jacksons Purple | `#1E3A8A` | — | `text-blue-900` (heading aktif) |
| Bright Sun | `#FDE047` | — | `bg-yellow-300` (sidebar hover) |
| Mischka | `#D1D5DB` | — | `text-gray-300` (sidebar default text) |
| Alto | `#DDDDDD` | — | `border-gray-300` |

### Contoh Perbaikan dari Guide Lama

```tsx
// ❌ SALAH — pakai nama Figma yang tidak terdaftar di @theme
className="bg-bay-of-many text-white"

// ✅ BENAR — pakai token dari @theme
className="bg-primary text-white"

// ❌ SALAH
className="text-candlelight"

// ✅ BENAR
className="text-accent"

// ❌ SALAH
className="border-mystic"

// ✅ BENAR
className="border-border"
```

---

## 📊 Status Halaman: Yang SUDAH vs BELUM Dikerjakan

### Desktop — 15 Halaman

| Baris | Halaman | Role | Status | File |
|-------|---------|------|--------|------|
| 1 | Login | Public | ✅ COMPLETE | `Pages/Login.tsx` |
| 644 | Dashboard Admin | Admin | ⚠️ Layout OK, data masih mock | `Pages/Dashboard.tsx` |
| 3855 | Pengajuan Izin Sakit (Admin view) | Admin | ❌ BELUM | — |
| 4139 | Pengajuan Izin Diterima | Admin | ❌ BELUM | — |
| 4231 | Manajemen Data Master | Admin | ✅ COMPLETE | `Pages/Admin/DataMaster.tsx` |
| 8529 | Rekap Bulanan | Admin | ❌ BELUM | — |
| 14004 | Enrolment Siswa Kelas | Admin | ❌ BELUM | — |
| 16482 | Riwayat Kehadiran | Siswa | ❌ BELUM | — |
| 19057 | Live Presensi | Siswa | ❌ BELUM | — |
| 20182 | Dashboard Siswa | Siswa | ❌ BELUM | — |
| 21843 | Pengajuan Izin (Wali Murid) | Wali | ❌ BELUM | — |
| 26383 | Manajemen Master Kelas | Admin | ❌ BELUM | — |
| 29537 | Pengaturan Waktu & Libur | Admin | ✅ COMPLETE | `Pages/Admin/AturWaktuLibur.tsx` |
| 41642 | Rekap Harian | Admin | ❌ BELUM | — |
| 58852 | Verifikasi Izin & Sakit | Guru/Wali Kelas | ✅ COMPLETE | `Pages/Admin/VerifikasiIzin.tsx` |

### Mobile — 17 Halaman

| Baris | Halaman | Role | Status |
|-------|---------|------|--------|
| 1 | Dashboard Admin | Admin | ❌ BELUM |
| 853 | Login | Public | ❌ (desktop sudah) |
| 1198 | Data Master | Admin | ❌ BELUM |
| 2209 | Ekspor Laporan | Admin | ❌ BELUM |
| 4203 | Enrolment Kelas | Admin | ❌ BELUM |
| 5068 | Dashboard Siswa | Siswa | ❌ BELUM |
| 5865 | Live Presensi | Siswa | ❌ BELUM |
| 6495 | Riwayat Kehadiran | Siswa | ❌ BELUM |
| 7759 | Pengaturan Jadwal Presensi | Admin | ❌ BELUM |
| 13667 | Edit Kelas | Admin | ❌ BELUM |
| 15146 | Dashboard Wali Murid | Wali Murid | ❌ BELUM |
| 16316 | Pengajuan Izin | Wali Murid | ❌ BELUM |
| 17954 | Dashboard Guru Piket | Guru | ❌ BELUM |
| 19785 | Dashboard Wali Kelas | Guru | ❌ BELUM |
| 21471 | Ekspor Harian | Admin | ❌ BELUM |
| 21644 | Filters (shared) | Shared | ❌ BELUM |
| 24158 | Verif Izin | Guru/Wali Kelas | ❌ (desktop sudah) |

---

## 📦 Komponen Existing (Sudah Dibuat)

Jangan bikin ulang komponen ini — sudah siap pakai:

| Komponen | Lokasi | Props Utama |
|----------|--------|-------------|
| **Button** | `Components/ui/Button.tsx` | `variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`, `loading: boolean` |
| **Input** | `Components/ui/Input.tsx` | `label`, `error`, `icon`, `...InputHTMLAttributes` |
| **Badge** | `Components/ui/Badge.tsx` | `variant: 'default' | 'success' | 'danger' | 'warning'` |
| **StatusBadge** | `Components/ui/StatusBadge.tsx` | `status: string` (otomatis pilih warna) |
| **StatCard** | `Components/ui/StatCard.tsx` | `title`, `value`, `icon?`, `color?` |
| **Table** | `Components/ui/Table.tsx` | `columns`, `data`, `loading?`, `emptyMessage?` |
| **Pagination** | `Components/ui/Table.tsx` | `links` (dari Inertia) |
| **Navbar** | `Components/Navbar.tsx` | `user` |
| **Sidebar** | `Components/Sidebar.tsx` | — (otomatis dari route) |
| **SidebarItem** | `Components/SidebarItem.tsx` | `href`, `icon`, `label`, `active?` |
| **LoginCard** | `Components/LoginCard.tsx` | `data`, `setData`, `errors`, `processing` |
| **AppLayout** | `Layouts/AppLayout.tsx` | Layout wrapper (Navbar + content) |

### Komponen Draft (Belum Lengkap)

| Komponen | Lokasi | Masalah |
|----------|--------|---------|
| DashboardStats | `Components/DashboardStats.tsx` | Hardcoded string, cuma dipakai di mobile view |
| StudentCard | `Components/StudentCard.tsx` | Partial, tidak dipakai di halaman mana pun |

---

## 🎯 Component CSS — Breakdown Lengkap

File `component.css` berisi komponen-komponen yang dipakai di berbagai halaman. Ini adalah **design spec** untuk reusable components.

### 1. Sidebar Menu Items (baris 20–500)

| State | Background | Warna Icon | Warna Text | Font Weight | Radius |
|-------|-----------|------------|------------|-------------|--------|
| **Active** | `bg-accent` (Candlelight) | `text-primary` (Bay of Many) | `text-primary` | Bold (700) | `rounded-lg` |
| **Default** | Transparan | `text-white/60` | `text-white/60` | Regular (400) | `rounded-lg` |

Menu items di Figma (dengan icon FA5): Dashboard, Data Master, Enrolment Kelas, Atur Waktu & Libur, Laporan Rekap, Riwayat, Live Presensi, Pengajuan Izin, Pantauan Izin, Verifikasi Izin.

Ada juga **sidebar versi lain** (baris 3046+): background `bg-yellow-300` (Bright Sun), pakai warna Jacksons Purple (`text-blue-900`) untuk active state, dan icon putih 60% untuk default.

### 2. Badge (baris 4038–4081)

- Background: Flamingo (`#EF4444` → `bg-danger`)
- Bentuk: lingkaran penuh (`rounded-full`)
- Ukuran: 24x24px, font 12px bold
- Posisi: absolute, di atas icon sidebar (notification count)
- Text: putih, center

### 3. Button Variants (baris 1764–2451)

Ada 6 variant button dengan 2 state (hover:true / hover:false):

| Variant | Figma Label | Hover State | Non-Hover State | Penggunaan |
|---------|------------|-------------|-----------------|------------|
| **1** | "Detail" | `bg-primary-light` (Zumthor `#E0E7FF`), `text-primary`, icon FA5 | `bg-background` (Catskill White), `text-primary`, icon FA5 | Tombol detail tabel |
| **2** | "Edit" | `bg-amber-100` (Beeswax `#FEF3C7`), `text-amber-600` | `bg-amber-50` (Buttery White `#FFFBEB`), `text-amber-600` | Tombol edit |
| **3** | "Filter Kelas" | — (tidak ada hover) | `bg-surface`, `border-border`, `text-text-secondary`, icon FA5 | Filter dropdown |
| **4** | "Hapus Terpilih" | — (tidak ada hover) | `bg-danger-light` (Cinderella `#FEE2E2`), `text-danger`, icon FA5 | Bulk delete |
| **5** | "Import Excel" | — (tidak ada hover) | `bg-accent` (Candlelight), `text-text-primary`, rounded-md | Import data |
| **6** | "Tambah Data Baru" | — (tidak ada hover) | `bg-primary`, `text-white`, icon `+` | Add new record |

### 4. Toggle / Checkbox / Radio (baris 2622–2950)

Dari Component 2:

| Komponen | Hover | Non-Hover | Ukuran |
|----------|-------|-----------|--------|
| **Two-state toggle** (variant=1) | `bg-background`, `border-border` | Sama tanpa hover | 30x30px, icon FA5 12px |
| **Toggle variant=2** | Sama seperti 1 | — | — |
| **Checkbox / Radio** (variant=3,4) | Styling konsisten dengan border dan FA5 icon | — | — |

**Component 3** (baris 3046+) adalah varian sidebar alternate dengan:
- Background: gradient `#5F718B` ke putih
- Active state: `bg-yellow-300` (Bright Sun), text Jacksons Purple
- Menu sama: Dashboard, Enrolment Kelas, Atur Waktu & Libur, Data Master, Laporan Rekap, Riwayat, Live Presensi, Pengajuan Izin, Pantauan Izin, Verifikasi Izin
- Ada notification badge merah (Flamingo) dengan angka

---

## 🎨 Icon System: Font Awesome 5 + React

Figma menggunakan **Font Awesome 5 Free** (Solid) untuk semua icon. Dua opsi:

### Opsi 1: `react-icons` (ringan, recomended)

```bash
bun add react-icons
```

```tsx
import { FaHome, FaUserGraduate, FaClipboardList } from 'react-icons/fa';

// Pakai langsung
<FaHome className="text-primary w-4 h-4" />
<FaUserGraduate className="text-text-muted w-4 h-4" />
```

### Opsi 2: `@fortawesome/react-fontawesome` (official)

```bash
bun add @fortawesome/react-fontawesome @fortawesome/free-solid-svg-icons
```

```tsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUserGraduate, faClipboardList } from '@fortawesome/free-solid-svg-icons';

<FontAwesomeIcon icon={faHome} className="text-primary" />
```

### Icon yang Dipakai di Figma

Dari component.css dan desktop.css, icon yang muncul:

| Icon (FA5) | Kegunaan | `react-icons` |
|------------|----------|---------------|
| `fa-home` | Dashboard | `FaHome` |
| `fa-database` | Data Master | `FaDatabase` |
| `fa-chalkboard-teacher` | Enrolment Kelas | `FaChalkboardTeacher` |
| `fa-calendar-alt` | Atur Waktu & Libur | `FaCalendarAlt` |
| `fa-file-alt` | Laporan Rekap | `FaFileAlt` |
| `fa-history` | Riwayat | `FaHistory` |
| `fa-video` | Live Presensi | `FaVideo` |
| `fa-file-signature` | Pengajuan Izin | `FaFileSignature` |
| `fa-eye` | Pantauan Izin / Verifikasi | `FaEye` |
| `fa-check-circle` | Verifikasi Izin | `FaCheckCircle` |
| `fa-edit` | Edit | `FaEdit` |
| `fa-trash` | Hapus | `FaTrash` |
| `fa-filter` | Filter | `FaFilter` |
| `fa-upload` | Import Excel | `FaUpload` |
| `fa-plus` | Tambah Data Baru | `FaPlus` |
| `fa-download` | Ekspor | `FaDownload` |
| `fa-search` | Search | `FaSearch` |
| `fa-chevron-left` / `fa-chevron-right` | Pagination | `FaChevronLeft`, `FaChevronRight` |
| `fa-times` | Close | `FaTimes` |
| `fa check` | Checkbox checked | `FaCheck` |
| `fa-circle` | Radio | `FaCircle` |

---

## 🔃 State Patterns untuk Semua Komponen

Setiap komponen data (Table, Card, FilterBar) harus punya 3 state:

### 1. Loading State

```tsx
// Table — sudah ada loading prop
<Table
  columns={columns}
  data={[]}
  loading={true}
/>

// Tampilkan skeleton loader
{loading ? (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="h-12 bg-background animate-pulse rounded-lg" />
    ))}
  </div>
) : (
  <Table ... />
)}
```

### 2. Empty State

```tsx
// Table — sudah ada emptyMessage
<Table
  columns={columns}
  data={[]}
  emptyMessage="Belum ada data siswa"
/>

// Atau manual untuk non-Table
{data.length === 0 && !loading && (
  <div className="flex flex-col items-center py-12 text-text-muted">
    <FaInbox className="w-12 h-12 mb-4" />
    <p className="text-sm">Belum ada data</p>
  </div>
)}
```

### 3. Error State

```tsx
{error && (
  <div className="bg-danger-bg border border-danger-light rounded-lg p-4 flex items-start gap-3">
    <FaExclamationCircle className="text-danger mt-0.5" />
    <div>
      <p className="text-sm font-bold text-danger">Gagal memuat data</p>
      <p className="text-xs text-text-secondary mt-1">{error}</p>
    </div>
  </div>
)}

// Button simpan dengan error
<Button loading={processing} disabled={processing}>
  {processing ? 'Menyimpan...' : 'Simpan'}
</Button>
{error && <p className="text-xs text-danger mt-1">{error}</p>}
```

### Pattern Lengkap untuk Halaman Data

```tsx
export default function SomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Item[]>([]);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={() => ...} />;
  if (data.length === 0) return <EmptyState />;
  return <DataView data={data} />;
}
```

---

## 📱 Responsive Strategy

### Breakpoints

| Tailwind | Lebar | Target |
|----------|-------|--------|
| `sm` | 640px+ | Mobile landscape |
| `md` | 768px+ | Tablet |
| `lg` | 1024px+ | Desktop (default) |
| `xl` | 1280px+ | Desktop wide |

### Aturan Responsive

1. **Mobile-first**: Tulis style mobile dulu, lalu override dengan `md:`, `lg:` untuk desktop
2. **Sidebar**: `hidden lg:flex` — sembunyi di mobile, tampil di desktop; `lg:hidden` untuk hamburger menu
3. **Tabel**: Horizontal scroll di mobile (`overflow-x-auto`), normal di desktop
4. **Card grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
5. **Filter bar**: Mobile → vertical stack, Desktop → horizontal row
6. **Font size**: Base `text-xs` di mobile, `text-sm` di desktop

### Contoh Layout Adaptif

```tsx
<div className="min-h-screen bg-background">
  {/* Mobile Header (lg:hidden) */}
  <header className="lg:hidden bg-primary text-white p-4 flex items-center justify-between">
    <button onClick={toggleSidebar}><FaBars /></button>
    <span className="font-bold text-sm">SMA UII</span>
    <FaUserCircle />
  </header>

  <div className="flex">
    {/* Sidebar Desktop */}
    <Sidebar className="hidden lg:flex w-60" />

    {/* Overlay Mobile */}
    {showSidebar && (
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />
    )}
    <div className={`fixed left-0 top-0 h-full z-50 lg:hidden ${showSidebar ? 'translate-x-0' : '-translate-x-full'} transition-transform`}>
      <Sidebar onClose={toggleSidebar} />
    </div>

    {/* Main Content */}
    <main className="flex-1 p-4 md:p-6 lg:p-8">
      {children}
    </main>
  </div>
</div>
```

### Komponen yang Berbeda di Mobile

Dari Figma mobile.css:

| Mobile Page | Line | Adaptasi dari Desktop |
|-------------|------|-----------------------|
| Dashboard Admin | 1 | StatCard jadi horizontal scroll, grafik disembunyikan |
| Login | 853 | Left panel (bg-primary) dihapus, langsung form |
| Data Master | 1198 | Tabel jadi card list |
| Ekspor Laporan | 2209 | Filter di atas, tombol full-width |
| Enrolment Kelas | 4203 | List siswa per kelas, tanpa tabel |
| Dashboard Siswa | 5068 | StatCard + daftar kehadiran |
| Live Presensi | 5865 | Camera full-screen, button besar |
| Riwayat | 6495 | Filter tanggal di atas, list vertikal |
| Pengaturan Presensi | 7759 | Form vertikal, no sidebar |
| Edit Kelas | 13667 | Form modal full-screen |
| Dashboard Wali Murid | 15146 | StatCard anak + daftar izin |
| Pengajuan Izin | 16316 | Form full-width |
| Dashboard Guru Piket | 17954 | StatCard + daftar kelas |
| Dashboard Wali Kelas | 19785 | StatCard per siswa |
| Ekspor Harian | 21471 | Form filter + tombol ekspor |
| Filters | 21644 | Slide-up panel |
| Verif Izin | 24158 | Card vertikal |

---

## 🧩 Panduan Per Halaman yang Belum Dikerjakan

### Halaman 1: Admin — Pengajuan Izin Sakit (desktop.css baris 3855)

Layout:
- Sidebar (kiri) + Header + Content
- Tabel daftar pengajuan izin sakit dengan kolom: Nama, Kelas, Tanggal, Keterangan, Status, Aksi
- Tombol "Verifikasi Izin" (variant 1 detail) di setiap baris
- Tab switcher: "Semua" | "Menunggu" | "Disetujui" | "Ditolak"
- Filter: by kelas, by tanggal

Route: `GET /admin/pengajuan-izin-sakit`
Controller: `Admin/PengajuanIzinSakitController`
Service: `LeaveRequestService` (existing — pakai `findAll()` dengan filter status)

### Halaman 2: Admin — Pengajuan Izin Diterima (desktop.css baris 4139)

Layout:
- Sama seperti Pengajuan Izin Sakit, tapi hanya menampilkan status "disetujui"
- Tombol "Lihat Detail" (variant 1 non-hover) di setiap baris

Route: `GET /admin/pengajuan-izin-diterima`
Bisa digabung dengan halaman di atas via query param `?status=approved`

### Halaman 3: Admin — Rekap Bulanan (desktop.css baris 8529)

Layout:
- Navbar + Sidebar + Header "Rekap Bulanan"
- Filter: bulan + tahun (dropdown)
- StatCards: Total Siswa, Hadir, Sakit, Izin, Alpha
- Tabel atau grafik batang per hari
- Tombol Ekspor (variant 5 / Import Excel style)

Route: `GET /admin/rekap-bulanan?bulan=1&tahun=2026`
Controller: `Admin/RekapBulananController`
Service: butuh method baru di `AttendanceService` — `getMonthlyStats($bulan, $tahun)`

### Halaman 4: Admin — Rekap Harian (desktop.css baris 41642)

Layout:
- Navbar + Sidebar + Header "Rekap Harian"
- Filter: tanggal (date picker)
- Tabel: Nama, Kelas, Jam Masuk, Jam Keluar, Status
- Summary baris: Total Hadir / Tidak Hadir

Route: `GET /admin/rekap-harian?tanggal=2026-07-02`
Controller: `Admin/RekapHarianController`
Service: butuh method di `AttendanceService` — `getDailyStats($tanggal)`

### Halaman 5: Admin — Enrolment Siswa Kelas (desktop.css baris 14004)

Layout:
- Navbar + Sidebar + Header "Enrolment Siswa Kelas"
- Pilih kelas (dropdown)
- Tabel siswa di kelas itu: NIS, Nama, Aksi (Hapus dari kelas)
- Tombol "Tambah Siswa" — modal/list siswa yang belum punya kelas
- Search + Filter

Route: `GET /admin/enrolment-kelas`, `POST /admin/enrolment-kelas/tambah`, `DELETE /admin/enrolment-kelas/{id}`
Controller: `Admin/EnrolmentKelasController`
Service: `SchoolClassService` + `StudentService`

### Halaman 6: Admin — Manajemen Master Kelas (desktop.css baris 26383)

Layout:
- Navbar + Sidebar + Header "Master Kelas"
- Tabel: Nama Kelas, Tingkat, Wali Kelas, Jumlah Siswa, Aksi
- Tombol "Tambah Kelas Baru" (variant 6)
- Modal form: Nama Kelas, Tingkat (X/XI/XII), Wali Kelas (dropdown guru)

Route: `GET /admin/master-kelas`, `POST /admin/master-kelas`, `PUT /admin/master-kelas/{id}`, `DELETE /admin/master-kelas/{id}`
Bisa digabung dengan halaman DataMaster yang sudah ada (tab "Kelas")

### Halaman 7: Siswa — Riwayat Kehadiran (desktop.css baris 16482)

Layout:
- Header + Mobile Nav (mobile-first)
- Profil siswa (nama, kelas, NIS)
- Filter: bulan + tahun
- Tabel: Tanggal, Jam Masuk, Jam Keluar, Status (Hadir/Sakit/Izin/Alpha)
- Ringkasan: total hadir bulan ini

Route: `GET /siswa/riwayat`
Controller: `Siswa/RiwayatController`
Service: `AttendanceService` — `getStudentHistory($userId, $bulan, $tahun)`

### Halaman 8: Siswa — Live Presensi (desktop.css baris 19057)

Layout:
- Full-screen camera view (simulasi)
- Waktu real-time
- Tombol "Check In" / "Check Out"
- Status: "Belum Check In" / "Sudah Check In"
- Notifikasi sukses setelah check in

Route: `POST /siswa/live-presensi/checkin`, `POST /siswa/live-presensi/checkout`
Controller: `Siswa/LivePresensiController`
Service: `AttendanceService` — `checkIn()`, `checkOut()`

### Halaman 9: Siswa — Dashboard Siswa (desktop.css baris 20182)

Layout:
- Header + Nav (mobile-first, tanpa sidebar)
- StatCards: Kehadiran Bulan Ini, Izin Tersisa, Poin (jika ada)
- Grafik kehadiran (mingguan/bulanan)
- Daftar notifikasi / pengumuman
- Tombol "Presensi Sekarang"

Route: `GET /siswa/dashboard`
Controller: `Siswa/DashboardController`
Service: `AttendanceService` — `getStudentStats($userId)`

### Halaman 10: Wali Murid — Pengajuan Izin (desktop.css baris 21843)

Layout:
- Header + Nav
- Daftar anak (jika wali punya >1 anak)
- Tombol "Ajukan Izin" (variant 6)
- Form: Pilih Anak, Tanggal Mulai, Tanggal Selesai, Jenis Izin (Sakit/Keperluan Keluaga/Dll), Keterangan, Upload Bukti (opsional)
- Tabel riwayat pengajuan izin: Tanggal, Jenis, Status (Menunggu/Disetujui/Ditolak)

Route: `GET /wali/pengajuan-izin`, `POST /wali/pengajuan-izin`
Controller: `Wali/PengajuanIzinController`
Service: `LeaveRequestService` — `create()` dengan `guardian_id`

---

## 🆕 Komponen Baru yang Perlu Dibuat

| Komponen | Lokasi Tujuan | Berdasarkan Figma | Prioritas |
|----------|--------------|-------------------|-----------|
| **BrandLogo** | `Components/BrandLogo.tsx` | Login panel, Navbar | Medium |
| **FilterBar** | `Components/FilterBar.tsx` | Global Filter (desktop.css 1519) | High |
| **TabSwitcher** | `Components/TabSwitcher.tsx` | Tab di DataMaster, VerifikasiIzin | High |
| **StudentCard** (perbaiki) | `Components/StudentCard.tsx` | Data Master (daftar siswa) | Low |
| **Modal** | `Components/Modal.tsx` | Form tambah/edit, konfirmasi hapus | High |
| **LoadingSpinner** | `Components/LoadingSpinner.tsx` | State loading | Medium |
| **EmptyState** | `Components/EmptyState.tsx` | State kosong | Medium |
| **ErrorAlert** | `Components/ErrorAlert.tsx` | State error | Medium |
| **DashboardStats** (perbaiki) | `Components/DashboardStats.tsx` | Dashboard (masih hardcoded) | Low |

---

## 🏗️ Struktur Layout Per Role

### Admin Layout (sidebar + navbar + content)
```
resources/js/Layouts/AdminLayout.tsx
├── <Sidebar />          — fixed left
├── <Navbar />           — fixed top
└── <main>               — content area (ml-60 mt-16)
    └── {children}       — halaman spesifik
```

### Siswa Layout (mobile-first, tanpa sidebar desktop)
```
resources/js/Layouts/SiswaLayout.tsx
├── <MobileHeader />     — lg:hidden
├── <Navbar />           — lg:flex
└── <main>               — content full-width
    └── {children}
```

### Guru Layout (sidebar minimal + navbar)
```
resources/js/Layouts/GuruLayout.tsx
├── <MiniSidebar />      — icon-only sidebar
├── <Navbar />
└── <main>
    └── {children}
```

### Auth Layout (no sidebar, centered)
```
resources/js/Layouts/AuthLayout.tsx
└── <main className="min-h-screen bg-background flex items-center justify-center">
    └── {children}
```

---

## 📐 Konvensi Penamaan dari Figma

| Di Figma | Yang Harus Dibuat |
|----------|-------------------|
| `/* Dekstop Login */` | `Pages/Login.tsx` |
| `/* Admin Dekstop Dashboard */` | `Pages/Admin/Dashboard.tsx` |
| `/* Admin Manajemen Data Master */` | `Pages/Admin/DataMaster.tsx` |
| `/* Admin Pengajuan Izin Sakit */` | `Pages/Admin/PengajuanIzinSakit.tsx` |
| `/* Pengajuan Izin Diterima */` | Bagian dari halaman di atas (tab) |
| `/* Admin Rekap Bulanan */` | `Pages/Admin/RekapBulanan.tsx` |
| `/* Admin Enrolment Siswa Kelas */` | `Pages/Admin/EnrolmentKelas.tsx` |
| `/* Admin Manajemen Master Kelas */` | Gabung dengan DataMaster (tab Kelas) |
| `/* Admin Pengaturan Waktu dan Libur */` | `Pages/Admin/AturWaktuLibur.tsx` |
| `/* Verifikasi Izin & Sakit */` | `Pages/Admin/VerifikasiIzin.tsx` |
| `/* Admin Rekap Harian */` | `Pages/Admin/RekapHarian.tsx` |
| `/* Siswa Dashboard */` | `Pages/Siswa/Dashboard.tsx` |
| `/* Siswa Live Presensi */` | `Pages/Siswa/LivePresensi.tsx` |
| `/* Siswa Riwayat Kehadiran */` | `Pages/Siswa/RiwayatKehadiran.tsx` |
| `/* Wali Murid Dashboard */` | `Pages/WaliMurid/Dashboard.tsx` |
| `/* Wali Murid Pengajuan Izin */` | `Pages/WaliMurid/PengajuanIzin.tsx` |
| `/* Mobile Guru Piket Dashboard */` | `Pages/Guru/DashboardPiket.tsx` |
| `/* Mobile Wali Kelas Dashboard */` | `Pages/Guru/DashboardWaliKelas.tsx` |

---

## 🧪 Quick Reference: Satu Halaman Lengkap

Template minimal untuk halaman admin baru:

```tsx
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Table from '@/Components/ui/Table';
import Button from '@/Components/ui/Button';
import { FaPlus, FaExclamationCircle, FaInbox } from 'react-icons/fa';

interface PageProps {
  data: any[];
  filters: any;
}

export default function NamaHalaman({ data, filters }: PageProps) {
  // State
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState(filters.search ?? '');

  // Columns definition
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nama' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'actions', label: 'Aksi', render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => router.get(route('detail', row.id))}>
          Detail
        </Button>
      </div>
    )},
  ];

  return (
    <AdminLayout title="Nama Halaman">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-text-primary">Nama Halaman</h1>
        <Button onClick={() => router.get(route('create'))}>
          <FaPlus className="mr-1" /> Tambah Baru
        </Button>
      </div>

      <Table
        columns={columns}
        data={data}
        emptyMessage="Belum ada data"
        onSelectionChange={setSelected}
      />

      {/* Pagination from Inertia */}
      {/* <Pagination links={data.links} /> */}
    </AdminLayout>
  );
}
```

---

## 📝 Checklist Lengkap (Update dari Existing)

### Existing Checklist (Phase 1–5) — Lihat di atas ↑

### Phase 4 Detail — Halaman Admin Tersisa

- [ ] **Pengajuan Izin Sakit** — tabel + filter status (baris 3855)
- [ ] **Pengajuan Izin Diterima** — filter status=approved (baris 4139)
- [ ] **Rekap Bulanan** — filter bulan+tahun + StatCard + tabel (baris 8529)
- [ ] **Rekap Harian** — filter tanggal + tabel kehadiran (baris 41642)
- [ ] **Enrolment Siswa Kelas** — pilih kelas + daftar siswa + assign (baris 14004)
- [ ] **Manajemen Master Kelas** — CRUD kelas + wali kelas (baris 26383)

### Phase 4B — Halaman Siswa

- [ ] **Dashboard Siswa** — StatCard kehadiran + notifikasi (baris 20182)
- [ ] **Live Presensi** — check-in/check-out (baris 19057)
- [ ] **Riwayat Kehadiran** — filter bulan + tabel history (baris 16482)

### Phase 4C — Halaman Wali Murid

- [ ] **Dashboard Wali Murid** — daftar anak + ringkasan (mobile.css 15146)
- [ ] **Pengajuan Izin (Wali)** — form + riwayat (desktop.css 21843)

### Phase 4D — Halaman Guru

- [ ] **Dashboard Guru Piket** — rekap harian per kelas (mobile.css 17954)
- [ ] **Dashboard Wali Kelas** — statistik per siswa (mobile.css 19785)
- [ ] **Verifikasi Izin (Guru)** — sudah selesai di Admin

### Phase 5 — Mobile & Polish

- [ ] Buat `ResponsiveWrapper` atau gunakan `lg:hidden` / `hidden lg:flex`
- [ ] Sidebar mobile: hamburger menu + overlay
- [ ] Tabel: `overflow-x-auto` untuk mobile
- [ ] StatCard: horizontal scroll di mobile
- [ ] Form: full-width di mobile
- [ ] Test semua halaman di viewport 375px (mobile) dan 1280px (desktop)
- [ ] Loading state di semua halaman yang fetching data
- [ ] Empty state di semua tabel
- [ ] Error alert di semua form

---

## 🚨 Hal yang Perlu Dihindari

1. **Jangan pakai `position: absolute`** — Figma pake itu, kita pake flexbox/grid
2. **Jangan pakai `left:`, `right:`, `top:`, `bottom:`** — itu position Figma
3. **Jangan salin `flex: none; order: 0; flex-grow: 0;`** — itu boilerplate Figma
4. **Jangan salin `width: 285.79px`** — pake Tailwind `w-*` yang relatif
5. **Jangan bikin komponen ulang** — cek dulu `Components/ui/` dan `Components/` apa yang sudah ada
6. **Jangan pakai `bg-bay-of-many`** — tidak terdaftar di `@theme`. Pakai `bg-primary`
7. **Jangan lupa eager loading** — `->with('relation')` di Service method
8. **Jangan lupa 3 state** — loading, empty, error untuk setiap komponen data
