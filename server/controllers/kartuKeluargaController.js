const prisma = require('../models/prisma'); // Menggunakan instance Prisma Client bersama
// const { PrismaClient } = require('@prisma/client'); // Hapus atau komentari ini
// const prisma = new PrismaClient(); // Hapus atau komentari ini

// Get semua kartu keluarga
exports.getAllKartuKeluarga = async (req, res) => {
  try {
    const kartuKeluarga = await prisma.kartuKeluarga.findMany({
      include: {
        anggota: {
          include: {
            warga: true
          }
        }
      }
    });
    res.status(200).json(kartuKeluarga);
  } catch (error) {
    console.error('Error getting all kartu keluarga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kartu keluarga', error: error.message });
  }
};

// Get kartu keluarga berdasarkan ID
exports.getKartuKeluargaById = async (req, res) => {
  try {
    const { id } = req.params;
    const kartuKeluarga = await prisma.kartuKeluarga.findUnique({
      where: { id: Number(id) },
      include: {
        anggota: {
          include: {
            warga: true
          }
        }
      }
    });

    if (!kartuKeluarga) {
      return res.status(404).json({ message: 'Kartu Keluarga tidak ditemukan' });
    }

    res.status(200).json(kartuKeluarga);
  } catch (error) {
    console.error('Error getting kartu keluarga by id:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kartu keluarga', error: error.message });
  }
};

// Get kartu keluarga berdasarkan Nomor KK
exports.getKartuKeluargaByNomorKK = async (req, res) => {
  try {
    const { nomorKK } = req.params;
    const kartuKeluarga = await prisma.kartuKeluarga.findUnique({
      where: { nomorKK },
      include: {
        anggota: {
          include: {
            warga: true
          }
        }
      }
    });

    if (!kartuKeluarga) {
      return res.status(404).json({ message: 'Kartu Keluarga tidak ditemukan' });
    }

    res.status(200).json(kartuKeluarga);
  } catch (error) {
    console.error('Error getting kartu keluarga by nomor KK:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data kartu keluarga', error: error.message });
  }
};

