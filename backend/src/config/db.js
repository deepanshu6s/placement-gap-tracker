const { Pool } = require('pg');
const env = require('./env');

const poolConfig = env.DATABASE_URL
  ? { connectionString: env.DATABASE_URL }
  : {
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
    };

const pool = new Pool({
  ...poolConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

pool.on('error', (err) => {
  console.error('Unexpected idle PostgreSQL client error:', err.message);
});

/**
 * Executes a parameterized SQL query against the connection pool.
 * Enforces parameterization ($1, $2, ...) to prevent SQL injection.
 */
const query = (text, params) => pool.query(text, params);

/**
 * Health check helper to test database connectivity.
 * Returns true if connected, false otherwise.
 */
const pingDatabase = async () => {
  try {
    const res = await pool.query('SELECT 1 as alive');
    return res.rows && res.rows.length > 0;
  } catch (err) {
    return false;
  }
};

module.exports = {
  pool,
  query,
  pingDatabase,
};
