# 🛡️ DX Developer Safety & Audit Compliance System

Dokumen ini menjelaskan sistem pengamanan standar pengembang (**Developer Experience & Safety Gate**) pada proyek **SMA UII Yogyakarta**.

Sistem ini dirancang untuk memastikan bahwa setiap pengembang (**Ihsan, Azis, Sandikodev, Fathan, Hanif, dan seluruh tim dev**) secara otomatis menjalankan validasi tipe, pengujian, dan analisis statis **sebelum melalukan Commit, Push, dan Pull Request (PR)/Merge**.

---

## 🏗️ 1. Alur Pengamanan Otomatis (Git Hooks)

```mermaid
graph TD
    subgraph Git Pre-Commit Guard (Local Staging)
        Commit["git commit"] --> C1["1. TypeScript Check (bun run typecheck)"]
        C1 --> C2["2. ESLint Check (bun run lint)"]
        C2 --> C3["3. PHP Pint Style Check (pint --test)"]
        C3 --> PassCommit["Commit Disetujui ✅"]
    end

    subgraph Git Pre-Push Guard (Full Testing Suite)
        Push["git push"] --> P1["1. Vitest Unit Suite (bun run test)"]
        P1 --> P2["2. Vite Build Compilation (bun run build)"]
        P2 --> P3["3. PHPStan Static Analysis (phpstan analyse)"]
        P4 --> P5["5. PHP Pint Style Check (pint --test)"]
        P5 --> PassPush["Push Disetujui & PR Siap ✅"]
    end
```

---

## 🚀 2. Cara Kerja Pre-Commit & Pre-Push Hooks

### A. Automatic Pre-Commit Check (`.husky/pre-commit`)
Saat pengembang menjalankan `git commit -m "..."`:
1. **TypeScript Typecheck**: Memastikan `bun run typecheck` 0 error.
2. **Frontend ESLint**: Memastikan `bun run lint` 0 error linting.
3. **PHP Pint Style**: Memastikan format kode PHP mematuhi PSR-12.

### B. Automatic Pre-Push Check (`.husky/pre-push`)
Saat pengembang menjalankan `git push origin <branch>`:
1. **Vitest Unit Suite**: Menjalankan seluruh pengujian unit React/Inertia (`bun run test`).
2. **Vite Production Build**: Memastikan kompilasi bundel aset `bun run build` sukses 100%.
3. **PHPStan Static Analysis**: Memeriksa tipe data statis PHP (`./vendor/bin/phpstan analyse`).
4. **PHPUnit Feature Tests**: Menjalankan seluruh 180+ test suite Laravel (`php artisan test`).
5. **PHP Pint Style**: Memvalidasi standar format PHP.

---

## ⚠️ 3. Aturan Dilema Terdesak & Audit Skip (Skip Governance)

Dalam situasi terdesak (*misal: hotfix darurat saat server down*), pengembang diizinkan melewati pengujian otomatis **DENGAN SYARAT Wajib Memberikan Alasan (Reason)** yang dicatat secara permanen ke dalam **Audit Trail Log**.

### A. Cara Melakukan Skip Pre-Commit
Jika terpaksa melewati pre-commit check:
```bash
SKIP_HOOKS=1 SKIP_REASON="Urgent hotfix perbaikan staging server" git commit -m "fix(hotfix): patch critical issue"
```

### B. Cara Melakukan Skip Pre-Push
Jika terpaksa melewati pre-push full testing:
```bash
SKIP_PUSH_TESTS=1 SKIP_REASON="Hotfix darurat terverifikasi manual" git push origin feat/urgent-fix
```

> ❌ **Jika pengembang mencoba skip TANPA menyertakan `SKIP_REASON`**:  
> Sistem akan menolak commit/push dengan pesan error:  
> `[ERROR] Mandatory skip reason required! Please provide SKIP_REASON environment variable.`

---

## 📝 4. Audit Trail Log (`storage/logs/git_skip_audit.log`)

Setiap tindakan skip akan dicatat secara otomatis dalam format log audit:

```text
[2026-08-18 13:20:00] DEVELOPER: Sandikodev (androxoss@hotmail.com) | STAGE: PRE-COMMIT | REASON: "Urgent hotfix perbaikan staging server"
[2026-08-18 13:25:00] DEVELOPER: Ihsan (ihsan@smauii.sch.id) | STAGE: PRE-PUSH | REASON: "Hotfix darurat terverifikasi manual"
```

Log ini memastikan seluruh tim (**Ihsan, Azis, Sandikodev, Fathan, Hanif**) tetap saling menyadari (*aware*), transparan, dan bertanggung jawab atas kualitas basis kode bersama.
