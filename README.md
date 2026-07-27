# ⭐️ Poin Anak (Mobile-First PWA)

A point tracking app for children's good habits, designed to motivate children positively. Built with a mobile-first approach and can be installed as a PWA (Progressive Web App).

## 📁 Project Structure (Monorepo)

* [`/backend`](./backend) — Express.js + TypeScript + Prisma ORM + S3/Garage Object Storage.
* [`/frontend`](./frontend) — React + Vite + TypeScript + TailwindCSS + framer-motion + PWA.

---

## 🛠️ Local Development Setup

### 1. Prerequisites
* Node.js (Compatible with v14 through v18+).
* Active PostgreSQL database (local or cloud).
* S3-Compatible Object Storage credentials (Garage/MinIO/AWS S3).

### 2. Backend Configuration

1. Navigate to the [`/backend`](./backend) folder:
   ```bash
   cd backend
   ```
2. Create a `.env` file (placeholder values are provided in the default `.env`):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/askativities?schema=public"
   JWT_SECRET="your-jwt-secret"
   FRONTEND_URL="http://localhost:5173"
   PORT=3000

   # Garage/S3 Config
   S3_ENDPOINT="https://garage-api.domain.com"
   S3_ACCESS_KEY_ID="your_access_key"
   S3_SECRET_ACCESS_KEY="your_secret_key"
   S3_BUCKET_NAME="poin-anak-avatars"
   ```
3. Sync the database schema and generate the Prisma client:
   ```bash
   npx prisma db push
   ```
4. Seed the database with initial data (creates default admin account, children data, activities, and rewards):
   ```bash
   npm run seed
   ```
   * *Default Admin Details*:
     * Email: `admin@poinanak.com`
     * Password: `adminpassword123`

5. Run the backend server (dev mode):
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration

1. Navigate to the [`/frontend`](./frontend) folder:
   ```bash
   cd ../frontend
   ```
2. Run the frontend application (dev mode):
   ```bash
   npm run dev
   ```
3. Access the application at `http://localhost:5173`.

---

## 🚀 Deployment Guide on Coolify

This application is easy to deploy on **Coolify** (Self-hosted VPS) using Git Integration by creating **3 resources** within one project:

### 1. Resource 1: PostgreSQL Database (Built-in)
* Create a **PostgreSQL** service using Coolify's built-in feature.
* Note the database URL for the backend environment variables.

### 2. Resource 2: Backend (Express App - Dockerfile)
* **Build Pack**: Select `Dockerfile`.
* **Base Directory**: Set to [`/backend`](./backend).
* **Port**: `3000`.
* **Environment Variables**:
  * Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `S3_*` credentials for Garage.
* **Auto Migration**: The Dockerfile is configured to automatically run `npx prisma migrate deploy` after the build completes.

### 3. Resource 3: Frontend (Vite Static Site)
* **Build Pack**: Select `Static` or `Nixpacks`.
* **Base Directory**: Set to [`/frontend`](./frontend).
* **Port**: `80` (default for static sites).
* **Environment Variables**:
  * Set `VITE_API_URL` pointing to your backend domain (e.g., `https://api.poinanak.com`).
* **SPA Redirection (IMPORTANT)**:
  * In Coolify, under the static web server configuration, make sure to enable fallback routing so that URLs like `/admin` or `/riwayat` don't return a 404 error when refreshed.
