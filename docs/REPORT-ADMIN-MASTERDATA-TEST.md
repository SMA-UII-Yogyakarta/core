# Laporan Pengujian — Role Admin Master Data

Tanggal eksekusi terakhir: 2026-09-12
Lingkup: CRUD master data (Siswa, Guru, Kelas, Wali) — Web + API + Import
Jenis: PHPUnit (headless, kontainer `core-dev-app-1`, SQLite `:memory:`) + Playwright e2e (headless, browser host → `http://localhost:8800`) + live smoke test + production fresh smoke
Pelapor: opencode (AI agent)

---

## Ringkasan Eksekutif

- Baseline (sebelum penambahan test): **316 passed / 1509 assertions / 25.92s**
- Setelah penambahan suite + **perbaikan BUG-1 + GAP-1 + F-2** + regresi penuh + xlsx import test + **test konsistensi peran (D1/ADR Opsi A)**: **430 passed / 0 failed / 1892 assertions / 36.48s**
- **BUG-1 (kritis, API 500 GuardDoesNotMatch) ditemukan, di-root-cause, dan DIPERBAIKI** — diverifikasi di stack live (store siswa/guru/wali → 201, siswa baru bisa login).
- **Pemeriksaan kasus serupa di role lain** tuntas (4 role; penulisan role runtime kini terpusat di model → aman di guard manapun).
- **GAP-1 kini DIPERBAIKI**: email & password wali dapat diubah lewat update Web/API (request + service + validasi unik, dengan UI yang sudah ada).
- **F-2 kini DIPERBAIKI**: `StudentPolicy::view` dirapatkan ke `admin`/`teacher` (menghilangkan izin PII/IDOR laten student/guardian yang tidak pernah terekspos rute).
- **e2e Playwright**: admin-master-data lulus **40/40** lintas 5 viewport setelah regression test penugasan ganda guru dan default form tambah guru ditambahkan. Full suite lulus **230/230** headless secara serial (`--workers=1`, 6m30s), termasuk seluruh role dan skenario geofence/GPS.
- **Rerun headless pasca-perbaikan production seeder**: admin-master-data **30/30** lintas 5 viewport (`--workers=1`, 56.3s).
- **Rerun headless pasca-perbaikan form guru**: admin-master-data **35/35** lintas 5 viewport (`--workers=1`, 1m12s). TCH-015 dengan `teacher_type=[duty, homeroom]` menampilkan kedua pilihan pada detail dan edit.
- **Rerun headless terbaru pasca-perbaikan default form tambah guru**: admin-master-data **40/40** lintas 5 viewport (`--workers=1`, 1.3m). Mode tambah dimulai tanpa penugasan terpilih; mode edit tetap mempertahankan penugasan data guru.
- **Rerun headless terbaru pasca-penyeragaman header drawer**: admin-master-data **40/40** lintas 5 viewport (`--workers=1`, 1.3m). Badge `Mode Tambah`, tombol `Close`, dan tombol `Hapus` pada drawer master-data terukur konsisten **32px**.
- **Live smoke test** (stack dev `:8800`, token admin asli): guru & wali → store 201, login 200, update nama+password 200, login password-baru 200, delete 200, cleanup 0.
- **Fresh DB smoke** (`db:migrate` + `RolePermissionSeeder`): 4 role guard=web, lazy hook syncs role saat user create → 0/0 gagal.
- **Production fresh smoke** (`make prod:fresh`): image production `--no-dev` berhasil build, migrasi + seluruh seeder berhasil, semua service healthy, health endpoint OK, dan role admin tersinkron.
- Hasil "deep code review" otorisasi/peran terlampir (F-1 ditutup melalui ADR Accepted — Opsi A; kolom `users.role` menjadi single source of truth → lihat `docs/ADR-ROLE-SOURCE-OF-TRUTH.md`).

---

## Hasil Pengujian Otomatis

