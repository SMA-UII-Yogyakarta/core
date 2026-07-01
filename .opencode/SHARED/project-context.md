# Project Context — SMAUII Core (Backend Laravel)

## Summary
Backend API for SMART Absen SMA UII — a digital attendance system with geolocation, camera selfie, and SSO.

## Tech Stack
- **Framework**: Laravel 13
- **PHP**: 8.4.22 NTS (VS17 x64) — best recommendation for Laravel 13
- **Database**: PostgreSQL 16 (NeonDB production) / SQLite (testing)
- **Cache & Queue**: Redis / Database driver
- **Object Storage**: S3-compatible (Wasabi / MinIO)
- **Frontend**: InertiaJS 3 + React 19 + TypeScript, Tailwind CSS 4, Vite 8
- **Package Manager**: Bun
- **Auth**: Laravel Sanctum (SSO / Identity Provider)

## Database (10 tables)
- **Master**: users, students, teachers, guardians, school_classes
- **Transactions**: attendances, leave_requests, duty_schedules
- **Configuration**: attendance_time_settings, academic_calendars

## Conventions
- Route: web.php (Inertia pages), api.php (API Sanctum)
- Controller: single action → `__invoke` for simple cases; dual controller (Web + API)
- Service Layer: logic in `app/Services/`, thin controller
- View: Inertia::render in controller → React component in resources/js/Pages/
- Validation: Form Request
- Database: migration + seeder
- Eloquent: eager loading (prevent N+1)
- Testing: PHPUnit

## Important Rules
1. All `main` changes must go through PR with at least 1 review
2. Commits must use Conventional Commits
3. Coding style: PSR-12 (Laravel Pint) for PHP
4. Tests must pass before merge
5. `.env`, keys, tokens must not be committed
6. Credit belongs to PT Koneksi Jaringan Indonesia
7. Use **bun** (not npm) for frontend package management
8. Service Layer pattern — don't put logic in controllers
9. Dual controller — Web (Inertia session) + API (Sanctum token)
10. PostgreSQL database — don't use MySQL-specific syntax

## KAEDE Installation (for team members)
KAEDE is not part of this project — it is a globally installed tool:
1. Clone `git@github.com:konxc/kaede-powerup.git`
2. `node scripts/kaede.mjs install` — copy to `~/.kaede/`, register global MCP
3. `node scripts/kaede.mjs setup` — fill in Trello API Key & Token (stored in `~/.config/kaede/secrets.env`)
4. Verify: `kaede status --mcp`

Don't save `secrets.env` in the project folder. Use global config `~/.config/kaede/secrets.env`.

## KAEDE Workflow (AI Agent)
Two MCP servers registered globally in `~/.config/opencode/opencode.json`:

| Server | Tools | Function |
|---|---|---|
| `mcp.kaede` | 4 tools | Context & planning — `parse_playbook`, `bundle_context`, `generate_plan`, `status` |
| `mcp.trello` | 24 tools | Execution — CRUD board/list/card/label/member |

**Mandatory workflow chain** (do not bypass):
1. `mcp.kaede.bundle_context` — load playbook + openkb + opencode
2. `mcp.kaede.generate_plan(goal, playbook)` → get `ActionStep[]` (names, not IDs)
3. `mcp.trello.get_board_lists`, `mcp.trello.search_members`, etc. — resolve names → IDs
4. `mcp.trello.create_card`, `mcp.trello.move_card`, etc. — execute with IDs

**16 intent patterns** supported by `generate_plan`: start sprint, create card, assign, move, move all, comment, report, close sprint, create label, archive, create board, remove member, add label, archive list, update card, create checklist.

Note: CLI `kaede run` is still available for quick direct execution without the chain.

## Tim
| Person | Role |
|---|---|
| sandikodev | Project Manager & Lead Developer |
| Fathan Mubina | Junior Frontend Developer (Inertia/React/TS) |
| Ihsan | Junior Backend Developer (Laravel/PostgreSQL) |
| Azis | Learning Mentor |
