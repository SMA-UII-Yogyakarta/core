# Panduan Data Seeding & Kredensial Pengujian (QA & UAT Testing Guide)

> **Dokumen Resmi Kredensial Mockup & Skenario Pengujian Sistem SMART Absen SMA UII Yogyakarta**  
> **Target Audiens:** Tim Pengembang (Dev), QA Engineer / Tester, serta Tim Penguji Sekolah (Pimpinan, Guru, Staf TU, Wali Murid, Siswa)  
> **Status Data:** 100% Data Tiruan / Mockup Sintetis (Aman & Mematuhi UU PDP)

---

## 📌 1. Informasi Umum & Akses Sistem

Seluruh data di dalam sistem telah diatur dengan akun tiruan (*mockup personas*) yang mencerminkan struktur nyata SMA UII Yogyakarta.

* **URL Akses Lokal:** `http://localhost:8800` (atau `http://smauii-core.test`)
* **URL Akses Preview Demo:** `https://preview.smauiiyk.sch.id`
* **Password Default Semua Akun:** `password`

---

## 👥 2. Katalog Akun Persona & Skenario UAT

### 2.1. Role Administrator & Manajemen Sekolah (`role: admin`)

Gunakan akun ini untuk menguji manajemen master data, pengaturan jam presensi, kalender akademik, dan ekspor laporan.

| Username | Password | Nama Lengkap | Jabatan / Peran | Fokus Skenario UAT |
|---|---|---|---|---|
| **`admin`** | `password` | Administrator Utama | IT Superadmin | Akses penuh seluruh modul master data, pengaturan sistem, dan audit log. |
| **`kepsek`** | `password` | Dra. Hj. Mulyani, M.Pd. | Kepala Sekolah | Tinjauan statistik kehadiran sekolah, grafik tren semester, dan unduh laporan rekap. |
| **`kurikulum`**| `password` | Ir. H. Bambang Sujatmiko, M.T. | Wakasek Kurikulum | Pengaturan kalender akademik, hari libur, dan jadwal aktif presensi. |
| **`kesiswaan`**| `password` | Drs. H. Ahmad Sudrajat, M.Si. | Wakasek Kesiswaan | Monitoring perizinan siswa, rekapitulasi ketidakhadiran, dan broadcast notifikasi. |
| **`tatausaha`**| `password` | Siti Nurjanah, S.E. | Staf Tata Usaha | Manajemen data siswa, guru, rombel kelas, dan unduh laporan PDF/Excel. |

---

### 2.2. Role Guru Piket Harian (`role: teacher` | `type: piket`)

Gunakan akun ini untuk menguji dashboard pemantauan langsung (*live attendance monitoring*) dan aksi koreksi presensi.

| Hari Piket | Username | Password | Nama Guru & Gelar | Tugas Utama |
|---|---|---|---|---|
| **Senin** | **`dimas_kom`** | `password` | Dimas Arya, S.Kom., M.Cs. | Guru TIK & Lab Komputer (Piket Senin) |
| **Selasa** | **`hendra_pjok`**| `password` | Hendra Wijaya, S.Pd.Kor. | Guru PJOK (Piket Selasa) |
| **Rabu** | **`nurul_seni`** | `password` | Nurul Hidayati, S.Sn. | Guru Seni Budaya (Piket Rabu) |
| **Kamis** | **`fitria_bk`** | `password` | Fitria Rahmawati, S.Psi., M.Psi. | Guru Bimbingan Konseling (Piket Kamis) |
| **Jumat** | **`agus_sej`** | `password` | Agus Prasetyo, S.Pd. | Guru Sejarah Indonesia (Piket Jumat) |

**Skenario UAT Guru Piket:**
1. Login sebagai `dimas_kom` pada hari Senin.
2. Buka **Dashboard Guru Piket** (`/teacher/duty/dashboard`).
3. Periksa statistik kehadiran real-time hari ini (Hadir, Terlambat, Izin, Alpha).
4. Gunakan fitur **Filter Kelas** untuk melihat kehadiran per rombel.
5. Uji tombol **Koreksi Presensi** melalui *Interactive Drawer*.

---

### 2.3. Role Guru Wali Kelas (`role: teacher` | `type: wali`)

Gunakan akun ini untuk menguji verifikasi perizinan siswa (Approve/Reject) dan rekap perwalian.

