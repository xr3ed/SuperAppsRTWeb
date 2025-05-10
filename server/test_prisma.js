require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testPrismaClient() {
  console.log('=== Menguji Prisma Client ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    console.log('\n=== Mencoba koneksi Prisma... ===');
    
    // Cek tabel Warga
    console.log('\n=== Mencoba mengakses tabel Warga... ===');
    try {
      const wargaCount = await prisma.warga.count();
      console.log(`✅ Berhasil! Jumlah data Warga: ${wargaCount}`);
      
      if (wargaCount > 0) {
        const wargaSample = await prisma.warga.findFirst({
          select: {
            id: true,
            nik: true,
            namaLengkap: true
          }
        });
        console.log('Contoh data Warga:', wargaSample);
      }
    } catch (error) {
      console.error('❌ Error saat mengakses tabel Warga:', error);
    }
    
    // Cek tabel KartuKeluarga
    console.log('\n=== Mencoba mengakses tabel KartuKeluarga... ===');
    try {
      const kkCount = await prisma.kartuKeluarga.count();
      console.log(`✅ Berhasil! Jumlah data KartuKeluarga: ${kkCount}`);
      
      if (kkCount > 0) {
        const kkSample = await prisma.kartuKeluarga.findFirst({
          select: {
            id: true,
            nomorKK: true,
            alamat: true
          }
        });
        console.log('Contoh data KartuKeluarga:', kkSample);
      }
    } catch (error) {
      console.error('❌ Error saat mengakses tabel KartuKeluarga:', error);
    }
    
    // Cek relasi antara KartuKeluarga dan Warga melalui KeluargaWarga
    console.log('\n=== Mencoba mengakses relasi KartuKeluarga-Warga... ===');
    try {
      const keluargaWargaCount = await prisma.keluargaWarga.count();
      console.log(`✅ Berhasil! Jumlah data KeluargaWarga: ${keluargaWargaCount}`);
      
      if (keluargaWargaCount > 0) {
        const keluargaWargaSample = await prisma.keluargaWarga.findFirst({
          include: {
            warga: true,
            kartuKeluarga: true
          }
        });
        console.log('Contoh data KeluargaWarga dengan relasi:');
        console.log(`- ID KeluargaWarga: ${keluargaWargaSample.id}`);
        console.log(`- Status Hubungan: ${keluargaWargaSample.statusHubungan}`);
        console.log(`- Warga: ${keluargaWargaSample.warga.namaLengkap} (NIK: ${keluargaWargaSample.warga.nik})`);
        console.log(`- KartuKeluarga: ${keluargaWargaSample.kartuKeluarga.nomorKK}`);
      }
    } catch (error) {
      console.error('❌ Error saat mengakses relasi KartuKeluarga-Warga:', error);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error saat menggunakan Prisma Client:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testPrismaClient()
  .then(success => {
    if (success) {
      console.log('\n✅ Test Prisma Client selesai dengan sukses');
    } else {
      console.log('\n❌ Test Prisma Client gagal');
    }
    process.exit(0);
  })
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  }); 