const GapRepository = require('../repositories/gap.repository');
const RoleRepository = require('../repositories/role.repository');

const GapService = {
  getGapCategory(gapValue) {
    if (gapValue <= 0) return 'none';
    if (gapValue >= 1 && gapValue <= 15) return 'small';
    if (gapValue >= 16 && gapValue <= 35) return 'medium';
    return 'critical';
  },

  async recompute(studentId, roleId) {
    if (!roleId) return [];

    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return [];
    }

    const scores = await GapRepository.getAllSkillScores(studentId);
    const scoreMap = new Map(scores.map(s => [s.skill_id, s.current_score]));

    const gaps = requirements.map(req => {
      const isAssessed = scoreMap.has(req.skill_id);
      const currentScore = isAssessed ? scoreMap.get(req.skill_id) : 0;
      // Requirement 8: For assessed skill: Gap = Configured Benchmark - Current Skill Score
      // Positive gap: below benchmark. Zero or negative gap: benchmark met.
      const rawGap = req.required_level - currentScore;
      const gapValue = isAssessed ? Math.max(0, rawGap) : req.required_level;
      const gapCategory = isAssessed ? this.getGapCategory(rawGap) : 'none';

      return {
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        skill_category: req.skill_category,
        required_level: req.required_level,
        current_score: isAssessed ? currentScore : 0,
        gap: gapValue,
        gap_category: gapCategory,
        is_assessed: isAssessed
      };
    });

    await GapRepository.upsertSkillGaps(studentId, roleId, gaps);
    return await GapRepository.getSkillGaps(studentId, roleId);
  },

  async getStudentGaps(studentId, roleId) {
    if (roleId) {
      const existingGaps = await GapRepository.getSkillGaps(studentId, roleId);
      const requirements = await RoleRepository.getSkillRequirements(roleId);
      if (requirements && requirements.length > 0 && existingGaps.length < requirements.length) {
        return await this.recompute(studentId, roleId);
      }
      return existingGaps;
    }
    return await GapRepository.getSkillGapsForStudent(studentId);
  }
};

module.exports = GapService;
