const GapService = require('../services/gap.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const GapController = {
  async getMyGaps(req, res, next) {
    try {
      const { roleId } = req.query; // optional filter
      const gaps = await GapService.getStudentGaps(req.user.studentProfileId, roleId);
      return successResponse(res, gaps);
    } catch (err) {
      next(err);
    }
  },

  async recompute(req, res, next) {
    try {
      const { role_id } = req.body;
      if (!role_id) return errorResponse(res, 400, 'BAD_REQUEST', 'role_id is required');
      const gaps = await GapService.recompute(req.user.studentProfileId, role_id);
      return successResponse(res, gaps);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = GapController;
