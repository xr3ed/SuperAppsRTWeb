require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
// const { Pool } = require('pg'); // Hapus atau komentari pg Pool
const { PrismaClient } = require('@prisma/client');

// Log the DATABASE_URL that will be used by Prisma
// Prisma secara otomatis akan membaca DATABASE_URL dari process.env atau .env
console.log('[server/models/prisma.js] Prisma Client will use DATABASE_URL:', process.env.DATABASE_URL);

// Inisialisasi Prisma Client
const prisma = new PrismaClient({
  log: [
    // { emit: 'stdout', level: 'query' }, // Dikomentari untuk mengurangi verbosity
    // { emit: 'stdout', level: 'info' }, // Dikomentari untuk menghilangkan log info Prisma
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'error' },
  ],
});

// Opsional: Fungsi untuk menguji koneksi melalui Prisma Client
// async function testPrismaConnection() {
//   try {
//     await prisma.$connect();
//     console.log('[server/models/prisma.js] Prisma Client connected successfully.');
//     // Contoh query sederhana
//     const result = await prisma.$queryRaw`SELECT NOW()`;
//     console.log('[server/models/prisma.js] Prisma $queryRaw SELECT NOW():', result);
//   } catch (error) {
//     console.error('[server/models/prisma.js] Prisma Client connection error:', error);
//   } finally {
//     await prisma.$disconnect();
//     console.log('[server/models/prisma.js] Prisma Client disconnected.');
//   }
// }
// testPrismaConnection();

// Export Prisma Client instance untuk digunakan di controllers
module.exports = prisma;

/* Hapus atau komentari kode pg.Pool lama:
// Parse DATABASE_URL
const getDatabaseInfo = (url) => {
  try {
    // Format untuk URL dengan parameter query
    const regex = /^postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?$/;
    const matches = url.match(regex);
    
    if (matches && matches.length >= 6) {
      const dbInfo = {
        user: matches[1],
        password: matches[2],
        host: matches[3],
        port: parseInt(matches[4]),
        database: matches[5],
        query: matches[6] || ''
      };
      
      // Parse parameter query jika ada
      if (dbInfo.query) {
        // Hapus tanda tanya di awal
        const queryString = dbInfo.query.substring(1);
        const params = new URLSearchParams(queryString);
        dbInfo.pgbouncer = params.has('pgbouncer') && params.get('pgbouncer') === 'true';
      }
      
      return dbInfo;
    }
    return null;
  } catch (error) {
    console.error('Error parsing DATABASE_URL:', error);
    return null;
  }
};

// Get database connection info
const dbInfo = getDatabaseInfo(process.env.DATABASE_URL);
if (!dbInfo) {
  throw new Error('Invalid DATABASE_URL format');
}

console.log('Database connection info:');
console.log('- Host:', dbInfo.host);
console.log('- Port:', dbInfo.port);
console.log('- Database:', dbInfo.database);
console.log('- User:', dbInfo.user);
console.log('- pgbouncer:', dbInfo.pgbouncer ? 'enabled' : 'disabled');

// Create a PostgreSQL connection pool with proper configuration for pgbouncer
const poolConfig = {
  user: dbInfo.user,
  password: dbInfo.password,
  host: dbInfo.host,
  port: dbInfo.port,
  database: dbInfo.database,
  ssl: {
    rejectUnauthorized: false
  }
};

// Jika menggunakan pgbouncer, tambahkan konfigurasi untuk disable prepared statements
if (dbInfo.pgbouncer) {
  // Disable prepared statements untuk pgbouncer
  poolConfig.statement_timeout = 5000; // 5 seconds
  poolConfig.idle_in_transaction_session_timeout = 5000; // 5 seconds
  poolConfig.query_timeout = 10000; // 10 seconds
}

const pool = new Pool(poolConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully. Current time:', res.rows[0].now);
  }
});

// Export the pool for use in controllers
// module.exports = pool; 
*/ 