# Panduan Lengkap Deployment Sistem MDM & Multi-App
**Server Target**: Linux Mint 22.3 (Kernel Linux 6.14.0-37-generic, basis Ubuntu 24.04 Noble Numbat)  
**Kapasitas Server**: 16 GB RAM (Sisa 14 GB Free)  
**Domain Utama**: `putraharapan.my.id`  
**Metode CI/CD**: Opsi 3 (GitHub Actions + GitHub Container Registry + Watchtower)

---

## Daftar Isi
1. [Ringkasan Analisis Sistem](#1-ringkasan-analisis-sistem)
2. [Arsitektur & Alokasi Resource](#2-arsitektur--alokasi-resource)
3. [Langkah 1: Setup Host Server Linux Mint 22.3](#3-langkah-1-setup-host-server-linux-mint-223)
4. [Langkah 2: Setup Docker Networks & Struktur Direktori](#4-langkah-2-setup-docker-networks--struktur-direktori)
5. [Langkah 3: Setup Infrastruktur Dasar (Reverse Proxy & Shared MySQL)](#5-langkah-3-setup-infrastruktur-dasar-reverse-proxy--shared-mysql)
6. [Langkah 4: Konfigurasi Docker Aplikasi MDM (`app-master-data`)](#6-langkah-4-konfigurasi-docker-aplikasi-mdm-app-master-data)
7. [Langkah 5: Konfigurasi GitHub Actions CI/CD (`.github/workflows/deploy.yml`)](#7-langkah-5-konfigurasi-github-actions-cicd-githubworkflowsdeployyml)
8. [Langkah 6: Login GHCR & Setup Container Aplikasi di Server Host](#8-langkah-6-login-ghcr--setup-container-aplikasi-di-server-host)
9. [Langkah 7: Setup Watchtower untuk Continuous Deployment Otomatis](#9-langkah-7-setup-watchtower-untuk-continuous-deployment-otomatis)
10. [Langkah 8: Setup DNS & SSL Subdomain (Nginx Proxy Manager)](#10-langkah-8-setup-dns--ssl-subdomain-nginx-proxy-manager)
11. [Langkah 9: Standar Komunikasi Aplikasi Lain (Keuangan, Akademik, BI) ke MDM](#11-langkah-9-standar-komunikasi-aplikasi-lain-keuangan-akademik-bi-ke-mdm)
12. [Jawaban Pertanyaan Khusus Arsitektur](#12-jawaban-pertanyaan-khusus-arsitektur)

---

## 1. Ringkasan Analisis Sistem

Aplikasi ini (`app-master-data`) bertindak sebagai **Hub Master Data Management (MDM)** untuk Yayasan Pendidikan Putra Harapan.

* **Fungsi Utama**: Single source of truth untuk 10 entitas: Unit Sekolah, Siswa, Orang Tua, Karyawan/Guru, Tahun Ajaran, Rombel Kelas, Anggota Kelas, Bangunan, Ruangan, Mata Pelajaran, dan Vendor.
* **Backend**: Laravel 13.x, PHP 8.3+, Laravel Sanctum (Token Auth API), Dedoc Scramble (Otomatis generate OpenAPI 3.0 di `/docs/api`).
* **Frontend**: Inertia.js React v3.3, React 19, TypeScript, Tailwind CSS v4, Radix UI.
* **Database**: MySQL/MariaDB dengan relasi foreign key terstruktur.
* **File Storage**: Upload foto siswa & karyawan disimpan di `storage/app/public` (wajib volume persisten).
* **Fitur Export/Import**: Native CSV Streaming (`fputcsv` / `fgetcsv`), hemat memori tanpa library office berat.
* **Reverse Proxy Ready**: Konfigurasi proxy trust sudah aktif di `bootstrap/app.php` (`$middleware->trustProxies(at: '*')`).

---

## 2. Arsitektur & Alokasi Resource

### Topologi Multi-Container (~10 Subdomain)

```
[ INTERNET ]
     │ (Port 80 & 443)
     ▼
┌────────────────────────────────────────────────────────┐
│  Container: reverse_proxy (Nginx Proxy Manager)        │
│  - SSL Wildcard (*.putraharapan.my.id) via Let's Encrypt
└───────────┬────────────────────────────────────────────┘
            │ Docker Network: web-gateway
    ┌───────┴─────────────────┬─────────────────────────┐
    ▼                         ▼                         ▼
┌─────────────────────┐ ┌──────────────────────┐  ┌─────────────────────┐
│ Container:          │ │ Container:           │  │ Container:          │
│ app_master_data     │ │ app_keuangan         │  │ app_bi              │
│ mdm.putraharapan... │ │ keuangan.putra...    │  │ bi.putraharapan...  │
│ Port 80 internal    │ │ Port 80 internal     │  │ Port 80 internal    │
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
│  ├── mdm_db         (User: mdm_user)                   │
│  ├── keuangan_db    (User: keuangan_user)              │
│  ├── akademik_db    (User: akademik_user)              │
│  └── bi_db          (User: bi_user)                    │
└────────────────────────────────────────────────────────┘
```

### Estimasi Alokasi RAM (Server 16 GB - Sisa 14 GB)
* **10 Container Aplikasi Web**: ~2.5 GB (rata-rata 250 MB / aplikasi)
* **Ingress Reverse Proxy (NPM)**: ~150 MB
* **Shared MySQL 8.4 (Buffer Pool 2 GB)**: ~2.5 GB
* **Watchtower Updater**: ~30 MB
* **Total Terpakai**: ~5 - 6 GB
* **Sisa Cadangan Bebas (Headroom)**: ~8 - 9 GB (sangat aman untuk caching Linux dan traffic spike).

---

## 3. Langkah 1: Setup Host Server Linux Mint 22.3

Login via SSH ke server host Linux Mint, lalu jalankan instalasi Docker Engine resmi (menggunakan repository basis Ubuntu 24.04 Noble Numbat):

```bash
# 1. Update paket sistem
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg ufw

# 2. Tambah GPG key Docker resmi
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 3. Daftarkan repository Docker Ubuntu Noble
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu noble stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine, CLI, Containerd, dan Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Berikan akses docker ke user biasa
sudo usermod -aG docker $USER
newgrp docker

# 6. Konfigurasi Firewall UFW
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 81/tcp   # Dashboard NPM (bisa dinonaktifkan setelah setup selesai)
sudo ufw enable
```

---

## 4. Langkah 2: Setup Docker Networks & Struktur Direktori

```bash
# 1. Buat jaringan virtual docker
docker network create web-gateway
docker network create db-network

# 2. Buat struktur folder organisasi proyek
sudo mkdir -p /opt/apps/infrastructure
sudo mkdir -p /opt/apps/app-master-data
sudo mkdir -p /opt/apps/app-keuangan
sudo mkdir -p /opt/apps/app-bi

# 3. Berikan kepemilikan folder ke user aktif
sudo chown -R $USER:$USER /opt/apps
```

---

## 5. Langkah 3: Setup Infrastruktur Dasar (Reverse Proxy & Shared MySQL)

Masuk ke folder `/opt/apps/infrastructure`:

```bash
cd /opt/apps/infrastructure
nano docker-compose.yml
```

Isi berkas `docker-compose.yml`:

```yaml
services:
  # Ingress Reverse Proxy & Auto SSL
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
      - --default-authentication-plugin=mysql_native_password
      - --sql-mode=STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
      - --innodb-buffer-pool-size=2G
    environment:
      MYSQL_ROOT_PASSWORD: 'SUPER_ROOT_PASSWORD_AMANKAN'
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
      - /root/.docker/config.json:/config.json:ro
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_LABEL_ENABLE=true

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

Inisialisasi database dan user per aplikasi:

```bash
docker exec -it shared_mysql mysql -u root -p'lab123' -e "
CREATE DATABASE IF NOT EXISTS mdm_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'mdm_user'@'%' IDENTIFIED WITH mysql_native_password BY 'lab123';
GRANT ALL PRIVILEGES ON mdm_db.* TO 'mdm_user'@'%';

CREATE DATABASE IF NOT EXISTS keuangan_db;
CREATE USER IF NOT EXISTS 'keuangan_user'@'%' IDENTIFIED WITH mysql_native_password BY 'PASSWORD_DB_KEUANGAN';
GRANT ALL PRIVILEGES ON keuangan_db.* TO 'keuangan_user'@'%';

CREATE DATABASE IF NOT EXISTS bi_db;
CREATE USER IF NOT EXISTS 'bi_user'@'%' IDENTIFIED WITH mysql_native_password BY 'PASSWORD_DB_BI';
GRANT ALL PRIVILEGES ON bi_db.* TO 'bi_user'@'%';

FLUSH PRIVILEGES;
"
```

---

## 6. Langkah 4: Konfigurasi Docker Aplikasi MDM (`app-master-data`)

Siapkan berkas-berkas berikut di root repositori `app-master-data`:

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

### B. `docker/nginx.conf`
```nginx
server {
    listen 80;
    server_name _;
    root /var/www/html/public;
    index index.php index.html;

    client_max_body_size 50M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
        fastcgi_read_timeout 300;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### C. `docker/supervisord.conf`
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

### D. `docker/entrypoint.sh`
```bash
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
```

### E. `Dockerfile`
```dockerfile
# Stage 1: Build Frontend Assets
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime Production
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

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

---

## 7. Langkah 5: Konfigurasi GitHub Actions CI/CD (`.github/workflows/deploy.yml`)

Buat berkas `.github/workflows/deploy.yml` di dalam repositori:

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

Setiap kali developer melakukan `git push` ke branch `main`, GitHub Actions akan mengompilasi Vite + PHP dependencies di cloud GitHub dan mem-publish image ke:
`ghcr.io/yayasan-putra-harapan/master-data:latest`

---

## 8. Langkah 6: Setup Container Aplikasi di Server Host (Tanpa Login Token Karena Public)

Karena visibilitas package sudah **Public**, langkah membuat GitHub PAT dan `docker login ghcr.io` **TIDAK DIPERLUKAN (DILEWATI)**.

### 1. Pastikan Image Sudah Ter-build di GitHub
* Push berkas `Dockerfile`, `docker/`, dan `.github/workflows/deploy.yml` ke branch `main`.
* Buka tab **Actions** di repositori GitHub, tunggu build selesai hingga status centang hijau.
* Verifikasi image muncul di menu **Packages** repository Anda (`ghcr.io/yayasan-putra-harapan/master-data:latest`).

### 2. Setup Berkas Aplikasi di Server (`/opt/apps/app-master-data`)
Masuk ke direktori server:

```bash
cd /opt/apps/app-master-data
nano .env
```

Isi berkas `.env`:

```ini
APP_NAME="MDM Putra Harapan"
APP_ENV=production
APP_KEY=
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

Buat berkas `docker-compose.yml`:

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

### 3. Jalankan Aplikasi Pertama Kali
```bash
docker compose pull
docker compose up -d

# Generate Application Key jika belum ada
docker exec -it app_master_data php artisan key:generate --show
# Salin key tersebut ke file .env (APP_KEY=base64:xxx)

# Jalankan seeder master data pertama kali
docker exec -it app_master_data php artisan db:seed --class=MasterDataSeeder --force

# Restart container
docker compose restart
```

---

## 9. Langkah 7: Setup Watchtower untuk Continuous Deployment Otomatis

Watchtower sudah terpasang di Langkah 3. Pastikan config autentikasi docker terbaca:

```bash
# Pastikan folder config docker root memiliki berkas login
sudo cp ~/.docker/config.json /root/.docker/config.json 2>/dev/null || true
```

**Mekanisme CD Bekerja:**
1. Developer push commit baru ke branch `main`.
2. GitHub Actions memproses build dan memperbarui `ghcr.io/...:latest`.
3. Dalam 60 detik, Watchtower mendeteksi adanya hash image baru.
4. Watchtower otomatis melakukan `pull` image baru, mematikan container lama, dan menyalakan container baru dengan konfigurasi yang sama.
5. `entrypoint.sh` berjalan: otomatis menjalankan `php artisan migrate --force` dan optimasi cache.
6. **Zero SSH Touch**: Sistem live terbarui tanpa ada yang perlu login ke SSH server!

---

## 10. Langkah 8: Setup DNS & SSL Subdomain (Nginx Proxy Manager)

### 1. Konfigurasi DNS di Provider Domain (`putraharapan.my.id`)
Buat DNS Record tipe **A**:
* `mdm.putraharapan.my.id` -> `IP_PUBLIC_SERVER`
* `keuangan.putraharapan.my.id` -> `IP_PUBLIC_SERVER`
* `bi.putraharapan.my.id` -> `IP_PUBLIC_SERVER`
*(Atau gunakan wildcard `*.putraharapan.my.id` -> `IP_PUBLIC_SERVER`)*

### 2. Atur Reverse Proxy di Web GUI Nginx Proxy Manager
1. Buka browser: `http://IP_PUBLIC_SERVER:81`
2. Login admin (default: `admin@example.com` / `changeme`, ganti setelah login).
3. Klik menu **Proxy Hosts** -> **Add Proxy Host**:
   * **Domain Names**: `mdm.putraharapan.my.id`
   * **Scheme**: `http`
   * **Forward Hostname / IP**: `app_master_data`
   * **Forward Port**: `80`
   * Centang: **Block Common Exploits** & **Websockets Support**
4. Buka tab **SSL**:
   * **SSL Certificate**: *Request a new SSL Certificate*
   * Centang: **Force SSL**
   * Centang: **HTTP/2 Support**
   * Masukkan email untuk Let's Encrypt dan centang persetujuan TOS.
5. Klik **Save**.
6. Aplikasi MDM kini live dengan HTTPS di `https://mdm.putraharapan.my.id`.

Ulangi langkah 2 untuk subdomain aplikasi lain (`keuangan.putraharapan.my.id`, `bi.putraharapan.my.id`, dll.) mengarah ke nama container masing-masing.

---

## 11. Langkah 9: Standar Komunikasi Aplikasi Lain ke MDM

Aplikasi lain (Keuangan, Akademik, Perpustakaan, BI) tidak perlu keluar ke jaringan internet publik untuk mengambil data siswa, karyawan, atau rombel kelas.

### 1. Alamat Endpoint Internal (Zero Latency)
Gunakan nama container internal Docker di dalam network `web-gateway`:
* Base URL: `http://app_master_data/api/v1`
* Contoh Endpoint:
  * `http://app_master_data/api/v1/siswa`
  * `http://app_master_data/api/v1/karyawan`
  * `http://app_master_data/api/v1/units`
  * `http://app_master_data/api/v1/kelas`

### 2. Autentikasi API
1. Buka browser: `https://mdm.putraharapan.my.id/api-tokens`
2. Buat Personal Access Token Sanctum untuk tiap sistem (misal: `Token_Aplikasi_Keuangan`, `Token_Aplikasi_BI`).
3. Masukkan ke file `.env` aplikasi klien:
   ```ini
   MDM_API_BASE_URL=http://app_master_data/api/v1
   MDM_API_TOKEN=1|abcdef1234567890...
   ```
4. Header request:
   ```http
   Authorization: Bearer 1|abcdef1234567890...
   Accept: application/json
   ```

### 3. Dokumentasi Kontrak OpenAPI
Spesifikasi lengkap schema JSON, query parameter, dan contoh response dapat diakses langsung oleh tim developer lain di:
`https://mdm.putraharapan.my.id/docs/api`

---

## 12. Jawaban Pertanyaan Khusus Arsitektur

### Pertanyaan 1: Apakah nantinya tiap aplikasi wajib memiliki versi PHP, MySQL, dan Laravel yang sama?
* **PHP & Laravel: TIDAK WAJIB SAMA.**
  * Ini adalah keunggulan utama Docker. Setiap aplikasi terisolasi dalam container masing-masing:
    * App MDM: Laravel 13 + PHP 8.3
    * App Keuangan: Laravel 10 + PHP 8.2
    * App Legacy: CodeIgniter / PHP 7.4
    * App BI: Python FastAPI / Node.js
* **MySQL:**
  * Dalam arsitektur rekomendasi di atas, digunakan **1 container MySQL 8.4 bersama** (Shared MySQL) untuk menghemat RAM server (menghemat 3-4 GB RAM).
  * MySQL 8.4 backwards-compatible dengan Laravel versi lama maupun baru. Masing-masing aplikasi diberikan database dan user terpisah (`mdm_db`, `keuangan_db`, dll).
  * Jika suatu saat ada aplikasi yang mutlak membutuhkan database engine berbeda (misal PostgreSQL atau MongoDB), cukup tambahkan 1 container khusus database tersebut di Docker Compose tanpa mengganggu database MySQL utama.

### Pertanyaan 2: Apakah aplikasi lain wajib membuat contract API seperti Swagger atau OpenAPI agar BI bisa mengambil data, atau cukup endpoint?
* **Secara Teknis / Runtime: TIDAK WAJIB.**
  * Script ETL atau aplikasi BI hanya membutuhkan HTTP endpoint valid yang merespons data JSON/CSV dengan status `200 OK` dan token autentikasi.
* **Secara Arsitektur & Operasional: SANGAT DIREKOMENDASIKAN.**
  * API Contract (OpenAPI) menjadi garansi format tipe data (`nisn` string vs int, tanggal `YYYY-MM-DD`, status enum) agar pipeline visualisasi BI tidak error saat tim aplikasi mengubah kode.
  * **Kabar Baik**: Pada sistem MDM ini (`app-master-data`), library **Dedoc Scramble** sudah terpasang. Dokumentasi OpenAPI 3.0 sudah aktif otomatis di `/docs/api` tanpa perlu menulis berkas Swagger manual.
* **Rekomendasi Skala Data BI**:
  * Data Master / Agregat Ringan: Ambil langsung via REST API MDM (`http://app_master_data/api/v1/siswa`).
  * Data Transaksional Sangat Besar (Jutaan Baris): Jangan tarik lewat REST API reguler (agar tidak membebani worker web). Gunakan pola sinkronisasi malam hari (cron job batch sync) atau buat Read-Replica database langsung ke database analitik BI.
