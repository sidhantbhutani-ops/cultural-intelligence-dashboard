const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: parseInt(process.env.DATABASE_POOL_SIZE) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[Database] Unexpected error on idle client:', err);
  process.exit(-1);
});

async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('[DB Query] Executed in', duration, 'ms');
    return result;
  } catch (error) {
    console.error('[DB Error]', error);
    throw error;
  }
}

async function getClient() {
  const client = await pool.connect();
  return client;
}

module.exports = { query, getClient, pool };
