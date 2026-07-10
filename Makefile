up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build app --no-cache

restart: down up

artisan:
	docker compose exec app php artisan $(cmd)

composer:
	docker compose exec app composer $(cmd)

migrate:
	docker compose exec app php artisan migrate

fresh:
	docker compose exec app php artisan migrate:fresh --seed

queue:
	docker compose exec app php artisan queue:listen --tries=1 --timeout=0

test:
	docker compose exec app php artisan test

bash:
	docker compose exec app sh

logs:
	docker compose logs -f app

psql:
	docker compose exec pgsql psql -U sail -d smauii_core

npm:
	bun $(cmd)

vite:
	bun run dev

setup: up
	docker compose exec app composer install --no-interaction
	docker compose exec app php artisan key:generate --ansi
	docker compose exec app php artisan migrate --seed

.PHONY: up down build restart artisan composer migrate fresh queue test bash logs psql npm vite setup
