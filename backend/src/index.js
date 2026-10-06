const app = require('./app');
const env = require('./config/env');
const logger = require('./utils/logger');
const { pool } = require('./config/db');

const server = app.listen(env.PORT, () => {
  logger.info(`Server successfully started on port ${env.PORT} [Environment: ${env.NODE_ENV}]`);
  logger.info(`Health check endpoint accessible at http://localhost:${env.PORT}/api/health`);
});

// Graceful Shutdown
const handleShutdown = (signal) => {
  logger.info(`${signal} received. Initiating graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    try {
      await pool.end();
      logger.info('PostgreSQL pool drained successfully.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during pool draining:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

module.exports = server;
