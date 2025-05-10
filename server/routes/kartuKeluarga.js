const express = require('express');
const router = express.Router();
const kartuKeluargaController = require('../controllers/kartuKeluargaController');

// Get semua kartu keluarga
router.get('/', kartuKeluargaController.getAllKartuKeluarga);

// Get kartu keluarga berdasarkan ID
router.get('/:id', kartuKeluargaController.getKartuKeluargaById);

// Get kartu keluarga berdasarkan Nomor KK
router.get('/nomor/:nomorKK', kartuKeluargaController.getKartuKeluargaByNomorKK);

// Buat kartu keluarga baru
router.post('/', kartuKeluargaController.createKartuKeluarga);

// Update kartu keluarga
router.put('/:id', kartuKeluargaController.updateKartuKeluarga);

// Hapus kartu keluarga
router.delete('/:id', kartuKeluargaController.deleteKartuKeluarga);

// Tambah anggota ke kartu keluarga
router.post('/anggota', kartuKeluargaController.addAnggotaKeluarga);

// Hapus anggota dari kartu keluarga
router.delete('/anggota/:id', kartuKeluargaController.removeAnggotaKeluarga);

// Update status hubungan anggota keluarga
router.put('/anggota/:id', kartuKeluargaController.updateStatusHubungan);

module.exports = router; 