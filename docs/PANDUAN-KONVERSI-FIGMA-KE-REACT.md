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

File-file ini adalah **hasil ekspor mentah dari Figma** — bukan CSS untuk dipakai langsung. Setiap blok CSS mewakili satu layer desain dengan posisi absolut (`position: absolute`) dan ukuran pixel tetap. Ini _design spec_, bukan production code.

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

| Figma Name | Hex | Semantic Token | CSS Variable | Contoh Pakai |
|------------|-----|----------------|--------------|--------------|
| Bay of Many | `#2E3391` | `primary` | `--color-primary` | `bg-primary`, `text-primary` |
| Candlelight | `#FAE62A` | `accent` | `--color-accent` | `bg-accent`, `text-accent` |
| Flamingo | `#EF4444` | `danger` | `--color-danger` | `bg-danger`, `text-danger` |
| Mountain Meadow | `#10B981` | `success` | `--color-success` | `bg-success`, `text-success` |
| Amber | `#F59E0B` | `warning` | `--color-warning` | `bg-warning`, `text-warning` |
| Catskill White | `#F1F5F9` | `background` | `--color-background` | `bg-background` |
| Catskill White (variant) | `#F8FAFC` | `muted` | `--color-muted` | `bg-muted` |
| White | `#FFFFFF` | `surface` | `--color-surface` | `bg-surface` |
| Mystic | `#E2E8F0` | `border` | `--color-border` | `border-border` |
| Geyser | `#CBD5E1` | `border-input` | `--color-border-input` | `border-border-input` |
| Mirage | `#1E293B` | `text-primary` | `--color-text-primary` | `text-text-primary` |
| Fiord | `#475569` | `text-secondary` | `--color-text-secondary` | `text-text-secondary` |
| Slate Gray | `#64748B` | `text-muted` | `--color-text-muted` | `text-text-muted` |
| Gull Gray | `#94A3B8` | `text-inactive` | `--color-text-inactive` | `text-text-inactive` |
| Boulder | `#757575` | `text-placeholder` | `--color-text-placeholder` | `placeholder:text-text-placeholder` |
| Zumthor | `#E0E7FF` | `primary-light` | `--color-primary-light` | `bg-primary-light` |
| Bright Sun | `#FDE68A` | `accent-light` | `--color-accent-light` | `bg-accent-light` |
| Granny Apple | `#DCFCE7` | `success-light` | `--color-success-light` | `bg-success-light`, `border-success-light` |
| Polar | `#ECFDF5` | `success-bg` | `--color-success-bg` | `bg-success-bg` |
| Cinderella | `#FEE2E2` | `danger-light` | `--color-danger-light` | `bg-danger-light` |
| — | `#FEF2F2` | `danger-bg` | `--color-danger-bg` | `bg-danger-bg` |
| Bright Sun (var) | `#FDE68A` | `warning-light` | `--color-warning-light` | `bg-warning-light`, `border-warning-light` |
| — | `#FFFBEB` | `warning-bg` | `--color-warning-bg` | `bg-warning-bg` |

