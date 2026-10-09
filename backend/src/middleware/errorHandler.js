const { ZodError } = require('zod');
const { errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Exception in [${req.method} ${req.originalUrl}]`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed for request data', details);
  }

  // Handle JSON syntax parsing errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 400, 'VALIDATION_ERROR', 'Malformed JSON payload in request body');
  }

  // Handle Database connection failures (ECONNREFUSED, pool timeout)
  const isDbConnectionError =
    err.code === 'ECONNREFUSED' ||
    err.code === 'ETIMEDOUT' ||
    err.code === '57P01' ||
    err.code === '57P03' ||
    (err.name === 'AggregateError' && Array.isArray(err.errors) && err.errors.some((e) => e.code === 'ECONNREFUSED')) ||
    (typeof err.message === 'string' && err.message.includes('ECONNREFUSED'));

  if (isDbConnectionError) {
    return errorResponse(
      res,
      503,
      'DATABASE_UNAVAILABLE',
      'Database connection failed. Please ensure PostgreSQL service is running and accessible.'
    );
  }

  // Handle explicit application errors with custom status codes
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal error occurred';

  return errorResponse(res, statusCode, errorCode, message, err.details || []);
};

module.exports = errorHandler;