// Buat kartu keluarga baru
exports.createKartuKeluarga = async (req, res) => {
  try {
    // Ambil kepalaKeluargaId dari body, bukan kepalaKeluarga (string nama)
    const { nomorKK, alamat, rt, rw, kelurahan, kecamatan, kabupatenKota, provinsi, kodePos, kepalaKeluargaId } = req.body;

    // Validasi data masukan
    if (!nomorKK || nomorKK.length !== 16 || !/^\d+$/.test(nomorKK)) {
      return res.status(400).json({ message: 'Nomor KK harus 16 digit angka' });
    }
    if (!alamat || alamat.length < 5 || alamat.length > 255) {
      return res.status(400).json({ message: 'Alamat tidak valid (min 5, max 255 karakter)' });
    }
    if (!rt || !/^\d{1,3}$/.test(rt)) {
      return res.status(400).json({ message: 'RT harus berupa angka 1-3 digit' });
    }
    if (!rw || !/^\d{1,3}$/.test(rw)) {
      return res.status(400).json({ message: 'RW harus berupa angka 1-3 digit' });
    }
    if (kodePos && !/^\d{5}$/.test(kodePos)) {
      return res.status(400).json({ message: 'Kode pos harus 5 digit angka' });
    }
    if (!kepalaKeluargaId) {
        return res.status(400).json({ message: 'kepalaKeluargaId wajib diisi' });
    }

    // Cek apakah nomor KK sudah ada
    const existingKKByNomor = await prisma.kartuKeluarga.findUnique({
      where: { nomorKK }
    });
    if (existingKKByNomor) {
      return res.status(400).json({ message: 'Nomor KK sudah terdaftar' });
    }

    // Ambil namaLengkap dari Warga yang menjadi kepala keluarga
    let wargaKepalaKeluarga;
    try {
        wargaKepalaKeluarga = await prisma.warga.findUnique({
             where: {id: Number(kepalaKeluargaId)} 
        });
    } catch (wargaError) {
        console.error('[createKartuKeluarga] Error fetching Warga for kepalaKeluargaId:', wargaError);
        return res.status(500).json({ message: 'Gagal mengambil data Kepala Keluarga.', error: wargaError.message });
    }

    if (!wargaKepalaKeluarga) {
        return res.status(404).json({ message: `Warga dengan ID ${kepalaKeluargaId} untuk Kepala Keluarga tidak ditemukan.` });
    }

    const kartuKeluarga = await prisma.kartuKeluarga.create({
      data: {
        nomorKK,
        kepalaKeluarga: wargaKepalaKeluarga.namaLengkap,
        alamat,
        rt,
        rw,
        kelurahan,
        kecamatan,
        kabupatenKota,
        provinsi,
        kodePos
      }
    });

    // Setelah KK dibuat, kita perlu membuat relasi di KeluargaWarga untuk kepala keluarga
    if (kartuKeluarga && wargaKepalaKeluarga) {
      await prisma.keluargaWarga.create({
        data: {
          wargaId: wargaKepalaKeluarga.id,
          kartuKeluargaId: kartuKeluarga.id,
          statusHubungan: 'Kepala Keluarga'
        }
      });
    }

    res.status(201).json({ message: 'Kartu Keluarga berhasil dibuat', data: kartuKeluarga });
  } catch (error) {
    console.error('Error creating kartu keluarga:', error);
    // Check if it's a Prisma unique constraint violation (e.g. for nomorKK if somehow the first check missed it due to race condition, though unlikely)
    if (error.code === 'P2002' && error.meta?.target?.includes('nomorKK')) {
        return res.status(400).json({ message: 'Nomor KK sudah terdaftar (pelanggaran constraint).' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan saat membuat kartu keluarga', error: error.message });
  }
};

// Update kartu keluarga
exports.updateKartuKeluarga = async (req, res) => {
  const { id } = req.params;
  const {
    nomorKK,
    alamat,
    rt,
    rw,
    kelurahan,
    kecamatan,
    kabupatenKota,
    provinsi,
    kodePos,
    kepalaKeluargaData
  } = req.body;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validasi Kartu Keluarga
      const existingKK = await tx.kartuKeluarga.findUnique({
        where: { id: Number(id) },
      });

      if (!existingKK) {
        return res.status(404).json({ message: 'Kartu Keluarga tidak ditemukan' });
      }

      // 2. Validasi Nomor KK jika diubah
      if (nomorKK && nomorKK !== existingKK.nomorKK) {
        const duplicateKK = await tx.kartuKeluarga.findUnique({
          where: { nomorKK },
        });
        if (duplicateKK) {
          return res.status(400).json({ message: 'Nomor KK sudah digunakan oleh kartu keluarga lain' });
        }
      }

      let updatedWargaKepalaKeluarga;
      // 3. Update data Kepala Keluarga (Warga)
      if (kepalaKeluargaData) {
        const { nik, originalNik, ...wargaDataToUpdate } = kepalaKeluargaData;
        
        let wargaToUpdate;
        if (originalNik && originalNik !== nik) {
          // NIK diubah, cari berdasarkan NIK lama
          wargaToUpdate = await tx.warga.findUnique({ where: { nik: originalNik } });
          if (!wargaToUpdate) {
            return res.status(404).json({ message: `Warga (Kepala Keluarga) dengan NIK lama ${originalNik} tidak ditemukan.` });
          }
          // Jika NIK baru sudah ada pada warga lain (selain warga yang sedang diedit berdasarkan originalNik)
          const nikConflict = await tx.warga.findFirst({ where: { nik: nik, id: { not: wargaToUpdate.id } } });
          if (nikConflict) {
            return res.status(400).json({ message: `NIK baru ${nik} sudah digunakan oleh warga lain.` });
          }
          wargaDataToUpdate.nik = nik; // Sertakan NIK baru untuk diupdate
        } else {
          // NIK tidak diubah, atau ini NIK awal, cari berdasarkan NIK saat ini
          wargaToUpdate = await tx.warga.findUnique({ where: { nik: nik } });
          if (!wargaToUpdate) {
            // Skenario jika saat edit KK, NIK kepala keluarga baru dan tidak ada originalNik
            // Ini bisa berarti membuat warga baru atau error. Untuk saat ini, kita anggap error jika tidak ketemu.
            return res.status(404).json({ message: `Warga (Kepala Keluarga) dengan NIK ${nik} tidak ditemukan.` });
          }
        }
        
        // Pastikan warga yang akan diupdate adalah memang anggota KK ini dan berstatus Kepala Keluarga
        const relasiKeluarga = await tx.keluargaWarga.findFirst({
            where: {
                kartuKeluargaId: Number(id),
                wargaId: wargaToUpdate.id,
                statusHubungan: 'Kepala Keluarga'
            }
        });

        if (!relasiKeluarga) {
            // Ini bisa terjadi jika NIK yang diinput adalah milik warga lain yang bukan kepala keluarga di KK ini.
            // Atau jika terjadi perubahan NIK kepala keluarga ke NIK warga lain.
            // Logika ini perlu diperketat. Untuk sekarang, kita cegah jika tidak match.
            return res.status(400).json({ message: `Warga dengan NIK ${nik} bukan Kepala Keluarga yang sah untuk KK ini.` });
        }

        updatedWargaKepalaKeluarga = await tx.warga.update({
          where: { id: wargaToUpdate.id }, // Update berdasarkan ID internal warga
          data: wargaDataToUpdate,
        });
      }

      // 4. Update data Kartu Keluarga
      const updatedKK = await tx.kartuKeluarga.update({
        where: { id: Number(id) },
        data: {
          nomorKK: nomorKK || existingKK.nomorKK,
          alamat: alamat || existingKK.alamat,
          rt: rt || existingKK.rt,
          rw: rw || existingKK.rw,
          kelurahan: kelurahan || existingKK.kelurahan,
          kecamatan: kecamatan || existingKK.kecamatan,
          kabupatenKota: kabupatenKota || existingKK.kabupatenKota,
          provinsi: provinsi || existingKK.provinsi,
          kodePos: kodePos || existingKK.kodePos,
          // Update nama kepala keluarga di tabel KK
          kepalaKeluarga: updatedWargaKepalaKeluarga ? updatedWargaKepalaKeluarga.namaLengkap : existingKK.kepalaKeluarga,
        },
      });
      return { updatedKK, updatedWargaKepalaKeluarga }; // Kembalikan hasil dari transaksi
    });

    // Cek jika transaksi mengembalikan respons error secara langsung (karena res.status().json() tidak bisa dalam transaksi)
    if (result && result.status && typeof result.json === 'function') {
        // Ini adalah hack karena kita tidak bisa langsung res.status().json() dari dalam transaction
        // Seharusnya validasi dilakukan sebelum transaksi, atau transaction melempar error yang ditangkap di luar
        // Untuk sementara biarkan seperti ini, tapi idealnya return value khusus untuk error handling.
        return; // Sudah di-handle oleh return res.status().json(...)
    }

    res.status(200).json({ 
        message: 'Kartu Keluarga dan data Kepala Keluarga berhasil diperbarui', 
        data: result.updatedKK, // Kirim data KK yang sudah diupdate
        kepalaKeluarga: result.updatedWargaKepalaKeluarga // Kirim data warga kepala keluarga yang sudah diupdate
    });

  } catch (error) {
    console.error('Error updating kartu keluarga:', error);
    // Jika error dari validasi yang melempar error eksplisit
    if (error.message.includes('Nomor KK sudah digunakan') || error.message.includes('tidak ditemukan') || error.message.includes('NIK baru sudah digunakan')) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui kartu keluarga', error: error.message });
  }
};

