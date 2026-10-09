const RecommendationService = require('../services/recommendation.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const RecommendationController = {
  async getMyRecommendations(req, res, next) {
    try {
      const roleId = req.query.roleId || req.user.targetRoleId;
      if (!roleId) return successResponse(res, []);
      
      const recommendations = await RecommendationService.getActiveRecommendations(req.user.studentProfileId, roleId);
      return successResponse(res, recommendations);
    } catch (err) {
      next(err);
    }
  },

  async dismiss(req, res, next) {
    try {
      const result = await RecommendationService.dismiss(req.params.id, req.user.studentProfileId);
      if (!result) return errorResponse(res, 404, 'NOT_FOUND', 'Recommendation not found or unauthorized');
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async generate(req, res, next) {
    try {
      const { roleId } = req.body;
      if (!roleId) return errorResponse(res, 400, 'BAD_REQUEST', 'roleId is required');
      
      const result = await RecommendationService.generateRecommendations(req.user.studentProfileId, roleId);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = RecommendationController;
