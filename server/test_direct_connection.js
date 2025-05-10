require('dotenv').config();
const { Pool } = require('pg');

// Gunakan DIRECT_URL jika tersedia
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

async function testDirectConnection() {
  console.log('=== Menguji Koneksi Langsung ke Database PostgreSQL ===');
  console.log('Menggunakan URL Koneksi:', connectionString);
  
  // Parse connection string
  const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
  const matches = connectionString.match(regex);
  
  if (!matches) {
    console.error('❌ Format URL koneksi tidak valid');
    return false;
  }
  
  const [, user, password, host, port, database, query] = matches;
  
  console.log('Informasi koneksi:');
  console.log('- User:', user);
  console.log('- Host:', host);
  console.log('- Port:', port);
  console.log('- Database:', database);
  console.log('- Query params:', query || 'none');
  
  // Membuat koneksi pool
  const pool = new Pool({
    user,
    password,
    host,
    port: parseInt(port),
    database,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  try {
    console.log('\n=== Mencoba koneksi langsung ke database... ===');
    const client = await pool.connect();
    console.log('✅ Koneksi berhasil!');
    
    // Cek versi PostgreSQL
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL Version:', versionResult.rows[0].version);
    
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
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Error saat mencoba koneksi langsung ke database:', error);
    return false;
  }
}

testDirectConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Test koneksi database langsung selesai dengan sukses');
    } else {
      console.log('\n❌ Test koneksi database langsung gagal');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 