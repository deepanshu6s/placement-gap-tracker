const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const { sendError } = require('../utils/response.utils');

const globalRateLimiter =
  env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
          return sendError(
            res,
            'RATE_LIMIT_EXCEEDED',
            'Too many requests from this IP, please try again after 15 minutes.',
            429
          );
        },
      });

module.exports = {
  globalRateLimiter,
};
