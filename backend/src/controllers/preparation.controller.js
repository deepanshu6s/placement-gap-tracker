const PreparationService = require('../services/preparation.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const PreparationController = {
  async getMyActivities(req, res, next) {
    try {
      const filters = {};
      if (req.query.skillId) filters.skill_id = req.query.skillId;
      
      const activities = await PreparationService.getActivities(req.user.studentProfileId, filters);
      return successResponse(res, activities);
    } catch (err) {
      next(err);
    }
  },

  async logActivity(req, res, next) {
    try {
      const activity = await PreparationService.logActivity(req.user.studentProfileId, req.body);
      return successResponse(res, activity, 201);
    } catch (err) {
      next(err);
    }
  },

  async updateActivity(req, res, next) {
    try {
      const activity = await PreparationService.updateActivity(req.params.id, req.user.studentProfileId, req.body);
      return successResponse(res, activity);
    } catch (err) {
      if (err.message.includes('not found')) return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async deleteActivity(req, res, next) {
    try {
      await PreparationService.deleteActivity(req.params.id, req.user.studentProfileId);
      return successResponse(res, { success: true });
    } catch (err) {
      if (err.message.includes('not found')) return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  }
};

module.exports = PreparationController;
