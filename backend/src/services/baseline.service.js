const BaselineRepository = require('../repositories/baseline.repository');
const RoleRepository = require('../repositories/role.repository');
const StudentRepository = require('../repositories/student.repository');

const VALID_LEVELS = ['beginner', 'intermediate', 'proficient', 'not_sure'];

const BaselineService = {
  async getBaseline(studentId, explicitRoleId = null) {
    let roleId = explicitRoleId;
    if (!roleId) {
      const profile = await StudentRepository.findById(studentId);
      roleId = profile?.target_role_id || null;
    }

    if (!roleId) {
      return {
        target_role: null,
        skills: [],
        summary: {
          total_skills: 0,
          rated_count: 0,
          proficient_count: 0,
          intermediate_count: 0,
          beginner_count: 0,
          not_sure_count: 0,
          unrated_count: 0,
          is_complete: false,
        },
      };
    }

    const role = await RoleRepository.findById(roleId);
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    const existingBaselines = await BaselineRepository.findByStudentId(studentId);
    const baselineMap = new Map(existingBaselines.map((b) => [b.skill_id, b]));

    let proficientCount = 0;
    let intermediateCount = 0;
    let beginnerCount = 0;
    let notSureCount = 0;
    let ratedCount = 0;

    const skills = (requirements || []).map((req) => {
      const b = baselineMap.get(req.skill_id);
      const level = b ? b.proficiency_level : null;
      if (level) {
        ratedCount++;
        if (level === 'proficient') proficientCount++;
        else if (level === 'intermediate') intermediateCount++;
        else if (level === 'beginner') beginnerCount++;
        else if (level === 'not_sure') notSureCount++;
      }

      return {
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        skill_category: req.skill_category,
        required_level: req.required_level,
        weight: req.weight,
        proficiency_level: level,
        is_rated: Boolean(level),
        is_self_reported: true,
        updated_at: b?.updated_at || null,
      };
    });

    const totalSkills = skills.length;
    const unratedCount = totalSkills - ratedCount;

    return {
      target_role: role ? { id: role.id, name: role.name, description: role.description } : null,
      skills,
      summary: {
        total_skills: totalSkills,
        rated_count: ratedCount,
        proficient_count: proficientCount,
        intermediate_count: intermediateCount,
        beginner_count: beginnerCount,
        not_sure_count: notSureCount,
        unrated_count: unratedCount,
        is_complete: totalSkills > 0 && unratedCount === 0,
      },
    };
  },

  async saveBaseline(studentId, roleId, ratings) {
    if (!roleId) {
      throw new Error('Target career role is required to establish skill baseline.');
    }

    const role = await RoleRepository.findById(roleId);
    if (!role) {
      throw new Error('Selected career role does not exist.');
    }

    if (!Array.isArray(ratings) || ratings.length === 0) {
      throw new Error('Ratings list must be provided.');
    }

    // Validate proficiency levels
    for (const r of ratings) {
      if (!r.skill_id) {
        throw new Error('Each rating must specify a valid skill_id.');
      }
      if (!VALID_LEVELS.includes(r.proficiency_level)) {
        throw new Error(
          `Invalid proficiency level "${r.proficiency_level}". Must be one of: ${VALID_LEVELS.join(', ')}.`
        );
      }
    }

    // Persist ratings idempotently
    await BaselineRepository.bulkUpsert(studentId, roleId, ratings);

    // Also update student's target role if needed
    const profile = await StudentRepository.findById(studentId);
    if (profile && profile.target_role_id !== roleId) {
      await StudentRepository.setTargetRole(studentId, roleId);
    }

    return await this.getBaseline(studentId, roleId);
  },

  async updateSingleSkill(studentId, skillId, proficiencyLevel) {
    if (!VALID_LEVELS.includes(proficiencyLevel)) {
      throw new Error(
        `Invalid proficiency level "${proficiencyLevel}". Must be one of: ${VALID_LEVELS.join(', ')}.`
      );
    }

    const profile = await StudentRepository.findById(studentId);
    const roleId = profile?.target_role_id || null;

    const saved = await BaselineRepository.upsert(studentId, skillId, roleId, proficiencyLevel);
    return saved;
  },
};

module.exports = BaselineService;
