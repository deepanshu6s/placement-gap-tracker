const ReadinessService = require('../services/readiness.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const ReadinessController = {
  async getMyScore(req, res, next) {
    try {
      const roleId = req.query.roleId || req.user.targetRoleId;
      if (!roleId) {
        return successResponse(res, { score: null, status: 'NO_ROLE_SELECTED' });
      }
      
      const result = await ReadinessService.getScore(req.user.studentProfileId, roleId);
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getMyHistory(req, res, next) {
    try {
      const roleId = req.query.roleId || req.user.targetRoleId;
      if (!roleId) return successResponse(res, []);
      
      const history = await ReadinessService.getHistory(req.user.studentProfileId, roleId);
      return successResponse(res, history);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = ReadinessController;
