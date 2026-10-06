const { pingDatabase } = require('../config/db');
const { sendSuccess } = require('../utils/response.utils');

/**
 * Health Controller
 * Verifies server process liveness and reports database pool status
 */
const getHealth = async (req, res, next) => {
  try {
    const isDbAlive = await pingDatabase();

    const healthData = {
      status: 'ok',
      service: 'placement-tracker-backend',
      timestamp: new Date().toISOString(),
      database: isDbAlive ? 'connected' : 'disconnected',
    };

    return sendSuccess(res, healthData, 200);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getHealth,
};
