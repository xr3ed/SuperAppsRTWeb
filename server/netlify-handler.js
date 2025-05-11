// server/netlify-handler.js
const serverless = require('serverless-http');
const express = require('express');

const app = express();

console.log("[V4] netlify-handler.js: Top level script execution, Express app initialized.");

// Rute root yang kita harapkan
app.get('/', (req, res) => {
  console.log("[V4] netlify-handler.js: Express root path ('/') was hit! Original URL:", req.originalUrl, "BaseURL:", req.baseUrl, "Path:", req.path);
  res.setHeader('X-Custom-Handler-Identifier', 'ExpressV4-Root');
  res.status(200).json({ message: '[V4] Express Netlify Function - Root Path - is ALIVE!' });
});

// Rute wildcard untuk menangkap semua path lain yang mungkin sampai ke Express
app.get('*', (req, res) => {
  console.log("[V4] netlify-handler.js: Express wildcard path ('*') was hit! Original URL:", req.originalUrl, "BaseURL:", req.baseUrl, "Path:", req.path);
  res.setHeader('X-Custom-Handler-Identifier', 'ExpressV4-Wildcard');
  res.status(404).json({ 
    message: '[V4] Express - Path not explicitly defined by app.get("/")',
    receivedOriginalUrl: req.originalUrl,
    receivedBaseUrl: req.baseUrl,
    receivedPath: req.path
  });
});

const expressAppHandler = serverless(app); // Ganti nama variabel agar tidak bentrok

console.log("[V4] netlify-handler.js: serverless(app) created.");

module.exports.handler = async (event, context) => {
  console.log("[V4] netlify-handler.js: Netlify entrypoint invoked. Event Path:", event.path, "HTTP Method:", event.httpMethod);
  // console.log("[V4] Full Event:", JSON.stringify(event)); // Uncomment jika perlu detail event lengkap
  return expressAppHandler(event, context);
};

console.log("[V4] netlify-handler.js: Handler exported to Netlify."); 