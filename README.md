# Super Apps RT Web

Aplikasi web untuk manajemen data RT berbasis browser dengan SQLite dan React.

## Fitur Utama

- **Dashboard** - Ringkasan data dan statistik RT
- **Manajemen Warga** - Kelola data penduduk RT
- **Sistem Iuran** - Kelola iuran, pembayaran, dan laporan keuangan
- **Kegiatan** - Manajemen event dan kegiatan RT
- **Pengumuman** - Publikasi pengumuman penting
- **Inventaris** - Pencatatan inventaris RT
- **Laporan** - Pembuatan laporan RT

## Teknologi

- **Frontend:** React, TailwindCSS, Framer Motion
- **Backend:** Express.js
- **Database:** SQLite dengan Prisma ORM

## Cara Menjalankan

### Prasyarat

Pastikan sistem Anda telah memiliki:
- Node.js (versi 14 atau lebih baru)
- npm

### Instalasi

1. Clone repository ini

2. Instalasi backend
```bash
cd server
npm install
```

3. Konfigurasi database
```bash
npx prisma migrate dev --name initial
```

4. Instalasi frontend
```bash
cd ../client
npm install
```

### Menjalankan Aplikasi

1. Jalankan backend:
```bash
cd server
npm run dev
```

2. Jalankan frontend:
```bash
cd client
npm start
```

3. Buka aplikasi di browser: [http://localhost:3000](http://localhost:3000)

## Struktur Proyek

```
SuperAppsRTWeb/
├── client/ (Frontend React)
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── server/ (Backend Express)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
└── prisma/ (Database Schema)
    └── schema.prisma
```

A new line to trigger deployment refresh. 