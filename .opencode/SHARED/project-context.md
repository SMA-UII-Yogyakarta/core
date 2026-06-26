# Project Context — SMAUII Core (Backend Laravel)

## Ringkasan
Backend API untuk SMART Absen SMA UII — sistem presensi digital dengan geolokasi, swafoto kamera, dan SSO.

## Tech Stack
- **Framework**: Laravel 13
- **PHP**: 8.4.22 NTS (VS17 x64) — rekomendasi terbaik untuk Laravel 13
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

## Instalasi KAEDE (untuk anggota tim)
KAEDE bukan bagian dari project ini — ia alat global yang diinstal terpisah:
1. Clone `git@github.com:konxc/kaede-powerup.git`
2. `node scripts/kaede.mjs install` — salin ke `~/.kaede/`, daftarkan MCP global
3. `node scripts/kaede.mjs setup` — isi Trello API Key & Token (tersimpan di `~/.config/kaede/secrets.env`)
4. Verifikasi: `kaede status --mcp`

Jangan simpan `secrets.env` di folder project. Gunakan global config `~/.config/kaede/secrets.env`.

## KAEDE Workflow (AI Agent)
Dua MCP server terdaftar global di `~/.config/opencode/opencode.json`:

| Server | Tools | Fungsi |
|---|---|---|
| `mcp.kaede` | 4 tools | Context & planning — `parse_playbook`, `bundle_context`, `generate_plan`, `status` |
| `mcp.trello` | 24 tools | Eksekusi — CRUD board/list/card/label/member |

**Wajib chain workflow** (jangan bypass):
1. `mcp.kaede.bundle_context` — muat playbook + openkb + opencode
2. `mcp.kaede.generate_plan(goal, playbook)` → dapat `ActionStep[]` (nama, bukan ID)
3. `mcp.trello.get_board_lists`, `mcp.trello.search_members`, dll — resolve nama → ID
4. `mcp.trello.create_card`, `mcp.trello.move_card`, dll — eksekusi dengan ID

**16 intent patterns** didukung `generate_plan`: mulai sprint, buat card, assign, pindah, pindah semua, komentar, report, tutup sprint, buat label, arsipkan, buat board, hapus anggota, tambah label, arsip list, update card, buat checklist.

Catatan: CLI `kaede run` masih tersedia untuk eksekusi cepat langsung tanpa chain.

## Tim
| Person | Role |
|---|---|
| sandikodev | Project Manager & Lead Developer |
| Fathan Mubina | Junior Developer |
| Ihsan | Junior Developer |
