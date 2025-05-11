# SuperApps RT Web

Aplikasi web komprehensif untuk manajemen data Rukun Tetangga (RT), dirancang untuk mempermudah administrasi dan komunikasi warga.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Prasyarat](#prasyarat)
- [Panduan Memulai (Pengembangan Lokal)](#panduan-memulai-pengembangan-lokal)
- [Menjalankan Frontend dan Backend Secara Terpisah](#menjalankan-frontend-dan-backend-secara-terpisah)
- [Deployment](#deployment)

## Fitur Utama

- **Dashboard Dinamis**: Ringkasan data dan statistik penting RT.
- **Manajemen Warga & Kartu Keluarga**: Pengelolaan data penduduk, kartu keluarga, dan relasi antar warga secara terpadu.
- **Sistem Iuran**: Pengelolaan iuran warga, pencatatan pembayaran, dan pelaporan keuangan.
- **Manajemen Kegiatan**: Penjadwalan dan pengelolaan partisipasi dalam event dan kegiatan RT.
- **Lainnya**: (Sebutkan fitur lain jika ada, misal: Pengumuman, Inventaris, Laporan).

## Teknologi

- **Frontend**: 
    - React.js
    - Tailwind CSS (Styling)
    - Axios (HTTP Client)
- **Backend**:
    - Node.js
    - Express.js (Framework Web)
- **Database**:
    - PostgreSQL (Dikelola melalui Supabase)
- **ORM**:
    - Prisma
- **Deployment**:
    - Frontend: Netlify (Static Site)
    - Backend: Netlify Functions

## Struktur Proyek

Struktur utama proyek dibagi menjadi direktori `client` (frontend), `server` (backend), dan `prisma` (konfigurasi ORM).

```
SuperAppsRTWeb/
├── client/           # Kode sumber Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── components/ # Komponen UI reusable
│   │   ├── pages/      # Komponen halaman utama
│   │   ├── services/   # Layanan API call (api.js, dll.)
│   │   └── App.js      # Root komponen aplikasi frontend
│   ├── .env.example  # Contoh variabel lingkungan frontend
│   └── package.json
├── server/           # Kode sumber Backend (Express.js)
│   ├── controllers/  # Logika bisnis dan handler request
│   ├── models/       # Definisi model data (prisma.js)
│   ├── routes/       # Definisi endpoint API
│   ├── .env.example  # Contoh variabel lingkungan backend
│   ├── index.js      # Entry point server (untuk lokal)
│   └── netlify-handler.js # Handler untuk Netlify Functions
│   └── package.json
├── prisma/           # Konfigurasi dan migrasi Prisma ORM
│   └── schema.prisma
├── public/           # Aset statis (misal: font untuk PDF)
├── netlify.toml      # Konfigurasi build dan redirect Netlify
├── package.json      # Skrip dan dependensi root
└── README.md         # File ini
```

Untuk detail riwayat pengembangan dan perubahan struktur yang lebih lengkap, silakan merujuk ke `Dev_log.txt`.

## Prasyarat

Pastikan sistem Anda telah terinstal:
- Node.js (Disarankan versi LTS terbaru, misal v18.x atau v20.x)
- npm (biasanya terinstal bersama Node.js) atau Yarn

## Panduan Memulai (Pengembangan Lokal)

1.  **Kloning Repositori**
    ```bash
    git clone https://github.com/xr3ed/SuperAppsRTWeb.git
    cd SuperAppsRTWeb
    ```

2.  **Konfigurasi Variabel Lingkungan**

    *   **Backend (`server/.env`)**:
        Salin `server/.env.example` menjadi `server/.env`.
        ```bash
        cp server/.env.example server/.env
        ```
        Kemudian, edit `server/.env` dan isi variabel-variabel berikut dengan nilai yang sesuai:
        - `DATABASE_URL`: String koneksi PostgreSQL Anda dari Supabase (gunakan *Pooled Connection String*, biasanya diakhiri dengan `?pgbouncer=true&sslmode=require`).
        - `DIRECT_URL`: String koneksi PostgreSQL langsung dari Supabase (biasanya *TIDAK* menggunakan PgBouncer, digunakan untuk migrasi Prisma, sering diakhiri dengan `?sslmode=require`).
        - `NODE_ENV`: Atur ke `development` untuk pengembangan lokal.
        - `FRONTEND_URL` (Opsional): Jika server lokal Anda (`server/index.js`) memerlukan URL frontend untuk konfigurasi CORS yang spesifik, Anda dapat mengaturnya di sini (misal: `http://localhost:3000`).

        Contoh isi `server/.env` (ganti dengan nilai Anda):
        ```env
        DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true&sslmode=require"
        DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-SUPABASE-PROJECT-ID].supabase.co:5432/postgres?sslmode=require"
        NODE_ENV="development"
        # FRONTEND_URL=http://localhost:3000 
        ```

    *   **Frontend (`client/.env`)**:
        Salin `client/.env.example` menjadi `client/.env`.
        ```bash
        cp client/.env.example client/.env
        ```
        Kemudian, edit `client/.env` dan atur `REACT_APP_API_URL` agar menunjuk ke server backend lokal Anda.
        Contoh:
        ```env
        REACT_APP_API_URL=http://localhost:5000/api
        ```
        (Port `5000` adalah port default yang digunakan oleh `server/index.js`. `/api` adalah base path API.)

3.  **Instalasi Dependensi**
    Dari direktori root proyek, jalankan:
    ```bash
    npm run install-all
    ```
    Skrip ini akan menginstal dependensi untuk direktori root, `server/`, dan `client/`, serta menjalankan `npx prisma generate` untuk menghasilkan Prisma Client.

4.  **Menjalankan Migrasi Database (jika ini setup pertama kali atau ada migrasi baru)**
    Pastikan variabel `DATABASE_URL` (atau lebih tepatnya `DIRECT_URL` yang sering digunakan Prisma untuk migrasi jika skema Prisma Anda dikonfigurasi untuk itu) di `server/.env` sudah benar.
    Anda dapat menjalankan migrasi dari direktori root atau dari dalam direktori `server`.

    Dari direktori root:
    ```bash
    npx prisma migrate dev --schema ./prisma/schema.prisma
    ```
    Atau jika dari direktori `server/` (umumnya lebih disarankan jika `schema.prisma` ada di `prisma/` yang relatif terhadap `server/` saat konteksnya di `server`):
    ```bash
    cd server
    npx prisma migrate dev 
    # (Prisma CLI akan mencari schema.prisma di ../prisma/ atau ./prisma/ relatif terhadap server/)
    cd ..
    ```
    Jika Prisma CLI dijalankan dari root, ia mungkin memerlukan `DATABASE_URL` di `.env` root jika tidak dapat menemukannya secara otomatis atau jika skrip Anda tidak mengatur path ke `server/.env`. Untuk kesederhanaan, pastikan `server/.env` memiliki `DIRECT_URL` yang benar, dan jika `prisma/schema.prisma` Anda menggunakan `env("DIRECT_URL")` untuk datasource provider migrasi, maka Prisma akan menggunakannya.

5.  **Menjalankan Aplikasi (Backend & Frontend Bersamaan)**
    Dari direktori root proyek, jalankan:
    ```bash
    npm run dev
    ```
    Ini akan menjalankan:
    - Server backend di `http://localhost:5000` (atau port lain jika dikonfigurasi).
    - Server pengembangan frontend di `http://localhost:3000` (atau port lain jika dikonfigurasi) dan otomatis membuka browser.

## Menjalankan Frontend dan Backend Secara Terpisah

Anda juga dapat menjalankan frontend dan backend secara independen:

*   **Menjalankan Server Backend (dari direktori `server/`)**
    ```bash
    cd server
    npm start 
    # atau npm run dev (jika menggunakan nodemon, periksa package.json server)
    ```
    Server akan berjalan, biasanya di `http://localhost:5000`.

*   **Menjalankan Aplikasi Frontend (dari direktori `client/`)**
    Pastikan backend sudah berjalan dan `REACT_APP_API_URL` di `client/.env` sudah benar.
    ```bash
    cd client
    npm start
    ```
    Aplikasi akan terbuka di browser, biasanya di `http://localhost:3000`.

## Deployment

- **Backend**: Dideploy sebagai Netlify Functions. Kode sumber utama fungsi ada di `server/netlify-handler.js` yang membungkus aplikasi Express.js.
- **Frontend**: Dideploy sebagai situs statis di Netlify, dibangun dari direktori `client`.
- **Konfigurasi**: File `netlify.toml` di root proyek mengatur perintah build, direktori publikasi, direktori fungsi, dan aturan redirect (termasuk proxy untuk API).
- **Variabel Lingkungan di Netlify**: Pastikan variabel lingkungan seperti `DATABASE_URL`, `DIRECT_URL` (jika diperlukan oleh proses build/migrasi di Netlify), `NODE_ENV="production"`, dan `FRONTEND_URL` (untuk CORS backend) telah dikonfigurasi di UI Netlify.

--- 

Pastikan untuk selalu menjaga `Dev_log.txt` tetap terbaru untuk catatan perubahan detail. 