# ADR — Sumber Kebenaran Role: Kolom `users.role` vs Spatie

Tanggal: 2026-09-11. Status: **Accepted — Opsi A** (keputusan diambil 2026-09-11).

## Keputusan
- **Opsi A dipilih**: kolom `users.role` adalah single source of truth; Spatie roles diturunkan (derived) via hook `User::syncRoleFromColumn()`. Perubahan role dilakukan hanya lewat kolom `role`.
- Guard rail diwujudkan di `tests/Feature/UserRoleConsistencyTest.php` (6 test, 26 assertions) — menutup 4 role: `hasRole('X','web')`, `guard_name='web'`, pergantian role menghapus role lama, update tak terkait tidak menyentuh Spatie, survive konteks request `auth:sanctum`, dan tidak ada duplikat role setelah multi-save.
- Aturan "role hanya via kolom" ditambahkan ke konvensi tim: jangan panggil `assignRole`/`syncRoles` langsung — gunakan hook (selalu sinkron otomatis).

## Keputusan yang Diperlukan
- [x] Setuju A? (atau pilih B — butuh alokasi migrasi) — **Opsi A**
- [x] Setuju menulis aturan "role hanya via kolom" ke konvensi tim? — **Ya**

## Konteks

Saat ini otorisasi berlapis 3 yang saling tumpang tindih:

1. **Kolom `users.role`** (`admin|teacher|student|guardian`) — dipakai `PermissionRegistry`, seluruh `*Policy`, `CheckRole` (middleware `role:admin,...`), dan nav (HandleInertiaRequests).
2. **Spatie roles** (tabel `roles` / `model_has_roles`) — dipakai `role:admin` (API), `TelescopeServiceProvider::hasRole('admin')`.
3. **User model hook** `syncRoleFromColumn()` — menjaga Spatie **diturunkan** (derived) dari kolom `role` di setiap `save`.

Akar BUG-1 (`GuardDoesNotMatch`) adalah konteks guard: middleware `auth:sanctum` mengubah `config('auth.defaults.guard')` → `sanctum` selama request, sedangkan Spatie sanggup hilang jangkar guard `web`. Perbaikan menambal dengan `User::$guard_name = 'web'`.

Risiko utama bukan hanya sinkronisasi — melainkan dua kode otorisasi yang harus menjawab pertanyaan sama ("user ini peran apa?") dengan dua jawaban berbeda jika drift terjadi.

## Opsi

| Opsi | Deskripsi | Konsekuensi |
|---|---|---|
| **A. Kolom sebagai single-source (rekomendasi)** | `users.role` = SUMBER. Spatie = turunan (via hook, seperti sekarang). Semua otorisasi membaca kolom. | • Perubahan role 1 tempat. • Spatie tetap berguna utk grup middleware + Telescope. • Perlu: test konsistensi kolom↔Spatie; larang write Spatie di luar hook. |
| **B. Spatie-only** | Hapus kolom `role`; semua baca Spatie; `PermissionRegistry`/policies pakai `hasRole`. | • Satu sumber di Spatie. • Migrasi besar: kolom dipakai 15+ berkas; guard harus dipatok (fiksasi `$guard_name`) supaya BUG-1 tak berulang. • Rugi: query/perbandingan kolom lebih murah & kebaca. |
| **C. Status quo + guard test saja** | Biarkan 3 lapis, hanya tambah test konsistensi. | • Paling cepat, tapi drift bisa lolos lagi di titik penulisan baru. |

## Rekomendasi

**Pilih A** karena arsitektur saat ini *sudah* mengarah ke sana (hook menurunkan Spatie dari kolom), sehingga langkahnya kecil dan non-destruktif:

1. Resmikan arah: tulis aturan "role bertulis hanya lewat kolom `users.role`; jangan panggil `assignRole/syncRoles` manual" ke `AGENTS.md`/convention.
2. Application service (login/idp) membungkus perubahan role via `User::syncRoleFromColumn()` (memakai guard eksplisit) — sudah ada.
3. Tambah **test konsistensi**: setelah store/update/import, asersi `users.role === roles[0].name` dan `guard_name === 'web'` (sebagian sudah ada).
4. Patok `User::$guard_name = 'web'` — jaga agar jangan dihapus tanpa mengganti semua `hasRole` dengan guard eksplisit.
5. Jika kelak muncul kebutuhan role dinamis/Spatie-native, pindahkan bertahap ke B (bukan C) via fitur permission di PermissionRegistry.

**Tolak C** (berhenti di status quo) karena meninggalkan dua sumber tanpa hasil — penyebab kelas bug seperti BUG-1.