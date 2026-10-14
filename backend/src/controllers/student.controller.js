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
  },

  async getSkillBaseline(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const BaselineService = require('../services/baseline.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) {
        return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');
      }

      const roleId = req.query.role_id || profile.target_role_id;
      const baseline = await BaselineService.getBaseline(profile.id, roleId);
      return successResponse(res, baseline);
    } catch (err) {
      next(err);
    }
  },

  async saveSkillBaseline(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const BaselineService = require('../services/baseline.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) {
        return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');
      }

      const roleId = req.body.role_id || profile.target_role_id;
      const result = await BaselineService.saveBaseline(profile.id, roleId, req.body.ratings);
      return successResponse(res, result);
    } catch (err) {
      if (err.message?.includes('required') || err.message?.includes('Invalid')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async updateSkillRating(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const BaselineService = require('../services/baseline.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) {
        return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');
      }

      const updated = await BaselineService.updateSingleSkill(
        profile.id,
        req.params.skillId,
        req.body.proficiency_level
      );
      return successResponse(res, updated);
    } catch (err) {
      if (err.message?.includes('Invalid')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async getRoadmap(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const RoadmapService = require('../services/roadmap.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) {
        return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');
      }

      const roleId = req.query.role_id || profile.target_role_id;
      const roadmap = await RoadmapService.getRoadmap(profile.id, roleId);
      return successResponse(res, roadmap);
    } catch (err) {
      next(err);
    }
  },

  async getSkillTasks(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const TaskProgressService = require('../services/taskProgress.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const data = await TaskProgressService.getSkillTasksWithProgress(profile.id, req.params.skillId);
      return successResponse(res, data);
    } catch (err) {
      if (err.message === 'Skill not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async updateSkillTask(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const TaskProgressService = require('../services/taskProgress.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const record = await TaskProgressService.updateTaskProgress(
        profile.id,
        req.params.skillId,
        req.params.taskKey,
        req.body
      );
      return successResponse(res, record);
    } catch (err) {
      if (err.message?.includes('Invalid task status')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      if (err.message === 'Skill not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getEvidence(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const EvidenceService = require('../services/evidence.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const evidence = await EvidenceService.getStudentEvidence(profile.id, {
        skill_id: req.query.skill_id,
        status: req.query.status,
      });
      return successResponse(res, evidence);
    } catch (err) {
      next(err);
    }
  },

  async submitEvidence(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const EvidenceService = require('../services/evidence.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const submission = await EvidenceService.submitEvidence(profile.id, req.body);
      return successResponse(res, submission, 201);
    } catch (err) {
      if (
        err.message?.includes('required') ||
        err.message?.includes('Invalid') ||
        err.message?.includes('Only HTTP')
      ) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      if (err.message === 'Skill not found in catalogue') {
        return errorResponse(res, 404, 'NOT_FOUND', err.message);
      }
      next(err);
    }
  },

  async updateEvidence(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const EvidenceService = require('../services/evidence.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const updated = await EvidenceService.updateStudentEvidence(profile.id, req.params.id, req.body);
      return successResponse(res, updated);
    } catch (err) {
      if (err.message === 'Evidence record not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      if (err.message === 'Unauthorized to modify this evidence') {
        return errorResponse(res, 403, 'FORBIDDEN', err.message);
      }
      if (
        err.message?.includes('required') ||
        err.message?.includes('Invalid') ||
        err.message?.includes('Only HTTP')
      ) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async deleteEvidence(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const EvidenceService = require('../services/evidence.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const deleted = await EvidenceService.deleteStudentEvidence(profile.id, req.params.id);
      return successResponse(res, { deleted: true, evidence: deleted });
    } catch (err) {
      if (err.message === 'Evidence record not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      if (err.message === 'Unauthorized to delete this evidence') {
        return errorResponse(res, 403, 'FORBIDDEN', err.message);
      }
      if (err.message?.includes('Cannot delete evidence')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async getTaskAndEvidenceStats(req, res, next) {
    try {
      const StudentRepository = require('../repositories/student.repository');
      const TaskProgressService = require('../services/taskProgress.service');
      const EvidenceService = require('../services/evidence.service');

      const profile = await StudentRepository.findByUserId(req.user.userId);
      if (!profile) return errorResponse(res, 404, 'NOT_FOUND', 'Student profile required');

      const [taskStats, evidenceStats] = await Promise.all([
        TaskProgressService.getStudentTaskStats(profile.id),
        EvidenceService.getStudentEvidenceStats(profile.id),
      ]);

      return successResponse(res, {
        tasks: taskStats,
        evidence: evidenceStats,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = StudentController;
