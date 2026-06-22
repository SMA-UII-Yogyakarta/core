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
- Route: web.php (Blade), api.php (API Sanctum)
- Controller: single action → __invoke untuk simple cases
- Validation: Form Request
- Database: migration + seeder
- Eloquent: eager loading (cegah N+1)
- Testing: PHPUnit

## Keamanan
- Jangan commit `.env`, key, token, password
- Input user divalidasi & di-sanitize
- Prepared statements via Eloquent
