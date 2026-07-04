# 📘 Team Playbook — SMART Absen SMA UII

> Untuk: Ihsan (Backend), Fathan (Frontend), Hanif (UI/UX), Azis (Mentor), Sandikodev (Lead)
> Bahasa: Indonesia (untuk memudahkan pembelajaran)
> Tujuan: Membantu setiap anggota tim naik level, punya inisiatif, dan berkontribusi nyata

---

## Daftar Isi

1. [Filosofi Tim](#1-filosofi-tim)
2. [Peta Belajar (Learning Roadmap)](#2-peta-belajar)
3. [Codebase: Peta Harta Karun](#3-codebase-peta-harta-karun)
4. [Misi-Misi Kecil (Quest)](#4-misi-misi-kecil-quest)
5. [Cara Berkomunikasi](#5-cara-berkomunikasi)
6. [Ritme Kerja Tim](#6-ritme-kerja-tim)
7. [Standar Kode & Review](#7-standar-kode--review)
8. [Troubleshooting Mental Block](#8-troubleshooting-mental-block)
9. [Glosarium Tim](#9-glosarium-tim)
10. [Inisiatif-Inisiatif Segar](#10-inisiatif-inisiatif-segar)

---

## 1. Filosofi Tim

### 🎯 Visi Kita
Bukan sekadar membuat aplikasi absensi. Kita membangun **Identity Provider (IdP) pertama di lingkungan Yayasan SMA UII** yang akan menjadi standar autentikasi untuk semua aplikasi sekolah di masa depan (e-Learning, Financial, Library).

Kode yang kita tulis hari ini akan dipakai **ribuan siswa, guru, dan wali murid** setiap hari.

### 💡 Mindset yang Harus Dipegang

| Mindset | Penjelasan |
|---|---|
| **"Saya pemilik fitur ini"** | Bukan "saya disuruh ngerjain X", tapi "fitur X adalah tanggung jawab saya dari awal sampai deploy" |
| **"Saya boleh bertanya"** | Tidak tahu bukan aib. Bertanya itu tanda mau belajar. Tapi setelah bertanya, coba dulu cari solusi sendiri |
| **"Saya boleh salah"** | Kesalahan adalah proses belajar. Tiap error adalah pelajaran gratis. Yang penting: belajar dari kesalahan |
| **"Saya bisa berkontribusi ide"** | Semua anggota tim punya suara. Fitur terbaik sering lahir dari sudut pandang yang tidak terduga |
| **"Kode saya akan dibaca orang"** | Tulis kode seolah-olah akan direview oleh senior yang ketat. Ini membuat kita otomatis meningkat |

### 🧠 Siklus Belajar yang Diharapkan
```
MENERIMA TUGAS → MEMAHAMI → MENCARI TAHU → COBA → ERROR → 
→ TANYA → COBA LAGI → BERHASIL → PUASA → BAGIKAN KE TIM
```

---

## 2. Peta Belajar (Learning Roadmap)

Setiap anggota tim punya level masing-masing. Target kita: **naik 1 level tiap 2 minggu**.

### Level System

| Level | Arti | Ciri-ciri |
|---|---|---|
| 🟢 **Explorer** | Baru, masih canggung | Butuh contoh konkret, step-by-step, peer programming |
| 🟡 **Builder** | Mulai percaya diri | Bisa buat fitur sederhana sendiri, kadang masih lupa pattern |
| 🟠 **Crafter** | Produktif | Tahu pattern, bikin fitur sendiri, review kode junior |
| 🔴 **Master** | Mentor | Desain arsitektur, bagi pengetahuan, nentuin standar tim |

### 🟢 Explorer → 🟡 Builder (Minggu 1-2)

Yang harus dikuasai:
- [ ] Laravel routing & controller pattern
- [ ] Service Layer pattern (kenapa pisah logic dari controller)
- [ ] Eloquent ORM dasar (CRUD, relations)
- [ ] Form Request validation
- [ ] Blade/Inertia rendering
- [ ] Git dasar: clone, branch, add, commit, push, pull

Belajar dari:
- Dokumentasi Laravel: https://laravel.com/docs
- Baca file `.opencode/SHARED/master-plan.md` — pahami gambaran besar
- Pair programming dengan Azis

### 🟡 Builder → 🟠 Crafter (Minggu 3-4)

Yang harus dikuasai:
- [ ] Event broadcasting (Pusher)
- [ ] Testing (PHPUnit)
- [ ] Spatie RBAC
- [ ] Sanctum API tokens
- [ ] Design pattern: policy, observer, event
- [ ] Git: rebase, resolve conflict

Belajar dari:
- Baca semua Service files di `app/Services/` — pahami pattern bisnis logic
- Baca semua Test files di `tests/Feature/Services/` — pahami cara ngetes
- Coba bikin fitur kecil sendiri (misal: filter tambahan di salah satu endpoint)

### 🟠 Crafter → 🔴 Master (Minggu 5+)

Yang harus dikuasai:
- [ ] Code review orang lain
- [ ] Arsitektur design decision
- [ ] Performance optimization (N+1 query, indexing)
- [ ] Security best practices
- [ ] Mentoring junior

---

## 3. Codebase: Peta Harta Karun

> "Kode yang sudah ada adalah guru terbaikmu." — Sandikodev

### 📁 Frontend (`resources/js/`)

```
resources/js/
├── Pages/           ← ★ MULAI DISINI untuk Fathan
│   ├── Admin/       (9 halaman: DataMaster, MasterKelas, Monitoring, dll)
│   ├── Siswa/       (3 halaman: Dashboard, LivePresensi, RiwayatKehadiran)
│   ├── Guru/        (2 halaman: DashboardPiket, DashboardWaliKelas)
│   └── WaliMurid/   (2 halaman: Dashboard, PengajuanIzin)
├── Components/      ← Komponen reusable
│   └── ui/          (Button, Input, Table, Skeleton, StatCard, Badge, dll)
├── Layouts/         ← Template halaman per role
├── hooks/           ← 4 custom hooks (useAttendance, useClasses, dll)
└── types/           ← Tipe TypeScript
```

**Cara membaca halaman:**
1. Buka file di `Pages/Admin/Monitoring.tsx`
2. Lihat `interface PageProps` — ini data yang dikirim dari backend
3. Lihat `export default function Monitoring` — komponen utama
4. Lihat komponen yang dipanggil (Table, StatCard, FilterBar)
5. Cari komponen tersebut di `Components/`
6. Lihat layout yang digunakan di `Layouts/`

### 📁 Backend (`app/`)

```
app/
├── Services/          ← ★ MULAI DISINI untuk Ihsan (LOGIKA BISNIS)
│   ├── AttendanceService.php    (presensi + triple-layer validation)
│   ├── StudentService.php       (CRUD siswa)
│   ├── TeacherService.php       (CRUD guru)
│   ├── LeaveRequestService.php  (pengajuan izin + verifikasi)
│   └── ... (total 11 services)
├── Http/Controllers/
│   ├── Web/            ← Controller untuk Inertia (session)
│   └── Api/            ← Controller untuk API (Sanctum token)
├── Models/             ← 10 Eloquent model dengan relasi
├── Policies/           ← 5 policy untuk otorisasi
├── Imports/            ← Import Excel (StudentsImport, TeachersImport)
└── Events/             ← AttendanceCreated (real-time broadcast)
```

### 🔍 Cara Debugging (Penting!)

```
BUG atau ERROR
    │
    ▼
1. Baca error message dari paling bawah (stack trace)
    │
    ▼
2. Tentukan jenis error:
   ├── "Class not found" → composer dump-autoload atau php artisan optimize
   ├── "SQL error"       → cek migration, cek tipe data di model $fillable
   ├── "Undefined variable" → cek controller → service → view
   ├── "419 expired"     → refresh halaman (CSRF token expired)
   └── "500 server error" → buka storage/logs/laravel.log
    │
    ▼
3. Search error di kode: grep -r "namaMethod" app/
    │
    ▼
4. Tambahkan dd($variable) untuk debug sementara
    │
    ▼
5. Kalau mentok >15 menit, tanya di grup + kirim screenshot error
```

---

## 4. Misi-Misi Kecil (Quest)

Quest adalah tugas kecil yang bisa dikerjakan dalam 1-2 jam. Cocok untuk belajar sambil berkontribusi.

### 🟢 Quest untuk Explorer

| # | Quest | Skill | File Target |
|---|---|---|---|
| Q-01 | **Jelajahi halaman Admin/DataMaster** — buka di browser, klik semua tab, catat error yang muncul | Manual testing | Semua halaman |
| Q-02 | **Baca satu service** — pilih `StudentService.php`, tulis ulang dengan kata sendiri apa yang dilakukan | Literasi kode | `app/Services/StudentService.php` |
| Q-03 | **Cari hardcode** — cari string seperti `"Present"`, `"Late"` di codebase. Catat di mana saja | Code audit | Seluruh codebase |
| Q-04 | **Tambah validasi** — di form request `StoreStudentRequest`, tambah rule `phone` harus numeric | Form Request | `app/Http/Requests/` |

### 🟡 Quest untuk Builder

| # | Quest | Skill | File Target |
|---|---|---|---|
| Q-05 | **Buat filter tambahan** — di API `/api/attendances`, tambah filter `status` (Present/Late) | API | `AttendanceApiController.php` |
| Q-06 | **Tambah test** — baca `AttendanceServiceTest.php`, tambah test case untuk "check-in di hari libur" | Testing | `tests/Feature/Services/` |
| Q-07 | **Fix eslint warning** — cari file dengan warning `no-explicit-any` di hooks, ganti dengan tipe yang tepat | TypeScript | `resources/js/hooks/` |
| Q-08 | **Buat komponen loading** — tambahkan skeleton loading di halaman yang belum punya | Frontend | Halaman tanpa loading state |

### 🟠 Quest untuk Crafter

| # | Quest | Skill | File Target |
|---|---|---|---|
| Q-09 | **Buat Export Excel** — export data siswa dari API `/api/students/export` | Export | `app/Services/ExportService.php` |
| Q-10 | **Code review** — review PR orang lain, minimal 3 komentar meaningful | Review | GitHub PR |
| Q-11 | **Buat dokumentasi** — tulis README untuk 1 service | Docs | `docs/services/` |
| Q-12 | **Optimasi query** — cari N+1 problem di salah satu controller, fix dengan eager loading | Performance | Controller mana pun |

---

## 5. Cara Berkomunikasi

### Aturan Emas

| Situasi | Yang Dilakukan |
|---|---|
| **Buntu >15 menit** | Tanya di grup chat dengan format: "Aku mau [tujuan], udah coba [langkah], error [pesan]" |
| **Ketemu bug** | Catat: URL, langkah reproduce, expected vs actual, screenshot |
| **Selesai fitur** | Push ke branch `feature/*`, buat draft PR di GitHub, tag reviewer |
| **Ada ide** | Tulis di Trello card ide, diskusi dengan Sandikodev/Azis |
| **Mau belajar sesuatu** | Cari di .opencode/SHARED/ dulu, kalau nggak ada, tanya |

### Format Tanya yang Efektif

```
❌ "Pak, kok error ya?"
✅ "Pak, saya mau bikin fitur export PDF. Saya udah install dompdf,
    udah baca docs-nya, tapi pas dijalanin error 'Class not found'.
    Ini screenshot errornya. Kira-kira kenapa ya?"
```

### Daily Check-In (setiap pagi)

Tiap hari sebelum mulai kerja, kirim 3 baris di grup:

```
1. Kemarin saya: [selesai apa]
2. Hari ini saya: [rencana kerja]
3. Blocker: [kendala, atau "tidak ada"]
```

---

## 6. Ritme Kerja Tim

### 🕐 Timeline Mingguan (Sprint)

| Hari | Aktivitas |
|---|---|
| **Senin** | Planning: lihat Trello board, ambil task, breakdown subtask |
| **Selasa-Kamis** | Fokus coding, pair programming (1 jam/hari) |
| **Jumat** | Code review + demo progress ke Sandikodev |
| **Sabtu-Minggu** | Istirahat, explorasi belajar sendiri |

### 🧑‍🤝‍🧑 Pair Programming Schedule

> Tujuan: transfer knowledge dari Azis/senior ke junior

| Sesi | Durasi | Yang Dibahas |
|---|---|---|
| Senin 10:00 | 45 menit | Azis + Ihsan — backend pattern |
| Rabu 10:00 | 45 menit | Azis + Fathan — frontend pattern |
| Jumat 15:00 | 60 menit | Semua — demo + review bersama |

### 🚦 Aturan Git

```bash
# Setiap hari, sebelum mulai kerja:
git checkout develop
git pull origin develop

# BUAT BRANCH BARU untuk setiap fitur:
git checkout -b feature/nama-fitur
# Contoh: feature/tambah-filter-status

# Setelah selesai:
git add .
git commit -m "feat: tambah filter status di API attendances"
git push origin feature/nama-fitur

# Bikin Pull Request di GitHub → tag Sandikodev sebagai reviewer

# JANGAN PUSH LANGSUNG KE main ATAU develop!
```

---

## 7. Standar Kode & Review

### Checklist Sebelum Commit

Sebelum `git commit`, tanyakan ke diri sendiri:

- [ ] Apakah ini sudah sesuai pattern yang ada? (cek file sejenis)
- [ ] Apakah ada `dd()`, `var_dump()`, `console.log()` yang kececeran?
- [ ] Apakah ada N+1 query? (cek di loop, apakah ada query berulang)
- [ ] Apakah validasi sudah dipisah ke Form Request?
- [ ] Apakah logic bisnis di Service, bukan di Controller?
- [ ] Apakah tidak ada password/token/secret yang kecommit?
- [ ] Apakah `bun run build` masih hijau? (frontend)
- [ ] Apakah `php artisan test` masih hijau? (backend)

### Code Review: Yang Perlu Dicek

**Saat me-review PR orang lain, cek:**

| Aspek | Pertanyaan |
|---|---|
| **Logic** | Apakah kode ini beneran menyelesaikan masalah? |
| **Security** | Apakah input tervalidasi? Apakah user bisa akses data orang lain? |
| **Performance** | Apakah ada query N+1? Apakah ada loop yang bisa dioptimasi? |
| **Readability** | Apakah jelas apa yang dilakukan kode ini? Butuh komentar? |
| **Consistency** | Apakah pattern-nya sama dengan kode existing? |
| **Testing** | Apakah ada test untuk kode baru? |

### Format Feedback Saat Review

```
✅ Bagus: [sebut apa yang bagus]
❌ Perlu diperbaiki: [sebut apa yang salah + kenapa]
💡 Saran: [opsi perbaikan, bukan perintah]
```

Contoh:
```
✅ Bagus: validasi udah dipisah ke Form Request, sesuai pattern.
❌ Perlu diperbaiki: ada query di dalam loop foreach di baris 45,
   ini bisa menyebabkan N+1 problem.
💡 Saran: bisa pake with() atau load() untuk eager loading.
```

---

## 8. Troubleshooting Mental Block

> "Aku merasa tidak becus. Kode orang lain lebih bagus. Aku lambat banget."

Pernah merasa seperti itu? **Normal.** Setiap developer pernah ngerasain ini. Namanya **Impostor Syndrome**.

### Cara Mengatasinya

| Situasi | Solusi |
|---|---|
| **"Kodeku jelek"** | Kode yang jelek tapi jalan > kode bagus yang tidak pernah selesai. Refactor nanti. |
| **"Aku lambat"** | Ukur kemajuan dari minggu lalu, bukan dari senior yang sudah 5 tahun. |
| **"Error terus"** | Setiap error yang kamu selesaikan = 1 level up. Catat errornya, besok kamu akan lebih cepat. |
| **"Bingung mulai dari mana"** | Buka Trello, ambil task terkecil. Kerjakan 25 menit dulu. Kalau buntu, ganti task. |
| **"Takut salah"** | Git commit itu reversible. Kalau salah, tinggal `git revert` atau `git reset`. No big deal. |
| **"Lelah burnout"** | Istirahat 10 menit tiap 1 jam. Jalan, minum, lihat pemandangan. Otak perlu jeda. |

### 25-Minute Sprint Technique

```
1. Pilih 1 task kecil dari Trello
2. Timer 25 menit — FOKUS 100%, no HP, no YouTube
3. Timer bunyi → ISTIRAHAT 5 menit
4. Ulangi

Setelah 4 sprint → istirahat panjang 30 menit.
```

### Kalau Buntu, Tanya Diri Sendiri

```
1. Apa yang ingin aku capai? (tujuan)
2. Apa yang sudah aku coba? (langkah)
3. Apa yang terjadi? (hasil)
4. Apa yang seharusnya terjadi? (ekspektasi)
5. Apa bedanya? (gap)

Kalau setelah 4 langkah ini masih buntu → TANYA TIM
```

---

## 9. Glosarium Tim

| Istilah | Arti |
|---|---|
| **Eloquent** | ORM Laravel — cara ngomong sama database pakai PHP |
| **Service Layer** | Pola pisahin logic bisnis dari Controller |
| **Controller** | Penghubung antara request user dan logic aplikasi |
| **Model** | Representasi tabel database di kode PHP |
| **Migration** | Catatan perubahan struktur database (version control for DB) |
| **Seeder** | Data awal untuk testing (bikin data palsu) |
| **Form Request** | File khusus buat validasi input |
| **Policy** | Aturan siapa yang boleh akses apa |
| **Route** | Alamat URL yang bisa diakses |
| **Middleware** | Penjaga pintu — cek apakah user boleh lewat |
| **Event** | Sesuatu yang terjadi di sistem (misal: absensi masuk) |
| **Listener/Broadcast** | Reaksi terhadap event (misal: kirim notifikasi) |
| **Eager Loading** | Teknik ambil data relasi sekaligus (with()) biar nggak N+1 |
| **N+1 Problem** | Query berulang dalam loop — musuh utama performance |
| **Inertia** | Jembatan antara Laravel (backend) dan React (frontend) |
| **Sanctum** | Laravel package buat API token auth |
| **Spatie** | Laravel package buat RBAC (role-based access control) |
| **Pusher** | Layanan real-time (misal: monitoring absensi live) |

---

## 10. Inisiatif-Inisiatif Segar

> "Inisiatif adalah ketika kamu melihat sesuatu yang perlu diperbaiki dan kamu langsung bertindak, tanpa disuruh."

### 💡 Ide-ide yang Bisa Kamu Ambil

| Ide | Untuk Siapa | Dampak |
|---|---|---|
| **Buat video tutorial 1 menit** tentang cara setup environment | Fathan/Hanif | Bantu anggota baru |
| **Tambah dark mode** ke aplikasi | Fathan | Semua user senang |
| **Buat dashboard monitoring error** — tampilin log error dalam grafik | Ihsan | Tim tahu kesehatan sistem |
| **Tulis "Week Notes"** — catatan mingguan apa yang dipelajari | Semua | Portofolio belajar |
| **Add loading skeleton** di halaman yang belum punya | Fathan | UX lebih baik |
| **Buat command Artisan custom** `php:idea generate:report` | Ihsan | Produktivitas tim |
| **Tambah test coverage** — cek mana yang belum ditest | Ihsan | Kualitas kode terjaga |
| **Buat template GitHub Issue** untuk laporan bug | Hanif | Tim terorganisir |
| **Tulis ulang dokumentasi** yang susah dipahami dengan bahasa lebih sederhana | Hanif | Tim junior terbantu |
| **Coba fitur baru Laravel** (misal: Laravel Pennant untuk feature flag) dan presentasi ke tim | Ihsan/Fathan | Inovasi |

### 🚀 Tantangan 30 Hari

Untuk memantik inisiatif, tantang diri sendiri:

| Hari ke | Tantangan |
|---|---|
| 1-5 | Baca 1 service file per hari, tulis 3 baris ringkasan |
| 6-10 | Fix 1 warning/error per hari di codebase |
| 11-15 | Bikin 1 test baru per hari |
| 16-20 | 1 commit kecil per hari (bisa cuma rename variable yang kurang jelas) |
| 21-25 | Baca dokumentasi 1 fitur Laravel yang belum dikenal |
| 26-30 | Presentasi 1 topik ke tim (10 menit) |

---

## Penutup

> **"Tim yang hebat bukan tim yang isinya semua senior.**
> **Tim yang hebat adalah tim yang saling mengangkat."**

Kita semua mulai dari nol. Sandikodev juga pernah jadi junior. Azis juga pernah belajar dari awal. Yang membedakan cuma satu: **mereka tidak berhenti belajar dan tidak takut salah.**

Jadilah versi terbaik dari dirimu sendiri. Bukan versi Sandikodev atau Azis.

**Mulai dari mana?**
1. Baca dokumen ini sekali lagi
2. Pilih 1 Quest dari section 4
3. Kerjakan 25 menit
4. Ulangi besok

Welcome to the team. Let's build something great together. 🚀

---

*Dokumen ini dibuat dengan ❤️ oleh Sandikodev untuk tim SMART Absen SMA UII*
*Terakhir diperbarui: 2026-07-04*
