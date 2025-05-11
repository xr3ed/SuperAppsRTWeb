// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');

const app = express();

console.log("[V3] netlify-handler.js: Top level script execution, Express app initialized.");

// Middleware dasar bisa ditambahkan di sini jika dirasa aman, atau tambahkan nanti
// Contoh: app.use(express.json()); // Jika hanya butuh parser JSON bawaan Express

app.get('/', (req, res) => {
  console.log("[V3] netlify-handler.js: Express root path ('/') was hit!");
  // Tambahkan header kustom untuk identifikasi
  res.setHeader('X-Custom-Handler-Identifier', 'ExpressV3');
  res.status(200).json({ message: '[V3] Express Netlify Function is ALIVE!' });
});

// Jangan tambahkan rute atau middleware kompleks lainnya dulu

const handler = serverless(app);

// Tambahkan log sebelum dan sesudah pembuatan handler serverless
console.log("[V3] netlify-handler.js: About to export serverless(app).");

module.exports.handler = async (event, context) => {
  console.log("[V3] netlify-handler.js: Serverless wrapper invoked. Path:", event.path);
  // Untuk melihat event lengkap jika perlu: console.log("[V3] Event:", JSON.stringify(event));
  return handler(event, context); // Panggil handler yang dibuat oleh serverless(app)
};

console.log("[V3] netlify-handler.js: Custom Express Handler exported."); 