# Panduan Lengkap Deployment Sistem MDM & Multi-App
**Server Target**: Linux Mint 22.3 (Kernel Linux 6.14.0-37-generic, basis Ubuntu 24.04 Noble Numbat)  
**Kapasitas Server**: 16 GB RAM (Sisa 14 GB Free)  
**Domain Utama**: `putraharapan.my.id`  
**Metode Ingress & SSL**: Cloudflare Tunnel (`cloudflared`) + Nginx Proxy Manager (NPM)  
**Metode CI/CD**: GitHub Actions + GitHub Container Registry (GHCR) + Watchtower

---

## Daftar Isi
1. [Ringkasan Analisis Sistem MDM](#1-ringkasan-analisis-sistem-mdm)
2. [Arsitektur & Alokasi Resource Server](#2-arsitektur--alokasi-resource-server)
3. [Langkah 1: Setup Host Server Linux Mint 22.3](#3-langkah-1-setup-host-server-linux-mint-223)
4. [Langkah 2: Setup Docker Networks & Struktur Direktori](#4-langkah-2-setup-docker-networks--struktur-direktori)
5. [Langkah 3: Setup Infrastruktur Dasar (Reverse Proxy, Shared MySQL, & Watchtower)](#5-langkah-3-setup-infrastruktur-dasar-reverse-proxy-shared-mysql--watchtower)
6. [Langkah 4: Konfigurasi Docker Aplikasi MDM (`app-master-data`)](#6-langkah-4-konfigurasi-docker-aplikasi-mdm-app-master-data)
7. [Langkah 5: Konfigurasi GitHub Actions CI/CD (`.github/workflows/deploy.yml`)](#7-langkah-5-konfigurasi-github-actions-cicd-githubworkflowsdeployyml)
8. [Langkah 6: Setup Container Aplikasi MDM di Server Host](#8-langkah-6-setup-container-aplikasi-mdm-di-server-host)
9. [Langkah 7: Konfigurasi Domain, Cloudflare Tunnel, & SSL](#9-langkah-7-konfigurasi-domain-cloudflare-tunnel--ssl)
10. [Panduan Deployment Sistem-Sistem Lainnya (Aplikasi 2 s/d 10)](#10-panduan-deployment-sistem-sistem-lainnya-aplikasi-2-sd-10)
11. [Standar Komunikasi Antar-Sistem (Integrasi Master Data MDM)](#11-standar-komunikasi-antar-sistem-integrasi-master-data-mdm)
12. [Troubleshooting & Solusi Masalah Nyata](#12-troubleshooting--solusi-masalah-nyata)

---

## 1. Ringkasan Analisis Sistem MDM

Aplikasi `app-master-data` bertindak sebagai **Hub Master Data Management (MDM)** untuk Yayasan Pendidikan Putra Harapan.

* **Fungsi Utama**: Single source of truth untuk 10 entitas: Unit Sekolah, Siswa, Orang Tua, Karyawan/Guru, Tahun Ajaran, Rombel Kelas, Anggota Kelas, Bangunan, Ruangan, Mata Pelajaran, dan Vendor.
* **Backend**: Laravel 13.x, PHP 8.4 (wajib PHP 8.4 karena Symfony v8.1 dependencies), Laravel Sanctum (Token Auth API), Dedoc Scramble (Otomatis generate OpenAPI 3.0 di `/docs/api`).
* **Frontend**: Inertia.js React v3.3, React 19, TypeScript, Tailwind CSS v4, Radix UI.
* **Database**: MySQL 8.4 dengan relasi foreign key terstruktur.
* **File Storage**: Upload foto siswa & karyawan disimpan di `storage/app/public` (wajib volume persisten).
* **Reverse Proxy Ready**: Konfigurasi proxy trust sudah aktif di `bootstrap/app.php` (`$middleware->trustProxies(at: '*')`).

---

## 2. Arsitektur & Alokasi Resource Server

### Topologi Multi-Container (~10 Subdomain)

```
[ PENGUNJUNG / INTERNET ]
            │ (HTTPS Port 443)
            ▼
┌────────────────────────────────────────────────────────┐
│           CLOUDFLARE EDGE NETWORK (CDN & SSL)          │
│  - Kelola SSL publik otomatis (*.putraharapan.my.id)   │
└───────────────────────────┬────────────────────────────┘
                            │ Outbound Cloudflare Tunnel
                            ▼
┌────────────────────────────────────────────────────────┐
│  Host Server Linux Mint (cloudflared service / ctn)   │
│  - Menerima traffic tanpa perlu port-forwarding router │
└───────────────────────────┬────────────────────────────┘
                            │ Forward ke Port 80 Host
                            ▼
┌────────────────────────────────────────────────────────┐
│  Container: reverse_proxy (Nginx Proxy Manager)        │
│  - Routing traffic berdasarkan HTTP Host Header        │
└───────────┬────────────────────────────────────────────┘
            │ Docker Network: web-gateway
    ┌───────┴─────────────────┬─────────────────────────┐
    ▼                         ▼                         ▼
┌─────────────────────┐ ┌──────────────────────┐  ┌─────────────────────┐
│ Container:          │ │ Container:           │  │ Container:          │
│ app_master_data     │ │ app_keuangan         │  │ app_bi              │
│ mdm.putraharapan... │ │ keuangan.putra...    │  │ bi.putraharapan...  │
│ Port 80 internal    │ │ Port 80 internal     │  │ Port 80/3000 internal
└─────────┬───────────┘ └──────────┬───────────┘  └──────────┬──────────┘
          │                        │                         │
          │ Komunikasi API internal│                         │
          │ (http://app_master_data)                         │
          ◄────────────────────────┴─────────────────────────┘
          │
          │ Docker Network: db-network (Tertutup dari Internet)
          ▼
┌────────────────────────────────────────────────────────┐
│  Container: shared_mysql (MySQL 8.4)                   │
│  - Flag: --skip-name-resolve (mencegah freeze koneksi) │
│  ├── mdm_db         (User: mdm_user)                   │
│  ├── keuangan_db    (User: keuangan_user)              │
│  ├── akademik_db    (User: akademik_user)              │
│  └── bi_db          (User: bi_user)                    │
└────────────────────────────────────────────────────────┘
```

### Alokasi Beban RAM (Server 16 GB - Sisa 14 GB)
* **10 Container Aplikasi Web**: ~2.5 - 3.0 GB (rata-rata 250-300 MB per aplikasi)
* **Ingress Reverse Proxy (NPM)**: ~150 MB
* **Shared MySQL 8.4 (Buffer Pool 2 GB)**: ~2.5 GB
* **Watchtower Updater**: ~30 MB
* **Total Terpakai**: ~5.5 - 6 GB
* **Sisa Cadangan Bebas (Headroom)**: ~8 GB (sangat aman untuk caching Linux dan traffic spike).

---

## 3. Langkah 1: Setup Host Server Linux Mint 22.3

Jalankan instalasi Docker Engine resmi (basis Ubuntu 24.04 Noble Numbat):

```bash
# 1. Update paket sistem
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw

# 2. Setup repositori Docker resmi
# Pastikan tidak ada duplikasi antara docker.list dan docker.sources
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu noble stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 3. Install Docker Engine & Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 4. Berikan izin akses docker ke user biasa
sudo usermod -aG docker $USER
newgrp docker

# 5. Konfigurasi Firewall UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 81/tcp   # Dashboard Nginx Proxy Manager
sudo ufw enable
```

---

## 4. Langkah 2: Setup Docker Networks & Struktur Direktori

```bash
# 1. Buat jaringan virtual docker bersama
docker network create web-gateway
docker network create db-network

# 2. Buat struktur folder organisasi proyek di server
sudo mkdir -p /opt/apps/infrastructure
sudo mkdir -p /opt/apps/app-master-data
sudo mkdir -p /opt/apps/app-keuangan
sudo mkdir -p /opt/apps/app-bi
sudo mkdir -p /opt/apps/app-akademik

# 3. Berikan kepemilikan folder ke user aktif (misal user: lab)
sudo chown -R $USER:$USER /opt/apps
```

---

## 5. Langkah 3: Setup Infrastruktur Dasar (Reverse Proxy, Shared MySQL, & Watchtower)

Masuk ke folder `/opt/apps/infrastructure`:

```bash
cd /opt/apps/infrastructure
nano docker-compose.yml
```

Isi berkas `docker-compose.yml` (sudah disesuaikan dengan fix MySQL 8.4, Docker API 1.44, dan Watchtower GHCR Auth):

```yaml
services:
  # Ingress Reverse Proxy & Dashboard Manager
  reverse-proxy:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: reverse_proxy
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
      - '81:81'
    environment:
      DISABLE_IPV6: 'true'
    volumes:
      - ./npm-data:/data
      - ./npm-letsencrypt:/etc/letsencrypt
    networks:
      - web-gateway

  # Shared Database Server untuk 10 aplikasi
  shared-mysql:
    image: 'mysql:8.4'
    container_name: shared_mysql
    restart: unless-stopped
    command:
      - --innodb-buffer-pool-size=2G
      - --sql-mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
      - --mysql-native-password=ON
      - --skip-name-resolve # Wajib: mencegah freeze koneksi akibat reverse DNS lookup container
    environment:
      MYSQL_ROOT_PASSWORD: 'lab123' # Ganti dengan password root database yang aman
    volumes:
      - ./mysql-data:/var/lib/mysql
    networks:
      - db-network

  # Auto Updater CI/CD Watchtower
  watchtower:
    image: containrrr/watchtower:latest
    container_name: auto_watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - DOCKER_API_VERSION=1.44 # Wajib untuk kompatibilitas Docker Engine Ubuntu 24.04
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=60 # Interval cek update setiap 60 detik
      - WATCHTOWER_LABEL_ENABLE=true
      - REPO_USER=USERNAME_GITHUB_ANDA
      - REPO_PASS=ghp_TOKEN_GITHUB_PAT_CLASSIC # Token dengan scope read:packages

networks:
  web-gateway:
    external: true
  db-network:
    external: true
```

Jalankan container infrastruktur:

```bash
docker compose up -d
```

### Inisialisasi Database MDM & Database Aplikasi Lainnya
Jalankan query pembuatan database di dalam container MySQL:

```bash
docker exec -it shared_mysql mysql -u root -p'lab123' -e "
CREATE DATABASE IF NOT EXISTS mdm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mdm_user'@'%' IDENTIFIED WITH mysql_native_password BY 'lab123';
GRANT ALL PRIVILEGES ON mdm_db.* TO 'mdm_user'@'%';

-- Template database untuk aplikasi berikutnya
CREATE DATABASE IF NOT EXISTS keuangan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'keuangan_user'@'%' IDENTIFIED WITH mysql_native_password BY 'lab123';
GRANT ALL PRIVILEGES ON keuangan_db.* TO 'keuangan_user'@'%';

CREATE DATABASE IF NOT EXISTS bi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'bi_user'@'%' IDENTIFIED WITH mysql_native_password BY 'lab123';
GRANT ALL PRIVILEGES ON bi_db.* TO 'bi_user'@'%';

FLUSH PRIVILEGES;
"
```

---

## 6. Langkah 4: Konfigurasi Docker Aplikasi MDM (`app-master-data`)

Siapkan berkas-berkas konfigurasi berikut di root repositori `app-master-data` di laptop:

### A. `.dockerignore`
```
.git
.github
node_modules
vendor
storage/*.key
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
storage/logs/*
.env
.env.backup
tests
```

### B. `docker/nginx.conf` (Tuned dengan Gzip & FastCGI Buffering)
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html/public;
    index index.php index.html;

    client_max_body_size 50M;

    # Gzip Compression untuk asset frontend
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Caching Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
        access_log off;
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
        fastcgi_buffer_size 128k;
        fastcgi_buffers 256 16k;
        fastcgi_busy_buffers_size 256k;
        fastcgi_temp_file_write_size 256k;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### C. `docker/opcache.ini` (Tuning OPcache Production)
```ini
[opcache]
opcache.enable=1
opcache.enable_cli=0
opcache.memory_consumption=128
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
```

### D. `docker/supervisord.conf`
```ini
[supervisord]
nodaemon=true
logfile=/var/log/supervisord.log
pidfile=/var/run/supervisord.pid

[program:php-fpm]
command=php-fpm -F
autostart=true
autorestart=true
priority=5
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
priority=10
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
```

### E. `docker/entrypoint.sh`
```bash
#!/bin/sh
set -e

# Buat symlink storage jika belum ada
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link
fi

# Migrasi database otomatis pada setiap restart image baru
php artisan migrate --force

# Optimasi konfigurasi, route, dan view
php artisan optimize:clear
php artisan optimize

exec "$@"
```

### F. `Dockerfile`
```dockerfile
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime Production PHP 8.4
FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    zip \
    unzip \
    icu-dev \
    oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .
COPY --from=frontend-builder /app/public/build ./public/build

# Install dependencies tanpa dev packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Tuning Worker Pool PHP-FPM
RUN sed -i 's/pm.max_children = 5/pm.max_children = 20/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/pm.start_servers = 2/pm.start_servers = 5/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/pm.min_spare_servers = 1/pm.min_spare_servers = 3/' /usr/local/etc/php-fpm.d/www.conf \
    && sed -i 's/pm.max_spare_servers = 3/pm.max_spare_servers = 10/' /usr/local/etc/php-fpm.d/www.conf

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

---

## 7. Langkah 5: Konfigurasi GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

Di laptop, buat berkas `.github/workflows/deploy.yml`:

```yaml
name: Build and Push Docker Image

on:
  push:
    branches:
      - main

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract Metadata (Tags & Labels)
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=raw,value=latest
            type=sha,format=short

      - name: Build and Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

Push seluruh berkas ini ke GitHub branch `main`:
```bash
git add .
git commit -m "ci: complete docker & github actions setup"
git push origin main
```
Tunggu hingga workflow selesai (centang hijau) di tab **Actions** repository GitHub Anda.

---

## 8. Langkah 6: Setup Container Aplikasi MDM di Server Host

Di terminal SSH server Linux Mint:

```bash
cd /opt/apps/app-master-data
```

### A. Buat Berkas `.env` Host
```bash
nano .env
```
Isi dengan konfigurasi database container:
```ini
APP_NAME="MDM Putra Harapan"
APP_ENV=production
APP_KEY=base64:GENERATE_KEY_DI_BAWAH
APP_DEBUG=false
APP_URL=https://mdm.putraharapan.my.id

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=shared_mysql
DB_PORT=3306
DB_DATABASE=mdm_db
DB_USERNAME=mdm_user
DB_PASSWORD=lab123

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=public
```

### B. Buat Berkas `docker-compose.yml`
```bash
nano docker-compose.yml
```
Isi berkas:
```yaml
services:
  app-mdm:
    image: ghcr.io/yayasan-putra-harapan/master-data:latest
    container_name: app_master_data
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./.env:/var/www/html/.env # Wajib dimount agar config .env terbaca
      - mdm_storage_data:/var/www/html/storage/app/public
    networks:
      - web-gateway
      - db-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

volumes:
  mdm_storage_data:
    name: mdm_storage_data

networks:
  web-gateway:
    external: true
  db-network:
    external: true
```

### C. Inisialisasi Aplikasi Pertama Kali
```bash
# Tarik image dan jalankan container
docker compose pull
docker compose up -d

# Generate Application Key
docker exec -it app_master_data php artisan key:generate --show
# Salin key yang muncul (base64:...) dan masukkan ke baris APP_KEY= di .env

# Jalankan Seeder data master (pertama kali saja)
docker exec -it app_master_data php artisan db:seed --force

# Reset permission storage
docker exec -it app_master_data chown -R www-data:www-data storage bootstrap/cache
docker exec -it app_master_data chmod -R 775 storage bootstrap/cache

# Restart container
docker compose restart
```

---

## 9. Langkah 7: Konfigurasi Domain, Cloudflare Tunnel, & SSL

Karena ISP memblokir port inbound 80/443 (menghasilkan Error 521 / Error 525), ingress menggunakan **Cloudflare Tunnel**.

### 1. Konfigurasi Cloudflare DNS
* Buka **Cloudflare Dashboard** -> Domain `putraharapan.my.id` -> **DNS** -> **Records**.
* **HAPUS** A Record lama yang mengarah langsung ke IP publik `103.255.125.2`.
* Pastikan routing ditangani oleh CNAME Cloudflare Tunnel (`*.cfargotunnel.com`).

### 2. Atur Route di Cloudflare Tunnel Dashboard
* Buka **Zero Trust Dashboard** -> **Networks** -> **Tunnels** -> Pilih tunnel aktif server Anda.
* Tab **Public Hostnames** -> **Add a public hostname**:
  * **Subdomain**: `mdm`
  * **Domain**: `putraharapan.my.id`
  * **Path**: *(Kosongkan)*
  * **Type**: `HTTP`
  * **Service URL**: `http://localhost:80`
  * **Additional application settings** -> **HTTP**:
    * **HTTP Host Header**: `mdm.putraharapan.my.id` *(PENTING agar Nginx Proxy Manager mengenali vhost)*
* Klik **Save hostname**.

### 3. Atur Proxy Host di Nginx Proxy Manager (NPM)
* Buka web GUI NPM: `http://IP_LOKAL_SERVER:81`
* Masuk ke **Proxy Hosts** -> **Add Proxy Host**:
  * **Domain Names**: `mdm.putraharapan.my.id`
  * **Scheme**: `http`
  * **Forward Hostname / IP**: `app_master_data`
  * **Forward Port**: `80`
  * Centang: **Block Common Exploits** & **Websockets Support**
  * Tab **SSL**: Set ke **None** *(SSL publik sudah di-handle oleh Cloudflare Edge)*.
* Klik **Save**.
* Akses aplikasi di browser: `https://mdm.putraharapan.my.id`.

---

## 10. Panduan Deployment Sistem-Sistem Lainnya (Aplikasi 2 s/d 10)

Untuk mendeploy 9 aplikasi lainnya (misal: Keuangan, Akademik, BI, Perpustakaan, PPDB) tanpa mengganggu sistem yang sudah berjalan, ikuti prosedur standar 6 langkah berikut:

### Langkah A: Buat Database di Shared MySQL Server
Jalankan di server via SSH:
```bash
docker exec -it shared_mysql mysql -u root -p'lab123' -e "
CREATE DATABASE IF NOT EXISTS keuangan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'keuangan_user'@'%' IDENTIFIED WITH mysql_native_password BY 'lab123';
GRANT ALL PRIVILEGES ON keuangan_db.* TO 'keuangan_user'@'%';
FLUSH PRIVILEGES;
"
```

### Langkah B: Pasang Konfigurasi Docker di Repositori Aplikasi Klien
Di repo aplikasi baru (misal `app-keuangan`):
1. Tambahkan `Dockerfile`, `docker/nginx.conf`, `docker/supervisord.conf`, `docker/entrypoint.sh`, dan `.dockerignore` (sesuaikan port jika aplikasi berbasis Node.js/Python/Go).
2. Tambahkan workflow CI/CD `.github/workflows/deploy.yml` agar saat merge ke `main`, image ter-build otomatis ke GHCR (`ghcr.io/yayasan-putra-harapan/app-keuangan:latest`).
3. Set visibility package image di GitHub Packages menjadi **Public** (atau pastikan token PAT Watchtower memiliki hak akses baca).

### Langkah C: Siapkan Folder & Docker Compose di Server Host
Di server Linux Mint:
```bash
mkdir -p /opt/apps/app-keuangan
cd /opt/apps/app-keuangan
nano .env
```
Isi berkas `.env` aplikasi:
```ini
APP_NAME="Keuangan Putra Harapan"
APP_ENV=production
APP_KEY=base64:...
APP_DEBUG=false
APP_URL=https://keuangan.putraharapan.my.id

DB_CONNECTION=mysql
DB_HOST=shared_mysql
DB_PORT=3306
DB_DATABASE=keuangan_db
DB_USERNAME=keuangan_user
DB_PASSWORD=lab123

# Integrasi ke MDM via internal Docker Network
MDM_API_BASE_URL=http://app_master_data/api/v1
MDM_API_TOKEN=1|token_khusus_keuangan_dari_mdm
```

Buat berkas `docker-compose.yml`:
```bash
nano docker-compose.yml
```
```yaml
services:
  app-keuangan:
    image: ghcr.io/yayasan-putra-harapan/app-keuangan:latest
    container_name: app_keuangan
    restart: unless-stopped
    env_file:
      - .env
    volumes:
      - ./.env:/var/www/html/.env
      - keuangan_storage:/var/www/html/storage/app/public
    networks:
      - web-gateway
      - db-network
    labels:
      - "com.centurylinklabs.watchtower.enable=true" # Terdaftar di auto-update Watchtower

volumes:
  keuangan_storage:
    name: keuangan_storage

networks:
  web-gateway:
    external: true
  db-network:
    external: true
```

Jalankan container aplikasi baru:
```bash
docker compose pull
docker compose up -d
```

### Langkah D: Daftarkan Routing di Nginx Proxy Manager (NPM)
1. Buka dashboard NPM (`http://IP_SERVER:81`).
2. **Add Proxy Host**:
   * **Domain Names**: `keuangan.putraharapan.my.id`
   * **Scheme**: `http`
   * **Forward Hostname / IP**: `app_keuangan`
   * **Forward Port**: `80` (atau port internal app, misal `3000` untuk Node.js)
   * Tab **SSL**: Set `None`.
3. Klik **Save**.

### Langkah E: Daftarkan Subdomain di Cloudflare Tunnel
1. Buka dashboard **Cloudflare Zero Trust** -> **Networks** -> **Tunnels** -> Pilih tunnel server Anda.
2. Tab **Public Hostnames** -> **Add a public hostname**:
   * **Subdomain**: `keuangan`
   * **Domain**: `putraharapan.my.id`
   * **Type**: `HTTP`
   * **Service URL**: `http://localhost:80`
   * **Additional application settings** -> **HTTP** -> **HTTP Host Header**: `keuangan.putraharapan.my.id`
3. Klik **Save hostname**.

Aplikasi baru kini live di `https://keuangan.putraharapan.my.id`.

### Langkah F: Auto-Deploy Berjalan Otomatis
Developer aplikasi Keuangan cukup melakukan `git push origin main`. GitHub Actions mem-build image baru, Watchtower mendeteksi image baru dalam 60 detik, me-restart `app_keuangan`, dan migrasi otomatis berjalan tanpa memerlukan akses SSH.

---

## 11. Standar Komunikasi Antar-Sistem (Integrasi Master Data MDM)

Aplikasi lain (Keuangan, Akademik, BI, dll.) **tidak boleh** membuat duplikasi tabel data induk (Siswa, Karyawan, Unit). Semua data induk diambil terpusat dari MDM.

### 1. Alamat Endpoint Internal (Zero Latency)
Gunakan koneksi nama container internal melalui network `web-gateway`:
* Base URL: `http://app_master_data/api/v1`
* Contoh Endpoint:
  * `http://app_master_data/api/v1/siswa`
  * `http://app_master_data/api/v1/karyawan`
  * `http://app_master_data/api/v1/units`
  * `http://app_master_data/api/v1/kelas`
  * `http://app_master_data/api/v1/auth/login` (Autentikasi SSO User)

### 2. Autentikasi API Klien
1. Admin MDM membuka: `https://mdm.putraharapan.my.id/api-tokens`.
2. Generate token Personal Access Token Sanctum untuk sistem pemanggil (misal: `Token_Aplikasi_Keuangan`).
3. Pasang token di header request HTTP aplikasi pemanggil:
   ```http
   Authorization: Bearer 1|abcdef1234567890...
   Accept: application/json
   ```

### 3. Dokumentasi Kontrak OpenAPI
Spesifikasi schema JSON, parameter query, dan format response selalu diperbarui otomatis di:
`https://mdm.putraharapan.my.id/docs/api`

---

## 12. Troubleshooting & Solusi Masalah Nyata

Rangkuman kendala nyata yang ditemukan saat implementasi beserta solusinya:

| Kasus Kendala | Gejala / Error | Penyebab | Solusi Pasti |
| :--- | :--- | :--- | :--- |
| **MySQL 8.4 Crash saat Boot** | `Container is restarting (1)` | Flag `--default-authentication-plugin` sudah dihapus permanen di MySQL 8.4. | Hapus flag tersebut dari `command:` compose. Gunakan `--mysql-native-password=ON` jika butuh client lama. |
| **Koneksi Database Freeze / Lambat** | Aplikasi loading 2-5 detik tiap navigasi halaman. | MySQL melakukan reverse DNS lookup pada setiap IP container internal Docker. | Tambahkan flag `- --skip-name-resolve` pada konfigurasi command MySQL di Docker Compose. |
| **Watchtower Crash Loop API Error** | `client version 1.25 is too old. Minimum supported API version is 1.40` | Docker daemon Ubuntu 24.04 menolak API client lawas bawaan Watchtower. | Tambahkan environment `DOCKER_API_VERSION=1.44` pada service Watchtower di Docker Compose. |
| **Watchtower Gagal Pull Image** | `403 Forbidden, auth: "not present"` | GHCR mewajibkan autentikasi token untuk pengecekan manifest update. | Masukkan `REPO_USER=username` dan `REPO_PASS=ghp_token` (scope `read:packages`) di env Watchtower. |
| **Build Composer Gagal di GitHub** | `symfony/* requires php >=8.4.1` | Dependensi `composer.lock` Laravel 13 mengunci library Symfony v8.1. | Ubah base image `Dockerfile` dari PHP 8.3 ke `FROM php:8.4-fpm-alpine`. |
| **Seeder Database Gagal** | `Call to a member function numerify() on null` | `fakerphp/faker` berada di `require-dev`, sehingga tidak terinstall saat production `--no-dev`. | Pindahkan `fakerphp/faker` ke blok `require` utama di `composer.json`. |
| **Aplikasi HTTP 500 Pertama Kali** | Blank 500 Internal Server Error saat load awal. | `APP_KEY` belum terisi di `.env` atau `.env` host belum di-mount ke container. | Generate key dengan `artisan key:generate --show`, simpan ke `.env`, dan mount `./.env:/var/www/html/.env`. |
| **Error 521 / 525 di Cloudflare** | `Web server is down` / `SSL handshake failed` | Port 80 & 443 diblokir oleh ISP / router modem belum di-port forward. | Gunakan Cloudflare Tunnel (`cloudflared`). Hapus A record direct IP dan alihkan via tunnel hostname. |
