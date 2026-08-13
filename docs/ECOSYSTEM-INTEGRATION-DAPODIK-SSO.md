# Arsitektur Ekosistem Terpusat: SMAUII-Core sebagai Central IdP & Dapodik Sekolah

> **Dokumen Arsitektur & Spesifikasi Integrasi Sistem Terpusat SMA UII Yogyakarta**  
> **Terakhir Diperbarui:** Agustus 2026  
> **Penanggung Jawab Arsitektur:** Sandikodev (PM Lead & System Architect)

---

## 🏛️ 1. Visi & Posisi Strategis Arsitektur

Aplikasi **`smauii-core`** dirancang bukan hanya sebagai backend presensi digital (*SMART Absen*), melainkan sebagai **Master Data Hub & Central Identity Provider (IdP)** terpusat — setara sistem **Dapodik / SIAKAD** terintegrasi untuk seluruh ekosistem teknologi informasi di lingkungan **SMA UII Yogyakarta**.

Semua akun pengguna (Pimpinan Sekolah, Guru, Staf TU, Siswa, dan Wali Murid), struktur rombongan belajar (Kelas/Fase), jadwal akademik, dan hak akses dikelola secara terpusat (*Single Source of Truth*) di dalam `smauii-core`.

```
                        ┌─────────────────────────────────────────┐
                        │              SMAUII-CORE                │
                        │    Central Master Data Hub & IdP        │
                        │      (Laravel 13 + PostgreSQL)          │
                        └────────────────────┬────────────────────┘
                                             │
         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
         │                   │                               │                   │
         ▼                   ▼                               ▼                   ▼
┌─────────────────┐ ┌─────────────────┐             ┌─────────────────┐ ┌─────────────────┐
│   SMART Absen   │ │ Moodle E-Learning│             │ SLiMS Library   │ │   Digital Lab   │
│  (Multi-Role)   │ │ elearning.smauii │             │ library.smauii  │ │   lab.smauii    │
│  GPS & Selfie   │ │  LMS Terpadu    │             │ Perpustakaan    │ │ Workstation &   │
│  smauiiyk.sch.id│ │   (Container)   │             │   (Container)   │ │ Praktikum (Cont)│
└─────────────────┘ └─────────────────┘             └─────────────────┘ └─────────────────┘
```

---

## 🌐 2. Peta Subdomain & Integrasi 4 Platform Inti

| No | Platform | Subdomain | Engine / Stack | Peran Integrasi dengan `smauii-core` |
|:--:|---|---|---|---|
| **1** | **SMART Absen (Core)** | `preview.smauiiyk.sch.id` / `app.smauiiyk.sch.id` | Laravel 13 + Inertia + React + RustFS S3 | Presensi geolokasi GPS, foto biometrik selfie, pengajuan izin digital wali murid, dan dashboard guru piket & wali kelas. |
| **2** | **Moodle E-Learning** | `elearning.smauiiyk.sch.id` | Moodle LMS (PHP + PostgreSQL + Redis) | Platform pembelajaran digital SMA UII. Akun guru dan siswa disinkronkan otomatis dari `smauii-core`; siswa otomatis terdaftar (*enrolled*) pada mata pelajaran sesuai kelas/rombel. |
| **3** | **SLiMS Digital Library** | `library.smauiiyk.sch.id` | Senayan Library Management System (PHP + MariaDB) | Sistem sirkulasi & katalog perpustakaan digital sekolah. Nomor Anggota (*Member ID*) menggunakan NIS (Siswa) dan NIP/NUPTK (Guru/Staf) yang terdaftar di `smauii-core`. |
| **4** | **Digital Lab & Research** | `lab.smauiiyk.sch.id` | Lab Management Portal & Workstation Auth | Manajemen workstation komputer lab, jadwal praktikum IPA & TIK, serta akses riset siswa SMA UII. |

---

## 🔑 3. Mekanisme Single Sign-On (SSO) & Sinkronisasi Akun

### 3.1. Single Sign-On (SSO) via Laravel Sanctum & OAuth/OIDC
1. **Central Login Portal:** Seluruh pengguna masuk menggunakan satu set kredensial (NIS/NIP/Username + Password) yang tervalidasi di tabel `users` `smauii-core`.
2. **SSO Token Flow:**
   * Aplikasi eksternal (Moodle, SLiMS, Digital Lab) melakukan handshaking token autentikasi via REST API `/api/v1/login` atau OAuth2 / External Database Authentication.
   * `smauii-core` mengembalikan profile data beserta perannya (`role: admin | teacher | guardian | student`).

