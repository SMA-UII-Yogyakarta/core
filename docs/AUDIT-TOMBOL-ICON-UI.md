# Audit Tombol dan Ikon UI

Snapshot audit: 11 September 2026.

## Cakupan

Audit mencakup seluruh `resources/js/Components`, `resources/js/Pages`, layout, modal/drawer, tabel, pagination, form, serta tombol header pada role Admin, Guru/Wali Kelas, Guru Piket, Wali Murid, dan Siswa.

Hasil inventory awal:

- 339 deklarasi tombol JSX pada source dan test/story terkait.
- 73 file production yang mengandung tombol.
- Primitive utama: `Button`, `ActionButton`, `TabSwitcher`, `Pagination`, `MobileNativePagination`, `PhotoPeekButton`, dan beberapa kelompok tombol export/import/filter lokal.
- Ikon saat ini konsisten menggunakan `react-icons/fi`, tetapi ukuran, warna, target sentuh, label aksesibilitas, dan struktur wrapper masih bervariasi.

## Peta aksi berdasarkan konteks pengguna

### Admin

- Navigasi dan role: menu, role switcher, logout, notifikasi.
- Master data: tambah, detail, edit, hapus, pilih/bulk select, import CSV, filter, pencarian, pagination.
- Assignment/enrolment: hubungkan, lepaskan, pilih kelas, kembali ke daftar.
- Presensi: filter, koreksi, reset, verifikasi.
- Hari libur dan pengaturan: tambah, edit, hapus, simpan, reset, test koneksi/integrasi.
- Laporan: filter, pilih periode/kelas, ekspor PDF/Excel, pagination.

### Guru/Wali Kelas/Guru Piket

- Verifikasi izin: filter, detail dokumen, setujui, tolak, tutup modal.
- Presensi piket: refresh, detail siswa, aksi presensi.
- Laporan kelas: tab periode, filter, ekspor, lihat foto/bukti, pagination.

### Wali Murid

- Pengajuan izin: tambah pengajuan, kirim, lampirkan dokumen, lihat PDF/foto, batalkan/tutup.
- Riwayat: filter periode, lihat bukti, pagination.

### Siswa

- Presensi aktif: mulai/ambil lokasi, ambil foto, kirim presensi, ulangi, tutup.
- Riwayat/dashboard: filter tanggal, lihat selfie, pagination.

## Temuan struktural

1. Tombol aksi umum masih banyak ditulis sebagai HTML + Tailwind lokal. Akibatnya ukuran `h-7`/`h-8`/`h-10`, radius, focus state, active state, dan warna tidak selalu sama.
2. Sebagian tombol icon-only sudah memiliki `aria-label`, tetapi belum memiliki primitive bersama sehingga target sentuh dan tooltip/title berbeda-beda.
3. Ditemukan tombol action tanpa `type="button"`; ini berisiko menjadi submit button ketika berada di dalam form. Semua temuan tersebut sudah diperbaiki pada batch ini.
4. `Button` sebelumnya tidak memberi default `type="button"` dan belum memiliki focus-visible ring standar. Fondasi tersebut sudah diperbaiki.
5. `ActionButton` dan tombol edit/hapus pada `MasterDataCard` memiliki styling paralel. `MasterDataCard` sekarang memakai `ActionButton`.
6. Tombol penutup Modal, BottomSheet, serta kontrol clear/calendar DatePicker sebelumnya memiliki markup lokal berbeda. Fondasi `IconButton` baru sudah dipakai pada komponen-komponen tersebut.
7. `TabSwitcher` dan pagination adalah primitive khusus, bukan tombol umum; keduanya harus mempertahankan semantics `role="tab"`, `aria-current`, dan label navigasi.
8. Ikon harus dipilih berdasarkan aksi, bukan sekadar dekorasi: `FiPlus` untuk create, `FiEdit2` untuk edit, `FiTrash2` untuk destructive delete, `FiFilter` untuk filtering, `FiDownload` untuk export, `FiCamera` untuk foto/selfie, dan chevron hanya untuk navigasi/dropdown.

## Kontrak UI yang dipakai setelah refaktor

- Tombol teks utama menggunakan `Button`.
- Tombol edit/hapus/detail pada row/card menggunakan `ActionButton`.
- Tombol icon-only menggunakan `IconButton` dan wajib menerima `label` yang menjelaskan aksi.
- Tombol submit form harus eksplisit `type="submit"`; tombol lain harus `type="button"`.
- Aksi destructive memakai variant danger dan harus melalui konfirmasi jika menghapus data.
- Icon-only minimum target normal adalah 32px; kontrol mobile/pagination memakai target 44px.
- Focus keyboard memakai `focus-visible:ring`, bukan menghapus outline secara global tanpa pengganti.
- Ikon dekoratif harus `aria-hidden` atau berada di dalam kontrol yang sudah memiliki accessible name.

## Perubahan batch ini

- Menambahkan `Components/ui/IconButton.tsx` dan mengekspornya dari barrel Components.
- Menstandarkan focus-visible dan default button type pada `Button`.
- Menstandarkan focus-visible/active state pada `ActionButton`.
- Memigrasikan tombol aksi `MasterDataCard` ke `ActionButton`.
- Memigrasikan kontrol close Modal/BottomSheet dan clear/calendar DatePicker ke `IconButton`.
- Menambahkan `type="button"` pada seluruh raw action button yang sebelumnya tidak eksplisit.

Audit lanjutan tetap perlu dilakukan secara bertahap pada halaman besar yang memiliki markup lokal kompleks, khususnya dashboard, form presensi live, drawer master data, notification action, dan halaman laporan lama. Refaktor berikutnya harus menggunakan primitive di atas, bukan membuat variant Tailwind baru di halaman.
