/**
 * Standardized API Response Utilities
 * Strictly enforces { success, data, error } contract from architecture_spec_v1_1.md
 */

const successResponse = (res, data = null, statusCode = 200, meta = null) => {
  const payload = {
    success: true,
    data,
    error: null,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

const errorResponse = (
  res,
  statusCode = 500,
  code = 'INTERNAL_ERROR',
  message = 'An unexpected error occurred',
  details = []
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      details,
    },
  });
};

module.exports = {
  successResponse,
  errorResponse,
  sendSuccess: successResponse,
  sendError: errorResponse,
};