| Suite | Status | Catatan |
|---|---|---|
| `tests/Feature/Web/AdminMasterDataCrudTest.php` | ✅ **84 passed** (210 assertions) | +4: update email/password wali (sync user, duplikat, preserve tanpa perubahan) |
| `tests/Feature/Api/AdminMasterDataApiCrudTest.php` | ✅ **28 passed** (194 assertions) | +3: update email/password wali, duplikat email 422 |
| `tests/Feature/Web/ImportWebTest.php` | ✅ **8 passed** (36 assertions) | +1: xlsx partial-failure (duplikat NIS → update bukan error) |
| `tests/Feature/UserRoleConsistencyTest.php` | ✅ **6 passed** (26 assertions) | +6: konsistensi kolom `role` ↔ Spatie (D1/ADR Opsi A) |
| Filter tes terkait (AdminMasterData, Import\*, ClassEnrolment, GuardianAssignment, User/Role, Auth, ApiContract, ApiAuthControl, Service\*) | ✅ **304 passed** (1426 assertions) | 0 gagal |
| **Full suite** | ✅ **430 passed / 0 failed** (1892 assertions, 36.48s) | regresi penuh setelah perbaikan production seeder — 0 gagal |
| **Playwright full e2e** | ✅ **230 passed / 0 failed** (6m30s, `--workers=1`) | 5 viewport, seluruh role, headless |

---

## Matriks Coverage

### Siswa (Web)
| Skenario | Hasil |
|---|---|
| Store (buat user sinkron, fallback email `{kataPertama}{nis}@smauiiyk.sch.id`) | ✅ PASS |
| Update (nama, nis → username, status aktif) | ✅ PASS |
| Destroy cascade user | ✅ PASS |
| Bulk destroy | ✅ PASS |
| Toggle status | ✅ PASS |
| Validasi gagal (nis duplikat, nama kosong) → flash error | ✅ PASS |
| Non-admin akses 17 rute mutasi → 403 | ✅ PASS |

### Guru (Web)
| Skenario | Hasil |
|---|---|
| Store (fallback email `{kataPertama}.{kode}@smauiiyk.sch.id`) | ✅ PASS |
| Update sinkron user | ✅ PASS |
| Destroy | ✅ PASS |
| Toggle status | ✅ PASS |
| Validasi (kode duplikat, level) | ✅ PASS |
| Non-admin → 403 | ✅ PASS |

### Kelas (Web)
| Skenario | Hasil |
|---|---|
| Store, update (termasuk ganti wali kelas), destroy | ✅ PASS |
| Toggle, bulk destroy | ✅ PASS |
| Validasi (level tidak valid, nama wajib) | ✅ PASS |
| Non-admin → 403 | ✅ PASS |

### Wali (Web)
| Skenario | Hasil |
|---|---|
| Store (sinkron user) | ✅ PASS |
| Update (nama/phone/address sinkron user) | ✅ PASS |
| Update email & password (sync user, duplikat → error) | ✅ PASS |
| Update tanpa kirim email/password → tetap dipertahankan | ✅ PASS |
| Destroy cascade user | ✅ PASS |
| Non-admin → 403 | ✅ PASS |

### API (Sanctum)
| Skenario | Siswa | Guru | Kelas | Wali |
|---|---|---|---|---|
| List (paginated `{data,links,meta}`) | ✅ | ✅ | ✅ | ✅ |
| Show | ✅ | ✅ | ✅ | ✅ |
| Store (201 + role sync) | ✅ 201 | ✅ 201 | ✅ 201 | ✅ 201 |
| Update | ✅ | ✅ | ✅ | ✅ |
| Update email/password | — | — | — | ✅ |
| Update email duplikat → 422 | — | — | — | ✅ |
| Delete | ✅ | ✅ | ✅ | ✅ |
| 404 pada id tidak ada | ✅ | ✅ | ✅ | ✅ |
| 422 validasi gagal | ✅ | ✅ | ✅ | ✅ |
| Tidak ada autentikasi → 401 | ✅ | ✅ | ✅ | ✅ |
| Non-admin store/update/delete → 403 | ✅ | ✅ | ✅ | ✅ |

