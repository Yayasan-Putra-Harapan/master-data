#!/bin/sh
set -e

# Buat symlink storage jika belum ada
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
fi

# Migrasi otomatis setiap deployment
php artisan migrate --force

# Optimasi konfigurasi & routing
php artisan optimize:clear
php artisan optimize

exec "$@"
