const { ZodError } = require('zod');
const { sendError } = require('../utils/response.utils');
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
    return sendError(res, 'VALIDATION_ERROR', 'Validation failed for request data', 400, details);
  }

  // Handle JSON syntax parsing errors from body-parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'VALIDATION_ERROR', 'Malformed JSON payload in request body', 400);
  }

  // Handle explicit application errors with custom status codes
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred'
      : err.message || 'An unexpected internal error occurred';

  return sendError(res, errorCode, message, statusCode, err.details || []);
};

module.exports = errorHandler;
