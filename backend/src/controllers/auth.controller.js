const AuthService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const AuthController = {
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.register(email, password);
      return successResponse(res, user, 201);
    } catch (err) {
      if (err.message === 'Email is already registered') {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await AuthService.login(email, password);
      return successResponse(res, data);
    } catch (err) {
      if (err.message === 'Invalid credentials or inactive account') {
        return errorResponse(res, 401, 'UNAUTHORIZED', err.message);
      }
      next(err);
    }
  },

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const data = await AuthService.refresh(refreshToken);
      return successResponse(res, data);
    } catch (err) {
      return errorResponse(res, 401, 'UNAUTHORIZED', 'Invalid or expired refresh token');
    }
  },

  async logout(req, res, next) {
    try {
      const refreshToken = req.body.refreshToken || (req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);
      if (refreshToken) {
        await AuthService.logout(refreshToken, null);
      } else if (req.user) {
        await AuthService.logout(null, req.user.userId);
      }
      return successResponse(res, { message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async me(req, res, next) {
    try {
      return successResponse(res, req.user);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = AuthController;
