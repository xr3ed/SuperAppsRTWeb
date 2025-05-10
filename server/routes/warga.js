const express = require('express');
const router = express.Router();
const wargaController = require('../controllers/wargaController');

// GET /api/warga - Get semua warga
router.get('/', wargaController.getAllWarga);

// GET /api/warga/search?query=keyword - Search warga
router.get('/search', wargaController.searchWarga);

// GET /api/warga/:id - Get warga by ID
router.get('/:id', wargaController.getWargaById);

// GET /api/warga/export/csv - Export warga data to CSV
router.get('/export/csv', wargaController.exportWargaToCSV);

// GET /api/warga/export/pdf - Export warga data to PDF
router.get('/export/pdf', wargaController.exportWargaToPDF);

// POST /api/warga - Create warga baru
router.post('/', wargaController.createWarga);

// PUT /api/warga/:id - Update warga
router.put('/:id', wargaController.updateWarga);

// DELETE /api/warga/:id - Delete warga
router.delete('/:id', wargaController.deleteWarga);

module.exports = router; 