# Audit Konsistensi UI/UX — Baseline Temuan
**SMART Absen — SMA UII Yogyakarta**  
*Dokumentasi lengkap hasil audit konsistensi UI/UX `resources/js/` — digunakan sebagai baseline perbandingan setelah perbaikan manual.*

> **PENTING (Cara pakai dokumen ini):**
> Setiap temuan ditulis sedetail mungkin — lokasi file:baris, penampakan saat ini (sebelum perbaikan), gap terhadap konvensi, dan dampak. Setelah Anda melakukan perbaikan manual, dokumen ini dipakai untuk **verifikasi akurasi**: apakah pemahaman saya tentang maksud Anda sesuai kenyataan, dan apakah temuan masih relevan/akurat. Jangan ubah isi dokumen ini selama proses perbaikan kecuali menandai status pada bagian akhir.

---

## 0. Ringkasan Eksekutif

| No | Kategori | Severity | Jumlah Lokasi | Ringkasan |
| :- | :--- | :--- | :-: | :--- |
| T-01 | Duplikasi komponen select | Tinggi | 2 komponen, 6 halaman pemakai | `SelectInput` (custom combobox, 232 baris) vs `NativeSelect` (native, 25 baris) — dua "kanon" untuk fungsi sama. |
| T-02 | Warna token `StatusDot` vs `StatusBadge` | Tinggi | Semua variant, 1 pemakai dot | Dot pakai solid (`bg-success`, `bg-info`), badge pakai light+bg; `permission` & `sick` di dot menggunakan `bg-info`/`bg-primary` ≠ badge. |
| T-03 | Badge status "DIY" (inline span) | Sedang | ~12 lokasi, 6+ halaman | Badge 11px ad-hoc dengan variasi token manual (bg-accent-light, bg-primary/10, uppercase tracking) padahal `StatusBadge`/`Badge` tersedia. |
| T-04 | Tombol aksi tabel "DIY" | Sedang | ~8 lokasi, 4 file MasterData | Tombol edit/hapus inline `text-[12px]` manual padahal `ActionButton` tersedia. |
| T-05 | `ConfirmDialog` — tombol Batal tidak via `Button` | Rendah | 1 komponen (semua pemakai) | Cancel adalah `<button>` mentah, Confirm via `<Button>`; dua bahan styling beda. |
| T-06 | `Teacher/Reports/Index.tsx` anak tiri | Sedang | 1 halaman | Header 22px inline (`text-[22px]`), select native, export DIY; tidak pakai `PageHeader`, `ExportButtonGroup`, `NativeSelect`. |
| T-07 | Header halaman inkonsisten | Rendah | ~6 halaman | Mayoritas 26 halaman pakai `PageHeader` (20/24px); beberapa memakai h2/h1 custom (15/16/17/13/14.5/22px). |
| T-08 | Font-size fraksional menyebar | Rendah | 148 baris | `text-[10.5px]`, `11.5px`, `12.5px`, `13.5px`, `14.5px` dll — tidak ada scale token tipografi. |
| T-09 | Banyaknya varian komponen filter | Sedang | 4 komponen + 15 halaman | `FilterBar`, `FilterDropdown`, `FilterPopover`, `MobileFilterSelectBar` — pola pemakaian campur aduk antar halaman. |
| T-10 | Export UI terbagi dua pola | Sedang | 4 halaman | `ExportButtonGroup` (modal pemilihan format) di Reports/Daily-Monthly-Semester; `Teacher/Reports` bikin sendiri. |
| T-11 | Badge kategori role/kelas manual | Sedang | 5+ lokasi | `TeachersTab`, `GuardianAssignment`, `ProfileHeroCard` pakai badge 11px manual untuk role/kelas — token campur. |
| T-12 | `StatusBadge` tidak menangani kategori izin lanjutan | Rendah | 1 komponen + pemakai | Token `permit`/`achievement`/`medical` (izin acara/kompetisi/sakit) tidak dipakai di `StatusBadge`; di `RecapTable` dipakai `text-medical` manual. |

**Total area terdokumentasi: 12 kategori, ±34 lokasi spesifik + 148 baris font fraksional.**

---

## 1. Metodologi & Ruang Lingkup

- **Ruang lingkup:** seluruh `resources/js/` — komponen & halaman React/TS.
- **Metode:** eksplorasi otomatis (inventaris komponen + audit cross-page), diverifikasi manual baca file per lokasi, dijalankan 2 agen parallel.
- **Snapshot diambil:** sebelum perbaikan manual apa pun (baseline).
- **Gate yang dipakai untuk validasi kode (dari konvensi proyek):**
  - `bun run typecheck` · `bun run lint` · `npm test -- --run` (vitest) · `./vendor/bin/sail test` (PHPUnit) · `bun run build`.
- **Komponen kanonik yang menjadi acuan "selayaknya"** diambil dari `resources/js/Components/ui/*`, `common/*`, `features/*`.

---

## 2. Inventaris Komponen (Referensi Kanonik)

Barel index `resources/js/Components/index.ts` mengekspor 50+ komponen. Berikut jejaknya (digunakan sebagai acuan "apa yang seharusnya dipakai"):

