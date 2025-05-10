const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Konfigurasi CORS yang lebih spesifik untuk produksi
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Izinkan dari FRONTEND_URL atau semua jika tidak diset
  optionsSuccessStatus: 200 // Beberapa browser lama (IE11, berbagai SmartTV) bermasalah dengan 204
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Selamat datang di API Super Apps RT!' });
});

// Import routes
const wargaRoutes = require('./routes/warga');
const iuranRoutes = require('./routes/iuran');
const kegiatanRoutes = require('./routes/kegiatan');
const kartuKeluargaRoutes = require('./routes/kartuKeluarga');

// Use routes
app.use('/api/warga', wargaRoutes);
app.use('/api/iuran', iuranRoutes);
app.use('/api/kegiatan', kegiatanRoutes);
app.use('/api/kartukeluarga', kartuKeluargaRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
}); 