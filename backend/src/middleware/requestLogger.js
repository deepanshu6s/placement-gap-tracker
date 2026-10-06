const morgan = require('morgan');
const env = require('../config/env');

// Use 'dev' format in development, 'combined' in production, skip in test
const requestLogger =
  env.NODE_ENV === 'test'
    ? (req, res, next) => next()
    : morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = requestLogger;