| Kelas Perwalian | Username | Password | Nama Wali Kelas | Email Akun |
|---|---|---|---|---|
| **X-A (Fase E - 1)** | **`budi`** | `password` | Budi Hartono, S.Pd. | `budi@smauii.sch.id` |
| **X-B (Fase E - 2)** | **`siti`** | `password` | Siti Aisyah, S.Ag., M.Pd.I. | `siti@smauii.sch.id` |
| **X-C (Tahfidz)** | **`ustadz_ihsan`** | `password` | Ustadz Muhammad Ihsan, Lc., M.H. | `ihsan.tahfidz@smauii.sch.id` |
| **XI-MIPA 1 (Sains 1)**| **`andi`** | `password` | Andi Pratama, S.Pd., M.Hum. | `andi@smauii.sch.id` |
| **XI-MIPA 2 (Sains 2)**| **`dewi`** | `password` | Dwi Lestari, S.Pd., M.Si. | `dewi@smauii.sch.id` |
| **XI-IPS 1 (Sosial 1)** | **`rudi`** | `password` | Rudi Hermawan, S.Si., M.Pd. | `rudi@smauii.sch.id` |
| **XI-IPS 2 (Sosial 2)** | **`g_ahmad`** | `password` | Ahmad Fauzi, S.Pd. | `ahmad.fauzi@smauii.sch.id` |
| **XII-MIPA 1 (Sains Akhir)**| **`g_rina`**| `password` | Rina Wati, S.Pd., M.A. | `rina.wati@smauii.sch.id` |
| **XII-IPS 1 (Sosial Akhir 1)**| **`eko_n`** | `password` | Eko Nugroho, S.Sos., M.Pd. | `eko.nugroho@smauii.sch.id` |
| **XII-IPS 2 (Sosial Akhir 2)**| **`tri_w`** | `password` | Tri Wahyuni, S.E., M.M. | `tri.wahyuni@smauii.sch.id` |

**Skenario UAT Wali Kelas:**
1. Login sebagai `budi` (Wali Kelas X-A).
2. Masuk ke menu **Verifikasi Izin** (`/teacher/leave-verification`).
3. Periksa daftar pengajuan izin dari siswa kelas X-A.
4. Buka detail surat izin melalui *Drawer Verifikasi* dan klik tombol **Setujui (Approve)** atau **Tolak (Reject)** dengan alasan.

---

### 2.4. Role Orang Tua / Wali Murid (`role: guardian`)

Gunakan akun ini untuk menguji portal orang tua, pengajuan izin digital, serta pemantauan presensi anak.

| Username | Password | Nama Wali Murid | Kontak WA | Siswa yang Terhubung |
|---|---|---|---|---|
| **`wahyu`** | `password` | Ir. Wahyu Hidayat, M.T. | `081223344551` | • Ahmad Reza Pahlevi (`X-A`)<br>• Utami Rahayu Ningsih (`XI-IPS 1`) |
| **`sri`** | `password` | Dr. Dra. Sri Rahayu, M.Si. | `081324354652` | • Clarissa Maharani (`X-A`)<br>• Vina Marvina Salsabila (`XI-IPS 1`) |
| **`hendro`** | `password` | Hendro Gunawan, S.E. | `081535465753` | • Budi Santoso (`X-A`)<br>• Wawan Setiawan Aji (`XI-IPS 1`) |
| **`titin`** | `password` | Titin Supriyatin, S.Pd. | `081746576854` | • Diana Putri Lestari (`X-A`)<br>• Yoga Pratama Yudha (`XI-IPS 1`) |
| **`agus_w`** | `password` | Agus Salim, S.Kom. | `081957687955` | • Eko Prasetyo Utomo (`X-B`)<br>• Zahra Alifia Zahir (`XI-IPS 2`) |
| **`nurul_w`**| `password` | Nurul Hidayah, S.Farm., Apt.| `082168798056` | • Fitri Handayani (`X-B`)<br>• Arya Bagus Sudewa (`XI-IPS 2`) |

**Skenario UAT Wali Murid:**
1. Login sebagai `wahyu`.
2. Pada dashboard, uji fitur **Switch Anak** (antara Ahmad di X-A dan Utami di XI-IPS 1).
3. Buka menu **Pengajuan Izin** (`/guardian/leave-application`).
4. Isi formulir izin (kategori Sakit/Acara, tanggal mulai-selesai, keterangan, dan upload dokumen pendukung PDF/Gambar).
5. Buka menu **Riwayat Presensi** (`/guardian/history`) untuk melihat grafik rekapitulasi kehadiran anak.

---

### 2.5. Role Siswa (`role: student`)

Gunakan akun ini untuk menguji presensi mandiri dengan foto selfie dan geolokasi.

