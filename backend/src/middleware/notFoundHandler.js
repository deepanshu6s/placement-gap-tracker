const { errorResponse } = require('../utils/response.utils');

const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, 'RESOURCE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`);
};

module.exports = notFoundHandler;