---

## Temuan

### ⛔ BUG-1 (Kritis) — API store Siswa/Guru/Wali selalu HTTP 500 → ✅ **DIPERBAIKI**

**Gejala & reproduksi** (original): `POST /api/v1/students`, `/api/v1/teachers`, `/api/v1/guardians` → `500` dengan exception
`Spatie\Permission\Exceptions\GuardDoesNotMatch: The given role or permission should use guard "web, api" instead of "sanctum".` — direproduksi live dengan token Sanctum asli. Tidak ada row tersisa (rollback).

**Akar masalah:**
1. `auth:sanctum` (middleware `Authenticate`) memanggil `Auth::shouldUse('sanctum')` → `AuthManager::setDefaultDriver()` **menulis ulang `config('auth.defaults.guard')` = `sanctum`** untuk seluruh durasi request (diverifikasi di `vendor/laravel/framework/src/Illuminate/Auth/AuthManager.php`).
2. Operasi Spatie (`Role::findOrCreate`, `assignRole`, `syncRoles`) menghitung guard dari `config('auth.defaults.guard')` → `sanctum` saat itu, padahal seluruh role tersimpan ber-guard `web` → `GuardDoesNotMatch`.
3. Titik lempar: hook `User::booted()` + `assignRole` di service/import; web (guard `web`) tidak terdampak; `classes` tidak ber-role → 201 OK.

**Perbaikan (sudah dieksekusi):**
- `app/Models/User.php`: tambah properti `protected string $guard_name = 'web'` (meminjam selalu guard `web` untuk semua operasi role/permission Spatie pada User), serta metode `syncRoleFromColumn()` yang memakai guard eksplisit untuk `Role::findOrCreate` + `hasRole` + `syncRoles`.
- **Refactor sentralisasi:** enam `$user->assignRole(...)` duplikat dihapus (`StudentService`, `TeacherService`, `GuardianService` + `StudentsImport`, `TeachersImport`, `GuardiansImport`) — role kini ditetapkan di SATU titik, hook `saved` pada `User`.

**Verifikasi:**
- PHPUnit: 3 store-test API yang tadinya merah → **hijau**, plus asersi baru: `hasRole('...')` bernilai benar dan `roles[0].guard_name === 'web'` walau request via sanctum.
- Live (token asli): `POST /api/v1/students` → **201**; siswa baru **berhasil login** dengan password default; cleanup lengkap (0 user tersisa).

### ✅ Pemeriksaan "kasus serupa di role lain"
- Role yang ada: `admin`, `teacher`, `student`, `guardian` (4). `teacher` punya sub-tipe duty/homeroom via `teacher_type` (tidak terlibat guard Spatie).
- Semua penulisan role runtime kini melalui hook `User::syncRoleFromColumn()` → aman pada guard request apa pun (web/sanctum). Admin hanya diset di seeder/CLI (guard web) — jika suatu saat ada API "buat admin", otomatis tertutup oleh hook.
- `DatabaseSeeder`, `InitSeeder`, `RolePermissionSeeder`, `UserFactory` berjalan di guard `web` (CLI/test) — tidak terpengaruh.
- Tidak ditemukan titik lain yang memanggil operasi Spatie di luar konteks guard `web` setelah refactor.

### ⚠️ GAP-1 (Minor) — Email & password wali tidak dapat diubah via update → ✅ **DIPERBAIKI**
`UpdateGuardianRequest` hanya memvalidasi `name`, `phone`, `address` — `email`/`password` tidak diteruskan ke `GuardianService::update()` sehingga akun wali tidak pernah diperbarui (Web maupun API).

