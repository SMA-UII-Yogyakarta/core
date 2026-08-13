# Deployment & Strategi Subdomain — SMAUII Core

> Dokumen ini mencatat keputusan arsitektur & strategi deploy. Terakhir diperbarui: 2026-08-12.

## 1. Posisi Arsitektur

**smauii-core adalah aplikasi backend berbasis Laravel** yang saat ini masih **fullstack** (backend + frontend Inertia/React dalam satu repo). **Belum ada urgensi frontend terpisah** (Next.js / React Native / Flutter).

### Roadmap

| Fase | Stack | Subdomain |
|---|---|---|
| **Sekarang — Preview/Demo** | Laravel fullstack (Inertia) | `https://preview.smauiiyk.sch.id` |
| **Masa depan — Production** | Laravel fullstack | `https://app.smauiiyk.sch.id` |
| **Masa depan — Backend terpisah** | Laravel API murni | `https://api.smauiiyk.sch.id/{v0,v1,v1.1,…}` |

Ketika backend dipisah nanti:

- `app.smauiiyk.sch.id` → **frontend webapp** (Next.js / SPA).
- `api.smauiiyk.sch.id/{v0,v1,v1.1,…}` → **backend API** dengan **versi via path prefix**. Rilis API mempertahankan kompatibilitas untuk minimal satu versi sebelumnya (contoh: `v1` masih jalan saat `v1.1` rilis).

## 2. Peta Environment & Subdomain

| Environment | URL | Keterangan |
|---|---|---|
| Local dev | `http://localhost:8800` | Docker (`make dev`), aset via Vite HMR `:5173` |
| Preview/Demo | `https://preview.smauiiyk.sch.id` | **Fase saat ini** — bukan production |
| Production | `https://app.smauiiyk.sch.id` | Fullstack, deploy saat siap production |
| API (masa depan) | `https://api.smauiiyk.sch.id/{v0,v1,…}` | Backend terpisah |

> **Catatan:** `app.smauiiyk.sch.id` **tidak dipakai untuk preview** karena: (1) saat ini ditempati entry SvelteKit **Aksesekolah** (repo `aksesekolah`), dan (2) nama tersebut di-*reserve* untuk frontend SMAUII Core saat production. Preview memakai `preview.smauiiyk.sch.id` agar tidak mengklaim nama permanen.

## 3. Struktur Docker Compose

Compose dipecah menjadi **base + overlay** (tanpa duplikasi):

| File | Isi |
|---|---|
| `docker-compose.yml` | **Base** — `app`, `pgsql`, `redis`, `rustfs`, `mailpit`. App tidak publish port host (`expose: 8000`), join network `nginx-net` (external) agar nginx-proxy bisa resolve `core-app-1`. |
| `docker-compose.dev.yml` | **Dev** — app publish `127.0.0.1:${APP_PORT:-8800}` + service `bun` (Vite HMR `:5173`). |
| `docker-compose.prod.yml` | **Prod** — `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` = subdomain aktif, mount `env/.env.production`, tambah service `worker` (queue) & `schedule`. |
| `env/.env.production` | Env Laravel untuk production (**gitignored**). Template: `env/.env.production.example`. |

Perintah utama:

```bash
make dev          # dev: up base+dev
make down
make prod-up      # prod: rm public/hot → bun run build → up base+prod --build
make prod-down
make prod-logs    # tail app worker schedule
```

### 3.1. Strategi Object Storage (S3 / RustFS / MinIO / Cloudflare R2)

Sistem SMART Absen SMA UII menyimpan foto presensi siswa (terkompresi WebP/JPEG) dan dokumen surat izin (PDF/JPG) pada storage berbasis S3 API:

| Lingkungan | Storage Engine | Endpoint / Port | Keterangan & Alasan |
|---|---|---|---|
| **Development (Lerd / Docker)** | **RustFS** *(Primary)* | `http://rustfs:9000` (host: `:9000`, console: `:9091`) | **Wajib/Utama** — Kompatibel secara *native* dengan `lerd`, ultra-ringan, konsumsi memori sangat hemat (< 20MB RAM), performa tinggi berbasis Rust. |
| **Development (Alternative)** | **MinIO** *(Optional)* | `http://minio:9000` (console: `:8900`) | Opsi alternatif jika developer memiliki instalasi MinIO yang sudah berjalan di host lokal. |
| **Self-Hosted Preview / Demo** | **RustFS** *(Self-Hosted)* | `http://rustfs:9000` | Berjalan di VPS host ini via service `rustfs` di `docker-compose.yml` dengan persistent volume `rustfs_data`. |
| **Production Cloud Target** | **AWS S3** / **Cloudflare R2** | Endpoint Cloud (`r2.cloudflarestorage.com` / `s3.amazonaws.com`) | Target rilis multi-region dengan zero egress fee (Cloudflare R2) atau high durability AWS S3 + CloudFront CDN. |

