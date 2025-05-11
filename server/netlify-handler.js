// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');
// const cors = require('cors'); // Dikomentari untuk sementara
// const bodyParser = require('body-parser'); // Dikomentari untuk sementara

const app = express();

console.log("netlify-handler.js: Top level script execution, app initialized.");

// Middleware (dikomentari untuk sementara)
/*
const corsOptions = {
  origin: process.env.FRONTEND_URL, 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
*/

// Test route sederhana
app.get('/', (req, res) => {
  console.log("netlify-handler.js: Root path ('/') was hit!");
  res.json({ message: 'Simplified Netlify Function is ALIVE via netlify-handler!' });
});

// Rute lain dikomentari untuk sementara
/*
const wargaRoutes = require('./routes/warga');
const iuranRoutes = require('./routes/iuran');
const kegiatanRoutes = require('./routes/kegiatan');
const kartuKeluargaRoutes = require('./routes/kartuKeluarga');

app.use('/warga', wargaRoutes);
app.use('/iuran', iuranRoutes);
app.use('/kegiatan', kegiatanRoutes);
app.use('/kartukeluarga', kartuKeluargaRoutes);
*/

// Error handler (dikomentari untuk sementara, atau biarkan jika tidak kompleks)
/*
app.use((err, req, res, next) => {
  console.error("Error di Netlify Function:", err.stack);
  res.status(500).json({
    message: 'Terjadi kesalahan pada server (Netlify Function)',
    error: process.env.NODE_ENV !== 'production' ? err.message : 'Internal Server Error' 
  });
});
*/

module.exports.handler = serverless(app);

console.log("netlify-handler.js: Handler exported.");

// PENTING: JANGAN sertakan app.listen() di sini.
// Netlify dan serverless-http akan menanganinya. 