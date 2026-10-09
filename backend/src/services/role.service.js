const RoleRepository = require('../repositories/role.repository');

const RoleService = {
  async getAllRoles(activeOnly = true) {
    return await RoleRepository.findAll(activeOnly);
  },

  async getRoleById(id) {
    const role = await RoleRepository.findById(id);
    if (!role) throw new Error('Role not found');
    return role;
  },

  async createRole(data, createdBy) {
    const existing = await RoleRepository.findByName(data.name);
    if (existing) throw new Error('Role with this name already exists');
    return await RoleRepository.create({ ...data, created_by: createdBy });
  },

  async updateRole(id, data) {
    const role = await RoleRepository.update(id, data);
    if (!role) throw new Error('Role not found');
    return role;
  },

  async deactivateRole(id) {
    const role = await RoleRepository.deactivate(id);
    if (!role) throw new Error('Role not found');
    
    // Clear student targets targeting this deactivated role
    await RoleRepository.clearStudentTargetRole(id);
    return role;
  },

  // Role Skill Requirements
  async getRequirements(roleId) {
    return await RoleRepository.getSkillRequirements(roleId);
  },

  async addRequirement(roleId, data) {
    return await RoleRepository.addSkillRequirement({ role_id: roleId, ...data });
  },

  async updateRequirement(roleId, skillId, data) {
    return await RoleRepository.updateSkillRequirement(roleId, skillId, data);
  },

  async removeRequirement(roleId, skillId) {
    return await RoleRepository.removeSkillRequirement(roleId, skillId);
  }
};

module.exports = RoleService;