**Perbaikan (sudah dieksekusi):**
- `UpdateGuardianRequest`: tambah aturan `email` (nullable, unique di `users.email` dengan *ignore* user milik wali yang bersangkutan) dan `password` (nullable min 6).
- `GuardianService::update`: bidang wali di-scope (`Arr::only`) agar `email`/`password` tidak bocor ke tabel `guardians`; email kosong/tidak terisi = tidak berubah (hanya non-empty yang diupdate) — selaras pola siswa & guru.
- UI `GuardianForm.tsx` sudah menyediakan field email & password (prefill email saat edit) — kini backend menghormatinya.

**Verifikasi:** Web + API update email/password → **PASS**; duplikat email antar-wali → 422/error; update tanpa email/password → nilai lama tetap dipertahankan. Test lama `test_guardian_email_is_ignored_on_update` dialihkan menjadi 4 test positif (Web) + 3 API.

### ℹ️ Catatan verifikasi (non-bug)
- Format fallback email otomatis: siswa = `{kataPertamaNama}{nis}`, guru = `{kataPertama}.{kode}`.
- List resource API memakai struktur paginator `{data, links, meta}` untuk semua entitas (tidak ada inkonsistensi kontrak antar-entitas).
- DB tak memiliki SoftDeletes → penghapusan bersifat permanen (cascade ke tabel `users`).

---

## Deep Code Review (Rabbit Hole) — Temuan

Lingkup: arsitektur otorisasi/peran (User, Spatie, middleware, policy, PermissionRegistry, rute web & API, Telescope) yang menjadi konteks BUG-1.

### 🟠 F-1 / Medium — Otorisasi "3 lapis" yang saling tumpang tindih (sumber kebenaran ganda) → ✅ **KEPUTUSAN: Opsi A (single source)**
- Akses web master-data dicap oleh **kolom `users.role`** (Middleware `PermissionRegistry` + policy `"{role}\_access_master_data"`), sementara **Spatie roles** dipakai `CheckRole`, `role:admin` (rute API), dan Telescope.
- Risiko: dua sumber menjelma dua versi "peran pengguna"; drift saat role diubah di satu tempat saja (yang sebabnya BUG-1 bisa lolos dari uji Web).
- **Keputusan (per ADR `docs/ADR-ROLE-SOURCE-OF-TRUTH.md`, Opsi A):** kolom `users.role` = single source of truth; Spatie diturunkan via hook `User::syncRoleFromColumn()` (sudah berjalan sejak BUG-1); role diubah hanya melalui kolom `role`.
- **Guard rail (baru):** `tests/Feature/UserRoleConsistencyTest.php` (6 test) menjamin tanpa drift untuk 4 role — hasRole+guard `web`, pergantian role menghapus role lama, update tak terkait tak menyentuh Spatie, survived konteks request sanctum, dan tanpa duplikat role setelah multi-save. Pint clean, full suite 430/0.

### 🟠 F-2 / Medium (latent) — `StudentPolicy::view`/`viewAny` permisif terhadap siswa & wali → ✅ **DIPERBAIKI**
- Policy memberi `view` **true** untuk `student` dan `guardian` — berpotensi IDOR/PII (detail siswa mana pun) dan kontradiksi taktis dengan `CheckRole`/`role:admin` di rute API.
- **Perbaikan:** `StudentPolicy::view` kini hanya `admin`/`teacher` (selaras `viewAny` dan `GuardianPolicy`). Tidak terjadi regresi eksploitatif maupun fungsional: semua rute siswa dibungkus `role:admin` (diverifikasi live — token siswa → 403), dan tidak ada alur yang sah memakai `authorize('view', Student::class)` selain `Api/StudentController@show`.
- Jika nanti wali/siswa memang berhak melihat profil siswa, gunakan *ownership check* eksplisit (`$student->user_id === auth()->id()`) ketimbang izin global.

