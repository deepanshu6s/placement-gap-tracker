const path = require('path');
const runner = require('node-pg-migrate').default;
const env = require('../config/env');
const logger = require('../utils/logger');

const runMigrations = async (direction = 'up') => {
  const databaseUrl =
    env.DATABASE_URL ||
    `postgresql://${env.DB_USER}:${env.DB_PASSWORD}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`;

  logger.info(`Running database migrations [direction: ${direction}]...`);

  try {
    const results = await runner({
      databaseUrl,
      dir: path.join(__dirname, 'migrations'),
      direction,
      migrationsTable: 'pgmigrations',
      verbose: true,
    });

    logger.info('Migrations executed successfully.', { count: results.length });
    return results;
  } catch (err) {
    logger.error('Database migration failed:', err);
    throw err;
  }
};

if (require.main === module) {
  const direction = process.argv[2] === 'down' ? 'down' : 'up';
  runMigrations(direction)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  runMigrations,
};