> **PENTING:** Gunakan semantic names seperti `bg-primary`, `text-accent`, `border-border` — BUKAN nama Figma (`bg-bay-of-many`). Lihat [Design Token Mapping](#-design-token-mapping-figma--appcss) untuk mapping lengkap.

### Font

| Font | Kegunaan |
|------|----------|
| **Inter** | Semua teks UI (via `--font-sans`) |
| **Urbanist** | Brand "SMA UII YOGYAKARTA" (via `--font-brand`) |
| **Font Awesome 5 Free** | Icon (via CDN `<i>` atau `react-icons/fa`) |

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
| Card | `0px 4px 10px rgba(0,0,0,0.05)` | `shadow-card` |
| Modal | `0px 20px 40px rgba(0,0,0,0.2)` | `shadow-modal` |
| Dropdown | `0px 4px 12px rgba(0,0,0,0.02)` | `shadow-dropdown` |

---

## Halaman yang Ada di Figma

### Desktop (`desktop.css`)

| Baris | Halaman | Role | Status Real | File |
|-------|---------|------|-------------|------|
| 1 | Login | Public | ✅ COMPLETE | `Pages/Login.tsx` |
| 644 | Dashboard Admin | Admin | ✅ COMPLETE | `Pages/Dashboard.tsx` |
| 3855 | Pengajuan Izin Sakit | Admin | ✅ (merged via TabSwitcher) | `Pages/Admin/PengajuanIzin.tsx` |
| 4139 | Pengajuan Izin Diterima | Admin | ✅ (merged via TabSwitcher) | Sama seperti di atas |
| 4231 | Manajemen Data Master | Admin | ✅ COMPLETE | `Pages/Admin/DataMaster.tsx` |
| 8529 | Rekap Bulanan | Admin | ✅ COMPLETE | `Pages/Admin/RekapBulanan.tsx` |
| 14004 | Enrolment Siswa Kelas | Admin | ✅ COMPLETE | `Pages/Admin/EnrolmentKelas.tsx` |
| 16482 | Riwayat Kehadiran | Siswa | ✅ COMPLETE | `Pages/Siswa/RiwayatKehadiran.tsx` |
| 19057 | Live Presensi | Siswa | ✅ COMPLETE | `Pages/Siswa/LivePresensi.tsx` |
| 20182 | Dashboard Siswa | Siswa | ✅ COMPLETE | `Pages/Siswa/Dashboard.tsx` |
| 21843 | Pengajuan Izin | Wali Murid | ✅ COMPLETE | `Pages/WaliMurid/PengajuanIzin.tsx` |
| 26383 | Manajemen Master Kelas | Admin | ✅ COMPLETE | `Pages/Admin/MasterKelas.tsx` |
| 29537 | Pengaturan Waktu & Libur | Admin | ✅ COMPLETE | `Pages/Admin/AturWaktuLibur.tsx` |
| 41642 | Rekap Harian | Admin | ✅ COMPLETE | `Pages/Admin/RekapHarian.tsx` |
| 58852 | Verifikasi Izin & Sakit | Guru/Wali Kelas | ✅ COMPLETE | `Pages/Admin/VerifikasiIzin.tsx` |
| — | Dashboard Piket | Guru | ✅ COMPLETE | `Pages/Guru/DashboardPiket.tsx` |
| — | Dashboard Wali Kelas | Guru | ✅ COMPLETE | `Pages/Guru/DashboardWaliKelas.tsx` |
| — | Monitoring Presensi | Admin | ✅ COMPLETE | `Pages/Admin/Monitoring.tsx` |

**Status: ✅ 100% halaman desktop sudah dibuat (18 halaman).**

### Mobile (`mobile.css`) — Design Spec Viewport 340px

> **PENTING:** mobile.css adalah **design spec untuk viewport 340px** — bukan instruksi
> untuk membuat 17 halaman React terpisah. Strategi kita adalah **responsive-first**:
> satu halaman, satu file React, adaptif via Tailwind breakpoints (`sm:`, `md:`, `lg:`).
> Semua halaman desktop di atas sudah responsif ke mobile.
>
> Tabel di bawah adalah daftar **referensi desain mobile dari Figma** — bukan daftar
> halaman baru yang harus dibuat. Setiap halaman sudah diadaptasi ke halaman desktop
> yang sudah ada.

| Baris | Mobile Page | Role | Adaptasi via |
|-------|-------------|------|-------------|
| 1 | Dashboard Admin | Admin | `grid-cols-2 lg:grid-cols-5` + sidebar `hidden lg:flex` |
| 853 | Login | Public | Layout single column, left panel dihapus di mobile |
| 1198 | Data Master | Admin | `w-full sm:w-auto` + `flex-col sm:flex-row` |
| 2209 | Ekspor Laporan | Admin | Form full-width + tombol full-width |
| 4203 | Enrolment Kelas | Admin | Card list, tanpa tabel di mobile |
| 5068 | Dashboard Siswa | Siswa | `flex-col` + bottom nav |
| 5865 | Live Presensi | Siswa | Camera full-screen, button besar |
| 6495 | Riwayat Kehadiran | Siswa | Filter tanggal + list vertikal |
| 7759 | Pengaturan Jadwal Presensi | Admin | Form vertikal, no sidebar |
| 13667 | Edit Kelas | Admin | Modal full-screen di mobile |
| 15146 | Dashboard Wali Murid | Wali Murid | StatCard anak + daftar izin |
| 16316 | Pengajuan Izin | Wali Murid | Form full-width |
| 17954 | Dashboard Guru Piket | Guru | StatCard + daftar kelas |
| 19785 | Dashboard Wali Kelas | Guru | StatCard per siswa |
| 21471 | Ekspor Harian | Admin | Form filter + tombol ekspor |
| 21644 | Filters (shared) | Shared | Slide-up panel / filter pills |
| 24158 | Verif Izin | Guru/Wali Kelas | Card vertikal |

---

## Panduan Konversi

### Langkah 1: Identifikasi Komponen dalam Satu Halaman

Ambil contoh Login desktop. Dari `desktop.css` baris 1-642:

```
Login Page (Desktop)
├── Card Utama (white card with shadow)
│   ├── Left Panel (bg-primary)
│   │   ├── Logo UII (circle accent)
│   │   ├── "Portal SSO Mandiri"
│   │   └── Deskripsi "Satu identitas digital..."
│   └── Right Panel (white)
│       ├── Logo UII kecil (circle primary)
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
  className="w-full h-10 px-3 py-[11px] bg-white border border-border-input rounded-md
             text-xs text-text-muted font-primary placeholder:text-text-placeholder
             focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
/>
```

### Langkah 3: Pisahkan ke Komponen Reusable

```tsx
// Components/ui/Input.tsx
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col w-full gap-1">
      {label && (
        <label className="text-xs text-text-secondary font-primary">{label}</label>
      )}
      <input
        className={clsx(
          "w-full h-10 px-3 py-[11px] bg-white border border-border-input rounded-md",
          "text-xs font-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
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
// Pages/Login.tsx
import Input from '@/Components/ui/Input';
import Button from '@/Components/ui/Button';
import BrandLogo from '@/Components/BrandLogo';

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex w-[650px] h-[420px] bg-surface rounded-lg shadow-card overflow-hidden">
        {/* Left Panel */}
        <div className="w-[283px] bg-primary p-10 flex flex-col justify-center">
          <BrandLogo variant="light" />
          <h1 className="text-lg font-bold text-white mt-4">Portal SSO Mandiri</h1>
          <p className="text-xs text-white/70 mt-3 leading-relaxed">
            Satu identitas digital resmi untuk seluruh civitas akademika SMA UII.
          </p>
        </div>
        {/* Right Panel */}
        <div className="flex-1 p-10 flex flex-col justify-center gap-4">
          <BrandLogo variant="dark" />
          <p className="text-sm font-bold text-primary text-center">Sign In Institusi</p>
          <Input label="Username / NISN" placeholder="Username / NISN" />
          <Input label="Password" type="password" placeholder="Password" />
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
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── Welcome.tsx
│   ├── Admin/
│   │   ├── DataMaster.tsx
│   │   ├── EnrolmentKelas.tsx
│   │   ├── MasterKelas.tsx
│   │   ├── Monitoring.tsx
│   │   ├── PengajuanIzin.tsx
│   │   ├── AturWaktuLibur.tsx
│   │   ├── RekapBulanan.tsx
│   │   ├── RekapHarian.tsx
│   │   └── VerifikasiIzin.tsx
│   ├── Siswa/
│   │   ├── Dashboard.tsx
│   │   ├── LivePresensi.tsx
│   │   └── RiwayatKehadiran.tsx
│   ├── WaliMurid/
│   │   ├── Dashboard.tsx
│   │   └── PengajuanIzin.tsx
│   └── Guru/
│       ├── DashboardPiket.tsx
│       └── DashboardWaliKelas.tsx
├── Layouts/
│   ├── AdminLayout.tsx       sidebar + header + mobile nav
│   ├── AppLayout.tsx         layout utama
│   ├── AuthLayout.tsx        layout login (centered)
│   ├── GuruLayout.tsx        layout guru
│   ├── SiswaLayout.tsx       layout siswa
│   └── WaliMuridLayout.tsx   layout wali murid
├── Components/
│   ├── BrandLogo.tsx
│   ├── DashboardStats.tsx
│   ├── EmptyState.tsx
│   ├── ErrorAlert.tsx
│   ├── FilterBar.tsx
│   ├── index.ts
│   ├── LoadingSpinner.tsx
│   ├── LoginCard.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── SidebarItem.tsx
│   ├── StudentCard.tsx
│   ├── TabSwitcher.tsx
│   └── ui/
│       ├── ActionButton.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Checkbox.tsx
│       ├── Input.tsx
│       ├── Radio.tsx
│       ├── RadioGroup.tsx
│       ├── StatCard.tsx
│       ├── StatusBadge.tsx
│       ├── Table.tsx
│       └── Toggle.tsx
└── types/
    ├── component.ts
    ├── global.d.ts
    ├── index.ts
    └── inertia.d.ts
```

---

## Checklist Pengerjaan (Prioritas)

### Phase 1 — Foundation (Design Tokens + Komponen Dasar)
- [x] Registrasi design tokens di `app.css` via `@theme` (warna, font, border-radius, shadow)
- [x] Buat `Components/ui/Button.tsx` (variant: primary/secondary/outline/danger/ghost)
- [x] Buat `Components/ui/Input.tsx`
- [x] Buat `Components/BrandLogo.tsx`
- [x] Buat `Components/ui/Badge.tsx`
- [x] Update `app.css` dengan `@import "tailwindcss"` + `@theme`

### Phase 2 — Layout & Navigasi
- [x] Buat `Components/SidebarItem.tsx` (state: active/default)
- [x] Buat `Components/Sidebar.tsx`
- [x] Buat `Layouts/AdminLayout.tsx` (header + sidebar + content + mobile nav)
- [x] Buat `Layouts/AuthLayout.tsx`

### Phase 3 — Halaman Prioritas Tinggi
- [x] **Login** — pakai AuthLayout
- [x] **Dashboard Admin** — StatCard, FilterBar, TabSwitcher
- [x] **Data Master** — daftar siswa/guru/wali dengan tabel

### Phase 4 — Halaman Lanjutan
- [x] Enrolment Kelas
- [x] Pengaturan Waktu & Libur
- [x] Live Presensi Siswa
- [x] Riwayat Kehadiran
- [x] Verifikasi Izin
- [x] Pengajuan Izin
- [x] Dashboard Siswa / Wali Murid / Guru
- [x] Monitoring Presensi
- [x] Rekap Bulanan & Harian
- [x] Master Kelas

### Phase 5 — Mobile Responsive
- [x] Mobile header + bottom nav di AdminLayout
- [x] Slide-out sidebar untuk mobile
- [x] Filter bar: `flex-col sm:flex-row`, `w-full sm:w-auto`
- [x] Stat card: 2 kolom mobile, 5 kolom desktop
- [x] Tabel: `overflow-x-auto` untuk mobile
- [x] SVGs di layout → FA5 icons
- [x] DashboardStats: mobile stat card pattern (9px label, 18px value)
- [ ] Audit setiap halaman untuk mobile readiness (ongoing)

---

## Tips Penting

### 1. Jangan Salin CSS Mentah Langsung
CSS Figma pake `position: absolute` dan ukuran fix. Di Tailwind kita pake flexbox/grid yang responsif. Ambil **nilai-nilainya** (warna, font-size, spacing, border-radius), bukan properti layout-nya.

### 2. Mulai dari Komponen Kecil
Kerjakan komponen kecil dulu (`Button`, `Input`, `BrandLogo`), baru naik ke komponen besar (`Sidebar`, `FilterBar`), lalu ke halaman utuh (`Login`, `Dashboard`).

### 3. Gunakan `@theme` — Jangan Hex Langsung
Gunakan Tailwind utility classes seperti `bg-primary`, `text-accent`, `border-border` — bukan `bg-[#2E3391]`.

### 4. Perhatikan State
Figma mendefinisikan 2 state per komponen:
- **Active** vs **Default** — sidebar menu
- **Hover: true** vs **Hover: false** — button detail

Buat prop seperti `isActive` atau `variant` untuk membedakan.

### 5. Ikon Font Awesome 5
Figma pakai Font Awesome 5 Free. Implementasi kita:
- **Layouts, sidebar, nav**: Pakai FA5 CDN via `<i className="fas fa-icon-name" />`
- **Components**: Pakai `react-icons/fa` (tree-shaking, ringan)
- Tidak perlu install `@fortawesome/react-fontawesome` — cukup CDN di `app.tsx` + `react-icons/fa`
- Mapping icon Figma → FA5 ada di [Icon yang Dipakai di Figma](#icon-yang-dipakai-di-figma)

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

Ini adalah isi `resources/css/app.css` yang real:

```css
@import "tailwindcss";

@theme {
  /* ── Colors ── */
  --color-primary: #2E3391;           /* Bay of Many */
  --color-primary-light: #E0E7FF;     /* Zumthor */
  --color-accent: #FAE62A;            /* Candlelight */
  --color-surface: #FFFFFF;           /* White */
  --color-background: #F1F5F9;        /* Catskill White */
  --color-muted: #F8FAFC;             /* Catskill White variant */
  --color-text-primary: #1E293B;      /* Mirage */
  --color-text-secondary: #475569;    /* Fiord */
  --color-text-muted: #64748B;        /* Slate Gray */
  --color-text-placeholder: #757575;  /* Boulder */
  --color-text-inactive: #94A3B8;     /* Gull Gray */
  --color-border: #E2E8F0;            /* Mystic */
  --color-border-input: #CBD5E1;      /* Geyser */
  --color-success: #10B981;           /* Mountain Meadow */
  --color-danger: #EF4444;            /* Flamingo */
  --color-warning: #F59E0B;
  --font-sans: 'Inter', sans-serif;
  --font-brand: 'Urbanist', sans-serif;
}
```

**PENTING:** `@theme` di atas adalah yang real di codebase. Token names menggunakan semantic names (`primary`, `accent`, `border`, dll) — BUKAN Figma names (`bay-of-many`, `candlelight`).

### Step 2: Buat Komponen Button

```tsx
// Components/ui/Button.tsx
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
          'bg-primary text-white hover:bg-primary/90': variant === 'primary',
          'bg-muted text-primary border border-border hover:bg-surface': variant === 'secondary',
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

**PENTING:** File `app.css` sudah memiliki design tokens lengkap via `@theme`. Gunakan **semantic names** seperti `bg-primary`, `text-accent`, `border-border` — **bukan** nama Figma (`bg-bay-of-many`).

| Figma Name | Hex | Semantic Token | CSS Variable | Contoh Pakai |
|------------|-----|----------------|--------------|--------------|
| Bay of Many | `#2E3391` | `primary` | `--color-primary` | `bg-primary`, `text-primary`, `border-primary` |
| Candlelight | `#FAE62A` | `accent` | `--color-accent` | `bg-accent`, `text-accent` |
| Flamingo | `#EF4444` | `danger` | `--color-danger` | `bg-danger`, `text-danger` |
| Mountain Meadow | `#10B981` | `success` | `--color-success` | `bg-success`, `text-success` |
| Amber | `#F59E0B` | `warning` | `--color-warning` | `bg-warning`, `text-warning` |
| Catskill White | `#F1F5F9` | `background` | `--color-background` | `bg-background` |
| Catskill White (variant) | `#F8FAFC` | `muted` | `--color-muted` | `bg-muted` |
| White | `#FFFFFF` | `surface` | `--color-surface` | `bg-surface` |
| Mystic | `#E2E8F0` | `border` | `--color-border` | `border-border` |
| Geyser | `#CBD5E1` | `border-input` | `--color-border-input` | `border-border-input` |
| Mirage | `#1E293B` | `text-primary` | `--color-text-primary` | `text-text-primary` |
| Fiord | `#475569` | `text-secondary` | `--color-text-secondary` | `text-text-secondary` |
| Slate Gray | `#64748B` | `text-muted` | `--color-text-muted` | `text-text-muted` |
| Gull Gray | `#94A3B8` | `text-inactive` | `--color-text-inactive` | `text-text-inactive` |
| Boulder | `#757575` | `text-placeholder` | `--color-text-placeholder` | `placeholder:text-text-placeholder` |
| Zumthor | `#E0E7FF` | `primary-light` | `--color-primary-light` | `bg-primary-light` |
| Bright Sun | `#FDE68A` | `accent-light` | `--color-accent-light` | `bg-accent-light` |
| Granny Apple | `#DCFCE7` | `success-light` | `--color-success-light` | `bg-success-light`, `border-success-light` |
| Polar | `#ECFDF5` | `success-bg` | `--color-success-bg` | `bg-success-bg` |
| Cinderella | `#FEE2E2` | `danger-light` | `--color-danger-light` | `bg-danger-light` |
| — | `#FEF2F2` | `danger-bg` | `--color-danger-bg` | `bg-danger-bg` |
| Bright Sun (var) | `#FDE68A` | `warning-light` | `--color-warning-light` | `bg-warning-light`, `border-warning-light` |
| — | `#FFFBEB` | `warning-bg` | `--color-warning-bg` | `bg-warning-bg` |
| Tahiti Gold | `#D97706` | — | — | `text-amber-600` (fallback) |
| Jacksons Purple | `#1E3A8A` | — | — | `text-blue-900` |
| Bright Sun | `#FDE047` | — | — | `bg-yellow-300` |
| Mischka | `#D1D5DB` | — | — | `text-gray-300` |
| Alto | `#DDDDDD` | — | — | `border-gray-300` |

### Contoh Perbaikan dari Guide Lama

```tsx
// ❌ SALAH — pakai nama Figma yang tidak terdaftar di @theme
className="bg-bay-of-many text-white"

// ✅ BENAR — pakai semantic token dari @theme
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

## 📊 Status Halaman: Real Codebase

### Desktop — 18 Halaman (✅ 100% Selesai)

| Baris Figma | Halaman | Role | Status | File |
|-------------|---------|------|--------|------|
| 1 | Login | Public | ✅ COMPLETE | `Pages/Login.tsx` |
| 644 | Dashboard Admin | Admin | ✅ COMPLETE | `Pages/Dashboard.tsx` |
| 3855 | Pengajuan Izin Sakit | Admin | ✅ (TabSwitcher: Semua/Menunggu/Disetujui/Ditolak) | `Pages/Admin/PengajuanIzin.tsx` |
| 4139 | Pengajuan Izin Diterima | Admin | ✅ (merged via TabSwitcher) | Sama seperti di atas |
| 4231 | Manajemen Data Master | Admin | ✅ COMPLETE (TabSwitcher: Siswa/Guru/Kelas/Wali) | `Pages/Admin/DataMaster.tsx` |
| 8529 | Rekap Bulanan | Admin | ✅ COMPLETE | `Pages/Admin/RekapBulanan.tsx` |
| 14004 | Enrolment Siswa Kelas | Admin | ✅ COMPLETE | `Pages/Admin/EnrolmentKelas.tsx` |
| 16482 | Riwayat Kehadiran | Siswa | ✅ COMPLETE | `Pages/Siswa/RiwayatKehadiran.tsx` |
| 19057 | Live Presensi | Siswa | ✅ COMPLETE | `Pages/Siswa/LivePresensi.tsx` |
| 20182 | Dashboard Siswa | Siswa | ✅ COMPLETE | `Pages/Siswa/Dashboard.tsx` |
| 21843 | Pengajuan Izin | Wali Murid | ✅ COMPLETE | `Pages/WaliMurid/PengajuanIzin.tsx` |
| 26383 | Manajemen Master Kelas | Admin | ✅ COMPLETE | `Pages/Admin/MasterKelas.tsx` |
| 29537 | Pengaturan Waktu & Libur | Admin | ✅ COMPLETE | `Pages/Admin/AturWaktuLibur.tsx` |
| 41642 | Rekap Harian | Admin | ✅ COMPLETE | `Pages/Admin/RekapHarian.tsx` |
| 58852 | Verifikasi Izin & Sakit | Guru/Wali Kelas | ✅ COMPLETE | `Pages/Admin/VerifikasiIzin.tsx` |
| — | Dashboard Piket | Guru | ✅ COMPLETE | `Pages/Guru/DashboardPiket.tsx` |
| — | Dashboard Wali Kelas | Guru | ✅ COMPLETE | `Pages/Guru/DashboardWaliKelas.tsx` |
| — | Monitoring Presensi | Admin | ✅ COMPLETE | `Pages/Admin/Monitoring.tsx` |

### Mobile — Design Spec (BUKAN Halaman Terpisah)

> mobile.css adalah **design spec untuk viewport 340px**. Semua halaman di atas sudah
> responsif ke mobile via Tailwind breakpoints. Tidak ada halaman React terpisah untuk mobile.
>
> Tabel di bawah adalah referensi bagaimana setiap Figma mobile page diadaptasi.

| Baris Mobile | Mobile Page | Role | Adaptasi di Halaman Desktop |
|-------------|-------------|------|----------------------------|
| 1 | Dashboard Admin | Admin | ✅ — StatCard 2 kolom (`grid-cols-2 lg:grid-cols-5`) |
| 853 | Login | Public | ✅ — Single column, left panel hidden |
| 1198 | Data Master | Admin | ✅ — `w-full sm:w-auto`, `flex-col sm:flex-row` |
| 2209 | Ekspor Laporan | Admin | ✅ — Form full-width |
| 4203 | Enrolment Kelas | Admin | ✅ — Card list di mobile |
| 5068 | Dashboard Siswa | Siswa | ✅ — Bottom nav + stat cards |
| 5865 | Live Presensi | Siswa | ✅ — Full-screen camera |
| 6495 | Riwayat Kehadiran | Siswa | ✅ — Filter + list vertikal |
| 7759 | Pengaturan Jadwal Presensi | Admin | ✅ — Form vertikal, no sidebar |
| 13667 | Edit Kelas | Admin | ✅ — Modal full-screen |
| 15146 | Dashboard Wali Murid | Wali Murid | ✅ — StatCard anak |
| 16316 | Pengajuan Izin | Wali Murid | ✅ — Form full-width |
| 17954 | Dashboard Guru Piket | Guru | ✅ — StatCard + list |
| 19785 | Dashboard Wali Kelas | Guru | ✅ — StatCard per siswa |
| 21471 | Ekspor Harian | Admin | ✅ — Filter + tombol |
| 21644 | Filters (shared) | Shared | ✅ — Filter pills |
| 24158 | Verif Izin | Guru/Wali Kelas | ✅ — Card vertikal |

---

## 📦 Komponen Existing (Sudah Dibuat)

Jangan bikin ulang komponen ini — sudah siap pakai:

| Komponen | Lokasi | Props Utama |
|----------|--------|-------------|
| **Button** | `Components/ui/Button.tsx` | `variant: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'`, `size: 'sm' | 'md' | 'lg'`, `loading: boolean` |
| **Input** | `Components/ui/Input.tsx` | `label`, `error`, `icon`, `...InputHTMLAttributes` |
| **Badge** | `Components/ui/Badge.tsx` | `variant: 'default' | 'success' | 'danger' | 'warning'` |
| **StatusBadge** | `Components/ui/StatusBadge.tsx` | `status: StatusVariant` (otomatis pilih warna) |
| **StatCard** | `Components/ui/StatCard.tsx` | `title`, `value`, `icon?`, `color?: StatColor` |
| **Table** | `Components/ui/Table.tsx` | `columns`, `data`, `loading?`, `emptyMessage?` |
| **Pagination** | `Components/ui/Table.tsx` | `links` (dari Inertia) |
| **Toggle** | `Components/ui/Toggle.tsx` | `checked`, `onChange` |
| **Checkbox** | `Components/ui/Checkbox.tsx` | `checked`, `onChange`, `label` |
| **Radio / RadioGroup** | `Components/ui/Radio.tsx` | `name`, `value`, `options` |
| **ActionButton** | `Components/ui/ActionButton.tsx` | `variant: 'detail' | 'edit' | 'delete'`, `onClick` |
| **Navbar** | `Components/Navbar.tsx` | `brand`, `username`, `userInitial` |
| **Sidebar** | `Components/Sidebar.tsx` | `activeMenu?`, `className?` |
| **SidebarItem** | `Components/SidebarItem.tsx` | `href`, `icon`, `label`, `active?` |
| **LoginCard** | `Components/LoginCard.tsx` | `data`, `setData`, `errors`, `processing` |
| **BrandLogo** | `Components/BrandLogo.tsx` | `variant: 'light' | 'dark'`, `size?` |
| **FilterBar** | `Components/FilterBar.tsx` | `children`, sub-komponen: `Select`, `Date`, `Search`, `Pill` |
| **TabSwitcher** | `Components/TabSwitcher.tsx` | `tabs`, `activeTab`, `onChange` |
| **Modal** | `Components/Modal.tsx` | `isOpen`, `onClose`, `title`, `children` |
| **LoadingSpinner** | `Components/LoadingSpinner.tsx` | `size?: 'sm' | 'md' | 'lg'` |
| **EmptyState** | `Components/EmptyState.tsx` | `icon?`, `message?`, `action?` |
| **ErrorAlert** | `Components/ErrorAlert.tsx` | `message`, `onRetry?` |
| **DashboardStats** | `Components/DashboardStats.tsx` | `hadir`, `alpa`, `ijin`, `sakit` (mobile stat card pattern) |
| **StudentCard** | `Components/StudentCard.tsx` | `student` |

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
| **1** | "Detail" | `bg-primary-light` (Zumthor), `text-primary`, icon FA5 | `bg-background` (Catskill White), `text-primary`, icon FA5 | Tombol detail tabel |
| **2** | "Edit" | `bg-amber-100` (Beeswax), `text-amber-600` | `bg-amber-50`, `text-amber-600` | Tombol edit |
| **3** | "Filter Kelas" | — | `bg-surface`, `border-border`, `text-text-secondary`, icon FA5 | Filter dropdown |
| **4** | "Hapus Terpilih" | — | `bg-danger-light` (Cinderella), `text-danger`, icon FA5 | Bulk delete |
| **5** | "Import Excel" | — | `bg-accent` (Candlelight), `text-text-primary`, rounded-md | Import data |
| **6** | "Tambah Data Baru" | — | `bg-primary`, `text-white`, icon `+` | Add new record |

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

Figma menggunakan **Font Awesome 5 Free** (Solid) untuk semua icon.

### Implementasi Kita

Kita menggunakan **2 pendekatan** untuk icon:

1. **FA5 CDN** — untuk Layouts, Sidebar, Navbar (global, tidak perlu import per komponen)
   ```html
   <!-- Di resources/views/app.blade.php (sebelum @vite) -->
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" crossorigin="anonymous" referrerpolicy="no-referrer" />
   ```
   ```tsx
   // Pakai langsung di JSX — tanpa import:
   <i className="fas fa-home" />
   <i className="fas fa-user-graduate" />
   ```

2. **`react-icons/fa`** — untuk Components (tree-shaking, ringan, hanya import yang dipakai)
   ```bash
   bun add react-icons
   ```
   ```tsx
   import { FaHome, FaUserGraduate } from 'react-icons/fa';
   
   <FaHome className="text-primary w-4 h-4" />
   <FaUserGraduate className="text-text-muted w-4 h-4" />
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
| `fa-check` | Checkbox checked | `FaCheck` |
| `fa-circle` | Radio | `FaCircle` |
| `fa-bars` | Hamburger menu | `FaBars` |
| `fa-th-large` | Dashboard grid | `FaThLarge` |
| `fa-clipboard-list` | Piket | `FaClipboardList` |
| `fa-user-graduate` | Siswa | `FaUserGraduate` |
| `fa-chart-bar` | Grafik | `FaChartBar` |
| `fa-cog` | Pengaturan | `FaCog` |
| `fa-sign-out-alt` | Logout | `FaSignOutAlt` |

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
  <EmptyState message="Belum ada data" />
)}
```

### 3. Error State

```tsx
<ErrorAlert
  message="Gagal memuat data"
  onRetry={() => fetchData()}
/>
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

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={() => ...} />;
  if (data.length === 0) return <EmptyState />;
  return <DataView data={data} />;
}
```

---

## 📱 Mobile-First Responsive Strategy

### Prinsip

```
Satu Halaman → Satu File → Adaptif via Tailwind Breakpoints
```

### Kenapa Tidak Bikin Halaman Mobile Terpisah?

| Argumentasi | Kesimpulan |
|-------------|------------|
| mobile.css adalah Figma spec viewport 340px | ✅ Design reference, bukan spec terpisah |
| Tailwind `lg:hidden` / `hidden lg:flex` | ✅ Satu komponen bisa tampil beda di tiap viewport |
| Biaya maintenance lebih rendah | ✅ 1 file = 1 halaman, bukan 2 |
| Future-proof untuk Next.js/Flutter/RN | ✅ Pisahkan logic dari view, bukan pisah view |

### Aturan Responsive

| Breakpoint | Target | Prefix |
|------------|--------|--------|
| `default` | Mobile (<640px) | Tidak pakai prefix |
| `sm:` | Tablet (≥640px) | `sm:flex-row`, `sm:w-auto` |
| `md:` | Tablet landscape (≥768px) | Jarang dipakai |
| `lg:` | Desktop (≥1024px) | `lg:flex`, `lg:hidden`, `lg:grid-cols-5` |

### Pattern yang Wajib

1. **Form/Select/Input** → `w-full sm:w-auto` — full-width di mobile, auto di desktop
2. **Filter bar** → `flex-col sm:flex-row` — stack di mobile, inline di desktop
3. **Stat cards** → `grid-cols-2 lg:grid-cols-5` — 2 kolom mobile, 5 kolom desktop
4. **Bottom navigation** → `fixed bottom-0 lg:hidden` — hanya di mobile
5. **Sidebar** → `hidden lg:flex` desktop, hamburger + overlay mobile
6. **Tabel** → `overflow-x-auto` — horizontal scroll di mobile
7. **Modal** → `w-full sm:max-w-lg` — full-width mobile, max-width desktop

### Mobile Layout Patterns dari Codebase (Yang Sudah Diterapkan)

| Pattern | Implementasi | File Contoh |
|---------|-------------|-------------|
| Mobile Header (hamburger + brand + avatar) | `lg:hidden bg-primary text-white` | `AdminLayout.tsx` |
| Slide-out Sidebar | `fixed inset-0 bg-black/50 z-40` + `-translate-x-full` | `AdminLayout.tsx`, `GuruLayout.tsx` |
| Bottom Navigation | `fixed bottom-0 lg:hidden` + 4 items | `AdminLayout.tsx` |
| Filter Vertical Stack | `flex-col sm:flex-row` | `FilterBar.tsx` |
| Full-width Input | `w-full sm:w-auto` | `FilterBar.tsx` |
| Mobile Stat Card 2-column | `grid grid-cols-2 gap-2.5` | `DashboardStats.tsx` |
| Mobile Stat Card Pattern | 9px label, 18px value, p-3 | `DashboardStats.tsx` |
| Filter Pills | `rounded-full px-4 py-1.5 text-[11px]` | `FilterBar.tsx` |

---

## 🔮 Persiapan Arsitektur Masa Depan

### Roadmap Pemisahan Frontend-Backend

```
Sekarang: smauii-core (monolith Inertia)
  │
  ├── Backend: Laravel + Eloquent + Services
  ├── Frontend: InertiaJS + React + Tailwind
  └── Satu repo, satu deployment
  │
  ▼
Nanti: Pisah menjadi 3 repositori:
  │
  ├── smauii-core → backend API (Laravel + Sanctum)
  │     REST API JSON untuk semua platform
  │
  ├── smauii-web → frontend web (Next.js)
  │     React + Tailwind, consume API
  │
  └── smauii-mobile → mobile app (Flutter / React Native)
        Native experience, consume API yang sama
```

### Yang Harus Mulai Dilakukan dari Sekarang

| # | Tindakan | Status |
|---|----------|--------|
| 1 | **Pisahkan logic fetching dari komponen UI** — buat custom hooks per halaman | ❌ Belum |
| 2 | **Gunakan TypeScript yang framework-agnostic** — `types/component.ts` pure types | ✅ Sudah |
| 3 | **Hindari `@inertiajs/react` import di Components** — hanya di Pages/Layouts | ⚠️ Sebagian |
| 4 | **Dual Controller pattern** — Web + API untuk setiap fitur | ✅ Sudah |
| 5 | **API response standar** — format JSON konsisten | ✅ Sudah |
| 6 | **Service Layer** — satu-satunya tempat business logic | ✅ Sudah |
| 7 | **Export types ke package terpisah** — `@smauii/types` | ❌ Belum |

### Panduan untuk Fathan

```tsx
// ✅ BOLEH — Inertia import di Pages
import { router, usePage } from '@inertiajs/react';
export default function DataMasterPage() {
    const { students } = usePage().props;
    // ...
}

// ❌ JANGAN — Inertia import di Components
import { router } from '@inertiajs/react';
export function Button() { ... } // ❌ Button harus pure React

// ✅ BOLEH — react-icons/fa di Components
import { FaPlus } from 'react-icons/fa';
export function Button({ children }) {
    return <button>{children} <FaPlus /></button>;
}
```

---

## 🧩 Panduan Per Halaman

### Halaman 1: Admin — Pengajuan Izin (desktop.css baris 3855, 4139)

**Status: ✅ SUDAH — `Pages/Admin/PengajuanIzin.tsx`**

Layout:
- Sidebar (kiri) + Header + Content
- TabSwitcher: "Semua" | "Menunggu" | "Disetujui" | "Ditolak"
- Tabel daftar pengajuan izin dengan kolom: Nama, Kelas, Tanggal, Keterangan, Status, Aksi
- Tombol verifikasi di setiap baris
- Filter: by kelas, by tanggal

**Catatan:** Halaman figma baris 3855 (Pengajuan Izin Sakit) dan 4139 (Pengajuan Izin Diterima) **digabung** via TabSwitcher.

### Halaman 2: Admin — Data Master (desktop.css baris 4231)

**Status: ✅ SUDAH — `Pages/Admin/DataMaster.tsx`**

Layout:
- TabSwitcher: Siswa | Guru | Kelas | Wali
- Tabel per tab dengan CRUD
- Search + Filter kelas
- Modal form tambah/edit

### Halaman 3: Admin — Rekap Bulanan (desktop.css baris 8529)

**Status: ✅ SUDAH — `Pages/Admin/RekapBulanan.tsx`**

Layout:
- Filter: bulan + tahun (dropdown)
- StatCards: Total Siswa, Hadir, Sakit, Izin, Alpha
- Tabel per hari
- Tombol Ekspor

### Halaman 4: Admin — Rekap Harian (desktop.css baris 41642)

**Status: ✅ SUDAH — `Pages/Admin/RekapHarian.tsx`**

Layout:
- Filter: tanggal (date picker)
- Tabel: Nama, Kelas, Jam Masuk, Jam Keluar, Status
- Summary baris: Total Hadir / Tidak Hadir

### Halaman 5: Admin — Enrolment Siswa Kelas (desktop.css baris 14004)

**Status: ✅ SUDAH — `Pages/Admin/EnrolmentKelas.tsx`**

Layout:
- Pilih kelas (dropdown)
- Tabel siswa di kelas itu: NIS, Nama, Aksi
- Tombol "Tambah Siswa" — modal
- Search + Filter

### Halaman 6: Admin — Master Kelas (desktop.css baris 26383)

**Status: ✅ SUDAH — `Pages/Admin/MasterKelas.tsx`**

Layout:
- Tabel: Nama Kelas, Tingkat, Wali Kelas, Jumlah Siswa, Aksi
- Modal form tambah/edit

### Halaman 7: Admin — Atur Waktu & Libur (desktop.css baris 29537)

**Status: ✅ SUDAH — `Pages/Admin/AturWaktuLibur.tsx`**

Layout:
- Kalender
- Daftar hari libur
- Form tambah hari libur

### Halaman 8: Admin — Verifikasi Izin (desktop.css baris 58852)

**Status: ✅ SUDAH — `Pages/Admin/VerifikasiIzin.tsx`**

Layout:
- Tabel + Filter
- Tombol approve/reject

### Halaman 9: Admin — Monitoring Presensi

**Status: ✅ SUDAH — `Pages/Admin/Monitoring.tsx`**

Layout:
- Tabel monitoring real-time
- Filter kelas + tanggal

### Halaman 10: Siswa — Dashboard (desktop.css baris 20182)

**Status: ✅ SUDAH — `Pages/Siswa/Dashboard.tsx`**

Layout:
- Header + Nav (mobile-first, tanpa sidebar)
- StatCards: Kehadiran Bulan Ini
- Tombol "Presensi Sekarang"

### Halaman 11: Siswa — Live Presensi (desktop.css baris 19057)

**Status: ✅ SUDAH — `Pages/Siswa/LivePresensi.tsx`**

Layout:
- Full-screen camera view (simulasi)
- Waktu real-time
- Tombol "Check In" / "Check Out"

### Halaman 12: Siswa — Riwayat Kehadiran (desktop.css baris 16482)

**Status: ✅ SUDAH — `Pages/Siswa/RiwayatKehadiran.tsx`**

Layout:
- Filter: bulan + tahun
- Tabel: Tanggal, Jam Masuk, Jam Keluar, Status
- Ringkasan: total hadir bulan ini

### Halaman 13: Wali Murid — Dashboard (mobile.css baris 15146)

**Status: ✅ SUDAH — `Pages/WaliMurid/Dashboard.tsx`**

Layout:
- Daftar anak
- StatCard per anak
- Riwayat izin terbaru

### Halaman 14: Wali Murid — Pengajuan Izin (desktop.css baris 21843)

**Status: ✅ SUDAH — `Pages/WaliMurid/PengajuanIzin.tsx`**

Layout:
- Form: Pilih Anak, Tanggal, Jenis Izin, Keterangan, Upload Bukti
- Tabel riwayat pengajuan

### Halaman 15: Guru — Dashboard Piket (mobile.css baris 17954)

**Status: ✅ SUDAH — `Pages/Guru/DashboardPiket.tsx`**

Layout:
- StatCard rekap
- Daftar kelas

### Halaman 16: Guru — Dashboard Wali Kelas (mobile.css baris 19785)

**Status: ✅ SUDAH — `Pages/Guru/DashboardWaliKelas.tsx`**

Layout:
- StatCard per siswa
- Daftar kehadiran

### Halaman 17: Login (desktop.css baris 1)

**Status: ✅ SUDAH — `Pages/Login.tsx`**

Layout:
- Dual panel (desktop) / Single column (mobile)

---

## 🆕 Komponen Baru — Status Real

> Semua komponen di bawah ini **SUDAH DIBUAT**. Tidak perlu dibuat ulang.

| Komponen | Lokasi | Prioritas | Status |
|----------|--------|-----------|--------|
| **BrandLogo** | `Components/BrandLogo.tsx` | Medium | ✅ SUDAH |
| **FilterBar** | `Components/FilterBar.tsx` | High | ✅ SUDAH (dengan sub-komponen Select, Date, Search, Pill) |
| **TabSwitcher** | `Components/TabSwitcher.tsx` | High | ✅ SUDAH |
| **StudentCard** | `Components/StudentCard.tsx` | Low | ✅ SUDAH |
| **Modal** | `Components/Modal.tsx` | High | ✅ SUDAH |
| **LoadingSpinner** | `Components/LoadingSpinner.tsx` | Medium | ✅ SUDAH |
| **EmptyState** | `Components/EmptyState.tsx` | Medium | ✅ SUDAH |
| **ErrorAlert** | `Components/ErrorAlert.tsx` | Medium | ✅ SUDAH |
| **DashboardStats** | `Components/DashboardStats.tsx` | Low | ✅ SUDAH (mobile stat card pattern) |

---

## 🏗️ Struktur Layout Per Role

### Admin Layout (sidebar + navbar + content)
```
resources/js/Layouts/AdminLayout.tsx
├── <MobileHeader />     — lg:hidden (hamburger + brand + avatar)
├── <Navbar />           — hidden lg:block (desktop header)
├── <Sidebar />          — hidden lg:flex (desktop) + slide-out (mobile)
├── <main>               — content area (pb-20 lg:pb-6 untuk ruang bottom nav)
│   └── {children}       — halaman spesifik
└── <BottomNav />        — lg:hidden, fixed bottom (4 items: Dashboard, Data, Presensi, Izin)
```

### Siswa Layout (mobile-first, tanpa sidebar desktop)
```
resources/js/Layouts/SiswaLayout.tsx
├── <MobileHeader />     — lg:hidden
├── <Navbar />           — lg:flex
├── <main>               — content full-width
│   └── {children}
└── <BottomNav />        — lg:hidden (3 items: Beranda, Presensi, Riwayat)
```

### Guru Layout (sidebar minimal + navbar)
```
resources/js/Layouts/GuruLayout.tsx
├── <MobileHeader />     — lg:hidden (hamburger + slide-out sidebar)
├── <Navbar />           — lg:flex (desktop header)
├── <Sidebar />          — hidden lg:flex
├── <main>
│   └── {children}
└── <BottomNav />        — lg:hidden (3 items: Piket, Wali Kelas, Logout)
```

### Wali Murid Layout
```
resources/js/Layouts/WaliMuridLayout.tsx
├── <MobileHeader />     — lg:hidden
├── <Navbar />           — lg:flex
├── <main>
│   └── {children}
└── <BottomNav />        — lg:hidden (2 items: Beranda, Pengajuan Izin)
```

### Auth Layout (no sidebar, centered)
```
resources/js/Layouts/AuthLayout.tsx
└── <main className="min-h-screen bg-background flex items-center justify-center">
    └── {children}
```

---

## 📐 Konvensi Penamaan dari Figma

| Di Figma | File Real |
|----------|-----------|
| `/* Dekstop Login */` | `Pages/Login.tsx` |
| `/* Admin Dekstop Dashboard */` | `Pages/Dashboard.tsx` |
| `/* Admin Manajemen Data Master */` | `Pages/Admin/DataMaster.tsx` |
| `/* Admin Pengajuan Izin Sakit */` | `Pages/Admin/PengajuanIzin.tsx` (TabSwitcher) |
| `/* Pengajuan Izin Diterima */` | Bagian dari halaman di atas (tab "Disetujui") |
| `/* Admin Rekap Bulanan */` | `Pages/Admin/RekapBulanan.tsx` |
| `/* Admin Enrolment Siswa Kelas */` | `Pages/Admin/EnrolmentKelas.tsx` |
| `/* Admin Manajemen Master Kelas */` | `Pages/Admin/MasterKelas.tsx` |
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
    </AdminLayout>
  );
}
```

---

## 📝 Checklist Lengkap (Update dari Existing)

### Phase 1 — Foundation (✅ Selesai)
- [x] Registrasi design tokens di `app.css` via `@theme`
- [x] Components/ui/Button, Input, Badge, StatusBadge
- [x] Components/BrandLogo

### Phase 2 — Layout & Navigasi (✅ Selesai)
- [x] Sidebar, SidebarItem
- [x] AdminLayout (header + sidebar + mobile nav)
- [x] AuthLayout, GuruLayout, SiswaLayout, WaliMuridLayout

### Phase 3 — Halaman Prioritas Tinggi (✅ Selesai)
- [x] Login — dual panel (desktop) / single column (mobile)
- [x] Dashboard Admin — StatCard, FilterBar, TabSwitcher
- [x] Data Master — TabSwitcher: Siswa, Guru, Kelas, Wali

### Phase 4 Detail — Halaman Admin (✅ Selesai)
- [x] **Pengajuan Izin** — TabSwitcher semua status
- [x] **Rekap Bulanan** — filter bulan+tahun + StatCard + tabel
- [x] **Rekap Harian** — filter tanggal + tabel kehadiran
- [x] **Enrolment Siswa Kelas** — pilih kelas + daftar siswa + assign
- [x] **Manajemen Master Kelas** — CRUD kelas + wali kelas
- [x] **Atur Waktu & Libur** — kalender + hari libur
- [x] **Verifikasi Izin** — approve/reject
- [x] **Monitoring Presensi** — real-time

### Phase 4B — Halaman Siswa (✅ Selesai)
- [x] **Dashboard Siswa** — StatCard kehadiran + tombol presensi
- [x] **Live Presensi** — check-in/check-out
- [x] **Riwayat Kehadiran** — filter bulan + tabel history

### Phase 4C — Halaman Wali Murid (✅ Selesai)
- [x] **Dashboard Wali Murid** — daftar anak + ringkasan
- [x] **Pengajuan Izin (Wali)** — form + riwayat

### Phase 4D — Halaman Guru (✅ Selesai)
- [x] **Dashboard Guru Piket** — rekap harian per kelas
- [x] **Dashboard Wali Kelas** — statistik per siswa

### Phase 5 — Mobile & Polish (✅ Sebagian)
- [x] Mobile header + bottom nav di semua layout
- [x] Slide-out sidebar untuk mobile
- [x] Filter bar: `flex-col sm:flex-row`, `w-full sm:w-auto`
- [x] Stat card: 2 kolom mobile, 5 kolom desktop
- [x] Tabel: `overflow-x-auto` untuk mobile
- [x] SVGs di layout → FA5 icons
- [x] DashboardStats: mobile stat card pattern (9px label, 18px value)
- [ ] Audit setiap halaman untuk mobile readiness (ongoing)
- [ ] Loading state di semua halaman yang fetching data (ongoing)
- [ ] Empty state di semua tabel (ongoing)

#### 📋 File yang Diubah untuk Mobile Responsive

| # | File | Perubahan |
|:---:|---|---|
| 1 | `Layouts/AdminLayout.tsx` | Mobile header (hamburger + brand + avatar), slide-out sidebar overlay, bottom nav 4 item, wrapper desktop Navbar, `pb-20 lg:pb-6` |
| 2 | `Layouts/SiswaLayout.tsx` | SVGs → FA5 (`fa-home`, `fa-clock`, `fa-history`), active state bottom nav via `usePage().url`, back button |
| 3 | `Layouts/GuruLayout.tsx` | SVGs → FA5, slide-out sidebar mobile, tombol logout di sidebar mobile + desktop |
| 4 | `Layouts/WaliMuridLayout.tsx` | SVGs → FA5 (`fa-home`, `fa-paper-plane`), logout icon di header mobile + desktop |
| 5 | `Components/FilterBar.tsx` | Mobile-first stacking (`flex-col sm:flex-row`), `w-full sm:w-auto` di input/select, sub-komponen `FilterPill` |
| 6 | `Components/DashboardStats.tsx` | Mobile stat card pattern: label 9px, value 18px, `p-3`, color-coded (primary/danger/success/warning), period filter pills 11px |
| 7 | `Pages/Admin/Monitoring.tsx` | Filter: `w-full` + `flex-col sm:flex-row` pada wrapper |
| 8 | `Pages/Admin/VerifikasiIzin.tsx` | Filter: `w-full` + `flex-col sm:flex-row` pada wrapper |

---

## 🚨 Hal yang Perlu Dihindari

1. **Jangan pakai `position: absolute`** — Figma pake itu, kita pake flexbox/grid
2. **Jangan pakai `left:`, `right:`, `top:`, `bottom:`** — itu position Figma yang tidak responsif
3. **Jangan salin `flex: none; order: 0; flex-grow: 0;`** — itu boilerplate Figma
4. **Jangan salin `width: 285.79px`** — pake Tailwind `w-*` yang relatif
5. **Jangan bikin komponen ulang** — cek dulu `Components/ui/` dan `Components/` apa yang sudah ada
6. **Jangan pakai `bg-bay-of-many`** — tidak terdaftar di `@theme`. Pakai `bg-primary`
7. **Jangan lupa eager loading** — `->with('relation')` di Service method
8. **Jangan lupa 3 state** — loading, empty, error untuk setiap komponen data
9. **Jangan bikin halaman mobile terpisah** — mobile.css adalah design spec 340px, bukan daftar halaman baru
10. **Jangan import `@inertiajs/react` di Components** — hanya di Pages/Layouts, biar mudah dipisah ke Next.js nanti