// Hapus kartu keluarga
exports.deleteKartuKeluarga = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah kartu keluarga ada
    const existingKK = await prisma.kartuKeluarga.findUnique({
      where: { id: Number(id) }
    });

    if (!existingKK) {
      return res.status(404).json({ message: 'Kartu Keluarga tidak ditemukan' });
    }

    // Hapus semua relasi keluarga terkait
    await prisma.keluargaWarga.deleteMany({
      where: { kartuKeluargaId: Number(id) }
    });

    // Hapus kartu keluarga
    await prisma.kartuKeluarga.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Kartu Keluarga berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting kartu keluarga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus kartu keluarga', error: error.message });
  }
};

// Tambah anggota ke kartu keluarga
exports.addAnggotaKeluarga = async (req, res) => {
  try {
    const { kartuKeluargaId, wargaId, statusHubungan } = req.body;
    
    // Validasi input dasar
    if (!kartuKeluargaId || !wargaId || !statusHubungan) {
      return res.status(400).json({ message: 'Data tidak lengkap: kartuKeluargaId, wargaId, dan statusHubungan wajib diisi' });
    }
    
    // Validasi status hubungan
    const validStatusHubungan = ['Kepala Keluarga', 'Istri', 'Anak', 'Cucu', 'Orang Tua', 'Mertua', 'Menantu', 'Famili Lain', 'Lainnya'];
    if (!validStatusHubungan.includes(statusHubungan)) {
      return res.status(400).json({ message: 'Status hubungan tidak valid' });
    }

    // Cek apakah kartu keluarga ada
    const kartuKeluarga = await prisma.kartuKeluarga.findUnique({
      where: { id: Number(kartuKeluargaId) },
      include: {
        anggota: {
          include: {
            warga: true
          }
        }
      }
    });

    if (!kartuKeluarga) {
      return res.status(404).json({ message: 'Kartu Keluarga tidak ditemukan' });
    }

    // Cek apakah warga ada
    const warga = await prisma.warga.findUnique({
      where: { id: Number(wargaId) }
    });

    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }

    // Cek apakah warga sudah terdaftar di KK ini
    const existingRelasi = await prisma.keluargaWarga.findFirst({
      where: {
        kartuKeluargaId: Number(kartuKeluargaId),
        wargaId: Number(wargaId)
      }
    });

    if (existingRelasi) {
      return res.status(400).json({ message: 'Warga sudah terdaftar dalam kartu keluarga ini' });
    }

    // Cek jika status "Kepala Keluarga" dan sudah ada kepala keluarga lain
    if (statusHubungan === 'Kepala Keluarga') {
      const existingKepala = await prisma.keluargaWarga.findFirst({
        where: {
          kartuKeluargaId: Number(kartuKeluargaId),
          statusHubungan: 'Kepala Keluarga'
        }
      });

      if (existingKepala) {
        return res.status(400).json({ 
          message: 'Kartu Keluarga ini sudah memiliki Kepala Keluarga. Tidak bisa menambahkan Kepala Keluarga baru.' 
        });
      }
      
      // Update field kepalaKeluarga di KK
      // await prisma.kartuKeluarga.update({  // DIKOMENTARI SEMENTARA
      //   where: { id: Number(kartuKeluargaId) },
      //   data: { kepalaKeluarga: warga.namaLengkap }
      // });
    }

    // Tambah anggota ke KK
    const anggotaKeluarga = await prisma.keluargaWarga.create({
      data: {
        kartuKeluargaId: Number(kartuKeluargaId),
        wargaId: Number(wargaId),
        statusHubungan
      }
    });

    res.status(201).json({ message: 'Anggota keluarga berhasil ditambahkan', data: anggotaKeluarga });
  } catch (error) {
    console.error('Error adding anggota keluarga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan anggota ke kartu keluarga', error: error.message });
  }
};