### 🟡 F-3 / Low — Pola `hasRole` mencair pada konteks guard sanctum
- `TelescopeServiceProvider::route` memanggil `$user->hasRole('admin')` tanpa guard eksplisit; kini aman berkat `$guard_name='web'`, tetapi menjadi rapuh bila suatu hari guard default diubah. **Rekomendasi:** gunakan guard eksplisit di titik2 sistemik atau terima dokumentasi bahwa User selalu ber-guard `web`.

### 🟡 F-4 / Low — Konvensi izin parsial
- `PermissionRegistry` adalah peta yang hilir-ke-hulu (route → controller → policy), bagus, tetapi hanya menutup halaman master-data; modul lain (absensi, izin, jadwal) belum tercakup — kandidat perluasan bertahap.

### ✅ Konfirmasi bersih
- Tidak ada celah pada `AuthController` (login/me/logout) terkait role; token Sanctum dibatasi cakupan (`abilities`) dan `role:admin` menutup grup master-data API.
- Import (Excel) tidak lagi memegang logika role (dipusatkan di model).
- Tidak ditemukan titik penulisan role lain di luar `web`/CLI setelah refactor.

---

## Pengujian E2E (Playwright)

**Perintah:** `bunx playwright test e2e/admin-master-data.spec.ts --project=desktop-fhd`

### admin-master-data.spec.ts (8/8 PASS)

| Kasus | Hasil |
|---|---|
| Mobile Hub navigation & back button | ✅ PASS |
| Mobile Header Actions: Import & +Tambah | ✅ PASS |
| Mobile Card Selection (Select All) & Search | ✅ PASS |
| Mobile Card Detail & header actions | ✅ PASS |
| Mobile Card Direct Edit | ✅ PASS |
| Desktop Tab Switcher & Table view | ✅ PASS |
| Teacher detail/edit mempertahankan dua penugasan (Guru Piket + Wali Kelas) | ✅ PASS |
| Form tambah guru dimulai tanpa penugasan terpilih | ✅ PASS |

### Pemeriksaan spec lain yang diperbaiki

| Spec | Sebelum | Sesudah | Catatan |
|---|---|---|---|
| `e2e/auth.spec.ts` — welcome link | FAIL (harus "Masuk") | ✅ PASS | Regex `/masuk\|login/i` — teks jadi "Login to Portal" di sm+ karena locale en default headless |
| `e2e/comprehensive-role-audit.spec.ts` — guardian leave form | FAIL (input tak ditemukan) | ✅ PASS | Buka tombol "Ajukan Izin" dulu baru assert inputs visible (form di drawer/dedicated page) |
| `e2e/responsive-guardian.spec.ts` — seluruh viewport | Timeout login saat harness lama | ✅ PASS | Helper login terpusat; lulus dalam full suite serial 230/230 dan rerun terisolasi 3/3 |

### Full e2e run
- **230 passed / 0 failed** (6m30s, `--workers=1`) — seluruh project: mobile portrait, mobile landscape, tablet, laptop, desktop-fhd.
- Rerun khusus admin master data pasca-perbaikan seeder: **30 passed / 0 failed** (56.3s, `--workers=1`) — kelima viewport.
- Rerun khusus admin master data pasca-perbaikan form guru: **35 passed / 0 failed** (1m12s, `--workers=1`) — kelima viewport.
- Rerun terbaru khusus admin master data pasca-perbaikan default form tambah guru: **40 passed / 0 failed** (1.3m, `--workers=1`) — kelima viewport.
- Rerun terisolasi tambahan: `responsive-student` desktop-fhd **15/15 passed** (3 pengulangan); guardian yang sebelumnya timeout **3/3 passed**.
- Full run paralel sebelumnya sempat menampilkan Vite error overlay saat dev server membaca perubahan file parsial. Run serial setelah stack stabil dipakai sebagai bukti final; tidak ada error aplikasi pada rerun.
- admin-master-data hijau di semua 5 project Playwright (mobile-portrait, mobile-landscape, tablet, laptop, desktop-fhd)
- Regression visual: state awal form edit kini di-resolve dari `teacher_type` sejak render pertama sehingga dua penugasan tetap tampil; state awal form tambah tidak memilih `Guru Piket` maupun `Wali Kelas`. Header drawer juga memiliki tinggi kontrol konsisten 32px untuk badge mode, close, dan hapus. Seluruhnya diverifikasi headless.

