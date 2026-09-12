#!/bin/sh
# ─────────────────────────────────────────────────────────────
# Production Entrypoint
# Dijalankan setiap kali container start.
# .env sudah di-mount via volume saat ini.
# ─────────────────────────────────────────────────────────────

echo "[entrypoint] Bootstrapping Laravel production..."

# Pastikan struktur storage framework tersedia — storage/ di-mount sebagai volume
# kosong, dan .dockerignore mengecualikan storage/framework/ dari image.
# Tanpa folder ini Laravel gagal dengan "Please provide a valid cache path".
mkdir -p /var/www/html/storage/framework/cache/data \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/testing \
         /var/www/html/storage/framework/views \
         /var/www/html/storage/app/public

# Pastikan symbolic link public/storage -> storage/app/public aktif
php artisan storage:link --force 2>&1 || echo "[entrypoint] WARNING: storage:link failed, skipping"

# Regenerasi package manifest (services.php/packages.php) dari vendor production.
# WAJIB sebelum config:cache: manifest stale hasil develop di host
# (Pail/Sail/Telescope/IdeHelper/Collision — tak ada di vendor --no-dev) tetap
# terbaca dan container crash dengan "Class ... not found".
php artisan package:discover --no-interaction 2>&1 || echo "[entrypoint] WARNING: package:discover failed, skipping"

# Jalankan artisan cache commands — gunakan '|| true' agar container
# TIDAK crash jika salah satu gagal (misal: DB belum siap saat pertama up).
# Cache akan dibangun ulang otomatis saat request pertama masuk.
php artisan config:cache  --no-interaction 2>&1 || echo "[entrypoint] WARNING: config:cache failed, skipping"
php artisan route:cache   --no-interaction 2>&1 || echo "[entrypoint] WARNING: route:cache failed, skipping"
php artisan view:cache    --no-interaction 2>&1 || echo "[entrypoint] WARNING: view:cache failed, skipping"
php artisan event:cache   --no-interaction 2>&1 || echo "[entrypoint] WARNING: event:cache failed, skipping"

echo "[entrypoint] Bootstrap selesai. Starting server..."

# Jalankan CMD dari Dockerfile (php artisan serve ...)
exec "$@"
