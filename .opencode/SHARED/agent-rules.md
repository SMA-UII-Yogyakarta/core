# Agent Rules — SMAUII Core

## General Rules
- Use English for all code, comments, documentation, and communication
- Answer concisely, straight to the point
- Follow existing code patterns
- Don't add comments unless asked
- If unsure, ask first

## Commit Convention
```
feat:     New feature
fix:      Bug fix
docs:     Documentation
chore:    Maintenance
refactor: Code refactoring
test:     Adding tests
```

## Laravel Conventions
- Route: web.php (Inertia pages), api.php (API Sanctum)
- Controller: single action → __invoke for simple cases
- View: Inertia::render in controller → React component in resources/js/Pages/
- Validation: Form Request
- Database: migration + seeder
- Eloquent: eager loading (prevent N+1)
- Testing: PHPUnit

## Frontend Conventions (Inertia + React + TypeScript)
- Use TypeScript for all frontend files (.tsx / .ts)
- Pages: resources/js/Pages/{PageName}.tsx — one file per route
- Components: resources/js/Components/{Name}.tsx — reusable
- Layouts: resources/js/Layouts/{Name}.tsx — layout wrapper
- Types: resources/js/types/*.ts — shared types
- Use bun for package management (not npm)
- Run Vite dev server: `bun run dev`
- Build production: `bun run build`

## KAEDE Workflow Rules
- **MANDATORY** call `mcp.kaede.generate_plan` before executing Trello — do not call Trello tools directly without a plan
- **MANDATORY** resolve name → ID via `mcp.trello.get_*` tools before execution (plan only has names)
- If `generate_plan` returns error/unknown intent, ask the user first, don't guess
- CLI `kaede run` = quick bypass (without generate_plan), use only if user requests directly

## Security
- Do not commit `.env`, keys, tokens, passwords
- Validate & sanitize user input
- Prepared statements via Eloquent

## Role & Authorization Conventions (D1/ADR — Accepted Opsi A)
- **Single source of truth**: kolom `users.role` (`admin|teacher|student|guardian`) adalah satu-satunya tempat menulis peran pengguna.
- **Spatie roles = derived cache**: Spatie roles diturunkan otomatis via hook `User::syncRoleFromColumn()` (panggil `$user->syncRoleFromColumn()` setelah mengubah `role`; otomatis dijalankan di `saved` event).
- **JANGAN** panggil `assignRole()` / `syncRoles()` / `removeRole()` secara manual di service/import/controller — gunakan hook.
- **Guard selalu `web`**: User model punya `protected string $guard_name = 'web'`. Semua `hasRole()` / `syncRoles()` memakai guard `web` eksplisit. Jangan hapus property ini tanpa mengganti semua `hasRole` jadi `$user->hasRole('role', 'web')`.
- **Test guard rail**: `UserRoleConsistencyTest` menjamin kolom↔Spatie sinkron untuk 4 role, survival di konteks `auth:sanctum`, tak ada duplikat role.
