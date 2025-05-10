const prisma = require('../models/prisma');

// Get semua iuran
exports.getAllIuran = async (req, res) => {
  try {
    const iuran = await prisma.iuran.findMany({
      include: {
        warga: {
          select: {
            id: true,
            nik: true,
            namaLengkap: true,
            alamat_domisili: true,
            keluarga: {
              include: {
                kartuKeluarga: true
              }
            }
          },
        },
      },
      orderBy: {
        tanggalBayar: 'desc',
      },
    });

    // Format data untuk menyertakan alamat dari KartuKeluarga
    const formattedIuran = iuran.map(item => {
      // Pastikan warga ada sebelum mengakses properti-propertinya
      if (!item.warga) {
        return {
          ...item,
          warga: {
            id: null,
            nik: '',
            namaLengkap: '',
            alamat: '',
            rt: '',
            rw: '',
            nomorKK: ''
          }
        };
      }
      
      // Pastikan keluarga ada dan merupakan array sebelum mengakses propertinya
      const keluarga = Array.isArray(item.warga.keluarga) ? item.warga.keluarga : [];
      
      // Pastikan kartuKeluarga ada sebelum mengakses propertinya
      const kartuKeluarga = keluarga.length > 0 && keluarga[0].kartuKeluarga 
        ? keluarga[0].kartuKeluarga 
        : null;
      
      return {
        ...item,
        warga: {
          ...item.warga,
          alamat: item.warga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
          rt: kartuKeluarga ? kartuKeluarga.rt : '',
          rw: kartuKeluarga ? kartuKeluarga.rw : '',
          nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
          keluarga: undefined // Hapus keluarga dari output untuk mengurangi ukuran data
        }
      };
    });

    res.json(formattedIuran);
  } catch (error) {
    console.error('Error fetching iuran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data iuran', error: error.message });
  }
};

// Get iuran by ID
exports.getIuranById = async (req, res) => {
  try {
    const { id } = req.params;
    const iuran = await prisma.iuran.findUnique({
      where: { id: Number(id) },
      include: {
        warga: {
          include: {
            keluarga: {
              include: {
                kartuKeluarga: true
              }
            }
          }
        },
      },
    });

    if (!iuran) {
      return res.status(404).json({ message: 'Iuran tidak ditemukan' });
    }

    // Pastikan warga ada sebelum mengakses properti-propertinya
    if (!iuran.warga) {
      return res.json({
        ...iuran,
        warga: {
          namaLengkap: '',
          alamat: '',
          rt: '',
          rw: '',
          nomorKK: '',
          statusHubungan: ''
        }
      });
    }

    // Pastikan keluarga ada dan merupakan array sebelum mengakses propertinya
    const keluarga = Array.isArray(iuran.warga.keluarga) ? iuran.warga.keluarga : [];
    
    // Pastikan kartuKeluarga ada sebelum mengakses propertinya
    const kartuKeluarga = keluarga.length > 0 && keluarga[0].kartuKeluarga 
      ? keluarga[0].kartuKeluarga 
      : null;
    
    const formattedIuran = {
      ...iuran,
      warga: {
        ...iuran.warga,
        alamat: iuran.warga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
        rt: kartuKeluarga ? kartuKeluarga.rt : '',
        rw: kartuKeluarga ? kartuKeluarga.rw : '',
        nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
        statusHubungan: keluarga.length > 0 ? keluarga[0].statusHubungan : '',
        keluarga: undefined // Hapus keluarga dari output untuk mengurangi ukuran data
      }
    };

    res.json(formattedIuran);
  } catch (error) {
    console.error('Error fetching iuran by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data iuran', error: error.message });
  }
};

// Get iuran by Warga ID
exports.getIuranByWargaId = async (req, res) => {
  try {
    const { wargaId } = req.params;
    const iuran = await prisma.iuran.findMany({
      where: { wargaId: Number(wargaId) },
      orderBy: {
        tanggalBayar: 'desc',
      },
    });

    res.json(iuran);
  } catch (error) {
    console.error('Error fetching iuran by warga ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data iuran', error: error.message });
  }
};

