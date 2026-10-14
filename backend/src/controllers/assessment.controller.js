const AssessmentService = require('../services/assessment.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const AssessmentController = {
  async startAttempt(req, res, next) {
    try {
      const { skill_id } = req.body;
      const attempt = await AssessmentService.startAttempt(req.user.studentProfileId, skill_id);
      return successResponse(res, attempt, 201);
    } catch (err) {
      if (err.message.includes('Cooldown active') || err.message.includes('Not enough active questions')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async getAttemptQuestions(req, res, next) {
    try {
      const questions = await AssessmentService.getAttemptQuestions(req.params.attemptId, req.user.studentProfileId);
      return successResponse(res, questions);
    } catch (err) {
      if (err.message === 'Attempt not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async submitAttempt(req, res, next) {
    try {
      const { answers } = req.body;
      const result = await AssessmentService.submitAttempt(req.params.attemptId, req.user.studentProfileId, answers);
      return successResponse(res, result);
    } catch (err) {
      if (err.message === 'Attempt not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      if (err.message.includes('Attempt already completed') || err.message.includes('Invalid option')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async getAttemptResult(req, res, next) {
    try {
      const result = await AssessmentService.getAttemptResult(req.params.attemptId, req.user.studentProfileId);
      if (!result) return errorResponse(res, 404, 'NOT_FOUND', 'Result not found');
      return successResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getAttemptReview(req, res, next) {
    try {
      const review = await AssessmentService.getAttemptReview(req.params.attemptId, req.user.studentProfileId);
      if (!review) return errorResponse(res, 404, 'NOT_FOUND', 'Review not found');
      return successResponse(res, review);
    } catch (err) {
      if (err.message === 'Attempt not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      if (err.message.includes('still in progress')) return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  }
};

module.exports = AssessmentController;