| Username | Password | NIS | NISN | Nama Siswa | Kelas |
|---|---|:---:|:---:|---|---|
| **`ahmad`** | `password` | `24250001` | `0081234501` | Ahmad Reza Pahlevi | X-A (Fase E - 1) |
| **`clara`** | `password` | `24250002` | `0081234502` | Clarissa Maharani | X-A (Fase E - 1) |
| **`eko`** | `password` | `24250005` | `0081234505` | Eko Prasetyo Utomo | X-B (Fase E - 2) |
| **`irvan`** | `password` | `24250009` | `0081234509` | Muhammad Irvan Maulana | X-C (Tahfidz) |
| **`miftah`** | `password` | `23240001` | `0071234601` | Miftahul Huda Jannah | XI-MIPA 1 (Sains 1) |
| **`qori`** | `password` | `23240005` | `0071234605` | Qori Amalia Fauziah | XI-MIPA 2 (Sains 2) |
| **`utami`** | `password` | `23240009` | `0071234609` | Utami Rahayu Ningsih | XI-IPS 1 (Sosial 1) |
| **`danang_s`**| `password` | `22230001` | `0061234701` | Danang Tri Wicaksono | XII-MIPA 1 (Sains Akhir) |
| **`haris_s`** | `password` | `22230005` | `0061234705` | Haris Firmansyah | XII-IPS 1 (Sosial Akhir 1) |
| **`latif_s`** | `password` | `22230009` | `0061234709` | Latif Nur Rohman | XII-IPS 2 (Sosial Akhir 2) |

**Skenario UAT Siswa:**
1. Login sebagai `ahmad`.
2. Buka menu **Presensi Mandiri** (`/student/attendance`).
3. Izinkan akses kamera dan lokasi browser.
4. Lakukan pengambilan foto selfie dan kirim presensi.
5. Buka menu **Riwayat Saya** (`/student/history`) untuk memeriksa status kehadiran.

---

## 🏫 3. Data Master Pendukung & Parameter Sekolah

### 3.1. Rombongan Belajar (10 Kelas Aktif)
* **Kelas X (Fase E):** `X-A (Fase E - 1)`, `X-B (Fase E - 2)`, `X-C (Fase E - Tahfidz)`
* **Kelas XI (Fase F):** `XI-MIPA 1`, `XI-MIPA 2`, `XI-IPS 1`, `XI-IPS 2`
* **Kelas XII (Fase F):** `XII-MIPA 1`, `XII-IPS 1`, `XII-IPS 2`

### 3.2. Geofence & Titik Koordinat Presensi
* **Lokasi Sekolah:** SMA UII Yogyakarta, Jl. Sorowajan Baru, Banguntapan, Bantul, D.I. Yogyakarta
* **Latitude Pusat:** `-7.797061`
* **Longitude Pusat:** `110.399583`
* **Radius Validasi:** 50 - 100 meter

### 3.3. Jam Operasional Presensi (Senin - Jumat)
* **Buka Presensi Tepat Waktu:** `06:30:00 WIB`
* **Batas Terlambat (*Late Threshold*):** `07:00:00 WIB`
* **Tutup Presensi:** `07:30:00 WIB`

---

## 🔄 4. Panduan Reset Database ke Data Awal

Jika tester atau pengembang ingin mengembalikan database ke kondisi awal yang bersih (*fresh state*):

```bash
# Melalui Docker Container (VPS / Server Preview)
docker exec core-app-1 php artisan migrate:fresh --seed

# Atau melalui Host Terminal lokal (Laragon / Makefile)
make fresh
```

### 4.1. Seeder Presensi Hari Ini (`SEED_TODAY_ATTENDANCE`)

Secara default seeder **tidak** membuat presensi untuk tanggal sekarang, sehingga demo kamera/lokasi siswa tetap bisa dicoba secara live di hari tersebut. Untuk menguji **Dashboard Wali Kelas** (tabel *Perhatian Khusus Hari Ini*), aktifkan presensi hari ini via variabel lingkungan sebelum re-seed:

```dotenv
# .env (lokal / testing — jangan commit ke repository)
SEED_TODAY_ATTENDANCE=true
```

```bash
php artisan migrate:fresh --seed
```

**Yang di-seed saat flag aktif:**
* Presensi hari ini untuk seluruh siswa aktif (masuk ke dalam pita ambang batas yang suara alamiah via loop probabilistik).
* Kurasi penuh **kelas X-A** agar tabel Perhatian Khusus merepresentasikan seluruh status: ALPA streak `3×` (NIS `24250006`, `24250020`), ALPA `1×` (NIS `24250010`), pengajuan izin **Pending** (TERTUNDA), izin **Approved** (DIIZINKAN), **TERLAMBAT**, serta mayoritas sisanya hadir tepat waktu. Siswa dengan izin Pending/Approved hari itu sengaja **tidak** diberi presensi.

> Gunakan akun `budi` (Wali Kelas X-A) untuk memverifikasi tabel ini di `/teacher/homeroom`. Set `SEED_TODAY_ATTENDANCE=false` (atau hapus dari `.env`) untuk mengembalikan perilaku seeding default.