// Hapus anggota dari kartu keluarga
exports.removeAnggotaKeluarga = async (req, res) => {
  try {
    const { id } = req.params; // ID dari KeluargaWarga

    // Cek apakah relasi keluarga ada
    const keluargaWarga = await prisma.keluargaWarga.findUnique({
      where: { id: Number(id) },
      include: {
        warga: true,
        kartuKeluarga: true
      }
    });

    if (!keluargaWarga) {
      return res.status(404).json({ message: 'Relasi anggota keluarga tidak ditemukan' });
    }

    // Cek apakah anggota yang akan dihapus adalah kepala keluarga
    if (keluargaWarga.statusHubungan.toLowerCase() === 'kepala keluarga') {
      // Hitung jumlah anggota keluarga
      const anggotaCount = await prisma.keluargaWarga.count({
        where: { kartuKeluargaId: keluargaWarga.kartuKeluargaId }
      });

      if (anggotaCount > 1) {
        return res.status(400).json({ 
          message: 'Tidak dapat menghapus Kepala Keluarga. Ubah status Kepala Keluarga ke anggota lain terlebih dahulu.' 
        });
      }
    }

    // Hapus relasi keluarga
    await prisma.keluargaWarga.delete({
      where: { id: Number(id) }
    });

    res.status(200).json({ message: 'Anggota keluarga berhasil dihapus' });
  } catch (error) {
    console.error('Error removing anggota keluarga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus anggota keluarga', error: error.message });
  }
};

// Update status hubungan anggota keluarga
exports.updateStatusHubungan = async (req, res) => {
  try {
    const { id } = req.params; // ID dari KeluargaWarga
    const { statusHubungan } = req.body;

    // Cek apakah relasi keluarga ada
    const keluargaWarga = await prisma.keluargaWarga.findUnique({
      where: { id: Number(id) },
      include: {
        warga: true,
        kartuKeluarga: true
      }
    });

    if (!keluargaWarga) {
      return res.status(404).json({ message: 'Relasi anggota keluarga tidak ditemukan' });
    }

    // Jika status baru adalah kepala keluarga, update kartuKeluarga
    if (statusHubungan.toLowerCase() === 'kepala keluarga') {
      // Cek apakah sudah ada kepala keluarga lain
      const existingKepala = await prisma.keluargaWarga.findFirst({
        where: {
          kartuKeluargaId: keluargaWarga.kartuKeluargaId,
          statusHubungan: { equals: 'Kepala Keluarga', mode: 'insensitive' },
          id: { not: Number(id) }
        }
      });

      if (existingKepala) {
        // Update status kepala keluarga yang lama
        await prisma.keluargaWarga.update({
          where: { id: existingKepala.id },
          data: { statusHubungan: 'Anggota Keluarga' }
        });
      }

      // Update nama kepala keluarga di kartu keluarga
      await prisma.kartuKeluarga.update({
        where: { id: keluargaWarga.kartuKeluargaId },
        data: { kepalaKeluarga: keluargaWarga.warga.namaLengkap }
      });
    }

    // Update status hubungan
    const updatedKeluargaWarga = await prisma.keluargaWarga.update({
      where: { id: Number(id) },
      data: { statusHubungan }
    });

    res.status(200).json({
      message: 'Status hubungan berhasil diperbarui',
      data: updatedKeluargaWarga
    });
  } catch (error) {
    console.error('Error updating status hubungan:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui status hubungan', error: error.message });
  }
}; 