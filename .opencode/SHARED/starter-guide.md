# 🎯 Panduan Mulai untuk Tim

> Dokumen pendamping `team-playbook.md` — berisi langkah konkret pertama yang harus dilakukan

## 📌 Untuk Ihsan (Junior Backend)

**Misi pertama:** Pahami Service Layer, bikin test, dan jadi "quality gate" untuk kode backend.

### Langkah 1: Setup (Hari 1)
```bash
# Clone project
git clone git@github.com:konxc/smauii-core.git
cd smauii-core

# Setup environment
cp .env.example .env
composer install
php artisan key:generate

# Jalankan migration + seeder
php artisan migrate --seed

# Cek test
php artisan test

# Kalau error, baca storage/logs/laravel.log
```

### Langkah 2: Baca & Pahami (Hari 2-3)

Baca file ini **berurutan**:

1. `routes/api.php` — lihat semua endpoint API yang sudah ada
2. `app/Helpers/ApiResponse.php` — pahami format response JSON
3. `app/Services/StudentService.php` — pahami pattern service
4. `app/Http/Controllers/Api/StudentController.php` — lihat cara controller panggil service
5. `app/Http/Requests/Api/StoreStudentRequest.php` — lihat validasi
6. `app/Models/Student.php` — lihat relasi

**Setelah baca, jawab pertanyaan ini:**
- Service itu fungsinya apa?
- Kenapa controller dibuat tipis?
- Gimana cara nambah endpoint baru?

### Langkah 3: Kontribusi Pertama (Hari 4-5)

**Quest Q-06:** Baca `tests/Feature/Services/AttendanceServiceTest.php`, pahami pola testing, lalu tambah 1 test case baru untuk "check-in gagal karena hari libur".

### Langkah 4: Jadi Owner (Minggu 2+)

Ambil alih tanggung jawab:
- Pantau `php artisan test` selalu hijau
- Kalau ada error di test, kamu yang fix
- Tambah test coverage untuk service yang belum punya test

---

## 📌 Untuk Fathan (Junior Frontend)

**Misi pertama:** Pahami Inertia + React + TypeScript, pastikan semua halaman berfungsi dengan baik.

### Langkah 1: Setup (Hari 1)
```bash
# Clone project
git clone git@github.com:konxc/smauii-core.git
cd smauii-core

# Setup frontend
bun install

# Jalankan Vite dev server
bun run dev

# Buka browser → http://smauii-core.test (atau sesuai virtual host)
```

### Langkah 2: Baca & Pahami (Hari 2-3)

Baca file ini **berurutan**:

1. `resources/js/app.tsx` — entry point aplikasi
2. `resources/js/app.css` — theme tokens (--color-primary, dll)
3. `resources/js/Layouts/AdminLayout.tsx` — struktur layout
4. `resources/js/Pages/Admin/Monitoring.tsx` — contoh halaman kompleks
5. `resources/js/Components/ui/Table.tsx` — komponen tabel yang dipakai di banyak halaman
6. `resources/js/hooks/useAttendance.ts` — contoh custom hook

**Setelah baca, jawab pertanyaan ini:**
- Gimana data dikirim dari backend ke frontend?
- Gimana caranya nambah halaman baru?
- Apa bedanya Components/ dan Pages/?

### Langkah 3: Kontribusi Pertama (Hari 4-5)

**Quest Q-07:** Buka file `resources/js/hooks/useAttendance.ts`, ada warning `no-explicit-any`. Ganti tipe `any` dengan tipe yang sesuai.

### Langkah 4: Jadi Owner (Minggu 2+)

Ambil alih tanggung jawab:
- Manual test semua halaman (Admin, Siswa, Guru, Wali Murid)
- Catat error visual atau functional
- Fix responsive issues

---

## 📌 Untuk Hanif (UI/UX / Documentation)

**Misi pertama:** Verifikasi visual consistency dan bikin dokumentasi yang membantu tim.

### Langkah 1: Setup (Hari 1)
```bash
# Clone project & jalankan seperti Fathan
# Buka semua halaman di browser
```

### Langkah 2: Audit Visual (Hari 2-3)

Bandingkan hasil di browser dengan referensi Figma / desktop.css:
- Apakah warna sidebar sudah sesuai (`bg-primary` = `#2E3391`)?
- Apakah font size StatCard 32px?
- Apakah ada elemen yang broken/missing?
- Apakah responsive di mobile 375px?

Buat laporan berisi:
```
Halaman: [nama]
Issue: [deskripsi]
Screenshot: [lampiran]
Expected: [sesuai Figma]
Actual: [yang terlihat di browser]
```

### Langkah 3: Kontribusi Pertama (Hari 4-5)

Buat dokumentasi visual: 1 halaman PDF atau Notion yang menjelaskan:
- Semantic design tokens yang digunakan
- Contoh component dengan props
- Gambar hasil vs Figma (before/after)

### Langkah 4: Jadi Owner (Minggu 2+)

Ambil alih tanggung jawab:
- Update `.opencode/SHARED/master-plan.md` dengan informasi terbaru
- Buat panduan onboarding untuk anggota tim baru

---

## 📌 Untuk Azis (Mentor)

**Misi pertama:** Pastikan Ihsan dan Fathan naik level.

### Langkah 1: Akselerasi (Hari 1-2)

1. Clone project, pastikan environment jalan di mesin kamu
2. Baca `master-plan.md` untuk pahami gambaran besar
3. Baca `team-playbook.md` yang baru dibuat

### Langkah 2: Mentoring (Setiap Hari)

- Sesi 45 menit per hari dengan Ihsan atau Fathan
- Format: "Show, Don't Tell" — minta mereka jelaskan kode yang sudah dibaca
- Kalau mereka buntu, jangan kasih jawaban langsung. Kasih clue: "Coba liat file X baris Y"

### Langkah 3: Quality Gate (Minggu 2+)

- Bantu Ihsan dan Fathan bikin PR pertama mereka
- Review PR mereka sebelum dikirim ke Sandikodev
- Pastikan test hijau sebelum merge

---

## 🚀 Quick Reference: Perintah Penting

```bash
# BACKEND
php artisan serve              # Jalankan dev server
php artisan migrate            # Jalankan migration
php artisan migrate:fresh      # Hapus semua tabel + migrate ulang
php artisan migrate:fresh --seed  # + isi data awal
php artisan test               # Jalankan semua test
php artisan make:model X       # Buat model baru
php artisan make:controller X  # Buat controller baru
./vendor/bin/pint              # Format kode otomatis (PSR-12)
composer dump-autoload         # Reload autoload (kalau ada class not found)

# FRONTEND
bun run dev                    # Jalankan Vite dev server (HMR)
bun run build                  # Build untuk production
bun add nama-package           # Install package
bunx tsc --noEmit              # Cek TypeScript error
```
