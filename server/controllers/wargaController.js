const pool = require('../models/prisma');
const { Parser } = require('json2csv');
const PdfPrinter = require('pdfmake');
const path = require('path');

// Shared configuration for exportable fields
const ALL_EXPORTABLE_FIELDS_CONFIG = [
  { label: 'NIK', value: 'nik', default: true },
  { label: 'Nama Lengkap', value: 'namaLengkap', default: true },
  { label: 'Jenis Kelamin', value: 'jenisKelamin', default: true },
  { label: 'Tempat Lahir', value: 'tempatLahir', default: true },
  { label: 'Tanggal Lahir (DD/MM/YYYY)', value: 'tanggalLahir', default: true },
  { label: 'Agama', value: 'agama', default: true },
  { label: 'Status Perkawinan', value: 'statusPerkawinan', default: true },
  { label: 'Pekerjaan', value: 'pekerjaan', default: true },
  { label: 'Pendidikan Terakhir', value: 'pendidikanTerakhir', default: false },
  { label: 'Nomor Telepon', value: 'nomorTelepon', default: false },
  { label: 'Email', value: 'email', default: false },
  { label: 'Nomor KK', value: 'nomorKK', default: true },
  { label: 'Alamat (Sesuai KK/Domisili)', value: 'alamatKK', default: false },
  { label: 'Status Hub. dlm KK', value: 'statusHubunganDalamKK', default: false },
  { label: 'Kewarganegaraan', value: 'kewarganegaraan', default: false },
];

// Helper function to build Prisma where clause for warga filter
const buildWargaFilterQuery = (queryParams) => {
  const where = {};
  const andConditions = [];

  // Pencarian teks umum (NIK atau Nama)
  if (queryParams.search) {
    andConditions.push({
      OR: [
        { nik: { contains: queryParams.search, mode: 'insensitive' } },
        { namaLengkap: { contains: queryParams.search, mode: 'insensitive' } },
      ],
    });
  }

  if (queryParams.agama) {
    andConditions.push({ agama: queryParams.agama });
  }

  if (queryParams.jenisKelamin) {
    andConditions.push({ jenisKelamin: queryParams.jenisKelamin });
  }

  if (queryParams.statusPerkawinan) {
    andConditions.push({ statusPerkawinan: queryParams.statusPerkawinan });
  }

  if (queryParams.pekerjaan) {
     andConditions.push({ pekerjaan: { contains: queryParams.pekerjaan, mode: 'insensitive' } });
  }

  if (queryParams.pendidikanTerakhir) {
    andConditions.push({ pendidikanTerakhir: queryParams.pendidikanTerakhir });
  }
  
  // Filter Usia
  const today = new Date();
  if (queryParams.minUsia) {
    const minBirthDate = new Date(today.getFullYear() - parseInt(queryParams.minUsia, 10), today.getMonth(), today.getDate());
    andConditions.push({ tanggalLahir: { lte: minBirthDate } }); 
  }
  if (queryParams.maxUsia) {
     const maxBirthDate = new Date(today.getFullYear() - parseInt(queryParams.maxUsia, 10) - 1, today.getMonth(), today.getDate());
     andConditions.push({ tanggalLahir: { gte: maxBirthDate } }); 
  }
  
  if (queryParams.usia && queryParams.usiaOperator) {
    const targetAge = parseInt(queryParams.usia, 10);
    if (queryParams.usiaOperator === 'diatas') {
        const birthDateLimit = new Date(today.getFullYear() - targetAge, today.getMonth(), today.getDate());
        andConditions.push({ tanggalLahir: { lt: birthDateLimit } });
    } else if (queryParams.usiaOperator === 'dibawah') {
        // Untuk usia < targetAge, berarti lahir setelah (targetAge + 1) tahun lalu dari hari ini
        // Contoh: jika targetAge = 20, usia < 20 berarti lahir setelah (hari ini - 21 tahun)
        // Ini karena jika lahir tepat (hari ini - 20 tahun), usianya sudah 20.
        const birthDateLimit = new Date(today.getFullYear() - targetAge, today.getMonth(), today.getDate());
        andConditions.push({ tanggalLahir: { gt: birthDateLimit } });
    } else if (queryParams.usiaOperator === 'samaDengan') {
        const birthYear = today.getFullYear() - targetAge;
        // Mencari yang tahun lahirnya adalah birthYear
        // dan belum ulang tahun tahun ini ATAU sudah ulang tahun tahun ini
        const startDate = new Date(birthYear, 0, 1); // Awal tahun kelahiran
        const endDate = new Date(birthYear + 1, 0, 0); // Akhir tahun kelahiran (00:00:00 hari pertama tahun berikutnya dikurangi 1 detik)
        
        // Logika yang lebih akurat untuk "samaDengan" usia:
        // Tanggal lahir harus antara (today - (targetAge + 1) years + 1 day) dan (today - targetAge years)
        const lowerBoundDate = new Date(today.getFullYear() - (targetAge + 1), today.getMonth(), today.getDate() + 1);
        const upperBoundDate = new Date(today.getFullYear() - targetAge, today.getMonth(), today.getDate());

        andConditions.push({
            tanggalLahir: {
                gte: lowerBoundDate,
                lte: upperBoundDate
            }
        });
    }
  }

  // Filter Hanya Kepala Keluarga
  if (queryParams.hanyaKepalaKeluarga === 'true' || queryParams.hanyaKepalaKeluarga === true) {
    andConditions.push({
      keluarga: {
        some: {
          statusHubungan: 'Kepala Keluarga', 
        },
      },
    });
  }
  
  if (andConditions.length > 0) {
    where.AND = andConditions;
  }
  return where;
};