**Catatan lingkungan (penting untuk reproduksi e2e):**
- Vite dev server berjalan di `core-dev-bun-1` dan membuka port **5173 di loopback host**; `public/hot` mengiklankan hostname dalam-jaringan `smauii-core.remote` yang **tidak bisa di-resolve browser host** → app tak hydrate → login gagal.
- **Perbaikan:** tambah `--host-resolver-rules=MAP smauii-core.remote 127.0.0.1` pada `launchOptions` di `playwright.config.ts`. Kini e2e berjalan terhadap **bundle Vite dev live** (lebih dekat ke kebenaran pengembangan); jika `hot` tak ada, aturan ini no-op dan aset disajikan dari `public/build`.
- **Keterbatasan jujur:** banyak assert di spec bersifat guard/conditional → bukti correctness utama di PHPUnit; e2e memverifikasi render, navigasi, dan interaksi utama.

---

## Live Smoke Test (Stack Dev :8800)

Token admin asli dari `localhost:8800` (SSO login via browser).

| Skenario | Status |
|---|---|
| Store guru `TCH-LIVE-901` → 201 + role guard=web | ✅ |
| Store wali `085511223344` → 201 + role guard=web | ✅ |
| Login guru → 200, token valid | ✅ |
| Login wali → 200, token valid | ✅ |
| Update guru (nama + password baru) → 200 | ✅ |
| Update wali (nama + password baru) → 200 | ✅ |
| Login guru password baru → 200 | ✅ |
| Login wali password baru → 200 | ✅ |
| Delete guru → 200, cascade user 0 tersisa | ✅ |
| Delete wali → 200, cascade user 0 tersisa | ✅ |
| Leftover: 0 user/guardian tersisa | ✅ |

---

## Fresh DB Smoke (B4-lite)

Verifikasi role seeding + lazy hook pada database bersih.

| Skenario | Status |
|---|---|
| `migrate --force` pada sqlite scratch (`/tmp/smoke.sqlite`) | ✅ |
| `db:seed --class=RolePermissionSeeder --force` → 4 role guard=`web` | ✅ |
| Admin `hasRole('admin')` = true | ✅ |
| Create user `role=guardian` → hook syncs `guardian` role, guard=`web` | ✅ |
| Cleanup | ✅ |

## Production Fresh Smoke

Perintah: `make prod:fresh` pada 2026-09-11. Perintah ini memang mereset volume stack `core-prod` untuk menguji instalasi dari database kosong.

| Skenario | Status |
|---|---|
| Build `Dockerfile.prod` dengan `composer install --no-dev` | ✅ |
| `migrate:fresh --seed --force` | ✅ |
| Semua container production (`app`, `pgsql`, `redis`, `rustfs`, `mailpit`, `worker`, `schedule`) healthy/running | ✅ |
| `GET /health` dari dalam container app → `{"status":"ok"}` | ✅ |
| Runtime production `function_exists('fake')` = false, tetapi seeder tetap selesai | ✅ |
| Hasil seed: 355 users, 245 students, 15 teachers, 88 guardians, 10 classes | ✅ |
| Hasil seed aktivitas: 40.739 attendances, 45 leave requests | ✅ |
| Role `admin`, `guardian`, `student`, `teacher` seluruhnya `guard_name=web` | ✅ |
| User `admin` ada dan `hasRole('admin', 'web')` = true | ✅ |

### Perbaikan yang ditemukan saat production fresh

