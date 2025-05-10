const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mendapatkan semua kegiatan
exports.getAllKegiatan = async (req, res) => {
  try {
    const kegiatan = await prisma.kegiatan.findMany({
      include: {
        _count: {
          select: {
            peserta: true
          }
        }
      },
      orderBy: {
        tanggalMulai: 'desc'
      }
    });
    
    res.status(200).json(kegiatan);
  } catch (error) {
    console.error('Error getting kegiatan:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil data kegiatan',
      error: error.message 
    });
  }
};

// Mendapatkan detail kegiatan berdasarkan ID
exports.getKegiatanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: Number(id) },
      include: {
        peserta: {
          include: {
            warga: true
          }
        }
      }
    });
    
    if (!kegiatan) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    
    res.status(200).json(kegiatan);
  } catch (error) {
    console.error('Error getting kegiatan detail:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengambil detail kegiatan',
      error: error.message 
    });
  }
};

// Membuat kegiatan baru
exports.createKegiatan = async (req, res) => {
  try {
    const { 
      nama, 
      deskripsi, 
      tanggalMulai, 
      tanggalSelesai, 
      lokasi, 
      anggaran, 
      statusKegiatan 
    } = req.body;
    
    // Validasi data
    if (!nama || !deskripsi || !tanggalMulai || !statusKegiatan) {
      return res.status(400).json({ 
        message: 'Nama, deskripsi, tanggal mulai, dan status kegiatan harus diisi' 
      });
    }
    
    const newKegiatan = await prisma.kegiatan.create({
      data: {
        nama,
        deskripsi,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        lokasi,
        anggaran: anggaran ? parseFloat(anggaran) : null,
        statusKegiatan
      }
    });
    
    res.status(201).json({
      message: 'Kegiatan berhasil dibuat',
      data: newKegiatan
    });
  } catch (error) {
    console.error('Error creating kegiatan:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat membuat kegiatan',
      error: error.message 
    });
  }
};

// Mengupdate kegiatan
exports.updateKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nama, 
      deskripsi, 
      tanggalMulai, 
      tanggalSelesai, 
      lokasi, 
      anggaran, 
      statusKegiatan 
    } = req.body;
    
    // Validasi data
    if (!nama || !deskripsi || !tanggalMulai || !statusKegiatan) {
      return res.status(400).json({ 
        message: 'Nama, deskripsi, tanggal mulai, dan status kegiatan harus diisi' 
      });
    }
    
    // Periksa keberadaan kegiatan
    const kegiatanExists = await prisma.kegiatan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!kegiatanExists) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    
    // Update kegiatan
    const updatedKegiatan = await prisma.kegiatan.update({
      where: { id: Number(id) },
      data: {
        nama,
        deskripsi,
        tanggalMulai: new Date(tanggalMulai),
        tanggalSelesai: tanggalSelesai ? new Date(tanggalSelesai) : null,
        lokasi,
        anggaran: anggaran ? parseFloat(anggaran) : null,
        statusKegiatan
      }
    });
    
    res.status(200).json({
      message: 'Kegiatan berhasil diupdate',
      data: updatedKegiatan
    });
  } catch (error) {
    console.error('Error updating kegiatan:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengupdate kegiatan',
      error: error.message 
    });
  }
};

// Menghapus kegiatan
exports.deleteKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Periksa keberadaan kegiatan
    const kegiatanExists = await prisma.kegiatan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!kegiatanExists) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    
    // Hapus relasi peserta kegiatan terlebih dahulu
    await prisma.pesertaKegiatan.deleteMany({
      where: { kegiatanId: Number(id) }
    });
    
    // Hapus kegiatan
    await prisma.kegiatan.delete({
      where: { id: Number(id) }
    });
    
    res.status(200).json({ message: 'Kegiatan berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kegiatan:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus kegiatan',
      error: error.message 
    });
  }
};

// Menambah peserta ke kegiatan
exports.addPesertaKegiatan = async (req, res) => {
  try {
    const { kegiatanId, wargaId, statusKehadiran, peran } = req.body;
    
    // Validasi data
    if (!kegiatanId || !wargaId) {
      return res.status(400).json({ 
        message: 'ID kegiatan dan ID warga harus diisi' 
      });
    }
    
    // Periksa keberadaan kegiatan dan warga
    const kegiatan = await prisma.kegiatan.findUnique({
      where: { id: Number(kegiatanId) }
    });
    
    if (!kegiatan) {
      return res.status(404).json({ message: 'Kegiatan tidak ditemukan' });
    }
    
    const warga = await prisma.warga.findUnique({
      where: { id: Number(wargaId) }
    });
    
    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }
    
    // Periksa apakah warga sudah terdaftar sebagai peserta
    const existingPeserta = await prisma.pesertaKegiatan.findFirst({
      where: {
        kegiatanId: Number(kegiatanId),
        wargaId: Number(wargaId)
      }
    });
    
    if (existingPeserta) {
      return res.status(400).json({ 
        message: 'Warga sudah terdaftar sebagai peserta kegiatan ini' 
      });
    }
    
    // Tambah peserta
    const newPeserta = await prisma.pesertaKegiatan.create({
      data: {
        kegiatanId: Number(kegiatanId),
        wargaId: Number(wargaId),
        statusKehadiran: statusKehadiran || 'Belum Konfirmasi',
        peran: peran || 'Peserta'
      }
    });
    
    res.status(201).json({
      message: 'Peserta berhasil ditambahkan ke kegiatan',
      data: newPeserta
    });
  } catch (error) {
    console.error('Error adding peserta:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menambahkan peserta kegiatan',
      error: error.message 
    });
  }
};

// Mengupdate status kehadiran peserta
exports.updateStatusKehadiran = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusKehadiran } = req.body;
    
    // Validasi data
    if (!statusKehadiran) {
      return res.status(400).json({ 
        message: 'Status kehadiran harus diisi' 
      });
    }
    
    // Periksa keberadaan data peserta
    const pesertaExists = await prisma.pesertaKegiatan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!pesertaExists) {
      return res.status(404).json({ message: 'Data peserta tidak ditemukan' });
    }
    
    // Update status kehadiran
    const updatedPeserta = await prisma.pesertaKegiatan.update({
      where: { id: Number(id) },
      data: { statusKehadiran }
    });
    
    res.status(200).json({
      message: 'Status kehadiran berhasil diupdate',
      data: updatedPeserta
    });
  } catch (error) {
    console.error('Error updating kehadiran:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat mengupdate status kehadiran',
      error: error.message 
    });
  }
};

// Menghapus peserta dari kegiatan
exports.removePesertaKegiatan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Periksa keberadaan data peserta
    const pesertaExists = await prisma.pesertaKegiatan.findUnique({
      where: { id: Number(id) }
    });
    
    if (!pesertaExists) {
      return res.status(404).json({ message: 'Data peserta tidak ditemukan' });
    }
    
    // Hapus peserta
    await prisma.pesertaKegiatan.delete({
      where: { id: Number(id) }
    });
    
    res.status(200).json({ message: 'Peserta berhasil dihapus dari kegiatan' });
  } catch (error) {
    console.error('Error removing peserta:', error);
    res.status(500).json({ 
      message: 'Terjadi kesalahan saat menghapus peserta kegiatan',
      error: error.message 
    });
  }
}; 