// Get semua warga
exports.getAllWarga = async (req, res) => {
  try {
    // console.log('[wargaController.js] getAllWarga: Mencoba mengambil data warga dengan Prisma Client');
    
    // Dapatkan parameter filter dari query request
    // Ganti req.query dengan sumber parameter filter yang sesuai jika berbeda
    const filters = buildWargaFilterQuery(req.query); 

    const wargaList = await pool.warga.findMany({
      where: filters, // Gunakan filter yang sudah dibangun
      include: {
        keluarga: { // Untuk mendapatkan statusHubungan dan data KK terkait
          include: {
            kartuKeluarga: true, // Untuk mendapatkan nomorKK, alamatKK, dll.
          },
        },
      },
      orderBy: {
        namaLengkap: 'asc',
      },
    });

    // console.log(`[wargaController.js] getAllWarga: Berhasil mengambil ${wargaList.length} data warga`);

    // Transformasi data untuk frontend
    const wargaWithDetails = wargaList.map(w => {
      // Logika untuk menentukan detail dari relasi keluarga dan kartuKeluarga
      let nomor_kk = '';
      let alamat_kk = '';
      let rt = '';
      let rw = '';
      let kelurahan = '';
      let kecamatan = '';
      let status_hubungan = '';
      let isKepalaKeluarga = false;

      if (w.keluarga && w.keluarga.length > 0) {
        // Asumsi satu warga hanya terhubung ke satu KK aktif pada satu waktu melalui KeluargaWarga
        // atau ambil yang pertama jika ada beberapa (perlu penyesuaian jika logika bisnis berbeda)
        const keluargaInfo = w.keluarga[0]; 
        if (keluargaInfo) {
          status_hubungan = keluargaInfo.statusHubungan;
          isKepalaKeluarga = status_hubungan === 'Kepala Keluarga';
          if (keluargaInfo.kartuKeluarga) {
            const kk = keluargaInfo.kartuKeluarga;
            nomor_kk = kk.nomorKK;
            alamat_kk = kk.alamat;
            rt = kk.rt;
            rw = kk.rw;
            kelurahan = kk.kelurahan || '';
            kecamatan = kk.kecamatan || '';
          }
        }
      }
      
      return {
        id: w.id,
        nik: w.nik,
        namaLengkap: w.namaLengkap,
        tempatLahir: w.tempatLahir,
        tanggalLahir: w.tanggalLahir, // Pastikan format tanggal sesuai kebutuhan frontend
        jenisKelamin: w.jenisKelamin,
        // Alamat diambil dari alamat_domisili Warga, atau dari alamat KartuKeluarga jika ada
        alamat: w.alamat_domisili || alamat_kk || '',
        agama: w.agama,
        statusPerkawinan: w.statusPerkawinan,
        pekerjaan: w.pekerjaan,
        pendidikanTerakhir: w.pendidikanTerakhir,
        kewarganegaraan: w.kewarganegaraan,
        nomorTelepon: w.nomorTelepon,
        email: w.email,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
        rt: rt,
        rw: rw,
        kelurahan: kelurahan,
        kecamatan: kecamatan,
        nomorKK: nomor_kk,
        statusHubungan: status_hubungan,
        isKepalaKeluarga: isKepalaKeluarga,
      };
    });

    res.json(wargaWithDetails);
  } catch (error) {
    console.error('Error fetching warga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data warga', error: error.message });
  }
};

