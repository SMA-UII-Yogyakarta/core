<div align="center">
  <h1>⚡ SMAUII Core</h1>
  <p><strong>Backend API — SMART Absen SMA UII</strong></p>
  <p><em>Integrated Digital Attendance System with Geolocation, Camera Biometrics &amp; SSO</em></p>

  <p align="center">
    <img src="https://img.shields.io/badge/laravel-13-F9322C?style=flat-square&logo=laravel" />
    <img src="https://img.shields.io/badge/php-8.4-777BB4?style=flat-square&logo=php" />
    <img src="https://img.shields.io/badge/inertia-3-6F4E9E?style=flat-square&logo=inertia" />
    <img src="https://img.shields.io/badge/react-19-61DAFB?style=flat-square&logo=react" />
    <img src="https://img.shields.io/badge/typescript-5-3178C6?style=flat-square&logo=typescript" />
    <img src="https://img.shields.io/badge/postgresql-16-4169E1?style=flat-square&logo=postgresql" />
    <img src="https://img.shields.io/badge/redis-7-FF4438?style=flat-square&logo=redis" />
    <img src="https://img.shields.io/badge/license-MIT-d63031?style=flat-square" />
  </p>

  <p align="center">
    <a href="https://SMA-UII-Yogyakarta.github.io/aksesekolah"><img src="https://img.shields.io/badge/🌐_docs-GitHub_Pages-2ea44f?style=flat-square" /></a>
    <a href="#environment-setup">Setup</a> •
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#api-endpoints">API</a>
  </p>
</div>

---

This repository is the **main backend** of the **SMART Absen SMA UII** system — a digital attendance application that enables students to check in via selfie and geolocation, guardians to submit leave requests digitally, and teachers to monitor attendance in real-time.

