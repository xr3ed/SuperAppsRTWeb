const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');

// Routes untuk kegiatan
router.get('/', kegiatanController.getAllKegiatan);
router.get('/:id', kegiatanController.getKegiatanById);
router.post('/', kegiatanController.createKegiatan);
router.put('/:id', kegiatanController.updateKegiatan);
router.delete('/:id', kegiatanController.deleteKegiatan);

// Routes untuk peserta kegiatan
router.post('/peserta', kegiatanController.addPesertaKegiatan);
router.put('/peserta/:id', kegiatanController.updateStatusKehadiran);
router.delete('/peserta/:id', kegiatanController.removePesertaKegiatan);

module.exports = router; 