Percobaan pertama berhenti pada `DatabaseSeeder.php` karena memanggil helper global `fake()`, sedangkan image production memang memasang Composer dengan `--no-dev` sehingga `fakerphp/faker` tidak tersedia. Tiga penggunaan untuk nomor telepon seed diganti menjadi generator nomor deterministik internal (`seededPhone()`); tidak ada dependency development yang dipindahkan ke production. Rerun penuh `make prod:fresh` kemudian berhasil dengan exit code 0.

---

## Artefak

**Test baru:**
- `tests/Feature/Web/AdminMasterDataCrudTest.php` (84 test)
- `tests/Feature/Api/AdminMasterDataApiCrudTest.php` (28 test)
- `tests/Feature/Web/ImportWebTest.php` (8 test, +1 xlsx partial-failure)
- `tests/Feature/UserRoleConsistencyTest.php` (6 test — D1/ADR Opsi A: kolom `role` ↔ Spatie selalu sinkron, guard web, survive sanctum, tak ada duplikat role)
- `e2e/admin-master-data.spec.ts` (8 test; ditambah regression dua penugasan guru, default form tambah tanpa penugasan, alur import → kembali, scoping tombol)
- `e2e/auth.spec.ts` (regex link diperbarui)
- `e2e/comprehensive-role-audit.spec.ts` (guardian leave form: buka drawer dulu)

**Perbaikan BUG-1:**
- `app/Models/User.php` — `$guard_name = 'web'` + `syncRoleFromColumn()` (guard eksplisit) untuk `Role::findOrCreate`, `hasRole`, `syncRoles`.
- `app/Services/{StudentService,TeacherService,GuardianService}.php` + `app/Imports/{StudentsImport,TeachersImport,GuardiansImport}.php` — hapus `assignRole` redundan (sentralisasi di model).
- `playwright.config.ts` — `--host-resolver-rules=MAP smauii-core.remote 127.0.0.1`.
- **GAP-1:** `app/Http/Requests/UpdateGuardianRequest.php` (email unique-ignore + password min6), `app/Services/GuardianService.php` (scope bidan wali via `Arr::only`, email kosong = unchanged).
- **F-2:** `app/Policies/StudentPolicy.php` (`view` → `admin`/`teacher`).

**Stabilisasi E2E headless:**
- `e2e/helpers/auth.ts` — helper login persona terpusat, menunggu form React dan melakukan satu reload bounded bila mount terlambat.
- `e2e/{auth,admin-master-data,attendance-flow,comprehensive-role-audit,responsive-admin,responsive-guardian,responsive-student,responsive-teacher}.spec.ts` — memakai helper login; penantian `networkidle` diganti `domcontentloaded` agar tidak bergantung pada koneksi idle Vite/HMR.

**Dokumen arsitektur:**
- `docs/ADR-ROLE-SOURCE-OF-TRUTH.md` — Status Accepted, Opsi A (kolom `role` single-source, Spatie derived via hook)

---

## Langkah Lanjutan yang Disarankan
1. ✅ BUG-1 (role assignment guard-safe) — **selesai & diverifikasi**; suite penuh 430/430.
2. ✅ GAP-1 (email/password wali via update) — **selesai** (Web + API + validasi unik + semantik unchanged).
3. ✅ F-2 (`StudentPolicy::view` pemufakatan izin) — **selesai**.
4. ✅ F-1 (sumber kebenaran peran ganda) — **keputusan Opsi A diambil** (ADR); guard rail aktif: `UserRoleConsistencyTest` (6 test, 26 assertions). Bila nanti ada kebutuhan memaknai `teacher_type`/dual-role, lanjutkan di hook `syncRoleFromColumn` + test terkait.
5. ✅ Stabilitas headless — helper login terpusat dan full e2e serial **230/230**.
6. Jalankan ulang PHPUnit + e2e setelah perubahan apa pun di stack auth/role; perbarui angka di atas.
7. ✅ Production fresh smoke — **selesai**; `make prod:fresh` berhasil setelah seeder dibuat kompatibel dengan image `--no-dev`.
