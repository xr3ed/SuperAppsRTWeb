// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');

const app = express();

console.log("[V2] netlify-handler.js: Top level script execution, Express app initialized.");

// Middleware dasar bisa ditambahkan di sini jika dirasa aman, atau tambahkan nanti
// Contoh: app.use(express.json()); // Jika hanya butuh parser JSON bawaan Express

app.get('/', (req, res) => {
  console.log("[V2] netlify-handler.js: Express root path ('/') was hit!");
  res.status(200).json({ message: '[V2] Express Netlify Function is ALIVE!' });
});

// Jangan tambahkan rute atau middleware kompleks lainnya dulu

module.exports.handler = serverless(app);

console.log("[V2] netlify-handler.js: Express Handler exported."); 