### 2.1 UI Primitives / Form (`Components/ui/`)
| Komponen | Ukuran | Peran |
| :--- | :-: | :--- |
| `Button.tsx` | 78 baris | Variants: primary/secondary/accent/outline/danger/danger-outline/success/ghost; size sm/md/lg. **Acuan semua tombol.** |
| `ActionButton.tsx` | 42 baris | Aksi kecil di tabel: detail/edit/delete/import/add; icon-only opsional. |
| `Input.tsx` / `Checkbox.tsx` / `Radio.tsx` / `Toggle.tsx` / `FormError.tsx` / `Label.tsx` | — | Form control standar |
| `NativeSelect.tsx` | 25 baris | `select` native `h-10 rounded-xl text-[13px]`, arrow custom; ringan & aksesibel. |
| `SelectInput.tsx` | 232 baris | Custom combobox: searchable (otomatis jika >7 opsi), keyboard nav, clearable, label, error, description. |
| `StatusBadge.tsx` | 118 baris | Badge status semantik penuh (12 variant + `resolveStatusVariant`), `px-2.5 py-0.5 text-[12px] font-semibold` + bg light/bg + text warna. |
| `StatusDot.tsx` | 49 baris | Dot warna bulat (xs–lg, pulse), **color map sendiri terpisah dari badge**. |
| `Badge.tsx` | 21 baris | **Count badge** (x99+), variant danger/default. Beda fungsi dari StatusBadge. |
| `PageHeader.tsx` | 41 baris | Judul halaman `text-[20px] sm:text-[24px] font-bold` + description `13/14px`, children di kanan. |
| `SectionHeader.tsx` / `Card.tsx` / `StatCard.tsx` / `MetricPill.tsx` / `Skeleton.tsx` / `TruncatedText.tsx` / `Table.tsx` / `Pagination.tsx` | — | Blok penyusun halaman |
| `TableFooter.tsx` / `MobileNativePagination.tsx` | — | Footer tabel + pagination mobile-native |
| `DashboardHero.tsx`, `LiveBadge.tsx`, `LeaveRequestCard.tsx` (539 baris) | — | Elemen khusus dashboard/live/izin |

### 2.2 Common (`Components/common/`)
`Modal`, `BottomSheet`, `Drawer`, `DrawerHeaderActions`, `ConfirmDialog`, `EmptyState`, `FilterBar`, `FilterDropdown`, `FilterPopover`, `MobileFilterSelectBar`, `MobileSectionHeader`, `MobileSelectionBar`, `LoadingSpinner`, `Toast`, `DatePicker`, `PhotoPeekButton`, `PhotoPeekModal`, `PreviewImageModal`, `ErrorAlert`, `ErrorBoundary`, `TabSwitcher`.

### 2.3 Features (`Components/features/`)
`AttendanceCalendar`, `AttendanceChart`, `DashboardStats`, `ExportButtonGroup`, `ImportModal`, `LoginCard`, `MasterDataCard`, `MasterDataEmptyState`, `StudentCard`.

---

## 3. Temuan Detail

---

### T-01 — Duplikasi Komponen Select: `SelectInput` vs `NativeSelect`

**Lokasi (komponen):**
- `resources/js/Components/ui/SelectInput.tsx` (232 baris — custom combobox)
- `resources/js/Components/ui/NativeSelect.tsx` (25 baris — native)

**Persamaan visual:** keduanya `h-10 w-full rounded-xl text-[13px] font-medium font-inter bg-surface border-border focus:ring-2 ring-primary/20`.

**Perbedaan perilaku:**
| Aspek | `SelectInput` | `NativeSelect` |
| :--- | :--- | :--- |
| Rendering | `div[role=combobox]` custom | `<select>` native |
| Search | Otomatis aktif bila `options.length > 7` | Tidak ada |
| Keyboard | Arrow/Enter/Escape | Native browser |
| label/error/description | Ya | Tidak |
| clearable | Ya | Tidak |
| Aksesibilitas tingkat lanjut | `aria-*` combobox manual | Native, lebih sederhana |

**Pemakai `NativeSelect` (4 halaman):**
1. `Pages/Admin/SystemSettings.tsx:26`
2. `Pages/Admin/Dashboard.tsx:34`
3. `Pages/Admin/Sections/AgentIntegrationSection.tsx:16`
4. `Pages/Guardian/Forms/LeaveForm.tsx:4`

**Pemakai `SelectInput` (2 halaman + 2 form):**
1. `Pages/Admin/MasterData/Forms/StudentForm.tsx:4`
2. `Pages/Admin/MasterData/Forms/ClassForm.tsx:4`
3. `Pages/Teacher/LeaveVerification/LeaveVerificationFilterModal.tsx:1`

**Gap:** Dua "kanon" untuk kebutuhan yang sama. Halaman pemakai campur (bedakan mis. `SystemSettings` memakai native sedang `MasterData` memakai combobox). Perlu keputusan **satu kanon** atau minimal satu `FilterSelect` shared untuk toolbar filter (pola filter 13px `h-10 rounded-xl` juga direplikasi inline di banyak toolbar, lihat T-07 dan T-09).

---

### T-02 — Warna Token `StatusDot` vs `StatusBadge` Tidak Selaras

**Lokasi:** `Components/ui/StatusDot.tsx:12-27` vs `Components/ui/StatusBadge.tsx:20-87`.

**Perbandingan per variant:**

