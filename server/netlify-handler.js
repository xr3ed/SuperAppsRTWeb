// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// Tidak perlu dotenv di sini, variabel lingkungan akan di-handle oleh Netlify

const app = express();

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Ini akan menjadi URL Vercel Anda dari Netlify env var
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route (opsional)
// Akan diakses melalui /api/ jika menggunakan redirect, atau /.netlify/functions/netlify-handler/ jika tidak
app.get('/', (req, res) => {
  res.json({ message: 'API Function SuperAppsRT aktif via Netlify Handler!' });
});

// Import routes (pastikan path ini benar relatif terhadap netlify-handler.js)
const wargaRoutes = require('./routes/warga');
const iuranRoutes = require('./routes/iuran');
const kegiatanRoutes = require('./routes/kegiatan');
const kartuKeluargaRoutes = require('./routes/kartuKeluarga');

// Gunakan routes
// Path di sini akan ditambahkan setelah path fungsi Anda.
// Misalnya, jika fungsi Anda di /api, maka ini akan menjadi /api/warga, /api/iuran, dst.
app.use('/warga', wargaRoutes);
app.use('/iuran', iuranRoutes);
app.use('/kegiatan', kegiatanRoutes);
app.use('/kartukeluarga', kartuKeluargaRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error di Netlify Function:", err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server (Netlify Function)',
    // Hanya tampilkan detail error di development (jika NODE_ENV diatur)
    error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal Server Error' 
  });
});

// Export handler untuk Netlify
// Ini akan membuat aplikasi Express Anda kompatibel dengan Netlify Functions
module.exports.handler = serverless(app);

// PENTING: JANGAN sertakan app.listen() di sini.
// Netlify dan serverless-http akan menanganinya. 