const { sendError } = require('../utils/response.utils');

const notFoundHandler = (req, res) => {
  return sendError(res, 'RESOURCE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`, 404);
};

module.exports = notFoundHandler;
