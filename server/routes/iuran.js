const express = require('express');
const router = express.Router();
const iuranController = require('../controllers/iuranController');

// GET /api/iuran - Get semua iuran
router.get('/', iuranController.getAllIuran);

// GET /api/iuran/summary - Get ringkasan iuran
router.get('/summary', iuranController.getIuranSummary);

// GET /api/iuran/warga/:wargaId - Get iuran by warga ID
router.get('/warga/:wargaId', iuranController.getIuranByWargaId);

// GET /api/iuran/:id - Get iuran by ID
router.get('/:id', iuranController.getIuranById);

// POST /api/iuran - Create iuran baru
router.post('/', iuranController.createIuran);

// PUT /api/iuran/:id - Update iuran
router.put('/:id', iuranController.updateIuran);

// DELETE /api/iuran/:id - Delete iuran
router.delete('/:id', iuranController.deleteIuran);

module.exports = router; 