// Create iuran baru
exports.createIuran = async (req, res) => {
  try {
    const iuranData = req.body;
    
    // Validasi data wajib
    if (!iuranData.wargaId || !iuranData.jenisIuran || !iuranData.jumlah || !iuranData.tanggalBayar || !iuranData.statusPembayaran) {
      return res.status(400).json({ 
        message: 'Data iuran tidak lengkap. ID warga, jenis iuran, jumlah, tanggal bayar, dan status pembayaran wajib diisi.' 
      });
    }

    // Cek apakah warga ada
    const warga = await prisma.warga.findUnique({
      where: { id: Number(iuranData.wargaId) },
    });

    if (!warga) {
      return res.status(400).json({ message: 'Warga tidak ditemukan' });
    }

    // Konversi tanggalBayar dari string ke Date
    iuranData.tanggalBayar = new Date(iuranData.tanggalBayar);
    
    // Konversi wargaId ke number
    iuranData.wargaId = Number(iuranData.wargaId);
    
    // Konversi jumlah ke float
    iuranData.jumlah = parseFloat(iuranData.jumlah);

    const newIuran = await prisma.iuran.create({
      data: iuranData,
    });

    res.status(201).json(newIuran);
  } catch (error) {
    console.error('Error creating iuran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat data iuran', error: error.message });
  }
};

// Update iuran
exports.updateIuran = async (req, res) => {
  try {
    const { id } = req.params;
    const iuranData = req.body;

    // Konversi tanggalBayar dari string ke Date jika ada
    if (iuranData.tanggalBayar) {
      iuranData.tanggalBayar = new Date(iuranData.tanggalBayar);
    }
    
    // Konversi wargaId ke number jika ada
    if (iuranData.wargaId) {
      iuranData.wargaId = Number(iuranData.wargaId);
    }
    
    // Konversi jumlah ke float jika ada
    if (iuranData.jumlah) {
      iuranData.jumlah = parseFloat(iuranData.jumlah);
    }

    const updatedIuran = await prisma.iuran.update({
      where: { id: Number(id) },
      data: iuranData,
    });

    res.json(updatedIuran);
  } catch (error) {
    console.error('Error updating iuran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data iuran', error: error.message });
  }
};

// Delete iuran
exports.deleteIuran = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah iuran ada
    const iuran = await prisma.iuran.findUnique({
      where: { id: Number(id) },
    });

    if (!iuran) {
      return res.status(404).json({ message: 'Iuran tidak ditemukan' });
    }

    await prisma.iuran.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Data iuran berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting iuran:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data iuran', error: error.message });
  }
};

// Get ringkasan iuran
exports.getIuranSummary = async (req, res) => {
  try {
    // Hitung total per jenis iuran
    const iuranByJenis = await prisma.iuran.groupBy({
      by: ['jenisIuran'],
      _sum: {
        jumlah: true,
      },
      _count: true,
    });

    // Hitung total per status pembayaran
    const iuranByStatus = await prisma.iuran.groupBy({
      by: ['statusPembayaran'],
      _sum: {
        jumlah: true,
      },
      _count: true,
    });

    // Hitung total keseluruhan
    const totalIuran = await prisma.iuran.aggregate({
      _sum: {
        jumlah: true,
      },
      _count: true,
    });

    // Ambil 5 pembayaran terbaru
    const recentPaymentsRaw = await prisma.iuran.findMany({
      take: 5,
      orderBy: {
        tanggalBayar: 'desc',
      },
      include: {
        warga: {
          select: {
            namaLengkap: true,
            alamat_domisili: true,
            keluarga: {
              include: {
                kartuKeluarga: true
              }
            }
          },
        },
      },
    });

    // Format data untuk menyertakan alamat dari KartuKeluarga
    const recentPayments = recentPaymentsRaw.map(item => {
      // Pastikan warga ada sebelum mengakses properti-propertinya
      if (!item.warga) {
        return {
          ...item,
          warga: {
            namaLengkap: '',
            alamat: '',
            rt: '',
            rw: '',
            nomorKK: ''
          }
        };
      }
      
      // Pastikan keluarga ada dan merupakan array sebelum mengakses propertinya
      const keluarga = Array.isArray(item.warga.keluarga) ? item.warga.keluarga : [];
      
      // Pastikan kartuKeluarga ada sebelum mengakses propertinya
      const kartuKeluarga = keluarga.length > 0 && keluarga[0].kartuKeluarga 
        ? keluarga[0].kartuKeluarga 
        : null;
      
      return {
        ...item,
        warga: {
          ...item.warga,
          alamat: item.warga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
          rt: kartuKeluarga ? kartuKeluarga.rt : '',
          rw: kartuKeluarga ? kartuKeluarga.rw : '',
          nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
          keluarga: undefined // Hapus keluarga dari output untuk mengurangi ukuran data
        }
      };
    });

    res.json({
      byJenis: iuranByJenis,
      byStatus: iuranByStatus,
      total: totalIuran,
      recentPayments,
    });
  } catch (error) {
    console.error('Error fetching iuran summary:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil ringkasan iuran', error: error.message });
  }
}; 