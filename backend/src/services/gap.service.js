const GapRepository = require('../repositories/gap.repository');
const RoleRepository = require('../repositories/role.repository');

const GapService = {
  getGapCategory(gapValue) {
    if (gapValue === 0) return 'none';
    if (gapValue >= 1 && gapValue <= 15) return 'small';
    if (gapValue >= 16 && gapValue <= 35) return 'medium';
    return 'critical';
  },

  async recompute(studentId, roleId) {
    if (!roleId) return;

    // Get requirements for the role
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return; // No requirements to compute gaps against
    }

    // Get all current scores for the student
    const scores = await GapRepository.getAllSkillScores(studentId);
    const scoreMap = new Map(scores.map(s => [s.skill_id, s.current_score]));

    const gaps = requirements.map(req => {
      const currentScore = scoreMap.get(req.skill_id) || 0;
      const isAssessed = scoreMap.has(req.skill_id); // As per architecture: assessed = has row in student_skill_scores
      const gapValue = Math.max(0, req.required_level - currentScore);
      const gapCategory = this.getGapCategory(gapValue);

      return {
        skill_id: req.skill_id,
        required_level: req.required_level,
        current_score: currentScore,
        gap: gapValue,
        gap_category: gapCategory,
        is_assessed: isAssessed
      };
    });

    // Upsert gaps in DB
    await GapRepository.upsertSkillGaps(studentId, roleId, gaps);
    
    return gaps;
  },

  async getStudentGaps(studentId, roleId) {
    if (roleId) {
      return await GapRepository.getSkillGaps(studentId, roleId);
    }
    return await GapRepository.getSkillGapsForStudent(studentId);
  }
};

module.exports = GapService;
