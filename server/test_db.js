require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Menguji koneksi ke database PostgreSQL...');
    console.log('Database URL:', process.env.DATABASE_URL);
    
    // Coba mengakses data dari database
    const wargaCount = await prisma.warga.count();
    console.log(`Koneksi berhasil! Jumlah data warga: ${wargaCount}`);
    
    // Coba ambil beberapa data warga sebagai contoh
    const wargaSample = await prisma.warga.findMany({
      take: 2,
      select: {
        id: true,
        nik: true,
        namaLengkap: true
      }
    });
    
    console.log('Contoh data warga:', wargaSample);
    return true;
  } catch (error) {
    console.error('Error saat mencoba koneksi ke database:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('Test koneksi database selesai dengan sukses');
    } else {
      console.log('Test koneksi database gagal');
    }
    process.exit(0);
  })
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  }); 