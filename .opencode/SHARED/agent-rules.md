# Agent Rules — SMAUII Core

## Aturan Umum
- Gunakan bahasa Indonesia
- Jawab ringkas, langsung ke titik
- Ikuti pattern kode yang sudah ada
- Jangan tambah komentar kecuali diminta
- Jika ragu, tanya dulu

## Konvensi Commit
```
feat:      Fitur baru
fix:       Perbaikan bug
docs:      Dokumentasi
chore:     Maintenance
refactor:  Refaktor kode
test:      Penambahan test
```

## Laravel Conventions
- Route: web.php (Inertia pages), api.php (API Sanctum)
- Controller: single action → __invoke untuk simple cases
- View: Inertia::render di controller → React component di resources/js/Pages/
- Validation: Form Request
- Database: migration + seeder
- Eloquent: eager loading (cegah N+1)
- Testing: PHPUnit

## Frontend Conventions (Inertia + React + TypeScript)
- Gunakan TypeScript untuk semua file frontend (.tsx / .ts)
- Pages: resources/js/Pages/{NamaPage}.tsx — satu file per route
- Components: resources/js/Components/{Nama}.tsx — reusable
- Layouts: resources/js/Layouts/{Nama}.tsx — layout wrapper
- Types: resources/js/types/*.ts — tipe data bersama
- Gunakan bun untuk package management (bukan npm)
- Jalankan Vite dev server: `bun run dev`
- Build production: `bun run build`

## KAEDE Workflow Rules
- **WAJIB** panggil `mcp.kaede.generate_plan` sebelum eksekusi Trello — jangan panggil Trello tools langsung tanpa plan
- **WAJIB** resolve nama → ID via `mcp.trello.get_*` tools sebelum eksekusi (plan cuma punya nama)
- Jika `generate_plan` return error/unknown intent, tanya user dulu, jangan tebak
- CLI `kaede run` = quick bypass (tanpa generate_plan), gunakan hanya jika user minta langsung

## Keamanan
- Jangan commit `.env`, key, token, password
- Input user divalidasi & di-sanitize
- Prepared statements via Eloquent
