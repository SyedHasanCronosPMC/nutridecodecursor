import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Verify connection immediately
async function verifyConnection() {
  try {
    const client = await pool.connect();
    console.log('Database connection verified');
    client.release();
    return true;
  } catch (err) {
    console.error('Failed to connect to database:', err);
    return false;
  }
}

verifyConnection();

export { pool };