// Get warga by ID
exports.getWargaById = async (req, res) => {
  try {
    const { id } = req.params;
    const warga = await pool.warga.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true,
          },
        },
        iuran: true,
      },
    });

    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }

    const keluargaHubungan = warga.keluarga && warga.keluarga.length > 0 ? warga.keluarga[0] : null;
    const kartuKeluarga = keluargaHubungan ? keluargaHubungan.kartuKeluarga : null;
    const isKepalaKeluarga = warga.keluarga ? warga.keluarga.some(k => k.statusHubungan === 'Kepala Keluarga') : false;

    const wargaWithDetails = {
      ...warga,
      alamat: warga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
      rt: kartuKeluarga ? kartuKeluarga.rt : '',
      rw: kartuKeluarga ? kartuKeluarga.rw : '',
      kelurahan: kartuKeluarga ? kartuKeluarga.kelurahan : null,
      kecamatan: kartuKeluarga ? kartuKeluarga.kecamatan : null,
      nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
      statusHubungan: keluargaHubungan ? keluargaHubungan.statusHubungan : '',
      isKepalaKeluarga: isKepalaKeluarga
    };

    res.json(wargaWithDetails);
  } catch (error) {
    console.error('Error fetching warga by ID:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data warga', error: error.message });
  }
};

// Create warga baru
exports.createWarga = async (req, res) => {
  try {
    const { nik, namaLengkap, tempatLahir, tanggalLahir, jenisKelamin, agama, statusPerkawinan, pekerjaan, pendidikanTerakhir, kewarganegaraan, email, nomorTelepon, alamat_domisili } = req.body;
    
    // Validasi NIK
    if (!nik) {
      return res.status(400).json({ message: 'NIK wajib diisi' });
    }
    
    if (nik.length !== 16 || !/^\d+$/.test(nik)) {
      return res.status(400).json({ message: 'NIK harus berupa 16 digit angka' });
    }
    
    // Validasi nama
    if (!namaLengkap) {
      return res.status(400).json({ message: 'Nama lengkap wajib diisi' });
    }
    
    if (namaLengkap.length < 3 || namaLengkap.length > 100) {
      return res.status(400).json({ message: 'Nama lengkap harus antara 3-100 karakter' });
    }
    
    // Validasi jenis kelamin
    if (!jenisKelamin) {
      return res.status(400).json({ message: 'Jenis kelamin wajib diisi' });
    }
    
    if (!['Laki-laki', 'Perempuan'].includes(jenisKelamin)) {
      return res.status(400).json({ message: 'Jenis kelamin harus Laki-laki atau Perempuan' });
    }
    
    // Validasi tanggal lahir jika ada
    if (tanggalLahir) {
      const birthDate = new Date(tanggalLahir);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({ message: 'Format tanggal lahir tidak valid' });
      }
      
      if (birthDate > today) {
        return res.status(400).json({ message: 'Tanggal lahir tidak boleh di masa depan' });
      }
    }
    
    // Validasi email jika ada
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Format email tidak valid' });
    }
    
    // Validasi nomor telepon jika ada
    if (nomorTelepon && !/^[0-9\-\+\s]{10,15}$/.test(nomorTelepon)) {
      return res.status(400).json({ message: 'Format nomor telepon tidak valid' });
    }

    // Cek apakah NIK sudah ada
    const existingWarga = await pool.warga.findUnique({
      where: { nik }
    });

    if (existingWarga) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    // Buat data warga baru
    const warga = await pool.warga.create({
      data: {
        nik,
        namaLengkap,
        tempatLahir,
        tanggalLahir,
        jenisKelamin,
        agama,
        statusPerkawinan,
        pekerjaan,
        pendidikanTerakhir,
        kewarganegaraan,
        email,
        nomorTelepon,
        alamat_domisili
      }
    });

    res.status(201).json({
      message: 'Warga berhasil ditambahkan',
      id: warga.id,
      nik: warga.nik,
      namaLengkap: warga.namaLengkap
    });
  } catch (error) {
    console.error('Error creating warga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menambahkan warga', error: error.message });
  }
};

