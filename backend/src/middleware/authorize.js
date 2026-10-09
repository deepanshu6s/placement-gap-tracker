const { errorResponse } = require('../utils/response.utils');

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'FORBIDDEN', 'You do not have permission to access this resource');
    }
    next();
  };
};

module.exports = authorize;
