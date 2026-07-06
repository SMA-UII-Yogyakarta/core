# Workflow Figma → Frontend: Panduan Kolaborasi UI/UX & Developer

**Dokumen ini untuk:**
- **Hanif** — UI/UX Designer (Figma)
- **Fathan** — Junior Frontend Developer (React/TSX/Inertia)

**Tujuan:** Memahami berbagai cara mengekstrak desain dari Figma ke kode, plus
alur kerja agar kolaborasi tidak lagi bottleneck.

---

## Daftar Isi

1. [Pendahuluan](#1-pendahuluan)
2. [Figma Copy as CSS — Kondisi Saat Ini](#2-figma-copy-as-css)
3. [Figma MCP (Model Context Protocol)](#3-figma-mcp)
4. [Perbandingan Metode](#4-perbandingan-metode)
5. [Alur Kolaborasi Ideal](#5-alur-kolaborasi-ideal)
6. [Panduan Hanif: Membuat Figma yang Siap Konversi](#6-panduan-hanif)
7. [Panduan Fathan: Menerima & Mengolah Desain](#7-panduan-fathan)
8. [Design Token & System](#8-design-token--system)
9. [Glossary](#9-glossary)
10. [Referensi & Link](#10-referensi--link)

---

## 1. Pendahuluan

### Masalah Saat Ini

- File `desktop.css` (63KB) dan `mobile.css` (27KB) di `resources/draft-figma/` adalah **hasil export mentah** Figma
- CSS ini tidak bisa dipakai langsung — semua `position: absolute`, ukuran fix
- Fathan harus membaca dan menebak mana yang komponen, mana yang hanya wrapper
- Hanif tidak tahu bagaimana cara structuring file Figma supaya mudah diekstrak
- Komunikasi bolak-balik tidak terstruktur → bottleneck

### Solusi

Ada **tiga metode** untuk memindahkan desain Figma ke kode:

| Metode | Cocok Untuk | Kecepatan | Presisi |
|--------|-------------|-----------|---------|
| **Copy as CSS** (manual) | Single element, prototyping cepat | ⭐⭐ | ⭐⭐ |
| **Figma MCP** (AI-assisted) | Ekstraksi massal, design token | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Manual ngoding** (liat doang) | Fine-tuning, interaksi kompleks | ⭐ | ⭐⭐⭐⭐⭐ |

Dokumen ini akan membahas **ketiganya** secara detail, plus alur kolaborasi yang
paling efektif untuk tim kita.

### Clarifikasi: Mobile CSS Bukan Halaman Terpisah

File `mobile.css` (27KB) di `resources/draft-figma/` adalah **design spec untuk viewport 340px** — bukan daftar 17 halaman React yang harus dibuat. Strategi kita adalah **responsive-first**: setiap halaman desktop yang sudah ada harus responsif ke mobile via Tailwind breakpoints (`sm:`, `md:`, `lg:`).

**Yang sudah dilakukan:**
- ✅ Layout mobile (header, bottom nav, sidebar slide-out) — semua layout sudah
- ✅ Form/input full-width di mobile — `w-full sm:w-auto`
- ✅ Filter bar stack vertikal di mobile — `flex-col sm:flex-row`
- ✅ Stat card 2 kolom di mobile — `grid-cols-2 lg:grid-cols-5`
- ✅ Ikon FA5 untuk semua layout (SVG → FA5)

**Yang TIDAK perlu dilakukan:**
- ❌ Membuat file `Pages/Mobile/DashboardAdmin.tsx` terpisah
- ❌ Routing terpisah untuk mobile (`/mobile/dashboard`)
- ❌ Duplikasi komponen untuk mobile

---

## 2. Figma Copy as CSS

### 2.1 Apa Itu?

Copy as CSS adalah fitur bawaan Figma untuk menyalin properti CSS dari elemen
yang dipilih. Akses: Klik kanan elemen → **Copy as** → **Copy as CSS**.

### 2.2 Hasil Output

```css
/* Contoh hasil Copy as CSS dari sebuah Button di Figma */

/* Auto layout */
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
padding: 12px 18px;
gap: 12px;

position: absolute;
width: 210px;
height: 41px;
left: 20px;
top: 20px;

/* Candlelight */
background: #FAE62A;
border-radius: 8px;
```

### 2.3 Kelebihan

| Kelebihan | Penjelasan |
|-----------|------------|
| **Cepat untuk elemen kecil** | Butuh 1 klik — langsung dapat CSS |
| **Tanpa setup** | Bisa dari Figma manapun, tanpa plugin |
| **Akurat warna & tipografi** | Nilai hex, font-size, font-family sesuai Figma |
| **Bisa offline** | Tidak perlu koneksi API |

### 2.4 Kekurangan

| Kekurangan | Dampak |
|------------|--------|
| **`position: absolute`** | Semua elemen punya `left`/`top`/`width`/`height` fix — tidak responsif |
| **Layer flatten** | Tidak ada hirarki parent-child yang jelas |
| **Auto Layout tidak selalu ke-export** | Flexbox arah, gap, padding sering hilang |
| **Nama warna ambigu** | `/* Bay of Many */` — tidak standar CSS |
| **Banyak boilerplate** | `/* Inside auto layout */`, `flex: none`, `order: 0` — tidak berguna |
| **Tidak ada grouping komponen** | Button, Input, Card — semua flat dalam 1 file besar |
| **Tidak scalable** | 1 halaman = 2000+ baris CSS mentah |

### 2.5 Kapan Pakai Copy as CSS

✅ **PAKAI** ketika:
- Ingin ambil nilai warna/typography/spacing dari 1 elemen tertentu
- Butuh referensi cepat ukuran padding/margin
- Tidak ada akses API Figma (file statis/delivery)

❌ **JANGAN** ketika:
- Mau generate kode untuk 1 halaman penuh (pilih Figma MCP)
- Butuh struktur komponen yang rapi
- File Figma-nya besar (100+ layer)

### 2.6 Cara Interpretasi Copy as CSS yang Benar

```css
/* ============================================
   CONTOH: Cara Membaca Copy as CSS
   ============================================ */

/* 1. AMBIL nilai-nilai ini */
background: #2E3391;           /* warna → bg-primary */
border-radius: 6px;            /* radius → rounded-md */
font-family: 'Inter';          /* font   → font-sans */
font-weight: 700;              /* weight → font-bold */
font-size: 13.3px;             /* size   → text-xs */
color: #FFFFFF;                /* color  → text-white */
padding: 12px 117.9px;         /* pad    → px-[117px] py-3 */
border: 1px solid #CBD5E1;    /* border → border border-border-input */
gap: 12px;                     /* gap    → gap-3 */

/* 2. ABUIKAN properti ini */
position: absolute;        /* ganti pake flexbox Tailwind */
left: 20px;                 /* abaikan — layout nanti ngikut parent */
top: 20px;                  /* abaikan */
width: 210px;               /* ganti pake w-full atau w-auto */
height: 41px;               /* ganti pake h-10 (40px) */
/* Inside auto layout */     /* abaikan */
flex: none;                 /* abaikan */
order: 0;                   /* abaikan */
flex-grow: 0;               /* abaikan */
```

---

## 3. Figma MCP (Model Context Protocol)

### 3.1 Apa Itu Figma MCP?

**MCP = Model Context Protocol** — protokol standar yang memungkinkan AI
(seperti opencode) berkomunikasi langsung dengan tools eksternal.

**Figma MCP** = MCP server yang menghubungkan AI ke Figma API. Dengan ini,
opencode bisa:

- Membaca struktur file Figma secara langsung
- Mengekstrak **design tokens** (warna, font, spacing, effect)
- Generate **React + Tailwind component** otomatis
- Mapping **Auto Layout Figma → Flexbox CSS**
- Export asset SVG/PNG langsung dari Figma

### 3.2 Cara Kerja

```
┌─────────────────────────────────────────────────┐
│                  opencode (AI)                   │
│                                                   │
│  "Generate design tokens dari file Figma SMAUII" │
└──────────────────────┬──────────────────────────┘
                       │
         ┌─────────────▼─────────────┐
         │    MCP Protocol Layer     │
         │  (Model Context Protocol) │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │   Figma MCP Server        │
         │  (berjalan di lokal)       │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │   Figma REST API          │
         │  (api.figma.com)          │
         └─────────────┬─────────────┘
                       │
         ┌─────────────▼─────────────┐
         │   File .fig di Cloud      │
         │  (figma.com/file/KEY)     │
         └───────────────────────────┘
```

### 3.3 Yang Diperlukan untuk Setup

| Requirement | Keterangan |
|-------------|------------|
| **Figma File Key** | Ada di URL: `figma.com/file/KEY/nama-file` |
| **Figma Personal Access Token** | Buat di Figma > Settings > Account > Personal Access Tokens |
| **Node.js** | Untuk menjalankan MCP server |
| **MCP Server** | Install salah satu MCP server (lihat tabel di bawah) |
| **File Figma yang rapi** | Auto Layout, proper naming, component separation |

### 3.4 Daftar Figma MCP Server

Berikut Figma MCP server yang sudah mature dan relevan untuk kita:

#### ⭐ A. figma-bridge-mcp — Paling Cocok untuk Kita

| Detail | Info |
|--------|------|
| **GitHub** | `github.com/Panxoat/figma-bridge-mcp` |
| **Kelebihan** | ✅ `get_design_tokens` dengan format `"tailwind"` |
| | ✅ `get_node_styles` — CSS generation per node |
| | ✅ `get_component_tree` — lihat struktur komponen |
| **Tools penting** | `get_file_overview`, `get_design_tokens`, `get_component_tree`, `get_node_styles`, `export_assets` |
| **Format tokens** | `raw`, `css_variables`, `tailwind` |

**Contoh output `get_design_tokens(format: "tailwind")`:**
```css
/* Otomatis generate Tailwind v4 @theme */
@theme {
  --color-primary: #2E3391;
  --color-accent: #FAE62A;
  --color-danger: #EF4444;
  --color-success: #10B981;
  --color-surface: #F1F5F9;
  --color-border: #E2E8F0;
  --font-sans: 'Inter', sans-serif;
  --font-brand: 'Urbanist', sans-serif;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

#### ⭐ B. pixel-figma-mcp — Code Generation Terbaik

| Detail | Info |
|--------|------|
| **GitHub** | `github.com/Rylaa/pixelbyte-figma-mcp` |
| **Kelebihan** | ✅ `include_generated_code` — langsung dapat kode React/Tailwind |
| | ✅ Support 10 framework: React, Vue, Tailwind, CSS, SCSS, dll |
| | ✅ Gradient, transform, effect lengkap |
| **Tools penting** | `figma_get_design_tokens`, `figma_get_styles` |

**Contoh output `figma_get_design_tokens(include_generated_code: true)`:**
```json
{
  "tokens": {
    "colors": [{ "name": "Button Background", "value": "#2E3391" }],
    "typography": [{ "fontFamily": "Inter", "fontSize": 13.3 }]
  },
  "generated": {
    "tailwind_config": "@theme { --color-button-bg: #2E3391; }",
    "css_variables": ":root { --color-button-bg: #2E3391; }"
  }
}
```

#### C. Figma Context MCP (glips/figma-context-mcp) — All-in-One

| Detail | Info |
|--------|------|
| **GitHub** | `github.com/glips/figma-context-mcp` |
| **Benchmark** | 87.95 (High) |
| **Kelebihan** | ✅ Complete design extraction untuk code generation |
| | ✅ Bisa generate React component + CSS module |

#### D. Figma Console MCP (southleft) — Design Operations

| Detail | Info |
|--------|------|
| **GitHub** | `github.com/southleft/figma-console-mcp` |
| **Benchmark** | 88.5 (High) |
| **Kelebihan** | ✅ Bisa create/edit/delete Figma elements via AI |
| | ✅ Variable management, debugging |

#### E. Official Figma MCP Server

| Detail | Info |
|--------|------|
| **Dokumentasi** | `github.com/figma/mcp-server-guide` |
| **Code Snippets** | 2292 |
| **Kelebihan** | ✅ Official dari Figma |
| | ✅ Code Connect integration |
| | ✅ Best-in-class structured metadata |

#### F. Figma Context MCP (boboluo832) — Token Hemat

| Detail | Info |
|--------|------|
| **GitHub** | `github.com/boboluo832-dev/figma-design-context` |
| **Kelebihan** | ✅ **Condensed format** — hemat 60% token AI |
| | ✅ Bisa output langsung Tailwind per node |
| | ✅ `get_page_for_codegen` — struktur + tokens + komponen dalam 1 call |

### 3.5 Perbandingan Tools Figma MCP

| Nama Server | Token Extraction | Code Gen | Tailwind Output | Auto Layout → Flexbox | Component Tree |
|-------------|:-:|:-:|:-:|:-:|:-:|
| **figma-bridge-mcp** | ✅✅✅ | ✅ | ✅✅ (format tailwind) | ✅ | ✅✅ |
| **pixel-figma-mcp** | ✅✅ | ✅✅✅ | ✅✅ | ✅✅ | ✅ |
| **figma-context-mcp (glips)** | ✅✅ | ✅✅ | ✅ | ✅ | ✅✅ |
| **figma-console-mcp** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Official Figma MCP** | ✅✅ | ✅✅ | ✅ | ✅✅ | ✅✅✅ |
| **figma-design-context** | ✅✅ | ✅ | ✅✅ | ✅ | ✅✅ |

**Rekomendasi:**
- **Token extraction & Tailwind config** → `figma-bridge-mcp`
- **Generate React component langsung** → `pixel-figma-mcp`
- **All-in-one + hemat token** → `figma-design-context`

### 3.6 Contoh Sesi Menggunakan Figma MCP

Skenario: Hanif selesai bikin halaman Dashboard Admin di Figma. Fathan ingin
generate komponennya.

**Step 1 — Setup MCP Server:**
```json
// ~/.config/opencode/opencode.json
{
  "mcpServers": {
    "figma-bridge": {
      "command": "npx",
      "args": ["@figma/bridge-mcp"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_xxxxx..."
      }
    }
  }
}
```

**Step 2 — Minta AI Extract Token:**
```
→ "Extract design tokens dari figma file KEY_DASHBOARD 
   dalam format tailwind"
→ Output: @theme block untuk app.css
```

**Step 3 — Minta AI Generate Komponen:**
```
→ "Generate React + Tailwind component untuk sidebar 
   dari halaman Dashboard Admin di file KEY_DASHBOARD"
→ Output: Components/Sidebar.tsx
```

**Step 4 — Fathan tinggal fine-tune:**
```tsx
// AI sudah buat 80% kode, Fathan tinggal:
// - Tambah interaksi (onClick, state)
// - Handling loading/error
// - Integrasi dengan Inertia
// - Routing
```

### 3.7 Keterbatasan Figma MCP

| Keterbatasan | Penjelasan | Mitigasi |
|-------------|------------|----------|
| **Membutuhkan file .fig** | Tidak bisa dari screenshot/PDF | Pastikan Hanif share link Figma |
| **Token API** | Perlu Personal Access Token | Sandiko bisa buatin 1 token khusus |
| **Tergantung struktur Figma** | Layer acak = hasil acak | Hanif harus ikut panduan naming |
| **Interaksi kompleks** | Animasi, drag-drop, state | Tetap manual oleh Fathan |
| **Tidak 100% sempurna** | Perlu penyesuaian manusia | Anggap 80% jadi, 20% fine-tune |

---

## 4. Perbandingan Metode

| Aspek | Copy as CSS | Figma MCP | Manual (Liat Figma) |
|-------|:-----------:|:----------:|:-------------------:|
| **Kecepatan ekstraksi** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |
| **Presisi warna/typography** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Struktur komponen** | ⭐ (flat) | ⭐⭐⭐⭐ (hierarchy) | ⭐⭐⭐⭐ |
| **Responsiveness** | ⭐ (pixel fix) | ⭐⭐⭐ (flexbox) | ⭐⭐⭐⭐⭐ |
| **Design tokens** | ❌ | ✅✅✅ | ❌ (manual) |
| **Butuh koneksi Figma API** | ❌ | ✅ | ❌ |
| **Butuh file .fig original** | ❌ | ✅ | ✅ (liat doang) |
| **Scalability** | ❌ (file raksasa) | ✅✅✅ | ✅ (tapi lambat) |
| **Hasil siap pakai** | 10% | 80% | 50% |

### Kapan Pakai yang Mana?

| Situasi | Metode |
|---------|--------|
| Ingin ambil 1 warna/ukuran dengan cepat | **Copy as CSS** |
| Generate design tokens seluruh halaman | **Figma MCP** |
| Generate 1 komponen (Button, Card, Sidebar) | **Figma MCP** |
| Implementasi halaman baru | **Figma MCP** → fine-tune manual |
| Animasi, transisi, interaksi kompleks | **Manual** |
| Responsive breakpoints | **Manual** (Figma biasanya fixed) |

### Alur Hybrid yang Paling Efektif

```
DESAIN SELESAI
    │
    ├── 1. Figma MCP → Extract Design Tokens
    │      → app.css (warna, font, spacing, radius, shadow)
    │
    ├── 2. Figma MCP → Generate Komponen Besar
    │      → Sidebar.tsx, Header.tsx, FilterBar.tsx
    │      → 80% jadi, flexbox sudah benar
    │
    ├── 3. Manual → Fine-tune Komponen
    │      → Tambah props, state, event handler
    │      → Responsive breakpoints
    │      → Integrasi Inertia
    │
    └── 4. Manual → Interaksi Spesifik
         → Animasi loading, error state, empty state
         → Drag & drop, realtime updates
```

---

## 5. Alur Kolaborasi Ideal

### 5.1 Siklus Kolaborasi

```
┌─────────────────────────────────────────────────────────┐
│                     HANIF (UI/UX)                        │
│  1. Desain di Figma dengan struktur yang rapi            │
│  2. Share link Figma + docs desain ke Fathan            │
│  3. Review hasil implementasi Fathan                     │
└────────────────────────┬────────────────────────────────┘
                         │ Share link Figma + docs
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     FATHAN (Frontend)                    │
│  1. Extract design tokens via Figma MCP                 │
│  2. Generate komponen via Figma MCP                     │
│  3. Fine-tune + integrasi Inertia                       │
│  4. Responsive (mobile-first via Tailwind breakpoints)  │
│  5. Demo ke Hanif                                       │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Step-by-Step Kolaborasi

#### Fase 1: Hanif Menyiapkan Desain

**Output:** Link Figma + Dokumen Desain

```
📁 File Figma: SMAUII Admin Dashboard
├── 🖥 Desktop/
│   ├── Login
│   ├── Dashboard Admin
│   ├── Data Master
│   └── ...
├── 📱 Mobile/
│   ├── Login Mobile
│   ├── Dashboard Mobile
│   └── ...
└── 🧩 Components/
    ├── Button (primary, secondary)
    ├── Text Input (default, error, disabled)
    ├── Card (default, hover)
    └── ...
```

**Checklist untuk Hanif:**

- [ ] Frame Figma menggunakan **Auto Layout** (bukan manual position)
- [ ] Layer naming jelas: `Button/Primary`, `Button/Secondary`, bukan `Rectangle 42`
- [ ] Komponen reusable dipisah ke halaman **Components**
- [ ] Warna pakai **Local Styles** atau **Variables** (bukan hex langsung di fill)
- [ ] Typography pakai **Text Styles**
- [ ] Efek shadow/border pakai **Effect Styles**
- [ ] Buat **cover note** untuk setiap halaman (behavior, responsive behavior, loading state)

#### Fase 2: Hanif Menyerahkan Desain

**Wajib dikirim:**
1. ✅ Link Figma (`figma.com/file/...`)
2. ✅ Dokumen desain (1 paragraf per halaman: fungsi, behavior, state)
3. ✅ Daftar komponen yang dipake
4. ✅ Referensi halaman/komponen serupa (kalo ada)

**Format cover note:**
```markdown
## Halaman: Dashboard Admin

**Fungsi:** Halaman utama admin — lihat statistik kehadiran hari ini.

**Komponen:**
- Header (logo + user info)
- Sidebar (navigasi, item "Dashboard" active)
- Global Filter Bar (dropdown kelas + date picker)
- Stat Cards (Hadir, Alpa, Ijin, Sakit)
- Tabel kehadiran (student list)

**States:**
- Loading: skeleton card
- Empty: "Belum ada data hari ini"
- Error: toast error + retry button

**Behavior:**
- Filter kelas → reload tabel
- Click stat card → filter by status
- Responsive: sidebar collapse jadi hamburger di <768px

**Referensi:**
- Sidebar: lihat Google Admin Console
- Stat Cards: lihat pattern dari page Dashboard Siswa
```

#### Fase 3: Fathan Menerima Desain

**Yang dilakukan Fathan:**
1. Baca dokumen cover note Hanif
2. Extract design tokens via Figma MCP (1x di awal proyek)
3. Generate komponen dasar via Figma MCP
4. Generate layout halaman via Figma MCP
5. Fine-tune + integrasi
6. **Implementasi responsive: mobile-first via Tailwind breakpoints** (baru)
7. Demo ke Hanif

#### Fase 4: Review

**Yang dicek Hanif:**
- [ ] Warna sesuai (cecokin pake eyedropper atau Figma)
- [ ] Spacing, padding, margin sesuai
- [ ] Typography sesuai
- [ ] Layout responsive (coba resize browser, cek mobile + tablet + desktop)
- [ ] Komponen punya hover/active/focus state

**Format review:**
```markdown
## Review: Dashboard Admin

✅ Header — OK
✅ Sidebar — OK
⚠️ Stat Cards — padding kurang 4px (Figma: 12px, code: 8px)
❌ Tabel — font size masih 14px harusnya 13px
❌ Mobile — sidebar belum collapse
❌ Mobile — filter bar belum vertical stack
```

### 5.3 Timeline yang Ideal

```
Day 1: Hanif selesai desain → share ke Fathan
Day 1: Fathan extract tokens + generate komponen dasar
Day 2: Fathan selesai implementasi halaman
Day 2: Fathan implement responsive (mobile-first)
Day 3: Hanif review → Fathan fix
Day 4: Selesai 🎉
```

---

## 6. Panduan Hanif: Membuat Figma yang Siap Konversi

### 6.1 Aturan Naming Layer

❌ **Jangan:**
```
Rectangle 42
Group 17
Frame 1023
Copy of Copy of Frame 56
```

✅ **Lakukan:**
```
Button/Primary
Button/Secondary
Card/Student/Default
Card/Stat/Hadir
Input/Text/Default
Sidebar/Menu Item/Active
Sidebar/Menu Item/Default
Header/Logo
Header/User Info
```

**Kontrak naming:**
- PascalCase untuk komponen: `Button`, `StatCard`, `FilterBar`
- `/` untuk variant/state: `Button/Primary`, `Button/Secondary`
- Nama harus bisa langsung dipetakan ke file React

### 6.2 Auto Layout Wajib

Setiap frame HARUS pake Auto Layout. Kenapa?

| Auto Layout | Tanpa Auto Layout |
|-------------|-------------------|
| Figma tau flex direction (row/column) | Tidak tau |
| padding, gap ke-export | Padding, gap hilang |
| Anak-anak teratur | Posisi absolute semua |
| Responsive kalau di-resize | Fix mati |

**Setting Auto Layout yang benar:**
```
Frame: Card
  ├── Auto Layout: Vertical (column)
  ├── Padding: 12px (atas, kanan, bawah, kiri)
  ├── Gap: 8px
  └── Children:
      ├── [Title] — text
      ├── [Divider] — line
      └── [Content] — text
```

### 6.3 Local Styles / Variables

Jangan pernah pake hex langsung di fill/text.

❌ **Salah:**
- Fill color: `#2E3391` (manual input)
- Font: Inter 14px Bold (manual input)

✅ **Benar:**
- Fill color: `Colors/Primary/Bay of Many`
- Font: `Typography/Button (Inter 13.3px Bold)`
- Effect: `Shadow/Card (4px 10px rgba(0,0,0,0.05))`

**Cara bikin:**
1. Pilih elemen
2. Di panel kanan, klik icon `⊕` di samping Fill / Text / Effect
3. Pilih "Create style"
4. Beri nama: `Colors/Primary/Bay of Many`

**Variabel vs Styles:**

| Fitur | Untuk | Enterprise? |
|-------|-------|-------------|
| **Styles** (Color, Text, Effect) | Tokens dasar, bisa dipake semua plan | ❌ Tidak |
| **Variables** | Tokens + mode (light/dark), lebih powerfull | ✅ Enterprise only |

**Rekomendasi:** Pakai **Local Styles** dulu (kita pakai Figma Professional/Org).

### 6.4 Component Hierarchy

Buat komponen di halaman **Components** terpisah.

```
Components/
├── Atoms/
│   ├── Button/
│   │   ├── Primary (variant)
│   │   └── Secondary (variant)
│   └── TextInput/
│       ├── Default (state)
│       ├── Error (state)
│       └── Disabled (state)
├── Molecules/
│   ├── StatCard/
│   │   └── Default
│   └── MenuItem/
│       ├── Active (state)
│       └── Default (state)
└── Organisms/
    ├── Sidebar/
    │   └── Default
    └── Header/
        └── Default
```

Setiap komponen di Figma → 1 file React (`Components/Button.tsx`).

### 6.5 Cover Note Format

Untuk setiap halaman yang diserahkan, Hanif wajib buat:

```markdown
## [Nama Halaman]

### Link Figma
[figma.com/file/KEY/file-name?node-id=xxx]

### Deskripsi
Apa fungsi halaman ini? Siapa usernya?

### Komponen yang Digunakan
- [x] Button (primary — untuk submit)
- [x] TextInput (default — username & password)
- [x] BrandLogo (light variant — untuk panel kiri)
- [ ] Sidebar (belum dipake)

### State yang Perlu Ditangani
- Loading → skeleton
- Error → toast "Gagal memuat data"
- Empty → ilustrasi + "Belum ada data"
- Success → data tampil

### Behavior Khusus
- Enter di input → trigger submit
- Validasi: username min 3 karakter
- Redirect ke dashboard setelah login berhasil

### Responsive Breakpoints (WAJIB DIISI)
- Desktop (≥1024px): layout dual panel, sidebar visible
- Tablet (640-1023px): sidebar collapse, bottom nav muncul
- Mobile (<640px): single column, full-width form, stacked

### Referensi
- Google Sign In page (pattern login dual panel)
- Halaman Dashboard Admin untuk stat cards
```

### 6.6 Yang Harus Dihindari

| ❌ Hindari | ✅ Ganti Dengan |
|-----------|----------------|
| Nama default Figma (Rectangle, Group, Frame) | Nama deskriptif (Button, Card, Input) |
| Manual position (seret-seret) | Auto Layout |
| Hex warna langsung | Color Style |
| Font manual | Text Style |
| Shadow manual | Effect Style |
| Layer bersarang >5 level | Maksimal 3-4 level, sisanya pecah |

---

## 7. Panduan Fathan: Menerima & Mengolah Desain

### 7.1 Checklist Saat Terima Desain

```
☐ 1. Baca cover note Hanif — pahami fungsi halaman
☐ 2. Cek Figma langsung — lihat layout, state, animasi
☐ 3. Ambil design tokens — jalankan Figma MCP
☐ 4. Generate komponen — jalankan Figma MCP
☐ 5. Generate halaman — jalankan Figma MCP
☐ 6. Fine-tune — tambah interaksi, responsive, Inertia
☐ 7. Responsive — implementasikan mobile-first (Tailwind breakpoints)
☐ 8. Tes — jalanin `bun run dev`, cek presisi + responsive
☐ 9. Minta review Hanif — kirim link hasil
```

### 7.2 Cara Baca File Figma

**Langsung di browser:**
1. Buka link Figma dari Hanif
2. Di panel kiri, lihat **Pages** (Desktop, Mobile, Components)
3. Klik halaman yang mau dikerjakan
4. Di panel kanan, lihat **Design** tab → properti elemen
5. Perhatikan: Auto Layout arah, padding, gap, fill, stroke, effect

**Shortcut penting:**
- `Option + Click` (Mac) / `Alt + Click` (Win) — select deep layer
- `Cmd/Ctrl + ]` atau `[` — naik/turun layer
- Di panel kanan, lihat **Auto Layout** section

### 7.3 Cara Extract Design Token (via Figma MCP)

Setelah setup Figma MCP, minta AI:

```
"Extract design tokens dari file Figma [KEY] 
 dengan format tailwind v4 @theme.
 Include: colors, typography, spacing, border-radius, shadows.
 Simpan ke resources/css/app.css"
```

### 7.4 Cara Generate Komponen

```
"Generate React + Tailwind component untuk [nama komponen] 
 dari Figma file [KEY], node [node-id].
 Komponen harus:
 - Menggunakan design tokens (@theme)
 - Support variant [active/default/error]
 - TypeScript interface untuk props
 - Export default"
```

### 7.5 Cara Generate Halaman

```
"Generate halaman [nama halaman] dari Figma file [KEY], node [node-id].
 - Layout pake [nama layout] dari Layouts/
 - Pecah komponen reusable ke Components/
 - Pakai design tokens dari @theme
 - TypeScript strict"
```

### 7.6 Yang Perlu Di-Fine-Tune Manual

| Bagian | AI Figma MCP | Manual Fathan |
|--------|:------------:|:-------------:|
| Struktur HTML (div, section, main) | ✅ 80% | ⚡ 20% |
| Warna, font, spacing | ✅ 95% | ⚡ 5% |
| Flexbox / layout | ✅ 80% | ⚡ 20% |
| State management (loading, error, empty) | ❌ | ✅ 100% |
| Event handler (onClick, onSubmit) | ❌ | ✅ 100% |
| Responsive breakpoints | ⚡ 30% | ✅ 70% |
| Animasi / transisi | ❌ | ✅ 100% |
| Integrasi Inertia routes | ❌ | ✅ 100% |
| Form validation | ❌ | ✅ 100% |
| Accessibility (aria, tabIndex) | ❌ | ✅ 100% |

### 7.7 Jika Ada Ketidaksesuaian

Jangan langsung ubah sendiri! Catat lalu tanya Hanif:

```
📝 Catatan Review untuk Hanif
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Halaman: Dashboard Admin
Tanggal: 2 Juli 2026

❌ Issue #1 — Padding StatCard
  Figma: 12px
  Code:  8px
  ✋ Tanya: Apakah padding-nya sengaja 12px?

❌ Issue #2 — Warna tombol MASUK
  Figma: #2E3391
  Code:  #1A237E (salah pake warna lama)
  ✋ Tanya: Confirm apakah pakai Bay of Many (primary)?

⚠️ Issue #3 — Font Size Tabel
  Figma: 13px
  Code:  font-size: 13px (sudah sesuai)
  ✅ OK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 8. Design Token & System

### 8.1 Apa Itu Design Token?

**Design token** adalah nilai-nilai desain terkecil yang distandarisasi: warna,
font, spacing, border-radius, shadow. Semua komponen React harus merujuk ke
token ini — BUKAN hardcode nilai langsung.

### 8.2 Token Kita (Hasil Ekstraksi dari Figma)

> **PENTING:** `app.css` real sudah menggunakan **semantic names** seperti `primary`, `accent`,
> `background` — BUKAN Figma names seperti `bay-of-many`, `candlelight`.  
> Contoh: `bg-primary` (bukan `bg-bay-of-many`), `text-accent` (bukan `text-candlelight`).

#### Warna

| Figma Name | Hex | Semantic Token | CSS Variable | Contoh Pakai |
|------------|-----|----------------|--------------|--------------|
| Bay of Many | `#2E3391` | `primary` | `--color-primary` | `bg-primary`, `text-primary` |
| Candlelight | `#FAE62A` | `accent` | `--color-accent` | `bg-accent`, `text-accent` |
| Flamingo | `#EF4444` | `danger` | `--color-danger` | `bg-danger`, `text-danger` |
| Mountain Meadow | `#10B981` | `success` | `--color-success` | `bg-success`, `text-success` |
| Amber | `#F59E0B` | `warning` | `--color-warning` | `bg-warning`, `text-warning` |
| Catskill White | `#F1F5F9` | `background` | `--color-background` | `bg-background` |
| Catskill White (var) | `#F8FAFC` | `muted` | `--color-muted` | `bg-muted` |
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

#### Typography

| Token | Font | Weight | Size | Line Height | Tailwind |
|-------|------|--------|------|-------------|----------|
| `text-heading-3` | Inter | 700 | 18.7px | 23px | `text-lg font-bold` |
| `text-strong` | Inter | 700 | 14px | 17px | `text-sm font-bold` |
| `text-button` | Inter | 700 | 13.3px | 16px | `text-xs font-bold` |
| `text-input` | Inter | 400 | 13.3px | 16px | `text-xs` |
| `text-data` | Inter | 700 | 13px | 16px | `text-xs font-bold` |
| `text-options` | Inter | 600 | 13px | 16px | `text-xs font-semibold` |
| `text-small` | Inter | 400 | 11px | 13px | `text-[11px]` |
| `text-tiny` | Inter | 400 | 9px | 11px | `text-[9px]` |
| `text-brand` | Urbanist | 700 | 18px | 22px | `text-lg font-bold font-brand` |
| `text-brand-mobile` | Inter | 700 | 11-12px | 13-15px | `text-xs font-bold` |

#### Spacing

| Name | Figma | Tailwind |
|------|-------|----------|
| `space-xs` | 4px | `gap-1` |
| `space-sm` | 8px | `gap-2` |
| `space-md` | 12px | `gap-3` |
| `space-lg` | 15px | `gap-4` |
| `space-xl` | 20px | `gap-5` |
| `space-2xl` | 25px | `gap-6` |
| `space-3xl` | 40px | `gap-10` |

#### Border Radius

| Name | Figma | Tailwind |
|------|-------|----------|
| `radius-input` | 6px | `rounded-md` |
| `radius-card` | 8px | `rounded-lg` |
| `radius-card-lg` | 10px | `rounded-xl` |
| `radius-card-xl` | 12px | `rounded-xl` |
| `radius-full` | 50% | `rounded-full` |
| `radius-badge` | 10px | `rounded-full` |
| `radius-button` | 4px | `rounded` |

#### Shadow

| Name | Figma | Tailwind |
|------|-------|----------|
| `shadow-card` | `0px 4px 10px rgba(0,0,0,0.05)` | `shadow-card` |
| `shadow-card-hover` | `0px 4px 10px rgba(0,0,0,0.02)` | `shadow-sm` |
| `shadow-modal` | `0px 20px 40px rgba(0,0,0,0.2)` | `shadow-modal` |
| `shadow-dropdown` | `0px 4px 12px rgba(0,0,0,0.02)` | `shadow-dropdown` |
| `shadow-mobile` | `0px 10px 30px rgba(0,0,0,0.1)` | `shadow-lg` |

#### Icon System: Font Awesome 5

Figma pakai Font Awesome 5 Free untuk semua icon. Implementasi di codebase:

| Lokasi | Approach | Contoh |
|--------|----------|--------|
| **Layouts, Sidebar, Navbar** | FA5 CDN via `<i className="fas fa-*" />` | `<i className="fas fa-home" />` |
| **Components** | `react-icons/fa` (tree-shaking) | `import { FaHome } from 'react-icons/fa'` |

**Tidak perlu** install `@fortawesome/react-fontawesome` — kita pakai CDN + `react-icons/fa`.
CDN sudah di-load di `resources/views/app.blade.php` (sebelum `@vite`).

### 8.3 Cara Registrasi di app.css

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
  --color-success-light: #DCFCE7;
  --color-danger-light: #FECACA;
  --color-warning-light: #FDE68A;

  /* ── Fonts ── */
  --font-sans: 'Inter', sans-serif;
  --font-brand: 'Urbanist', sans-serif;

  /* ── Shadows ── */
  --shadow-card: 0px 4px 10px rgba(0, 0, 0, 0.05);
  --shadow-modal: 0px 20px 40px rgba(0, 0, 0, 0.2);
  --shadow-dropdown: 0px 4px 12px rgba(0, 0, 0, 0.02);
}
```

### 8.4 Siapa yang Ngatur Design Token?

| Peran | Tanggung Jawab |
|-------|---------------|
| **Hanif** | Membuat & maintain token di Figma (Local Styles) |
| **Fathan** | Menjaga konsistensi token di kode (`app.css`) |
| **Sandiko** | Review & approve perubahan token |

**Aturan:**
- Token hanya berubah jika Hanif ubah di Figma
- Fathan tidak boleh menambah token tanpa koordinasi Hanif
- Kalau butuh warna baru → Hanif buat Style di Figma → Fathan update `app.css`

---

## 9. Glossary

| Istilah | Arti |
|---------|------|
| **Figma** | Tool desain UI/UX berbasis cloud |
| **Figma File Key** | ID unik file Figma (ada di URL) |
| **Figma Personal Access Token** | Token API untuk akses Figma secara programatis |
| **Figma MCP** | Server yang menghubungkan AI ke Figma API |
| **Copy as CSS** | Fitur Figma untuk copy CSS mentah dari elemen |
| **Auto Layout** | Fitur Figma untuk layout otomatis (flexbox) |
| **Local Styles** | Style tersimpan (warna, text, effect) yang bisa dipakai ulang |
| **Variables** | Fitur Figma Enterprise untuk tokens + mode |
| **Design Token** | Nilai desain standar (warna, font, spacing) |
| **Component** | Elemen UI reusable (Button, Input, Card) |
| **Variant** | Variasi dari komponen (Primary, Secondary) |
| **State** | Kondisi komponen (Default, Hover, Active, Disabled, Error) |
| **Node ID** | ID unik setiap elemen di Figma |
| **Layer** | Istilah Figma untuk elemen di canvas |
| **Frame** | Container di Figma (mirip div) |
| **OpenCode** | AI coding agent yang kita pakai |
| **MCP** | Model Context Protocol — standar komunikasi AI ↔ tools |
| **Tailwind CSS** | Framework CSS utility-first |
| **InertiaJS** | Bridge Laravel + React (tanpa API) |
| **Sanctum** | Laravel authentication untuk SPA |
| **@theme** | Fitur Tailwind v4 untuk define design tokens |
| **Bun** | Package manager & runtime JavaScript |
| **Vite** | Build tool untuk frontend |
| **Bottleneck** | Titik tersendat dalam alur kerja tim |
| **Mobile-first** | Strategi desain: mulai dari viewport terkecil, lalu scale up |
| **Breakpoint** | Titik dimana layout berubah (sm: 640px, lg: 1024px) |
| **FA5 CDN** | Font Awesome 5 via Content Delivery Network |

---

## 10. Referensi & Link

### Figma MCP Servers

| Server | Link |
|--------|------|
| figma-bridge-mcp ⭐ | `github.com/Panxoat/figma-bridge-mcp` |
| pixel-figma-mcp ⭐ | `github.com/Rylaa/pixelbyte-figma-mcp` |
| figma-context-mcp (glips) | `github.com/glips/figma-context-mcp` |
| figma-console-mcp | `github.com/southleft/figma-console-mcp` |
| Official Figma MCP | `github.com/figma/mcp-server-guide` |
| figma-design-context | `github.com/boboluo832-dev/figma-design-context` |

### Dokumentasi

| Topik | Link |
|-------|------|
| Figma API Documentation | `www.figma.com/developers/api` |
| Figma Personal Access Token | `www.figma.com/settings` → Account → Personal Access Tokens |
| Model Context Protocol | `modelcontextprotocol.io` |
| Tailwind CSS v4 `@theme` | `tailwindcss.com/docs/theme` |
| InertiaJS + React | `inertiajs.com` |
| Laravel Sanctum | `laravel.com/docs/sanctum` |

### Tools

| Tool | Fungsi |
|------|--------|
| `bun run dev` | Jalanin Vite dev server (hot reload) |
| `composer run dev` | Jalanin Laravel + Vite + Queue + Log |
| `npx figma-bridge-mcp` | Jalanin MCP server figma-bridge |
| `npx pixel-figma-mcp` | Jalanin MCP server pixel-figma |

---

## 🔮 Future: Pemisahan Frontend dari Backend

### Target Arsitektur

```
smauii-core (Laravel) → REST API + Sanctum
smauii-web (Next.js) → Frontend web
smauii-mobile (Flutter/RN) → Mobile app
```

### Yang Perlu Disiapkan Hanif (Figma)

1. **Desain dengan component-based thinking** — komponen Figma = komponen React
2. **Dokumentasi states** untuk setiap komponen (loading, empty, error, success)
3. **Spesifikasi responsive breakpoints** untuk setiap halaman
4. **Gunakan Auto Layout** — Figma flexbox = Tailwind flexbox
5. **Export asset SVG** untuk icon — persiapan Flutter/RN yang tidak support FA5

### Yang Perlu Disiapkan Fathan (Frontend)

1. **Pisahkan business logic dari presentation components**
   - Buat custom hooks untuk data fetching (mudah diganti dari Inertia ke axios)
2. **Jangan import `@inertiajs/react` di Components** — hanya di Pages/Layouts
3. **Export types ke file terpisah** (`types/*.ts`) — siap dipindah ke package `@smauii/types`
4. **Gunakan FA5 via CDN** — konsisten dan mudah dipisah ke standalone React nanti

---

## Lampiran

### A. Template Cover Note untuk Hanif

Copy template ini setiap kali mau share desain ke Fathan:

```markdown
## [Nama Halaman]

### Link Figma
[figma.com/file/KEY?node-id=xxx]

### Role User
[admin / siswa / wali-murid / guru]

### Fungsi Halaman
[satu paragraf]

### Komponen
- [nama komponen] — [keterangan]

### State
- Loading:
- Empty:
- Error:
- Success:

### Behavior
-

### Responsive (WAJIB DIISI)
- Desktop (≥1024px):
- Tablet (640-1023px):
- Mobile (<640px):

### Referensi
-
```

### B. Template Review untuk Hanif

```markdown
## Review: [Nama Halaman]

✅ [komponen] — OK
⚠️ [komponen] — [issue]
❌ [komponen] — [issue]
```

### C. Template Issue Tracker (shared Google Sheets)

| No | Halaman | Komponen | Issue | Severity | Status |
|----|---------|----------|-------|----------|--------|
| 1 | Dashboard | StatCard | Padding 4px kurang | Low | Fixed |
| 2 | Login | Button | Warna beda | High | Pending |

---

> **Prinsip Tim:**
> _Hanif bikin desain yang siap konversi, bukan cuma cantik dilihat._
> _Fathan ngoding dengan presisi, bukan asal jadi._
> _Komunikasi lewat dokumen, bukan lisan — biar tidak ada yang lupa._
> _Kalau ragu, tanya. Kalau mentok 30 menit, angkat tangan._
