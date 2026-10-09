const StudentService = require('../services/student.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const StudentController = {
  async getMyProfile(req, res, next) {
    try {
      const profile = await StudentService.getProfile(req.user.userId);
      if (!profile) {
        return errorResponse(res, 404, 'NOT_FOUND', 'Profile not found');
      }
      return successResponse(res, profile);
    } catch (err) {
      next(err);
    }
  },

  async setupProfile(req, res, next) {
    try {
      const profile = await StudentService.setupInitialProfile(req.user.userId, req.body);
      return successResponse(res, profile, 201);
    } catch (err) {
      if (err.message === 'Profile already exists for this user') {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async updateMyProfile(req, res, next) {
    try {
      const profile = await StudentService.updateProfile(req.user.userId, req.body);
      return successResponse(res, profile);
    } catch (err) {
      if (err.message === 'Profile not found' || err.message === 'Selected role is invalid or inactive') {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  }
};

module.exports = StudentController;