// Update warga
exports.updateWarga = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nik,
      namaLengkap,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat_domisili,
      agama,
      statusPerkawinan,
      pekerjaan,
      kewarganegaraan,
      nomorTelepon,
      email,
      kartuKeluargaId,
      statusHubungan
    } = req.body;

    // Konversi tanggal lahir dari string ke Date jika ada
    let tanggalLahirDate = null;
    if (tanggalLahir) {
      tanggalLahirDate = new Date(tanggalLahir);
    }

    // Mulai transaksi untuk update warga dan relasi KK
    await pool.$transaction(async (pool) => {
      // Update data warga
      await pool.warga.update({
        where: { id: Number(id) },
        data: {
          nik,
          namaLengkap,
          tempatLahir,
          tanggalLahir: tanggalLahirDate,
          jenisKelamin,
          alamat_domisili,
          agama,
          statusPerkawinan,
          pekerjaan,
          kewarganegaraan,
          nomorTelepon,
          email
        },
      });

      // Jika kartuKeluargaId disediakan, update relasi dengan KK
      if (kartuKeluargaId && statusHubungan) {
        // Cek relasi yang ada
        const existingRelation = await pool.keluargaWarga.findFirst({
          where: { wargaId: Number(id) }
        });

        if (existingRelation) {
          // Jika KK berbeda, hapus relasi lama dan buat yang baru
          if (existingRelation.kartuKeluargaId !== Number(kartuKeluargaId)) {
            await pool.keluargaWarga.delete({
              where: { id: existingRelation.id }
            });

            // Buat relasi baru
            await pool.keluargaWarga.create({
              data: {
                wargaId: Number(id),
                kartuKeluargaId: Number(kartuKeluargaId),
                statusHubungan
              }
            });
          } else {
            // Update status hubungan jika KK sama
            await pool.keluargaWarga.update({
              where: { id: existingRelation.id },
              data: { statusHubungan }
            });
          }
        } else {
          // Buat relasi baru jika belum ada
          await pool.keluargaWarga.create({
            data: {
              wargaId: Number(id),
              kartuKeluargaId: Number(kartuKeluargaId),
              statusHubungan
            }
          });
        }

        // Jika status adalah kepala keluarga, update kepalaKeluarga di KK
        if (statusHubungan.toLowerCase() === 'kepala keluarga') {
          await pool.kartuKeluarga.update({
            where: { id: Number(kartuKeluargaId) },
            data: { kepalaKeluarga: namaLengkap }
          });
        }
      }
    });

    // Ambil data warga yang diupdate untuk response
    const updatedWarga = await pool.warga.findUnique({
      where: { id: Number(id) },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true
          }
        }
      }
    });

    // Tambahkan alamat dari KK untuk response
    const kartuKeluarga = updatedWarga.keluarga.length > 0 
      ? updatedWarga.keluarga[0].kartuKeluarga 
      : null;
    
    const responseData = {
      ...updatedWarga,
      alamat: updatedWarga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
      rt: kartuKeluarga ? kartuKeluarga.rt : '',
      rw: kartuKeluarga ? kartuKeluarga.rw : '',
      kelurahan: kartuKeluarga ? kartuKeluarga.kelurahan : null,
      kecamatan: kartuKeluarga ? kartuKeluarga.kecamatan : null,
      nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
      statusHubungan: updatedWarga.keluarga.length > 0 
        ? updatedWarga.keluarga[0].statusHubungan 
        : ''
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error updating warga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat memperbarui data warga', error: error.message });
  }
};

// Delete warga
exports.deleteWarga = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah warga ada
    const warga = await pool.warga.findUnique({
      where: { id: Number(id) },
      include: {
        keluarga: true,
        iuran: true,
        kegiatan: true,
      },
    });

    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }

    // Hapus semua data terkait
    if (warga.keluarga.length > 0) {
      await pool.keluargaWarga.deleteMany({
        where: { wargaId: Number(id) },
      });
    }

    if (warga.iuran.length > 0) {
      await pool.iuran.deleteMany({
        where: { wargaId: Number(id) },
      });
    }

    if (warga.kegiatan.length > 0) {
      await pool.pesertaKegiatan.deleteMany({
        where: { wargaId: Number(id) },
      });
    }

    // Hapus warga
    await pool.warga.delete({
      where: { id: Number(id) },
    });

    res.json({ message: 'Data warga berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting warga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat menghapus data warga', error: error.message });
  }
};

