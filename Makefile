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
prod-up:
	rm -f public/hot
	bun run build
	$(COMPOSE_PROD) up -d --build

prod-down:
	$(COMPOSE_PROD) down

prod-logs:
	$(COMPOSE_PROD) logs -f app worker schedule

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

.PHONY: up dev down build frontend-build restart prod-up prod-down prod-logs artisan composer migrate fresh queue test bash logs psql setup