### Hubungan dengan lerd (Podman)

**Docker Compose dev adalah *alternatif* dari `lerd`** — dev environment berbasis **Podman** yang menjadi standar tim di repo ini (lihat `CONTRIBUTING.md` → `composer setup` / `composer dev`). Keduanya sama-sama containerized, tinggal pilih sesuai engine yang tersedia di host:

| | **lerd** (Podman) | **Docker Compose dev** |
|---|---|---|
| Engine | Podman (rootless) | Docker Engine |
| Entry point | `composer setup` / `composer dev` | `make dev` |
| Toolchain | php, composer, bun, pint, phpstan via container lerd | service `app` + `bun` di compose |
| DB / Redis / S3 / mail | disediakan host (Laragon/NeonDB/RustFS) | built-in: `pgsql`, `redis`, `rustfs`, `mailpit` |
| Vite HMR | via `composer dev` (concurrent) | service `bun` di compose |

Fungsional untuk development **setara** — tidak wajib keduanya. Aturan umum: **lerd** = standar tim & CI; **Docker Compose** = opsi nyaman di host yang sudah menjalankan Docker (mis. VPS ini), dan wajib dipakai untuk **production** via overlay `docker-compose.prod.yml`.

## 4. Alur Deploy Preview (pertama kali)

1. **DNS** — tambah A record `preview.smauiiyk.sch.id` → `202.162.40.162` di registrar.
2. **SSL** — issue sertifikat:
   ```bash
   certbot certonly --webroot -w /var/www/certbot -d preview.smauiiyk.sch.id
   ```
3. **Reload nginx** — conf sudah tersedia: `infrastructure/nginx/conf.d/smauii/preview.conf`:
   ```bash
   aws nginx reload
   ```
4. **Up stack**:
   ```bash
   make prod-up
   ```

Data DB dipertahankan antar-mode karena memakai volume `core_pgsql_data`.

## 5. Migrasi ke Production (`app.smauiiyk.sch.id`)

Saat fullstack siap production:

1. Pindahkan entry Aksesekolah keluar dari `app.smauiiyk.sch.id` (misal ke `home.smauiiyk.sch.id`).
2. Ubah `APP_URL` di **dua tempat** agar sama:
   - `docker-compose.prod.yml` → `APP_URL: https://app.smauiiyk.sch.id`
   - `env/.env.production` → `APP_URL=https://app.smauiiyk.sch.id`
3. Buat nginx conf `conf.d/smauii/app.conf` (copy `preview.conf`, ganti `server_name` + path cert).
4. DNS `app.smauiiyk.sch.id` → VPS IP, certbot, `aws nginx reload`, `make prod-up`.

## 6. Migrasi ke Backend Terpisah (masa depan)

1. `app.smauiiyk.sch.id` → deploy frontend webapp (Next.js).
2. `api.smauiiyk.sch.id` → deploy backend API. Versioning via path prefix: `api.smauiiyk.sch.id/v0`, `api.smauiiyk.sch.id/v1`, `v1.1`, dst.
3. Compose prod menyesuaikan (tanpa Inertia pages / hanya endpoint API + auth).
4. `trustProxies` sudah diset di `bootstrap/app.php` (RFC1918) sehingga skema HTTPS & IP asli benar di belakang nginx-proxy.

## 7. Catatan Penting

- **Jangan pakai `${APP_URL:-...}` di compose** — `APP_URL` di root `.env` akan di-interpolasi compose (nilai `localhost:8800`) dan menimpa default. Di `docker-compose.prod.yml` nilai APP_URL di-**hardcode**.
- **`public/hot` harus dihapus sebelum mode production** — kalau ada, Laravel menyangka mode dev dan memuat aset dari `:5173`. `make prod-up` sudah otomatis menghapusnya.
- Semua port host di-bind ke `127.0.0.1` saja; akses publik hanya lewat nginx-proxy.
- Aplikasi non-root (`USER app`, uid 1000) di container; `ulimits core: 0` mencegah core dump.
