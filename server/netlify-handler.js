// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express(); // Aplikasi Express utama
const router = express.Router(); // Router yang akan kita mount di /api

console.log("[V5] netlify-handler.js: Top level script execution.");

// Middleware (sekarang diterapkan ke 'app' atau 'router' sesuai kebutuhan)
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions)); // CORS bisa di level aplikasi

// Middleware untuk router API kita
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Test route di router API kita
router.get('/', (req, res) => {
  console.log("[V5] netlify-handler.js: API root path ('/') was hit! req.originalUrl:", req.originalUrl);
  res.json({ message: '[V5] API Root is ALIVE via netlify-handler!' });
});

// Import rute-rute aplikasi (seperti sebelumnya)
const wargaRoutes = require('./routes/warga');
const iuranRoutes = require('./routes/iuran');
const kegiatanRoutes = require('./routes/kegiatan');
const kartuKeluargaRoutes = require('./routes/kartuKeluarga');

// Gunakan rute-rute aplikasi di dalam router API kita
// Path di sini adalah relatif terhadap '/api' nantinya
router.use('/warga', wargaRoutes);
router.use('/iuran', iuranRoutes);
router.use('/kegiatan', kegiatanRoutes);
router.use('/kartukeluarga', kartuKeluargaRoutes);

// Mount router utama kita di path /api pada aplikasi Express utama
app.use('/api', router);

// Error handler (jika diperlukan, bisa di level 'app' atau 'router')
app.use((err, req, res, next) => {
  console.error("[V5] Error di Netlify Function:", err.stack);
  res.status(500).json({
    message: '[V5] Terjadi kesalahan pada server (Netlify Function)',
    error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal Server Error' 
  });
});

module.exports.handler = serverless(app);

console.log("[V5] netlify-handler.js: Handler exported."); 