| Variant | `StatusBadge` (bg / text) | `StatusDot` (bg) | Selaras? |
| :--- | :--- | :--- | :-: |
| `present` | `bg-success-light` / `text-success` | `bg-success` (solid) | ⚠️ beda gaya |
| `late` | `bg-warning-bg` / `text-warning` | `bg-warning` (solid) | ⚠️ beda gaya |
| `absent` | `bg-danger-bg` / `text-danger` | `bg-danger` (solid) | ⚠️ beda gaya |
| `sick` | `bg-primary-light` / `text-primary` | `bg-primary` (solid) | ⚠️ beda gaya |
| `permission` | `bg-primary-light` / `text-primary` | **`bg-info`** (biru langit) | ❌ **beda hue** |
| `active` | `bg-success-light` / `text-success` | `bg-success` | ⚠️ beda gaya |
| `inactive` | `bg-danger-bg` / `text-danger` | `bg-danger` | ⚠️ beda gaya |
| `pending` | `bg-warning-bg` / `text-warning` | `bg-warning` | ⚠️ beda gaya |
| `approved` | `bg-success-light` / `text-success` | `bg-success` | ⚠️ beda gaya |
| `rejected` | `bg-danger-bg` / `text-danger` | `bg-danger` | ⚠️ beda gaya |
| `no_update` / `no_check_in` / `not_open` / `unknown` | `bg-transparent` / `bg-background+border` | `bg-text-muted` | ⚠️ beda |

