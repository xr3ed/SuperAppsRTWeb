// server/prisma-client-helper.js
// Helper untuk memastikan Prisma Client tersedia untuk fungsi serverless

// Jika kita di lingkungan development, gunakan Prisma Client seperti biasa
if (process.env.NODE_ENV !== 'production') {
  module.exports = require('@prisma/client');
} else {
  // Di lingkungan production (Netlify Functions), coba akses Prisma Client dari berbagai lokasi
  try {
    // Pertama coba akses Prisma Client dari node_modules lokal server
    module.exports = require('@prisma/client');
  } catch (e) {
    console.log('Trying to load Prisma Client from root directory...');
    try {
      // Jika gagal, coba akses dari direktori root
      module.exports = require('../node_modules/@prisma/client');
    } catch (rootError) {
      console.error('Failed to load Prisma Client from server or root directory', rootError);
      throw new Error('Could not load Prisma Client. Please make sure prisma generate was run correctly.');
    }
  }
} 