SAIL       := ./vendor/bin/sail
COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml

# ── Development (Laravel Sail) ────────────────
# Sail adalah interface utama untuk development (termasuk laragon/Windows).
# Setelah bootstrap pertama, semua perintah dev memakai SAIL.
up: dev

dev:
	$(SAIL) up -d

down:
	$(SAIL) down

build:
	$(SAIL) build app --no-cache

frontend-build:
	bun run build

restart: down dev

# ── Bootstrap (fresh clone) ───────────────────
# Hack khusus host tanpa PHP 8.4 di mesin host: Sail membutuhkan
# `vendor/` agar script `./vendor/bin/sail` ada. Bangun stack dulu,
# install composer di dalam container, lalu lanjut via Sail.
setup:
	$(COMPOSE_DEV) up -d --build
	$(COMPOSE_DEV) exec app composer install --no-interaction
	$(SAIL) artisan key:generate --ansi
	$(SAIL) artisan migrate --seed

# ── Tooling (via Sail) ────────────────────────
artisan:
	$(SAIL) artisan $(cmd)

composer:
	$(SAIL) composer $(cmd)

migrate:
	$(SAIL) artisan migrate

fresh:
	$(SAIL) artisan migrate:fresh --seed

queue:
	$(SAIL) artisan queue:listen --tries=1 --timeout=0

test:
	$(SAIL) test

shell:
	$(SAIL) shell

logs:
	$(SAIL) logs -f app

psql:
	$(SAIL) psql

# ── Production ────────────────────────────────
# Production TIDAK memakai Sail — overlay terpisah (docker-compose.prod.yml)
# + env file khusus. Sail khusus development saja.
# prod-up: Build image production (termasuk frontend di dalam Docker multi-stage)
# TIDAK perlu `bun run build` manual — sudah di-handle oleh Dockerfile.prod stage 1
prod-up:
	rm -f public/hot
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down

prod-restart: prod-down prod-up

prod-logs:
	$(COMPOSE_PROD) logs -f app worker schedule

# prod-fresh: Clean deploy — down + hapus volume DB + up + migrate:fresh + seed
# ⚠️  HATI-HATI: Menghapus semua data database!
prod-fresh:
	$(COMPOSE_PROD) down -v
	rm -f public/hot
	$(COMPOSE_PROD) up -d --build
	@echo "Waiting for app container to be healthy..."
	@until docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app php artisan --version > /dev/null 2>&1; do \
		echo "  ... container not ready yet, retrying in 3s"; \
		sleep 3; \
	done
	$(COMPOSE_PROD) exec app php artisan migrate:fresh --seed --force

# prod-migrate: Deploy ulang tanpa hapus data (aman untuk update)
prod-migrate:
	$(COMPOSE_PROD) exec app php artisan migrate --force
	$(COMPOSE_PROD) exec app php artisan config:clear
	$(COMPOSE_PROD) exec app php artisan cache:clear
	$(COMPOSE_PROD) exec app php artisan route:clear
	$(COMPOSE_PROD) exec app php artisan view:clear

# prod-shell: Masuk ke shell container production
prod-shell:
	$(COMPOSE_PROD) exec app sh

# prod-log-laravel: Tail laravel.log langsung (bersih, tanpa noise webhook)
prod-log-laravel:
	$(COMPOSE_PROD) exec app tail -f /var/www/html/storage/logs/laravel.log

.PHONY: up dev down build frontend-build restart \
        setup artisan composer migrate fresh queue test shell logs psql \
        prod-up prod-down prod-restart prod-logs prod-fresh prod-migrate prod-shell prod-log-laravel