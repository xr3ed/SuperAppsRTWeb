require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');

// Ekstrak informasi koneksi dari DATABASE_URL
const getDatabaseInfo = (url) => {
  try {
    // Format untuk URL direct connection
    const postgresqlRegex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    // Format untuk URL pooler
    const poolerRegex = /^postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    
    let matches = url.match(postgresqlRegex);
    if (!matches) {
      matches = url.match(poolerRegex);
    }
    
    if (matches && matches.length >= 6) {
      console.log('Matched parts:', matches);
      return {
        user: matches[1],
        password: matches[2],
        host: matches[3],
        port: parseInt(matches[4]),
        database: matches[5],
        query: matches[6] || '' // Parameter query seperti ?pgbouncer=true
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return null;
  }
};

async function testConnection() {
  console.log('=== Menguji Koneksi Database PostgreSQL ===');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  const dbInfo = getDatabaseInfo(process.env.DATABASE_URL);
  if (!dbInfo) {
    console.error('Tidak dapat mengurai DATABASE_URL dengan benar');
    return false;
  }
  
  console.log('Informasi koneksi:');
  console.log('- Host:', dbInfo.host);
  console.log('- Port:', dbInfo.port);
  console.log('- Database:', dbInfo.database);
  console.log('- User:', dbInfo.user);
  
  // Buat koneksi menggunakan node-postgres
  const pool = new Pool({
    user: dbInfo.user,
    password: dbInfo.password,
    host: dbInfo.host,
    port: dbInfo.port,
    database: dbInfo.database,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  // Log connection details
  console.log('Attempting to connect with:');
  console.log('- User:', dbInfo.user);
  console.log('- Host:', dbInfo.host);
  console.log('- Port:', dbInfo.port);
  console.log('- Database:', dbInfo.database);
  console.log('- Connection parameters:', dbInfo.query || 'none');
  
  try {
    console.log('\n=== Mencoba koneksi ke database... ===');
    const client = await pool.connect();
    console.log('✅ Koneksi berhasil!');
    
    // Cek tabel yang ada di schema public
    console.log('\n=== Memeriksa tabel yang ada di schema public... ===');
    const tableResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (tableResult.rows.length === 0) {
      console.log('❌ Tidak ada tabel yang ditemukan di schema public!');
    } else {
      console.log(`✅ Ditemukan ${tableResult.rows.length} tabel:`);
      tableResult.rows.forEach(row => console.log(`- ${row.table_name}`));
    }
    
    // Cek tabel yang diperlukan oleh aplikasi (case insensitive)
    const requiredTables = ['Warga', 'KartuKeluarga', 'KeluargaWarga', 'Iuran', 'Kegiatan', 'PesertaKegiatan'];
    console.log('\n=== Memeriksa tabel yang diperlukan oleh aplikasi (case insensitive)... ===');
    
    // Dapatkan semua nama tabel yang ada dalam lowercase untuk perbandingan case-insensitive
    const existingTableNames = tableResult.rows.map(row => row.table_name.toLowerCase());
    
    for (const tableName of requiredTables) {
      const lowercaseName = tableName.toLowerCase();
      const exists = existingTableNames.includes(lowercaseName);
      
      // Cari nama tabel yang sebenarnya (jika ada)
      let actualTableName = '';
      if (exists) {
        actualTableName = tableResult.rows.find(row => 
          row.table_name.toLowerCase() === lowercaseName
        ).table_name;
      }
      
      console.log(`- Tabel ${tableName}: ${exists ? `✅ Ada (nama aktual: ${actualTableName})` : '❌ Tidak ada'}`);
    }
    
    // Cek struktur tabel Warga
    console.log('\n=== Memeriksa struktur tabel Warga... ===');
    try {
      const wargaStructure = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Warga'
        ORDER BY ordinal_position;
      `);
      
      if (wargaStructure.rows.length > 0) {
        console.log('Kolom dalam tabel Warga:');
        wargaStructure.rows.forEach(col => {
          console.log(`- ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
        });
      } else {
        console.log('❌ Tidak dapat menemukan struktur tabel Warga');
      }
    } catch (err) {
      console.error('Error saat memeriksa struktur tabel Warga:', err.message);
    }
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Error saat mencoba koneksi ke database:', error);
    return false;
  }
}

testConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Test koneksi database selesai dengan sukses');
    } else {
      console.log('\n❌ Test koneksi database gagal');
    }
    process.exit(0);
  })
  .catch(e => {
    console.error('Unhandled error:', e);
    process.exit(1);
  }); 