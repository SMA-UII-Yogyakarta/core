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

- **SSO Identity Provider** — Single sign-on for the entire SMA UII ecosystem (Laravel Sanctum)
- **Live Attendance** — Selfie + geolocation with client-side image compression (≤20 KB)
- **Triple-Layer Validation** — Academic calendar + active day + time range checks
- **Role-Based Access Control** — Admin, Student, Guardian, Homeroom Teacher, Duty Teacher
- **Master Data Management** — CRUD Student/Teacher/Class + Excel import/export
- **Leave Submission & Verification** — Digital permission with document upload
- **Real-Time Monitoring** — Duty Teacher dashboard with class filter
- **Export Reports** — PDF & Excel (daily/monthly/semester)
- **Object Storage** — Media files stored in S3-compatible storage, not in the database
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

Open `http://smauii-core.test` in your browser.

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
| **Object Storage** | S3-compatible (Wasabi / MinIO) |
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

### Adding New Features

```bash
git checkout develop
git checkout -b feature/feature-name
# ... coding ...
git push origin feature/nama-fitur
# Create Pull Request to develop branch
```

### Running Tests

```bash
php artisan test
```

### Coding Style

```bash
./vendor/bin/pint  # Laravel Pint (PSR-12)
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
