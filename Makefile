COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml

# ── Development ─────────────────────────────────────────────
up: dev

dev:
	$(COMPOSE_DEV) up -d

down:
	$(COMPOSE_DEV) down

build:
	docker compose build app --no-cache

frontend-build:
	bun run build

restart: down dev

# ── Production ──────────────────────────────────────────────
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

# ── Tooling (dev stack) ─────────────────────────────────────
artisan:
	$(COMPOSE_DEV) exec app php artisan $(cmd)

composer:
	$(COMPOSE_DEV) exec app composer $(cmd)

migrate:
	$(COMPOSE_DEV) exec app php artisan migrate

fresh:
	$(COMPOSE_DEV) exec app php artisan migrate:fresh --seed

queue:
	$(COMPOSE_DEV) exec app php artisan queue:listen --tries=1 --timeout=0

test:
	$(COMPOSE_DEV) exec app php artisan test

bash:
	$(COMPOSE_DEV) exec app sh

logs:
	$(COMPOSE_DEV) logs -f app

psql:
	$(COMPOSE_DEV) exec pgsql psql -U sail -d smauii_core

setup: dev
	$(COMPOSE_DEV) exec app composer install --no-interaction
	$(COMPOSE_DEV) exec app php artisan key:generate --ansi
	$(COMPOSE_DEV) exec app php artisan migrate --seed

.PHONY: up dev down build frontend-build restart \
        prod-up prod-down prod-restart prod-logs prod-fresh prod-migrate prod-shell prod-log-laravel \
        artisan composer migrate fresh queue test bash logs psql setup