**Masalah paling krusial:** `permission` (izin) berwarna **biru (`bg-info` #0EA5E9)** di dot, tetapi **indigo (`bg-primary-light` #E0E7FF → text-primary`)** di badge. Artinya: di kalender/ring (dot) "izin" tampak biru, tapi di tabel/ringkasan "izin" tampak indigo. Inkonsistensi makna warna antar elemen.

Juga, `sick` di badge memakai family `primary` (indigo), sedangkan `permission` di badge juga `primary` — **dua status berbeda (sakit vs izin) kebetulan berwarna sama** di badge. Di dot, `sick`=primary tapi `permission`=info → perbedaan yang membuat sakit/izin tampak berbeda di dot namun identik di badge.

**Pemakai `StatusDot` (hanya 1 produk):**
- `Components/features/AttendanceCalendar.tsx:2,155,157,172,176,180,184`
- (lainnya: unit test `__tests__/statusDot.test.tsx`)

**Dampak:** Kalender presensi (AttendanceCalendar, dipakai di Settings/AttendanceHistory/Guardian) menampilkan dot: `present`=hijau solid, `late`=kuning solid, `sick`=indigo solid, `absent`=merah solid. Di halaman yang sama bila ada badge status (mis. riwayat) warna tidak berbagi sumber resolusi yang sama.

---

### T-03 — Badge Status "DIY" (Inline Span) Menggantikan `StatusBadge`/`Badge`

Pola umum yang ditemukan (ad-hoc, tanpa komponen):
```
<span class="px-2.5 py-0.5 rounded-full text-[11px] font-semibold ...">...</span>
```
Struktur mirip `StatusBadge` (`px-2.5 py-0.5 rounded-full`) tetapi ukuran font **11px** (badge kanonik 12px), font-weight & token warna manual, kadang `uppercase tracking-wide`.

**Lokasi terverifikasi:**
1. `Pages/Admin/MasterData/TeachersTab.tsx:84` — `bg-primary-light text-primary border-primary/20` "Guru Piket"
2. `Pages/Admin/MasterData/TeachersTab.tsx:87` — `bg-accent-light text-text-primary border-accent/30` "Wali Kelas"
3. `Pages/Admin/MasterData/TeachersTab.tsx:95` — sama, "Wali Kelas"
4. `Pages/Admin/MasterData/TeachersTab.tsx:101` — sama, "Guru Piket"
5. `Pages/Admin/MasterData/TeachersTab.tsx:337` — `text-[10px] font-bold bg-primary/10` (jenis lain)
6. `Pages/Admin/MasterData/TeachersTab.tsx:342` — `bg-amber-500/...` (subject warna literal Tailwind)
7. `Pages/Admin/MasterData/ClassesTab.tsx:148` — `bg-warning-light text-text-primary border-warning/30` "Kelas" 
8. `Pages/Admin/SystemSettings.tsx:505` — `text-[11px] bg-primary/10 border-primary/20` label status
9. `Pages/Admin/LeaveVerification.tsx:377,381,385` — badge besar status verifikasi: `text-[11px] font-bold uppercase tracking-wide px-3 py-1`, warna `bg-warning-bg/warning`, `bg-success-bg/success`, `bg-danger-bg/danger`
10. `Pages/Profile/components/ProfileHeroCard.tsx:32,83` — `text-[11px] font-bold bg-primary/10` dan `font-medium bg-muted` (role)
11. `Pages/Guardian/LeaveApplication.tsx:519` — `text-[11.5px] font-semibold bg-primary/10` label kategori izin
12. `Pages/Admin/GuardianAssignment.tsx:422` — `text-[11px] bg-primary/10 text-primary` (badge jumlah terhubung)

**Gap vs konvensi:**
- `StatusBadge` = satu-satunya cara kanonik untuk status; ia juga punya `label` prop agar label bisa diganti (mis. "MENUNGGU" → label="Menunggu" tanpa perlu uppercase manual).
- `Badge` = count badge (99+). Untuk kategori non-status (role guru, subject, kelas) **tidak ada** komponen "ToneBadge"/"Tag" kanonik → semua orang membuat span sendiri dengan token sendiri (campur `accent`, `warning`, `amber-500`, `primary/10`).
- Konsekuensi visual: di `<480px`–`sm`, badge 11px vs status 12px tak begitu beda, tetapi **spektrum warna konsisten horizontal patah**: role "Wali Kelas" memakai `accent-light` (kuning pudar) sedangkan di tempat lain role memakai `primary/10`.

**Non-konformitas khusus di `LeaveVerification`:** badge itu `uppercase tracking-wide` dan ukuran `px-3 py-1` — bukannya salah, tapi jelas pola berbeda dari StatusBadge di halaman yang sama? (halaman Admin LeaveRequests memakai `StatusBadge` → dua pola dalam satu portal admin).

---

### T-04 — Tombol Aksi Tabel "DIY" Menggantikan `ActionButton`

**Komponen kanonik yang tersedia:** `ActionButton.tsx` — `variant="detail|edit|delete|import|add"`, ukuran `px-2.5 py-1.5 text-[12px]` (berlabel) / `w-8 h-8 text-[13px]` (icon-only).

**Lokasi "DIY" di MasterData (pattern sama di 4 tab):**
```
className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border transition-colors cursor-pointer text-[12px] font-semibold"
```
dan
```
className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 transition-colors cursor-pointer text-[12px] font-semibold"
```
1. `Pages/Admin/MasterData/StudentsTab.tsx:193` (edit) dan `:203` (hapus)
2. `Pages/Admin/MasterData/TeachersTab.tsx:188` (edit) dan `:198` (hapus)
3. `Pages/Admin/MasterData/ClassesTab.tsx:188` (edit) dan `:198` (hapus)
4. `Pages/Admin/MasterData/GuardiansTab.tsx:161` (edit) dan `:171` (hapus)

**Pemakai `ActionButton` yang benar:** `Pages/Admin/AttendanceCorrection.tsx:208,215,346,353` (undo/delete).

**Gap:** Di MasterData, tombol edit/hapus digarap manual dengan `border border-border rounded-md text-[12px] px-2 py-1`; di AttendanceCorrection memakai `ActionButton` (`rounded-md` juga, variant `edit`=`bg-amber-50 text-amber-600`, `delete`=`bg-danger-bg text-danger`). Dua tampilan berbeda untuk fungsi sama (edit=kuning, hapus=merah muda) — tabel data master dan kolom status tidak persis sama dengan tabel koreksi absensi.

---

### T-05 — `ConfirmDialog`: Tombol Batal Bukan `Button` (Dua "Bahan" Styling)

**Lokasi:** `resources/js/Components/common/ConfirmDialog.tsx`:
- Baris 87–96: tombol **Batal** → `<button>` mentah:
  ```
  flex-1 h-10 px-4 rounded-xl text-[13px] font-bold text-text-secondary bg-surface hover:bg-muted/60 border border-border transition-all active:scale-95 ... shadow-2xs
  ```
- Baris 97–106: tombol **Konfirmasi** → `<Button variant={config.buttonVariant} className="flex-1 h-10 ... ">`.

**Gap:** Dua tombol sejajar dengan bahan berbeda — cancel pakai `active:scale-95` (efek "pers") + `shadow-2xs` + `font-bold`; confirm pakai animasi `Button` (`active:scale-[0.98]`) + `font-extrabold` + `shadow-xs`. Secara fungsional hampir seragam, tapi jika `Button.tsx` diubah (mis. radius / shadow / hover), **cancel tidak ikut berubah** karena bukan instance `Button`. Risiko drift.

**Pemakai ConfirmDialog:** Admin (LeaveVerification, GuardianAssignment, HolidaySettings, ClassEnrolment, AttendanceCorrection, MasterData, Notifications, Profile, Dashboard) — semua terpengaruh lewat 1 komponen.

---

### T-06 — `Teacher/Reports/Index.tsx` = Halaman "Anak Tiri"

**Lokasi:** `resources/js/Pages/Teacher/Reports/Index.tsx` (482 baris). Halaman laporan wali kelas (`/reports`).

**Bukti ketidakkonkonsistenan:**

| Aspek | Kondisi di halaman ini | Konvensi lain (Reports/admin) |
| :--- | :--- | :--- |
| Header halaman | `Index.tsx:205-212` — `<h1 className="text-[22px] font-bold ...">` desktop, `<h1 className="sm:hidden text-[20px]">` mobile | `PageHeader` = `text-[20px] sm:text-[24px]` + desc `13/14px` (26 halaman) — lihat T-07 |
| Select bulan | `Index.tsx:225-234` — `<select className="border border-border rounded-lg px-3 py-1.5 text-[13px] ...">` | `NativeSelect` (`rounded-xl h-10 pr-8`) atau `FilterBar.Select` |
| Export | `Index.tsx:187-197` — tombol `w-8 h-8 rounded-full ... FiDownload` untuk mobile + state `exportSheetOpen`; header menu tidak ada di desktop | `ExportButtonGroup` (modal format Excel/PDF/Print) dipakai Reports/Daily, Monthly, Semester |
| Toolbar sticky | `Index.tsx:216` — `sticky top-0 z-20 pt-1 bg-background border-b` | Container/pattern toolbar halaman lain |
| `MONTH_NAMES` & tab | Pakai `TabSwitcher` + `DatePicker` (bagian ini ok) | — |

**Catatan:** `ExportButtonGroup` dipakai di `Pages/Reports/Daily.tsx:222`, `Pages/Reports/Monthly.tsx:110,188`, `Pages/Reports/Semester.tsx:120,205` — tapi **tidak** di `Teacher/Reports`. Kedua "Reports" (admin `/reports/daily` dst dan wali kelas `/reports`) tidak berbagi komponen export maupun header.

**Header export desktop:** di `Teacher/Reports`, tombol export hanya muncul di mobile (`sm:hidden`), sedangkan di Reports admin tombol `ExportButtonGroup` tampil desktop. **Inkonsistensi visibilitas aksi export.**

---

### T-07 — Header Halaman Inkonsisten (26 vs beberapa outlier)

**Kanonik:** `PageHeader.tsx` → `text-[20px] sm:text-[24px] font-bold` + `description text-[13px] sm:text-[14px]`. Dipakai di **26 halaman** (grep `PageHeader` di `Pages/`):

`Teacher/DutyDashboard`, `Teacher/HomeroomDashboard`, `Teacher/LeaveVerification/LeaveVerificationHeader`, `Guardian/{Dashboard,History,LeaveApplication}`, `Reports/{Export,Semester,Daily,Monthly}`, `Profile`, `Notifications`, `Student/{Dashboard,LiveAttendance,AttendanceHistory}`, `Admin/{Dashboard,MasterData,AttendanceCorrection,ClassEnrolment,Monitoring,HolidaySettings,GuardianAssignment,LeaveRequests,SystemSettings,Overview,LeaveVerification}`.

**Outlier (header dibuat manual):**
1. `Teacher/Reports/Index.tsx:205,212` — `text-[22px]` desktop / `text-[20px]` mobile (lihat T-06). **Satu-satunya halaman yang tidak import PageHeader sama sekali.**
2. `Admin/GuardianAssignment.tsx:419,427` — `<h2 className="text-[15px] sm:text-[16px] font-bold text-primary ...">` (sub-header panel, bukan page header; kemungkinan sengaja).
3. `Profile/components/ProfileHeroCard.tsx:74` — `<h2 className="text-[17px] font-bold ...">` (header hero profil; konteks khusus, wajar).
4. `Admin/MasterData.tsx:416` — tombol di header hero `bg-white/15` (bukan header text).
5. `Student/LiveAttendance.tsx:489,576` — `<h2 className="text-[13px] font-bold ...">` (label kota, bukan header halaman).

**Kesimpulan:** halaman-bertingkat header hampir seragam. Outlier benar-benar hanya `Teacher/Reports/Index.tsx`. Sisanya sub-header panel (wajar), hero profil, dan label posisi. **Jangan ubah sub-header/hero — hanya halaman utama.**

---

### T-08 — Font-Size Fraksional Menyebar (148 baris)

**Jejak:** `grep "text-[1x.y px]"` di `Components/` + `Pages/` menghasilkan **148 baris** menggunakan size pecahan:

| Size | Contoh pemakaian |
| :--- | :--- |
| `text-[9.5px]` | `Layouts/ErrorLayout.tsx:211` (badge error) |
| `text-[10.5px]` | `Components/ui/StatCard.tsx:77` (persentase), `common/TabSwitcher.tsx:51` (badge tab) |
| `text-[11.5px]` | `TabSwitcher.tsx:53,188,194`, `DrawerHeaderActions.tsx:122,196,229`, `MobileFilterSelectBar.tsx:88`, `MobileNativePagination.tsx:32,55`, `MobileSelectionBar.tsx:72`, `Guardian/{History,LeaveApplication}.tsx`, `Reports/Export.tsx` (16+ baris), `Profile.tsx` |
| `text-[12.5px]` | `Drawer.tsx:114,127`, `MasterDataCard.tsx:96`, `Guardian/LeaveApplication.tsx` (konsisten banyak), `Reports/Export.tsx` (konsisten), `Teacher/DutyDashboard.tsx:376` |
| `text-[13.5px]` | `Guardian/History.tsx:318`, `Guardian/LeaveApplication.tsx:360`, `Reports/Export.tsx:284`, `Layouts/ErrorLayout.tsx:216` |
| `text-[14.5px]` | `Guardian/LeaveApplication.tsx:284,516`, `Reports/Export.tsx:812,835`, `Profile.tsx:531` |

**Analisis:** 
- **Sebagian konsistensi lokal baik:** `Guardian/*` dan `Reports/Export.tsx` memakai gauge konsisten `11.5/12.5/13.5/14.5px` di seluruh lightweight UI-nya — kemungkinan **sengaja** (memadatkan teks di mobile).
- **Masalah sebenarnya:** tidak ada **tipe scale token** (mis. `text-xs`→`text-body2`) di `app.css`; semua hardcode. Akibatnya halaman memakai "numeral-arbitrary", dan jika suatu saat perlu scale-up global, tidak ada satu sumber.
- `StatCard.tsx:77` (10.5px untuk persentase) adalah kasus umum komponen aliasnya.

**Rekomendasi minimum untuk konsistensi:** seragamkan **keluarga 11.5→12/11, 12.5→13, 13.5→14, 14.5→15** ATAU definisikan token `--text-*` agar drift berhenti. (Ini area paling banyak tapi sebagian sengaja.)

---

### T-09 — Empat Komponen Filter / Pencarian (Pola Campur)

**Komponen yang tersedia:** `FilterBar` (compound: `.Select/.Date/.Search/.Pill`), `FilterDropdown`, `FilterPopover`, `MobileFilterSelectBar`.

**Klasifikasi pemakai di `Pages/`:**

| Komponen | Halaman | Pola |
| :--- | :--- | :--- |
| `FilterBar` (compound) | `Teacher/DutyDashboard.tsx:293` | Toolbar filter tersusun (Select+Date+Search) di card |
| `FilterPopover` | `Admin/Dashboard.tsx:209`, `Admin/MasterData.tsx:627`, `Admin/ClassEnrolment.tsx:705`, `Guardian/History.tsx:447`, `Guardian/LeaveApplication.tsx:341`, `Reports/Export.tsx:266`, `Student/AttendanceHistory.tsx:346` | Popover trigger tombol (accent) |
| `MobileFilterSelectBar` | `Admin/ClassEnrolment.tsx:532,898` | Bar select mobile |
| `FilterDropdown` | (tidak ditemukan pemakaian aktif di Pages → kemungkinan orphan serupa NativeSelect) | — |

**Gap lintas halaman yang nyata:**
1. **Pemicu popover tidak seragam ukuran.** `MasterData` dan `Guardian/LeaveApplication` trigger popover bertema **accent/kuning** (`bg-accent text-primary font-bold`); `Admin/Dashboard` & `Student/AttendanceHistory` trigger pakai **Button outline/ghost** yang berbeda. Dua "wajah" tombol Filter.
2. **Modal filter vs popover:** `LeaveVerificationFilterModal.tsx` (@Teacher) memakai **Modal**, bukan FilterPopover — pola ketiga. (Admin LeaveVerification memakai TabSwitcher untuk status, filter dimodal.)
3. **Toolbar filter inline tanpa komponen di banyak halaman laporan** — lihat T-06 (`Teacher/Reports/Index.tsx:216-234`), dan `Reports/Daily–Semester` memakai blok row sendiri.

**Dampak:** tombol "Filter" berwarna kuning di satu halaman, netral di halaman lain, modal di halaman ketiga — user tidak mendapat pola mental konsisten tentang "di mana dan seperti apa kontrol filter".

---

### T-10 — Export UI Terbagi Dua Pola

- **Kanonik:** `ExportButtonGroup` (`features/ExportButtonGroup.tsx`) — tombol `primary` "Unduh Laporan" (FiDownload) → **Modal** memilih Microsoft Excel / PDF / Cetak, masing-masing dengan card format berwarna.
- **Pemakai kanonik:** `Reports/Daily.tsx:222`, `Reports/Monthly.tsx:110,188`, `Reports/Semester.tsx:120,205`.
- **Pemakai "DIY":** `Teacher/Reports/Index.tsx` — lihat T-06. Tidak memakai ExportButtonGroup; hanya tombol download `sm:hidden`.

**Gap:** dua halaman "laporan" sejenis (daily/monthly/semester) yang sama-sama mengekspor file memiliki UI export berbeda & aksesibilitas berbeda.

---

### T-11 — Badge Role / Kategori Manual (Bukan "Tag" Kanonik)

Selain status (T-03), kategori non-status juga dibuat manual berulang:

| Lokasi | Konten | Token warna |
| :--- | :--- | :--- |
| `MasterData/TeachersTab.tsx:84-104` | Guru Piket / Wali Kelas | `primary-light`, `accent-light` |
| `MasterData/ClassesTab.tsx:148` | label kelas | `warning-light` |
| `GuardianAssignment.tsx:422` | jumlah terhubung | `primary/10` |
| `ProfileHeroCard.tsx:32,83` | badge role/akun | `primary/10`, `muted` |
| `Profile.tsx` | (badge role di hero) | — |

**Gap:** tidak ada satu komponen "Tag/ToneBadge" untuk kategori selain status & count. Setiap halaman memilih-token sendiri → spektrum tidak konsisten antar halaman (kuning vs indigo untuk hal serupa). **Opsi:** ekstensi `StatusBadge` dengan `tone` atau komponen `Tag` baru; atau tandai sebagai "sengaja per-konfigurasi" dan dokumentasikan.

---

### T-12 — `StatusBadge` Tidak Mencakup Kategori Izin Lanjutan (`permit`/`achievement`/`medical`)

**Token yang sudah didefinisikan di `resources/css/app.css` (50-69):**
- `--color-permit*` (biru #3B82F6) — izin acara
- `--color-achievement*` (teal #14B8A6) — izin kompetisi
- `--color-medical*` (ungu #A855F7) — kesehatan

**Pemakaian belum via StatusBadge:**
- `Pages/Teacher/Reports/RecapTable.tsx:129,140,150` — `color: "text-medical"`, `"text-medical": "bg-medical-light"` (badge manual di recap)
- `StatusBadge.resolveStatusVariant` hanya memetakan `permission/izin/...` → `permission` (primary indigo), tidak mengurai kode kategori izin lanjutan.

**Gap:** kategori izin (acara/kompetisi/sakit) memiliki family warna **sendiri** yang didefinisikan di token, tetapi resolve status tidak menghubungkannya. Akibat: label "Sakit/Izin" di tempat berbeda bisa berwarna indigo (StatusBadge `sick`/`permission` = primary) atau ungu (`text-medical` di RecapTable). Lihat juga T-02 (`permission` dot = biru `info`).

---

## 4. Matriks Halaman → Status Konsistensi

| Halaman / URL | Komponen inti | Temuan terkait |
| :--- | :--- | :--- |
| `Admin/Dashboard` `/dashboard` | PageHeader, StatusBadge, NativeSelect, FilterPopover, EmptyState | T-02 (badge), T-09 (popover ghost/accent) |
| `Admin/Overview` `/overview` | PageHeader, StatusBadge | T-02 |
| `Admin/MasterData` `/master-data` + 4 tab | PageHeader, FilterPopover, ConfirmDialog, StatusBadge, **badge DIY**, **aksi DIY** | T-03, T-04, T-09 |
| `Admin/MasterData/Forms/{Student,Class}Form` | SelectInput | T-01 |
| `Admin/ClassEnrolment` `/class-enrolment` | PageHeader, FilterPopover, MobileFilterSelectBar, ConfirmDialog, EmptyState | T-09 |
| `Admin/GuardianAssignment` `/guardian-assignment` | PageHeader, ConfirmDialog, EmptyState, **sub-header 15px**, badge 11px | T-03/T-11, T-07 |
| `Admin/Monitoring` `/monitoring` | PageHeader, StatusBadge, EmptyState | T-02 |
| `Admin/AttendanceCorrection` `/attendance-correction` | PageHeader, StatusBadge, ActionButton (benar), ConfirmDialog, EmptyState | T-02, T-04 (control) |
| `Admin/LeaveRequests` `/leave-requests` | PageHeader, StatusBadge, EmptyState | T-02 |
| `Admin/LeaveVerification` `/leave-requests/verification` | PageHeader, ConfirmDialog, EmptyState, **badge uppercase 11px**, filter modal | T-03, T-09 |
| `Admin/SystemSettings` `/settings` | PageHeader, NativeSelect, **badge 11px** | T-01, T-03 |
| `Admin/HolidaySettings` `/operational-settings` | PageHeader, ConfirmDialog, EmptyState, **badge 11px emerald/text literal** | T-03 |
| `Admin/Sections/AgentIntegrationSection` | NativeSelect | T-01 |
| `Reports/Daily|Monthly|Semester` `/reports/{daily,monthly,semester}` | PageHeader, ExportButtonGroup, StatusBadge | T-10 (benar) |
| `Reports/Export` `/export` | PageHeader, FilterPopover | T-08, T-09 |
| `Teacher/Reports/Index` `/reports` (wali) | **Header DIY 22px, select DIY, export DIY** | T-06, T-07, T-10 |
| `Teacher/DutyDashboard` `/teacher/duty` | PageHeader, FilterBar, StatusBadge | T-09 (FilterBar — satu-satunya) |
| `Teacher/HomeroomDashboard` `/teacher/homeroom` | PageHeader, StatusBadge, EmptyState | T-02 |
| `Teacher/LeaveVerification*` `/leave-requests` (wali) | LeaveVerificationHeader, SelectInput (filter modal) | T-01, T-09 |
| `Guardian/Dashboard` `/guardian` | PageHeader, StatusBadge, NativeSelect | T-01, T-02 |
| `Guardian/History` `/guardian/history` | PageHeader, FilterPopover, StatusBadge, EmptyState | T-08, T-09 |
| `Guardian/LeaveApplication` `/guardian/leave-application` | PageHeader, FilterPopover, NativeSelect (form), **badge 11.5px** | T-01, T-03, T-08, T-09 |
| `Student/Dashboard` `/student/dashboard` | PageHeader, StatusBadge, DashboardHero | T-02 |
| `Student/AttendanceHistory` | PageHeader, FilterPopover, StatusBadge, EmptyState | T-09 |
| `Student/LiveAttendance` | PageHeader, (label posisi 13px wajar) | T-07 |
| `Profile` `/profile` | PageHeader, ConfirmDialog, TabSwitcher | T-08 |
| `Notifications` `/notifications` | PageHeader, ConfirmDialog, EmptyState | — |
| `Welcome.tsx` / `Login.tsx` | — | (login terpisah) |

---

## 5. Komponen "Orphan"/Diragukan (untuk keputusan penyatuan)

| Komponen | Keterangan |
| :--- | :--- |
| `FilterDropdown.tsx` | Tidak ada pemakai aktif di `Pages/`. Kandidat orphan (serupa `NativeSelect`) — verifikasi sebelum dihapus/diaktifkan. |
| `FilterBar` | Hanya dipakai 1 halaman (`DutyDashboard`). Meskipun bagus, adopsi rendah → pertimbangkan jadi standar toolbar filter agar T-09 terselesaikan. |
| `Badge.tsx` vs `StatusBadge.tsx` | Fungsi beda (count vs status), jangan digabung tanpa perencanaan; gunakan di tempat yang tepat. |
| `MobileNativePagination` vs `Pagination` | Sudah berjalan dua-duanya (desktop vs mobile). Tidak bermasalah — catat saja. |
| `LeaveRequestCard.tsx` (539 baris) | Komponen "feature" yang tinggal di `ui/`; besar & kompleks. Refactor opsional (bukan bagian konsistensi visual utama). |

---

## 6. Keputusan yang Perlu Diambil (Pertanyaan Terbuka)

Dokumen ini mendokumentasikan **kenyataan**, bukan rekomendasi final. Sebelum/ketika Anda memperbaiki manual, putuskan:

1. **Select kanonik:** `NativeSelect` (ringan, native) atau `SelectInput` (rich, searchable)? Atau buat `FilterSelect` baru? *(T-01)*
2. **Makna warna izin:** apakah `permission` dan `sick` memang harus dibedakan? Jika ya — pilih hue untuk masing-masing (indigo / ungu `medical` / biru `permit` / teal `achievement`) dan selaraskan `StatusDot` + `StatusBadge` + `RecapTable`. *(T-02, T-12)*
3. **Kategori non-status (role, kelas, guru-piket/wali):** buat komponen `Tag`/`ToneBadge` baru, atau anggap ada per-bagian yang sengaja. *(T-03, T-11)*
4. **Toolbar filter:** satu pola visu (popover accent vs ghost vs modal vs FilterBar). *(T-09)*
5. **`Teacher/Reports/Index.tsx`:** refactor total ke PageHeader + ExportButtonGroup + NativeSelect/FilterBar, atau diperbolehkan berbeda (halaman mobile-first wali kelas). *(T-06, T-10)*
6. **Font-scale:** pertahankan ukuran fraksional yang sengaja (mobile compact) atau migrasi ke token. Berikan pengecualian baris demi baris bila dipertahankan. *(T-08)*
7. **ConfirmDialog cancel:** izinkan bahan manual (demi polish `active:scale-95`) atau samakan ke `Button` agar satu sumber. *(T-05)*

---

## 7. Catatan Non-Temuan (Sengaja Tidak Dimasukkan / Sudah Konsisten)

- **`PageHeader` dipakai 26 halaman** — konsistensi kuat; jangan terganggu.
- **`EmptyState` dipakai 19 kali**, variasi disediakan (no-data/no-results/no-leaves/no-history/loading/error/dst) — pola seragam.
- **`TabSwitcher`** baru saja menerima `iconOnly` — konsisten di seluruh halaman bertab.
- **`ConfirmDialog`** struktur visual secara keseluruhan konsisten (satu komponen).
- **`StatusBadge`** label & resolve sudah bagus untuk status inti (hadir/late/alpha/sakit/izin dkk).
- **`StatusDot`** pemakaian terbatas & testable (unit test ada) — aman untuk diubah.

---

## 8. Lampiran: Snapshot Bukti Kode (Sebelum Perbaikan)

### 8.1 StatusBadge — basis warna (cut)
```tsx
// Components/ui/StatusBadge.tsx:20-46
const config: Record<StatusVariant, { bg: string; text: string; defaultLabel: string }> = {
    present: { bg: "bg-success-light", text: "text-success", defaultLabel: "Hadir" },
    late:    { bg: "bg-warning-bg",   text: "text-warning", defaultLabel: "Terlambat" },
    absent:  { bg: "bg-danger-bg",    text: "text-danger",  defaultLabel: "Tidak Hadir" },
    sick:        { bg: "bg-primary-light", text: "text-primary", defaultLabel: "Sakit" },
    permission:  { bg: "bg-primary-light", text: "text-primary", defaultLabel: "Izin" },
    pending:     { bg: "bg-warning-bg",   text: "text-warning", defaultLabel: "Pending" },
};
```

### 8.2 StatusDot — basis warna (cut) — TIDAK selaras
```tsx
// Components/ui/StatusDot.tsx:12-27
const dotColors: Record<string, string> = {
    present: "bg-success",
    late: "bg-warning",
    absent: "bg-danger",
    sick: "bg-primary",
    permission: "bg-info",   // ← biru, ≠ badge (primary)
    active: "bg-success",
    pending: "bg-warning",
    ...
};
```

### 8.3 ConfirmDialog — dual styling
```tsx
// common/ConfirmDialog.tsx:87-96 (cancel, raw)
<button className="flex-1 h-10 px-4 rounded-xl text-[13px] font-bold text-text-secondary bg-surface hover:bg-muted/60 border border-border transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs">
// :97-106 (confirm, via Button)
<Button variant={config.buttonVariant} className="flex-1 h-10 text-[13px] font-extrabold rounded-xl shadow-xs">
```

### 8.4 TeachersTab — badge role DIY
```tsx
// Pages/Admin/MasterData/TeachersTab.tsx:84-104
<span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary-light text-primary border border-primary/20">Guru Piket</span>
<span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accent-light text-text-primary border border-accent/30">Wali Kelas</span>
```

### 8.5 LeaveVerification — badge besar uppercase DIY
```tsx
// Pages/Admin/LeaveVerification.tsx:377-387
<span className="bg-warning-bg text-warning font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">MENUNGGU</span>
<span className="bg-success-bg text-success font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">DISETUJUI</span>
<span className="bg-danger-bg text-danger font-bold text-[11px] px-3 py-1 rounded-full uppercase tracking-wide inline-block">DITOLAK</span>
```

### 8.6 Teacher/Reports — header & export DIY
```tsx
// Pages/Teacher/Reports/Index.tsx:205-212
<h1 className="text-[22px] font-bold text-text-primary font-inter">{t("reports.headerTitle", { class: kelas.name })}</h1>
<p className="text-[13px] text-text-muted font-inter mt-1">{t("reports.subtitle", { class: kelas.name })}</p>
<h1 className="sm:hidden text-[20px] font-bold text-text-primary font-inter">{kelas.name}</h1>

// :188-197 (export tombol mobile-only)
<button type="button" className="w-8 h-8 ... rounded-full ... sm:hidden" title={t("reports.export")}>
    <FiDownload className="text-[15px]" />
</button>
```

### 8.7 MasterData — aksi edit/hapus DIY
```tsx
// Pages/Admin/MasterData/StudentsTab.tsx:193-203
<button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-text-muted hover:text-primary hover:bg-primary-light border border-border ... text-[12px] font-semibold">
<button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-danger hover:bg-danger-bg border border-danger/20 ... text-[12px] font-semibold">
```

### 8.8 StatusBadge == aksi kanonik (pembanding)
```tsx
// Pages/Admin/AttendanceCorrection.tsx:208-215
<ActionButton variant="detail" label="...</> icon={<FiEye .../>} />
<ActionButton variant="delete" label="..." icon={<FiTrash2 .../>} />
```

---

## 9. Riwayat Perubahan Dokumen

| Tanggal | Perubahan | Status |
| :--- | :--- | :--- |
| 2026-09-11 | Baseline awal (snapshot sebelum perbaikan manual) | Baseline |