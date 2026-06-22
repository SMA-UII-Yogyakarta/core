# Project Context — SMAUII Core (Backend Laravel)

## Ringkasan
Backend API untuk SMART Absen SMA UII — sistem presensi digital dengan geolokasi, swafoto kamera, dan SSO.

## Tech Stack
- **Framework**: Laravel 13
- **PHP**: 8.5.7 NTS (VS17 x64)
- **Database**: MySQL 8.0.30 (dev) / SQLite (testing)
- **Cache & Queue**: Redis / Database driver
- **Object Storage**: S3-compatible (Wasabi / MinIO)
- **Frontend**: Blade + Tailwind CSS 4 + Vite
- **Auth**: Laravel Sanctum (SSO / Identity Provider)

## Database (10 tabel)
- **Master**: users, siswa, guru, wali_murid, kelas
- **Transaksi**: presensi, pengajuan_izin, jadwal_piket
- **Konfigurasi**: pengaturan_jam_presensi, kalender_akademik

## Aturan Penting
1. Semua perubahan `main` harus via PR dengan minimal 1 review
2. Commit menggunakan Conventional Commits
3. Coding style: PSR-12 (Laravel Pint)
4. Test harus hijau sebelum merge
5. `.env`, key, token tidak boleh di-commit
6. Kredit milik PT Koneksi Jaringan Indonesia

## Tim
| Person | Role |
|---|---|
| sandikodev | Project Manager & Lead Developer |
| Fathan Mubina | Junior Developer |
| Ihsan | Junior Developer |
