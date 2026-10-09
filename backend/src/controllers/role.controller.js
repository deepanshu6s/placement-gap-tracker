const RoleService = require('../services/role.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

const RoleController = {
  async getAll(req, res, next) {
    try {
      const activeOnly = req.query.all !== 'true';
      const roles = await RoleService.getAllRoles(activeOnly);
      return successResponse(res, roles);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const role = await RoleService.getRoleById(req.params.id);
      return successResponse(res, role);
    } catch (err) {
      if (err.message === 'Role not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const role = await RoleService.createRole(req.body, req.user.userId);
      return successResponse(res, role, 201);
    } catch (err) {
      if (err.message === 'Role with this name already exists') return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const role = await RoleService.updateRole(req.params.id, req.body);
      return successResponse(res, role);
    } catch (err) {
      if (err.message === 'Role not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async deactivate(req, res, next) {
    try {
      const role = await RoleService.deactivateRole(req.params.id);
      return successResponse(res, role);
    } catch (err) {
      if (err.message === 'Role not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  // Requirements
  async getRequirements(req, res, next) {
    try {
      const reqs = await RoleService.getRequirements(req.params.id);
      return successResponse(res, reqs);
    } catch (err) {
      next(err);
    }
  },

  async addRequirement(req, res, next) {
    try {
      const reqInfo = await RoleService.addRequirement(req.params.id, req.body);
      return successResponse(res, reqInfo, 201);
    } catch (err) {
      next(err);
    }
  },

  async updateRequirement(req, res, next) {
    try {
      const reqInfo = await RoleService.updateRequirement(req.params.id, req.params.skillId, req.body);
      return successResponse(res, reqInfo);
    } catch (err) {
      next(err);
    }
  },

  async removeRequirement(req, res, next) {
    try {
      await RoleService.removeRequirement(req.params.id, req.params.skillId);
      return successResponse(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = RoleController;
