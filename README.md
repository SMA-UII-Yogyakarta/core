<div align="center">
  <h1>⚡ SMAUII Core</h1>
  <p><strong>Backend API — SMART Absen SMA UII</strong></p>
  <p><em>Sistem Presensi Digital Terintegrasi dengan Geolokasi, Biometrik Kamera & SSO</em></p>

  <p align="center">
    <img src="https://img.shields.io/badge/laravel-13-F9322C?style=flat-square&logo=laravel" />
    <img src="https://img.shields.io/badge/php-8.5-777BB4?style=flat-square&logo=php" />
    <img src="https://img.shields.io/badge/mysql-8.0-4479A1?style=flat-square&logo=mysql" />
    <img src="https://img.shields.io/badge/redis-7-FF4438?style=flat-square&logo=redis" />
    <img src="https://img.shields.io/badge/license-MIT-d63031?style=flat-square" />
  </p>

  <p align="center">
    <a href="#setup-lingkungan">Setup</a> •
    <a href="#fitur">Fitur</a> •
    <a href="#arsitektur">Arsitektur</a> •
    <a href="#api-endpoints">API</a> •
    <a href="#contributing">Kontribusi</a>
  </p>
</div>

---

Repositori ini adalah **backend utama** dari sistem **SMART Absen SMA UII** — aplikasi presensi digital yang memungkinkan siswa melakukan absensi melalui swafoto dan geolokasi, wali murid mengajukan izin secara digital, serta guru memonitor kehadiran secara real-time.

> Repositori ini adalah **git submodule** dari [`SMA-UII-Yogyakarta/aksesekolah`](https://github.com/SMA-UII-Yogyakarta/aksesekolah) di `apps/backend/`.

---

## Fitur

- **SSO Identity Provider** — Single sign-on untuk seluruh ekosistem SMA UII (Laravel Sanctum)
- **Presensi Live** — Selfie + geolokasi dengan kompresi gambar client-side (≤20 KB)
- **Triple-Layer Validation** — Cek kalender akademik + hari aktif + rentang jam
- **Role-Based Access Control** — Admin, Siswa, Wali Murid, Wali Kelas, Guru Piket
- **Manajemen Data Master** — CRUD Siswa/Guru/Kelas + import/export Excel
- **Pengajuan & Verifikasi Izin** — Digital permission dengan upload dokumen
- **Monitoring Real-Time** — Dashboard Guru Piket dengan filter kelas
- **Laporan Export** — PDF & Excel (harian/bulanan/semester)
- **Object Storage** — File media disimpan di S3-compatible storage, bukan database
- **100% Mobile Responsive** — Tailwind CSS 4 + Vite

---

## Setup Lingkungan

### Prasyarat

| Tool | Versi | Keterangan |
|---|---|---|
| [Laragon](https://laragon.org) | 6.0+ | Development environment (wajib) |
| PHP | 8.3+ (8.5.7 recommended) | Sudah termasuk Laragon |
| MySQL | 8.0+ | Sudah termasuk Laragon |
| Composer | latest | Portable di `C:\laragon\bin\composer` |
| Node.js | 22+ | Sudah termasuk Laragon |

### Instalasi

```bash
# Clone ke Laragon document root
cd C:\laragon\www
git clone git@github.com:SMA-UII-Yogyakarta/core.git smauii-core

# Install PHP dependencies
composer install

# Setup environment
cp .env.example .env
# — edit .env, sesuaikan kredensial database —

# Generate app key
php artisan key:generate

# Jalankan migrasi + seeder
php artisan migrate --seed
```

### Konfigurasi .env

```env
APP_NAME="SMAUII Core"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://smauii-core.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smauii-core
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### Akses Aplikasi

Buka `http://smauii-core.test` di browser.

---

## Arsitektur

### Relasi dengan Monorepo

```
aksesekolah.git (monorepo entrypoint)
└── apps/backend/ → submodule → core.git (repositori ini)
```

Developer cukup melakukan clone `core.git` langsung ke Laragon untuk development harian. Maintainer monorepo yang mengelola sinkronisasi submodule.

### Stack Teknologi

| Layer | Teknologi |
|---|---|
| **Framework** | Laravel 13 |
| **PHP** | 8.5.7 NTS (VS17 x64) |
| **Database** | MySQL 8.0.30 |
| **Cache & Queue** | Redis / Database driver |
| **Object Storage** | S3-compatible (Wasabi / MinIO) |
| **Web Server** | Apache 2.4 (dev) / Nginx (prod) |
| **Frontend** | Blade + Tailwind CSS 4 + Vite |
| **Auth** | Laravel Sanctum (SSO / IdP) |

### Struktur Database (10 Tabel)

```
Core:     users → siswa, guru, wali_murid, kelas
Transaksi: presensi, pengajuan_izin, jadwal_piket
Konfig:   pengaturan_jam_presensi, kalender_akademik
```

Detail ERD selengkapnya: [docs/04-erd-database.md](https://github.com/SMA-UII-Yogyakarta/aksesekolah/blob/main/docs/04-erd-database.md)

---

## API Endpoints

> Dokumentasi API lengkap akan menyusul (OpenAPI/Swagger).

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/login` | SSO Authentication |
| `POST` | `/api/logout` | Logout + revoke token |
| `GET` | `/api/user` | Profil pengguna saat ini |
| `POST` | `/api/presensi` | Submit presensi (foto + GPS) |
| `GET` | `/api/presensi/riwayat` | Riwayat presensi siswa |
| `POST` | `/api/izin` | Ajukan izin (wali murid) |
| `GET` | `/api/izin/pending` | Daftar izin pending (wali kelas) |
| `PATCH` | `/api/izin/{id}/verifikasi` | Approve/reject izin |
| `GET` | `/api/monitoring?kelas=` | Monitoring real-time (guru piket) |
| `GET` | `/api/laporan?format=` | Export PDF/Excel |

---

## Pengembangan

### Menambahkan Fitur Baru

```bash
git checkout develop
git checkout -b feature/nama-fitur
# ... coding ...
git push origin feature/nama-fitur
# Buat Pull Request ke branch develop
```

### Menjalankan Test

```bash
php artisan test
```

### Coding Style

```bash
./vendor/bin/pint  # Laravel Pint (PSR-12)
```

---

## Contributing

1. Fork repositori ini
2. Buat branch fitur: `git checkout -b feature/awesome-feature`
3. Commit perubahan: `git commit -m 'feat: tambah fitur awesome'`
4. Push ke branch: `git push origin feature/awesome-feature`
5. Buat Pull Request

Pastikan test tetap hijau dan kode sesuai standar PSR-12.

---

## Lisensi

Proyek ini dikembangkan untuk **SMA UII Yogyakarta** di bawah lisensi MIT.

---

<div align="center">
  <p>
    <a href="https://github.com/SMA-UII-Yogyakarta/aksesekolah">📚 Monorepo</a> •
    <a href="https://github.com/SMA-UII-Yogyakarta">🏫 Organization</a>
  </p>
  <p><sub>Dikembangkan oleh Tim Pengembang SMA UII Yogyakarta</sub></p>
</div>
