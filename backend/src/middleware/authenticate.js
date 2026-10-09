const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { errorResponse } = require('../utils/response.utils');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 401, 'UNAUTHORIZED', 'No access token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload; // Contains userId, email, role
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'TOKEN_EXPIRED', 'Access token has expired');
    }
    return errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid access token');
  }
};

module.exports = authenticate;