> This repository is a **git submodule** of [`SMA-UII-Yogyakarta/aksesekolah`](https://github.com/SMA-UII-Yogyakarta/aksesekolah) at `apps/backend/`.

---

## Features

- **SSO & Central IdP Hub** — Single Sign-On and Master Data / Dapodik terpusat untuk ekosistem SMA UII: Moodle (`elearning.smauiiyk.sch.id`), SLiMS Library (`library.smauiiyk.sch.id`), dan Digital Lab (`lab.smauiiyk.sch.id`). Lihat [Panduan Integrasi Ekosistem](docs/ECOSYSTEM-INTEGRATION-DAPODIK-SSO.md).
- **Live Attendance** — Selfie + geolocation with client-side image compression (≤20 KB)
- **Triple-Layer Validation** — Academic calendar + active day + time range checks
- **Role-Based Access Control** — Admin, Student, Guardian, Homeroom Teacher, Duty Teacher
- **Master Data Management** — CRUD Student/Teacher/Class + Excel import/export
- **Leave Submission & Verification** — Digital permission with document upload
- **Real-Time Monitoring** — Duty Teacher dashboard with class filter
- **Export Reports** — PDF & Excel (daily/monthly/semester)
- **Object Storage** — Media files stored in S3-compatible storage (RustFS for native Lerd dev & self-hosted preview, AWS S3 / Cloudflare R2 for production)
- **100% Mobile Responsive** — Tailwind CSS 4 + Vite

---

## Environment Setup

### Prerequisites

| Tool | Version | Description |
|---|---|---|
| [Laragon](https://laragon.org) | 6.0+ | Development environment (required) |
| PHP | 8.4+ | Included with Laragon — select PHP 8.4 from Laragon menu |
| PostgreSQL | 16+ | Via NeonDB or Laragon add-on |
| Composer | latest | Portable at `C:\laragon\bin\composer` |
| [Bun](https://bun.sh) | 1.3+ | JS package manager & runtime — `powershell -c "irm bun.sh/install.ps1 | iex"` (Win) / `curl -fsSL https://bun.sh/install | bash` (Mac/Linux) |

### Installation

```bash
# Clone to Laragon document root
cd C:\laragon\www
git clone git@github.com:SMA-UII-Yogyakarta/core.git smauii-core

# Install PHP dependencies
composer install

# Setup environment
cp .env.example .env
# — edit .env, adjust database credentials —

# Generate app key
php artisan key:generate

# Install frontend dependencies (use bun, not npm)
bun install

# Build frontend assets
bun run build

# Run migration + seeder
php artisan migrate --seed
```

### .env Configuration

```env
APP_NAME="SMAUII Core"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://smauii-core.test

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smauii_core
DB_USERNAME=postgres
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### Access Application

Open `http://smauii-core.test` (or `http://localhost:8800`) in your browser.

> 📖 **Testing & QA Reference Guide:**  
> Untuk kredensial akun uji coba (Admin, Guru Piket, Wali Kelas, Wali Murid, Siswa) dan skenario UAT lengkap, baca **[Panduan Data Seeding & Kredensial Pengujian (QA & UAT Testing Guide)](docs/SEED-DATA-TESTING-GUIDE.md)**.

### Docker & Laravel Sail (recommended for development)

**Laravel Sail** is the dedicated interface for local development — on Linux, `lerd` (podman), or Windows/Laragon. All day-to-day commands go through `./vendor/bin/sail`, so the whole team runs the exact same workflow regardless of OS. Compose is split into a base file plus environment overlays:

| File | Purpose |
|---|---|
| `docker-compose.yml` | Base stack — `app`, `pgsql`, `redis`, `rustfs`, `mailpit` |
| `docker-compose.dev.yml` | Dev overlay — host port + Vite HMR (`bun`) |
| `docker-compose.prod.yml` | Prod overlay — production env, queue `worker` + `schedule` |

> `docker-compose.yml` has a top-level `name: core-dev`, so `./vendor/bin/sail up -d` brings up the same dev stack with no extra flags. Service/container names differ from Sail defaults, hence these required `.env` values: `APP_SERVICE=app`, `APP_USER=app`, `WWWUSER=1000`, `WWWGROUP=1000`.

**Quick start (fresh clone):**

```bash
# Host is on PHP 8.4 (e.g. Laragon/Windows with Git Bash or WSL2):
composer install
cp .env.example .env   # pilih konfigurasi SAIL (lihat komentar di file)
php artisan key:generate
./vendor/bin/sail up -d

# Host without PHP 8.4 (Linux): bootstrap vendor/ inside the container first
make setup               # = compose up --build → composer install → key → migrate --seed
```

**Day-to-day (via Sail):**

```bash
./vendor/bin/sail up -d               # start stack (http://localhost:8800, HMR :5173)
./vendor/bin/sail test                # PHPUnit (316 tests / 1509 assertions, sqlite :memory:)
./vendor/bin/sail artisan migrate     # Laravel artisan
./vendor/bin/sail pint --test         # PSR-12
./vendor/bin/sail bin phpstan analyse --memory-limit=2G
./vendor/bin/sail psql                # psql ke pgsql:smauii_core
./vendor/bin/sail redis redis-cli ping
```

Frontend tooling stays on its dedicated `bun` service (Vite HMR runs automatically on `up`); there is no node/bun inside the PHP image, so use the host `bun` CLI (or `docker compose exec bun ...`) for frontend tasks.

**Production** does NOT use Sail — it uses the prod overlay directly:

```bash
make prod-up       # production (build assets, then up base+prod)
make prod-migrate  # migrate tanpa hapus data
```

> Docker/lerd: development is containerized regardless of environment (`lerd` = the team's Podman dev environment: `composer setup` / `composer dev`). On Linux, Sail runs on top of Docker and is functionally equivalent; production always deploys via the `prod` overlay above.

Subdomain strategy, deploy steps (DNS/certbot/nginx), and the roadmap to a split backend (`app.` frontend / `api.smauiiyk.sch.id/{v0,v1,…}` backend) are documented in **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

---

## Architecture

### Monorepo Relationship

```
aksesekolah.git (monorepo entrypoint)
└── apps/backend/ → submodule → core.git (this repository)
```

Developers can clone `core.git` directly into Laragon for daily development. Monorepo maintainers handle submodule synchronization.

### Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Laravel 13 |
| **PHP** | 8.4.22 NTS (VS17 x64) |
| **Database** | PostgreSQL 16 (NeonDB) |
| **Cache & Queue** | Redis / Database driver |
| **Object Storage** | S3-compatible (**RustFS** / MinIO / Cloudflare R2 / AWS S3) |
| **Web Server** | Apache 2.4 (dev) / Nginx (prod) |
| **Frontend** | InertiaJS 3 + React 19 + TypeScript + Tailwind CSS 4 + Vite 8 |
| **Package Manager** | [Bun](https://bun.sh) |
| **Auth** | Laravel Sanctum (SSO / IdP) |

### Frontend Structure

```
resources/
├── js/
│   ├── app.tsx                 # Inertia + React entry point
│   ├── Pages/                  # Pages (one file per route)
│   │   └── Welcome.tsx
│   ├── Components/             # Reusable components
│   ├── Layouts/                # Layout wrappers
│   │   └── AppLayout.tsx
│   └── types/                  # TypeScript definitions
│       ├── index.ts
│       ├── global.d.ts
│       └── inertia.d.ts
├── css/
│   └── app.css                 # Tailwind CSS 4
└── views/
    └── app.blade.php           # Inertia root template
```

### Database Structure (10 Tables)

```
Core:     users → students, teachers, guardians, school_classes
Transactions: attendances, leave_requests, duty_schedules
Config:   attendance_time_settings, academic_calendars
```

Full ERD details: [docs/04-erd-database.md](https://github.com/SMA-UII-Yogyakarta/aksesekolah/blob/main/docs/04-erd-database.md)

---

## API Endpoints

> Full API documentation coming soon (OpenAPI/Swagger).

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/login` | SSO Authentication |
| `POST` | `/api/logout` | Logout + revoke token |
| `GET` | `/api/user` | Current user profile |
| `POST` | `/api/presensi` | Submit attendance (photo + GPS) |
| `GET` | `/api/presensi/riwayat` | Student attendance history |
| `POST` | `/api/izin` | Submit leave request (guardian) |
| `GET` | `/api/izin/pending` | Pending leave requests (homeroom teacher) |
| `PATCH` | `/api/izin/{id}/verifikasi` | Approve/reject leave request |
| `GET` | `/api/monitoring?kelas=` | Real-time monitoring (duty teacher) |
| `GET` | `/api/laporan?format=` | Export PDF/Excel |

---

## Development

### Dev Server (Hot Reload)

```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev (with hot reload)
bun run dev
```

Or run all (server + queue + logs + vite) at once:

```bash
composer run dev
```

### Platform Notes

> **Development is optimized for Linux.** Windows (Laragon) is supported for local setup, but all team members are strongly encouraged to use Linux (WSL2, Ubuntu, or similar) for a more professional, reliable, and robust development experience. Some tools (e.g. `pcntl` for `php artisan pail`) are Unix-only; a Windows-compatible `php artisan log:tail` fallback is provided.

### Adding New Features

```bash
git checkout develop
git checkout -b feature/feature-name
# ... coding ...
git push origin feature/feature-name
# Create Pull Request to develop branch
```

### Running Tests & Quality Assurance

```bash
# 1. Backend PHPUnit Tests (160 tests)
php artisan test

# 2. Fast TypeScript Schema Tests (Bun Test)
bun run test:bun

# 3. Component & Accessibility Tests (Vitest + Axe-Core)
bun run test

# 4. Playwright E2E Browser Testing (Virtual Camera & GPS Geofence)
bun run test:e2e

# 5. Typecheck & Linting
bun run typecheck
bun run lint
```

📖 **Detailed Testing Manual:** See [`docs/TESTING-GUIDE.md`](docs/TESTING-GUIDE.md) and [`docs/SEED-DATA-TESTING-GUIDE.md`](docs/SEED-DATA-TESTING-GUIDE.md).

### Design System & Storybook (WCAG 2.1 AA)

```bash
# Run Storybook Component Explorer (Port 6006)
bun run storybook

# Build Production Storybook Static Assets
bun run build-storybook
```

🎨 **Design System & Architecture Guide:** See [`docs/DESIGN-SYSTEM-STORYBOOK.md`](docs/DESIGN-SYSTEM-STORYBOOK.md).

### Coding Style

```bash
./vendor/bin/pint  # Laravel Pint (PSR-12)
bun run format     # Biome Formatter
```

---

## Contributing

1. Fork this repository
2. Create a feature branch: `git checkout -b feature/awesome-feature`
3. Commit changes: `git commit -m 'feat: add awesome feature'`
4. Push to branch: `git push origin feature/awesome-feature`
5. Create a Pull Request

Make sure tests stay green and code follows PSR-12 standards.

---

## License

This project is developed by **PT Koneksi Jaringan Indonesia** (*Software House — Agency Koneksi Digital*) as the official technology development partner of **SMA UII Yogyakarta** and is licensed under the MIT license.

> **Copyright** — Source code © 2025–2026 PT Koneksi Jaringan Indonesia. All rights reserved. The source code is provided for the operational purposes of SMA UII Yogyakarta. **IT IS PROHIBITED** to sell, redistribute, or use outside the SMA UII Yogyakarta environment without written permission from PT Koneksi Jaringan Indonesia and SMA UII Yogyakarta. Credit remains with PT Koneksi Jaringan Indonesia to maintain authenticity and prevent illegal third-party resale outside the agreement.

---

<div align="center">
  <p>
    <a href="https://github.com/SMA-UII-Yogyakarta/aksesekolah">📚 Monorepo</a> •
    <a href="https://github.com/SMA-UII-Yogyakarta">🏫 Organization</a> •
    <a href="https://SMA-UII-Yogyakarta.github.io/aksesekolah">🌐 Online Documentation</a>
  </p>
  <p><sub>PT Koneksi Jaringan Indonesia — Software House Agency Koneksi Digital</sub></p>
</div>
