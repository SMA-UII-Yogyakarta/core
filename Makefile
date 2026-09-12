SAIL       := ./vendor/bin/sail
COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.yml -f docker-compose.prod.yml
# Bun hidup di service terpisah (docker-compose.dev.yml), bukan di image app.
# Semua perintah frontend dieksekusi di dalam container bun — tidak butuh bun host.
BUN := $(COMPOSE_DEV) exec bun bun

# ── Development (Laravel Sail) ────────────────
# Sail adalah interface utama untuk development (termasuk laragon/Windows).
# Setelah bootstrap pertama, semua perintah dev memakai SAIL.
# Konvensi target: <grup>:<aksi> (mis. frontend:build, prod:up, prod:log:app).

help: ## Show available make targets
	@echo "Usage: make <target>"
	@echo
	@grep -hE '^[a-zA-Z0-9_:\\.-]+:[^#]*##' $(MAKEFILE_LIST) \
	    | sed -E 's/\\//g; s/(.*):[[:space:]]*##[[:space:]]*/\1\t/' \
	    | sort

dev: ## Start dev stack (app + pgsql + redis + rustfs + bun HMR)
	$(SAIL) up -d

up: dev

down: ## Stop dev stack
	$(SAIL) down

build: ## Rebuild app image (--no-cache)
	$(SAIL) build app --no-cache

restart: down dev

# ── Frontend (container bun) ──────────────────
# Vite HMR otomatis berjalan saat `make dev` (service bun di dev overlay),
# jadi tidak ada target frontend:dev. Playwright e2e butuh browser binary → host-only,
# jadi tidak ada target frontend:test:e2e.
# Target frontend butuh stack up terlebih dahulu: `make dev`.

frontend\:build: ## Build frontend production assets (bun run build)
	$(BUN) run build

frontend\:typecheck: ## TypeScript check (bun run typecheck)
	$(BUN) run typecheck

frontend\:lint: ## ESLint (bun run lint)
	$(BUN) run lint

frontend\:test: ## Vitest + axe (bun run test)
	$(BUN) run test

frontend\:test\:bun: ## Bun schema/util tests (bun run test:bun)
	$(BUN) run test:bun

frontend\:format: ## Biome format (bun run format)
	$(BUN) run format

# ── Bootstrap (fresh clone) ───────────────────
# Host tanpa PHP 8.4: Sail butuh `vendor/` agar script `./vendor/bin/sail` ada.
# Bangun stack dulu, install composer + bun di dalam container, lalu lanjut via Sail.
setup: ## Bootstrap fresh clone (composer + bun install + key + migrate --seed)
	$(COMPOSE_DEV) up -d --build
	$(COMPOSE_DEV) exec app composer install --no-interaction
	$(BUN) install
	$(SAIL) artisan key:generate --ansi
	$(SAIL) artisan migrate --seed

# ── Tooling (via Sail) ────────────────────────
artisan: ## Run artisan (make artisan cmd="route:list")
	$(SAIL) artisan $(cmd)

composer: ## Run composer (make composer cmd="require x/y")
	$(SAIL) composer $(cmd)

migrate: ## Run DB migrations
	$(SAIL) artisan migrate

fresh: ## Reset DB + seed (WARNING: deletes all data)
	$(SAIL) artisan migrate:fresh --seed

queue: ## Start queue worker (foreground)
	$(SAIL) artisan queue:listen --tries=1 --timeout=0

test: ## PHPUnit suite via Sail
	$(SAIL) test

shell: ## Shell into app container
	$(SAIL) shell

logs: ## Tail app container logs
	$(SAIL) logs -f app

psql: ## psql into pgsql:smauii_core
	$(SAIL) psql

# ── Production (overlay docker-compose.prod.yml) ──
# Produksi TIDAK memakai Sail — overlay terpisah + env khusus (Sail khusus dev).
# Build assets sudah di-handle Dockerfile.prod stage 1 → tidak perlu bun manual.
prod\:up: ## Bring up production stack (Vite build inside Docker stage 1)
	rm -f public/hot
	$(COMPOSE_PROD) up -d --build

prod\:down: ## Stop production stack
	$(COMPOSE_PROD) down

prod\:restart: prod\:down prod\:up

prod\:logs: ## Tail prod logs (app worker schedule)
	$(COMPOSE_PROD) logs -f app worker schedule

prod\:log\:app: ## Tail prod app logs
	$(COMPOSE_PROD) logs -f app

prod\:log\:worker: ## Tail prod worker logs
	$(COMPOSE_PROD) logs -f worker

prod\:log\:schedule: ## Tail prod schedule logs
	$(COMPOSE_PROD) logs -f schedule

prod\:fresh: ## Clean redeploy (down -v + migrate:fresh --seed) — deletes data!
	$(COMPOSE_PROD) down -v
	rm -f public/hot
	$(COMPOSE_PROD) up -d --build
	@echo "Waiting for app container to be healthy..."
	@until docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app php artisan --version > /dev/null 2>&1; do \
		echo "  ... container not ready yet, retrying in 3s"; \
		sleep 3; \
	done
	$(COMPOSE_PROD) exec app php artisan migrate:fresh --seed --force

prod\:migrate: ## Migrate prod without data loss (aman untuk update)
	$(COMPOSE_PROD) exec app php artisan migrate --force
	$(COMPOSE_PROD) exec app php artisan config:clear
	$(COMPOSE_PROD) exec app php artisan cache:clear
	$(COMPOSE_PROD) exec app php artisan route:clear
	$(COMPOSE_PROD) exec app php artisan view:clear

prod\:shell: ## Shell into prod app container
	$(COMPOSE_PROD) exec app sh

prod\:log\:laravel: ## Tail laravel.log in prod container
	$(COMPOSE_PROD) exec app tail -f /var/www/html/storage/logs/laravel.log

.PHONY: help up dev down build restart \
        frontend\:build frontend\:typecheck frontend\:lint \
        frontend\:test frontend\:test\:bun frontend\:format \
        setup artisan composer migrate fresh queue test shell logs psql \
        prod\:up prod\:down prod\:restart prod\:logs prod\:log\:app prod\:log\:worker prod\:log\:schedule \
        prod\:fresh prod\:migrate prod\:shell prod\:log\:laravel