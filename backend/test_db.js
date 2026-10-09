const { query } = require('./src/config/db');

async function run() {
  try {
    const res = await query('SELECT * FROM users LIMIT 1');
    console.log('Users:', res.rows);
  } catch (err) {
    console.error('DB Error:', err);
  }
  process.exit(0);
}

run();
