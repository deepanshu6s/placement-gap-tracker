const SkillService = require('../services/skill.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const SkillController = {
  async getAll(req, res, next) {
    try {
      const activeOnly = req.query.all !== 'true';
      const skills = await SkillService.getAllSkills(activeOnly);
      return successResponse(res, skills);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const skill = await SkillService.getSkillById(req.params.id);
      return successResponse(res, skill);
    } catch (err) {
      if (err.message === 'Skill not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const skill = await SkillService.createSkill(req.body);
      return successResponse(res, skill, 201);
    } catch (err) {
      if (err.message === 'Skill with this name already exists') return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const skill = await SkillService.updateSkill(req.params.id, req.body);
      return successResponse(res, skill);
    } catch (err) {
      if (err.message === 'Skill not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async deactivate(req, res, next) {
    try {
      const skill = await SkillService.deactivateSkill(req.params.id);
      return successResponse(res, skill);
    } catch (err) {
      if (err.message === 'Skill not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  // Assessment Configs
  async getConfig(req, res, next) {
    try {
      const config = await SkillService.getAssessmentConfig(req.params.id);
      return successResponse(res, config);
    } catch (err) {
      next(err);
    }
  },

  async updateConfig(req, res, next) {
    try {
      const config = await SkillService.updateAssessmentConfig(req.params.id, req.body);
      return successResponse(res, config);
    } catch (err) {
      if (err.message === 'Sum of easy, medium, and hard counts must equal total questions') {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async getQuestionCounts(req, res, next) {
    try {
      const counts = await SkillService.getQuestionCounts(req.params.id);
      return successResponse(res, counts);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = SkillController;