// Search warga
exports.searchWarga = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Parameter pencarian diperlukan' });
    }

    // Cari warga berdasarkan nama atau NIK
    const warga = await pool.warga.findMany({
      where: {
        OR: [
          { namaLengkap: { contains: query } },
          { nik: { contains: query } },
          { alamat_domisili: { contains: query } }
        ],
      },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true
          }
        }
      },
      orderBy: {
        namaLengkap: 'asc',
      },
    });

    // Cari juga berdasarkan alamat di kartu keluarga
    const wargaByKKAddress = await pool.keluargaWarga.findMany({
      where: {
        kartuKeluarga: {
          OR: [
            { alamat: { contains: query } },
            { nomorKK: { contains: query } }
          ]
        }
      },
      include: {
        warga: true,
        kartuKeluarga: true
      }
    });

    // Tambahkan warga dari hasil pencarian KK yang belum ada di hasil pencarian nama/NIK
    const wargaIds = warga.map(w => w.id);
    const additionalWarga = wargaByKKAddress
      .filter(kw => !wargaIds.includes(kw.warga.id))
      .map(kw => ({
        ...kw.warga,
        keluarga: [{ kartuKeluarga: kw.kartuKeluarga, statusHubungan: kw.statusHubungan }]
      }));

    // Gabungkan hasil dan tambahkan alamat dari KK
    const allWarga = [...warga, ...additionalWarga];
    const wargaWithAddress = allWarga.map(w => {
      const kartuKeluarga = w.keluarga.length > 0 ? w.keluarga[0].kartuKeluarga : null;
      return {
        ...w,
        alamat: w.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
        rt: kartuKeluarga ? kartuKeluarga.rt : '',
        rw: kartuKeluarga ? kartuKeluarga.rw : '',
        kelurahan: kartuKeluarga ? kartuKeluarga.kelurahan : null,
        kecamatan: kartuKeluarga ? kartuKeluarga.kecamatan : null,
        nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
        statusHubungan: w.keluarga.length > 0 ? 
          (typeof w.keluarga[0].statusHubungan === 'string' ? 
            w.keluarga[0].statusHubungan : 
            w.keluarga[0].statusHubungan) : ''
      };
    });

    res.json(wargaWithAddress);
  } catch (error) {
    console.error('Error searching warga:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mencari data warga', error: error.message });
  }
};

// Get warga by NIK
exports.getWargaByNIK = async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await pool.warga.findUnique({
      where: { nik },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true,
          },
        },
      },
    });

    if (!warga) {
      return res.status(404).json({ message: 'Warga tidak ditemukan' });
    }

    // Tambahkan alamat dari KK
    const kartuKeluarga = warga.keluarga.length > 0 ? warga.keluarga[0].kartuKeluarga : null;
    const wargaWithAddress = {
      ...warga,
      alamat: warga.alamat_domisili || (kartuKeluarga ? kartuKeluarga.alamat : ''),
      rt: kartuKeluarga ? kartuKeluarga.rt : '',
      rw: kartuKeluarga ? kartuKeluarga.rw : '',
      kelurahan: kartuKeluarga ? kartuKeluarga.kelurahan : null,
      kecamatan: kartuKeluarga ? kartuKeluarga.kecamatan : null,
      nomorKK: kartuKeluarga ? kartuKeluarga.nomorKK : '',
      statusHubungan: warga.keluarga.length > 0 ? warga.keluarga[0].statusHubungan : ''
    };

    res.json(wargaWithAddress);
  } catch (error) {
    console.error('Error fetching warga by NIK:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengambil data warga berdasarkan NIK', error: error.message });
  }
};