### 3.2. Skema Sinkronisasi Rombel & Enrolment Moodle
* Data rombel di `school_classes` (contoh: `X-A`, `XI-MIPA 1`, `XII-MIPA 1`) menjadi *Cohort* / *Course Category* di Moodle.
* Guru yang tercatat sebagai wali kelas atau guru mapel otomatis dijadikan *Teacher Role* pada mata pelajaran terkait.
* Siswa di `students` otomatis di-enrol ke dalam *Course* sesuai rombel aktifnya.

### 3.3. Skema Sinkronisasi Member SLiMS Perpustakaan
* **Member ID:** `$student->nis` atau `$teacher->teacher_code`.
* **Member Name:** `$user->name`.
* **Member Type:** `Siswa` / `Guru` / `Karyawan`.
* **Expiry Date:** Otomatis diset hingga tanggal kelulusan / akhir tahun ajaran aktif.

---

## 👥 4. Peta Akun & Data Simulasi Realistis SMA UII Yogyakarta

Database seeder `DatabaseSeeder.php` telah menyusun data komprehensif yang siap digunakan untuk demonstrasi, pengujian, maupun integrasi sistem:

### 4.1. Akun Manajemen & Pimpinan Sekolah (`role: admin`)
*Semua password default:* `password`

| Username | Nama Lengkap | Jabatan / Peran | Email |
|---|---|---|---|
| `admin` | Administrator Utama | IT Superadmin | `admin@smauii.sch.id` |
| `kepsek` | Dra. Hj. Mulyani, M.Pd. | Kepala Sekolah SMA UII | `kepsek@smauii.sch.id` |
| `kurikulum` | Ir. H. Bambang Sujatmiko, M.T. | Wakasek Kurikulum | `kurikulum@smauii.sch.id` |
| `kesiswaan` | Drs. H. Ahmad Sudrajat, M.Si. | Wakasek Kesiswaan | `kesiswaan@smauii.sch.id` |
| `tatausaha` | Siti Nurjanah, S.E. | Staf Tata Usaha | `tu@smauii.sch.id` |

---

### 4.2. Akun Guru & Tenaga Pengajar (`role: teacher`)

| Username | Nama Guru & Gelar | Kode Guru | Tipe Guru | Penugasan Kelas / Jadwal Piket |
|---|---|:---:|:---:|---|
| `budi` | Budi Hartono, S.Pd. | `TCH-001` | Wali Kelas | Wali Kelas `X-A (Fase E - 1)` & Piket Senin |
| `siti` | Siti Aisyah, S.Ag., M.Pd.I. | `TCH-002` | Wali Kelas | Wali Kelas `X-B (Fase E - 2)` & Piket Selasa |
| `andi` | Andi Pratama, S.Pd., M.Hum. | `TCH-003` | Wali Kelas | Wali Kelas `XI-MIPA 1 (Sains 1)` & Piket Rabu |
| `dewi` | Dwi Lestari, S.Pd., M.Si. | `TCH-004` | Wali Kelas | Wali Kelas `XI-MIPA 2 (Sains 2)` & Piket Kamis |
| `rudi` | Rudi Hermawan, S.Si., M.Pd. | `TCH-005` | Wali Kelas | Wali Kelas `XI-IPS 1 (Sosial 1)` |
| `g_ahmad` | Ahmad Fauzi, S.Pd. | `TCH-006` | Wali Kelas | Wali Kelas `XI-IPS 2 (Sosial 2)` |
| `g_rina` | Rina Wati, S.Pd., M.A. | `TCH-007` | Wali Kelas | Wali Kelas `XII-MIPA 1 (Sains Akhir)` |
| `eko_n` | Eko Nugroho, S.Sos., M.Pd. | `TCH-008` | Wali Kelas | Wali Kelas `XII-IPS 1 (Sosial Akhir 1)` |
| `tri_w` | Tri Wahyuni, S.E., M.M. | `TCH-009` | Wali Kelas | Wali Kelas `XII-IPS 2 (Sosial Akhir 2)` |
| `dimas_kom`| Dimas Arya, S.Kom., M.Cs. | `TCH-010` | Guru Piket | Guru TIK & Lab Komputer, Piket Senin |
| `hendra_pjok`| Hendra Wijaya, S.Pd.Kor. | `TCH-011` | Guru Piket | Guru PJOK, Piket Selasa |
| `nurul_seni` | Nurul Hidayati, S.Sn. | `TCH-012` | Guru Piket | Guru Seni Budaya, Piket Rabu |
| `fitria_bk` | Fitria Rahmawati, S.Psi., M.Psi.| `TCH-013`| Guru Piket | Guru BK, Piket Kamis |
| `agus_sej` | Agus Prasetyo, S.Pd. | `TCH-014` | Guru Piket | Guru Sejarah, Piket Jumat |
| `ustadz_ihsan`| Ustadz Muhammad Ihsan, Lc., M.H.| `TCH-015`| Wali & Piket | Wali `X-C Tahfidz` & Piket Jumat |

