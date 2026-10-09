const FacultyService = require('../services/faculty.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const FacultyController = {
  async getProfile(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      return successResponse(res, profile);
    } catch (err) {
      if (err.message === 'Faculty profile not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudents(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      
      const students = await FacultyService.getStudents(
        profile.id, 
        profile.is_tpo, 
        batch_year ? parseInt(batch_year) : null, 
        branch
      );
      return successResponse(res, students);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      if (err.message.includes('required for non-TPO')) return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  },

  async getStudentDetails(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const student = await FacultyService.getStudentDetails(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, student);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudentSkillGaps(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const gaps = await FacultyService.getStudentSkillGaps(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, gaps);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudentPrepAggregate(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const prep = await FacultyService.getStudentPrepAggregate(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, prep);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getBatchAnalytics(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      if (!batch_year || !branch) {
        return errorResponse(res, 400, 'BAD_REQUEST', 'batch_year and branch are required');
      }

      const profile = await FacultyService.getProfile(req.user.userId);
      const analytics = await FacultyService.getBatchAnalytics(profile.id, profile.is_tpo, parseInt(batch_year), branch);
      
      return successResponse(res, analytics);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  }
};

module.exports = FacultyController;
