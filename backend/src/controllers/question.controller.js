const AssessmentRepository = require('../repositories/assessment.repository');
const { successResponse, errorResponse } = require('../utils/response.utils');

const QuestionController = {
  async getQuestions(req, res, next) {
    try {
      const { skill_id, difficulty, all } = req.query;
      const activeOnly = all !== 'true';
      const questions = await AssessmentRepository.findQuestions({ skill_id, difficulty, activeOnly });
      return successResponse(res, questions);
    } catch (err) {
      next(err);
    }
  },

  async getQuestionById(req, res, next) {
    try {
      const question = await AssessmentRepository.findQuestionById(req.params.id);
      if (!question) return errorResponse(res, 404, 'NOT_FOUND', 'Question not found');
      return successResponse(res, question);
    } catch (err) {
      next(err);
    }
  },

  async createQuestion(req, res, next) {
    try {
      const { skill_id, question_text, difficulty, options } = req.body;
      
      const correctCount = options.filter(o => o.is_correct).length;
      if (correctCount !== 1) {
        return errorResponse(res, 400, 'BAD_REQUEST', 'Exactly one option must be correct');
      }

      const question = await AssessmentRepository.createQuestion({
        skill_id,
        question_text,
        difficulty,
        created_by: req.user.userId,
        options
      });
      return successResponse(res, question, 201);
    } catch (err) {
      next(err);
    }
  },

  async deactivateQuestion(req, res, next) {
    try {
      const question = await AssessmentRepository.deactivateQuestion(req.params.id);
      if (!question) return errorResponse(res, 404, 'NOT_FOUND', 'Question not found');
      return successResponse(res, question);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = QuestionController;