// Fungsi helper untuk memformat data warga sebelum ekspor
const formatWargaForExport = (wargaList) => {
  return wargaList.map(w => {
    // Cari hubungan utama (Kepala Keluarga jika ada, atau hubungan pertama jika tidak)
    let keluargaHubungan = null;
    if (w.keluarga && w.keluarga.length > 0) {
      keluargaHubungan = w.keluarga.find(k => k.statusHubungan === 'Kepala Keluarga') || w.keluarga[0];
    }
    const kartuKeluarga = keluargaHubungan ? keluargaHubungan.kartuKeluarga : null;
    
    const alamatKKFull = kartuKeluarga 
      ? `${kartuKeluarga.alamat || ''}${kartuKeluarga.rt ? ', RT ' + kartuKeluarga.rt : ''}${kartuKeluarga.rw ? ' RW ' + kartuKeluarga.rw : ''}${kartuKeluarga.kelurahan ? ', Kel. ' + kartuKeluarga.kelurahan : ''}${kartuKeluarga.kecamatan ? ', Kec. ' + kartuKeluarga.kecamatan : ''}`
      : (w.alamat_domisili || '');

    return {
      nik: w.nik || '',
      namaLengkap: w.namaLengkap || '',
      jenisKelamin: w.jenisKelamin || '',
      tempatLahir: w.tempatLahir || '',
      tanggalLahir: w.tanggalLahir ? new Date(w.tanggalLahir).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
      agama: w.agama || '',
      statusPerkawinan: w.statusPerkawinan || '',
      pekerjaan: w.pekerjaan || '',
      pendidikanTerakhir: w.pendidikanTerakhir || '',
      nomorTelepon: w.nomorTelepon || '',
      email: w.email || '',
      nomorKK: kartuKeluarga ? (kartuKeluarga.nomorKK || '') : '',
      alamatKK: alamatKKFull,
      statusHubunganDalamKK: keluargaHubungan ? (keluargaHubungan.statusHubungan || '') : '',
      kewarganegaraan: w.kewarganegaraan || '',
    };
  });
};

exports.exportWargaToCSV = async (req, res) => {
  console.log('[wargaController.js] exportWargaToCSV: Received query:', req.query);
  try {
    const filterOptions = buildWargaFilterQuery(req.query);

    const wargaData = await pool.warga.findMany({
      where: filterOptions,
      orderBy: {
        namaLengkap: 'asc',
      },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true,
          },
        },
      },
    });

    if (wargaData.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data warga yang sesuai untuk diekspor.' });
    }

    const formattedWarga = formatWargaForExport(wargaData);

    let fieldsToExport;
    const requestedColumnsQuery = req.query.columns;
    console.log('[wargaController.js] exportWargaToCSV: Received req.query.columns:', requestedColumnsQuery);

    if (requestedColumnsQuery) {
      const requestedColumnKeys = requestedColumnsQuery.split(',');
      console.log('[wargaController.js] exportWargaToCSV: Parsed requestedColumnKeys:', requestedColumnKeys);

      fieldsToExport = requestedColumnKeys.map(key => { 
        const foundField = ALL_EXPORTABLE_FIELDS_CONFIG.find(field => field.value === key.trim()); 
        return foundField;
       } ).filter(field => field !== undefined); 

      console.log('[wargaController.js] exportWargaToCSV: Filtered fieldsToExport based on request:', fieldsToExport);

      if (fieldsToExport.length === 0) {
        console.log('[wargaController.js] exportWargaToCSV: No valid columns requested, falling back to default.');
        fieldsToExport = ALL_EXPORTABLE_FIELDS_CONFIG.filter(field => field.default);
        console.log('[wargaController.js] exportWargaToCSV: Default fieldsToExport:', fieldsToExport);
      }
    } else {
      console.log('[wargaController.js] exportWargaToCSV: No columns requested, using default.');
      fieldsToExport = ALL_EXPORTABLE_FIELDS_CONFIG.filter(field => field.default);
      console.log('[wargaController.js] exportWargaToCSV: Default fieldsToExport:', fieldsToExport);
    }
    
    console.log('[wargaController.js] exportWargaToCSV: Final fields being used for CSV Parser:', fieldsToExport.map(f => f.value));

    const json2csvParser = new Parser({ fields: fieldsToExport.map(f => ({label: f.label, value: f.value})), header: true });
    const csv = json2csvParser.parse(formattedWarga);

    res.header('Content-Type', 'text/csv; charset=utf-8');
    res.attachment('data_warga.csv');
    res.send(Buffer.from(csv, 'utf-8')); // Kirim sebagai buffer UTF-8

  } catch (error) {
    console.error('Error exporting warga to CSV:', error);
    // Pastikan error dikirim sebagai JSON jika headers belum terkirim
    if (!res.headersSent) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengekspor data warga ke CSV.', error: error.message });
    } else {
        // Jika headers sudah terkirim (misalnya saat streaming), akhiri koneksi
        res.end();
    }
  }
};

