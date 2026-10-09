const StudentRepository = require('../repositories/student.repository');
const RoleRepository = require('../repositories/role.repository');
const ReadinessService = require('./readiness.service');

const StudentService = {
  async getProfile(userId) {
    return await StudentRepository.findByUserId(userId);
  },

  async updateProfile(userId, profileData) {
    let existing = await StudentRepository.findByUserId(userId);
    if (!existing) {
      throw new Error('Profile not found');
    }

    const { target_role_id, ...updateData } = profileData;

    // Update basic profile fields
    if (Object.keys(updateData).length > 0) {
      await StudentRepository.update(existing.id, updateData);
    }

    // Handle target role change
    if (target_role_id && target_role_id !== existing.target_role_id) {
      const role = await RoleRepository.findById(target_role_id);
      if (!role || !role.is_active) {
        throw new Error('Selected role is invalid or inactive');
      }

      await StudentRepository.setTargetRole(existing.id, target_role_id);
      
      // Update existing var to reflect the new role
      existing = await StudentRepository.findById(existing.id);

      // Recompute readiness asynchronously
      if (ReadinessService && ReadinessService.recompute) {
        ReadinessService.recompute(existing.id, target_role_id).catch(err => {
          console.error('Readiness recompute failed after target role change:', err);
        });
      }
    } else {
      existing = await StudentRepository.findById(existing.id);
    }

    return existing;
  },

  async setupInitialProfile(userId, profileData) {
    const existing = await StudentRepository.findByUserId(userId);
    if (existing) {
      throw new Error('Profile already exists for this user');
    }
    
    const profile = await StudentRepository.create({
      user_id: userId,
      ...profileData
    });

    if (profile.target_role_id && ReadinessService && ReadinessService.recompute) {
      ReadinessService.recompute(profile.id, profile.target_role_id).catch(err => {
        console.error('Readiness recompute failed after profile setup:', err);
      });
    }

    return profile;
  }
};

module.exports = StudentService;
