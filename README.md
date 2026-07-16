# ⭐️ Poin Anak (Mobile-First PWA)

Aplikasi pencatat poin bintang kebiasaan baik anak untuk memotivasi anak secara positif, didesain khusus untuk tampilan mobile-first dan dapat diinstal sebagai PWA (Progressive Web App).

## 📁 Struktur Proyek (Monorepo)

* `/backend` — Express.js + TypeScript + Prisma ORM + S3/Garage Object Storage.
* `/frontend` — React + Vite + TypeScript + TailwindCSS + framer-motion + PWA.

---

## 🛠️ Persiapan Lokal (Local Development)

### 1. Prasyarat (Prerequisites)
* Node.js (Aplikasi ini kompatibel dari Node.js v14 hingga v18+).
* PostgreSQL database aktif (lokal atau cloud).
* Credential Object Storage S3-Compatible (Garage/MinIO/AWS S3).

### 2. Konfigurasi Backend
1. Masuk ke folder `/backend`:
   ```bash
   cd backend
   ```
2. Buat file `.env` (isi placeholder sudah disediakan di `.env` bawaan):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/askativities?schema=public"
   JWT_SECRET="isi-secret-jwt-anda"
   FRONTEND_URL="http://localhost:5173"
   PORT=3000

   # Garage/S3 Config
   S3_ENDPOINT="https://garage-api.domain.com"
   S3_ACCESS_KEY_ID="your_access_key"
   S3_SECRET_ACCESS_KEY="your_secret_key"
   S3_BUCKET_NAME="poin-anak-avatars"
   ```
3. Sinkronkan skema database & buat client Prisma:
   ```bash
   npx prisma db push
   ```
4. Masukkan data awal (seeds) ke database (membuat akun admin default, data anak, aktivitas, dan reward):
   ```bash
   npm run seed
   ```
   * *Detail Admin Default*:
     * Email: `admin@poinanak.com`
     * Password: `adminpassword123`

5. Jalankan server backend (mode dev):
   ```bash
   npm run dev
   ```

### 3. Konfigurasi Frontend
1. Masuk ke folder `/frontend`:
   ```bash
   cd ../frontend
   ```
2. Jalankan aplikasi frontend (mode dev):
   ```bash
   npm run dev
   ```
3. Akses aplikasi melalui `http://localhost:5173`.

---

## 🚀 Panduan Deployment di Coolify

Aplikasi ini sangat mudah di-deploy di **Coolify** (Self-hosted VPS) menggunakan Git Integration dengan membuat **2 resource** di dalam satu project:

### 1. Resource 1: PostgreSQL Database (Built-in)
* Buat service **PostgreSQL** bawaan dari Coolify.
* Catat URL database-nya untuk dimasukkan ke env backend.

### 2. Resource 2: Backend (Express App - Dockerfile)
* **Build Pack**: Pilih `Dockerfile`.
* **Base Directory**: Set ke `/backend`.
* **Port**: `3000`.
* **Environment Variables**:
  * Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, dan credential `S3_*` untuk Garage.
* **Auto Migration**: Dockerfile sudah dikonfigurasi untuk menjalankan `npx prisma migrate deploy` secara otomatis saat build selesai.

### 3. Resource 3: Frontend (Vite Static Site)
* **Build Pack**: Pilih `Static` atau `Nixpacks`.
* **Base Directory**: Set ke `/frontend`.
* **Port**: `80` (default static).
* **Environment Variables**:
  * Set `VITE_API_URL` mengarah ke URL domain backend Anda (misal: `https://api.poinanak.com`).
* **SPA Redirection (PENTING)**:
  * Di Coolify, pada bagian konfigurasi web server static, pastikan mengaktifkan routing fallback agar URL seperti `/admin` atau `/riwayat` tidak menghasilkan error 404 saat direfresh.