---

### 4.3. Sampel Akun Wali Murid (`role: guardian`)

| Username | Nama Wali Murid | No. Kontak (WA) | Alamat Domisili DIY | Siswa yang Terhubung |
|---|---|---|---|---|
| `wahyu` | Ir. Wahyu Hidayat, M.T. | `081223344551` | Jl. Kaliurang KM 14.5, Sleman | Ahmad Reza Pahlevi (X-A), Utami Rahayu (XI-IPS 1) |
| `sri` | Dr. Dra. Sri Rahayu, M.Si. | `081324354652` | Jl. Sorowajan Baru No. 12, Bantul | Clarissa Maharani (X-A), Vina Marvina (XI-IPS 1) |
| `hendro` | Hendro Gunawan, S.E. | `081535465753` | Purbayan, Kotagede, Yogyakarta | Budi Santoso (X-A), Wawan Setiawan (XI-IPS 1) |
| `titin` | Titin Supriyatin, S.Pd. | `081746576854` | Jl. Wonosari KM 7, Banguntapan | Diana Putri Lestari (X-A), Yoga Pratama (XI-IPS 1) |
| `agus_w` | Agus Salim, S.Kom. | `081957687955` | Jl. Gedongkuning No. 45, Kotagede | Eko Prasetyo Utomo (X-B), Zahra Alifia (XI-IPS 2) |
| `nurul_w` | Nurul Hidayah, S.Farm., Apt. | `082168798056` | Jl. Glagahsari No. 18, Umbulharjo | Fitri Handayani (X-B), Arya Bagus (XI-IPS 2) |

---

### 4.4. Sampel Akun Siswa (`role: student`)

| Username | NIS | NISN | Nama Siswa | Kelas / Tingkat | Status |
|---|:---:|:---:|---|---|:---:|
| `ahmad` | `24250001` | `0081234501` | Ahmad Reza Pahlevi | X-A (Fase E - 1) | Active |
| `clara` | `24250002` | `0081234502` | Clarissa Maharani | X-A (Fase E - 1) | Active |
| `eko` | `24250005` | `0081234505` | Eko Prasetyo Utomo | X-B (Fase E - 2) | Active |
| `irvan` | `24250009` | `0081234509` | Muhammad Irvan Maulana | X-C (Fase E - Tahfidz) | Active |
| `miftah` | `23240001` | `0071234601` | Miftahul Huda Jannah | XI-MIPA 1 (Sains 1) | Active |
| `qori` | `23240005` | `0071234605` | Qori Amalia Fauziah | XI-MIPA 2 (Sains 2) | Active |
| `utami` | `23240009` | `0071234609` | Utami Rahayu Ningsih | XI-IPS 1 (Sosial 1) | Active |
| `danang_s`| `22230001` | `0061234701` | Danang Tri Wicaksono | XII-MIPA 1 (Sains Akhir) | Active |
| `haris_s` | `22230005` | `0061234705` | Haris Firmansyah | XII-IPS 1 (Sosial Akhir 1) | Active |
| `latif_s` | `22230009` | `0061234709` | Latif Nur Rohman | XII-IPS 2 (Sosial Akhir 2) | Active |

---

## 📍 5. Data Presensi & Geofence SMA UII Yogyakarta

* **Titik Koordinat Pusat Sekolah:** Latitude `-7.797061`, Longitude `110.399583` (Kampus SMA UII, Jl. Sorowajan Baru, Banguntapan, Bantul).
* **Radius Validasi Presensi:** 50 s.d. 100 meter dari gerbang sekolah.
* **Presensi Historis:** Tersedia data 30 hari ke belakang untuk setiap siswa aktif dengan distribusi:
  * ~82% Hadir Tepat Waktu (`Present`, check-in pukul 06:35 - 06:55 WIB).
  * ~10% Terlambat (`Late`, check-in pukul 07:05 - 07:22 WIB).
  * ~8% Izin/Sakit/Alpha terhubung ke tabel `leave_requests`.

---

## 🛠️ 6. Cara Reset & Menjalankan Seeding

Untuk menyegarkan database lokal / VPS dengan seluruh dataset realistis di atas:

```bash
# Melalui Docker Container app
docker exec core-app-1 php artisan migrate:fresh --seed

# Atau via Makefile
make fresh
```