// NEW FUNCTION FOR PDF EXPORT
// Define fonts for pdfmake
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '../../public/fonts/Roboto-Regular.ttf'), 
    bold: path.join(__dirname, '../../public/fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, '../../public/fonts/Roboto-Italic.ttf'),
    bolditalics: path.join(__dirname, '../../public/fonts/Roboto-MediumItalic.ttf')
  }
};

exports.exportWargaToPDF = async (req, res) => {
  // console.log('[wargaController.js] exportWargaToPDF: Received query:', req.query);
  try {
    const filterOptions = buildWargaFilterQuery(req.query);

    const wargaData = await pool.warga.findMany({
      where: filterOptions,
      orderBy: {
        namaLengkap: 'asc',
      },
      include: {
        keluarga: {
          include: {
            kartuKeluarga: true,
          },
        },
      },
    });

    if (wargaData.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data warga yang sesuai untuk diekspor.' });
    }

    const formattedWarga = formatWargaForExport(wargaData);

    let fieldsToUse;
    const requestedColumnsQuery = req.query.columns;
    // console.log('[wargaController.js] exportWargaToPDF: Received req.query.columns:', requestedColumnsQuery);

    if (requestedColumnsQuery) {
      const requestedColumnKeys = requestedColumnsQuery.split(',');
      // console.log('[wargaController.js] exportWargaToPDF: Parsed requestedColumnKeys:', requestedColumnKeys);
      
      fieldsToUse = requestedColumnKeys
        .map(key => ALL_EXPORTABLE_FIELDS_CONFIG.find(field => field.value === key.trim()))
        .filter(field => field !== undefined);
      
      // console.log('[wargaController.js] exportWargaToPDF: Filtered fieldsToUse based on request:', fieldsToUse);

      if (fieldsToUse.length === 0) {
        // console.log('[wargaController.js] exportWargaToPDF: No valid columns requested, falling back to default.');
        fieldsToUse = ALL_EXPORTABLE_FIELDS_CONFIG.filter(field => field.default);
        // console.log('[wargaController.js] exportWargaToPDF: Default fieldsToUse:', fieldsToUse);
      }
    } else {
      // console.log('[wargaController.js] exportWargaToPDF: No columns requested, using default.');
      fieldsToUse = ALL_EXPORTABLE_FIELDS_CONFIG.filter(field => field.default);
      // console.log('[wargaController.js] exportWargaToPDF: Default fieldsToUse:', fieldsToUse);
    }

    // console.log('[wargaController.js] exportWargaToPDF: Final fields being used for PDF:', fieldsToUse.map(f => f.value));
    
    const tableBody = [
      fieldsToUse.map(field => ({ text: field.label, style: 'tableHeader' })), // Header
      ...formattedWarga.map(warga => fieldsToUse.map(field => warga[field.value] || '')), // Data
    ];

    const tableColumnWidths = fieldsToUse.map((field, index) => {
      // Heuristik sederhana untuk lebar kolom
      if (field.value === 'namaLengkap' || field.value === 'alamatKK') return '*';
      if (field.value === 'nik' || field.value === 'nomorKK') return 'auto';
      return 'auto'; 
    });

    const printer = new PdfPrinter(fonts);

    const documentDefinition = {
      content: [
            { text: 'Data Warga', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: tableColumnWidths, 
            body: tableBody
          }
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black'
        }
      },
      defaultStyle: {
            font: 'Roboto',
            fontSize: 9
        }
    };

    const pdfDoc = printer.createPdfKitDocument(documentDefinition);
    
    res.header('Content-Type', 'application/pdf');
    res.attachment('data_warga.pdf');
    pdfDoc.pipe(res);
    pdfDoc.end();

  } catch (error) {
    console.error('Error exporting warga to PDF:', error);
    if (!res.headersSent) {
        res.status(500).json({ message: 'Terjadi kesalahan saat mengekspor data warga ke PDF.', error: error.message });
    } else {
        res.end();
    }
  }
}; 