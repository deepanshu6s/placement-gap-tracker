const RecommendationRepository = require('../repositories/recommendation.repository');
const GapRepository = require('../repositories/gap.repository');
const RoleRepository = require('../repositories/role.repository');
const PreparationRepository = require('../repositories/preparation.repository');

const RecommendationService = {
  async generateRecommendations(studentId, roleId) {
    if (!roleId) return [];

    // Get skill gaps and requirements
    let gaps = await GapRepository.getSkillGaps(studentId, roleId);
    if (!gaps || gaps.length === 0) {
      const GapService = require('./gap.service');
      gaps = await GapService.recompute(studentId, roleId);
    }
    if (!gaps || gaps.length === 0) return [];
    
    // Get role requirements for weights
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    const weightMap = new Map(requirements.map(req => [req.skill_id, req.weight]));

    // Fetch all current scores to check for regression
    const skillScores = await GapRepository.getAllSkillScores(studentId);
    const bestScoreMap = new Map(skillScores.map(s => [s.skill_id, s.best_score]));
    const currentScoreMap = new Map(skillScores.map(s => [s.skill_id, s.current_score]));

    const generated = [];

    // Evaluate rules for each gap
    for (const gap of gaps) {
      const weight = weightMap.get(gap.skill_id) || 1;
      const priorityScore = gap.gap * weight; // Based on formula
      
      let ruleFired = false;

      // R01 & R02: Never assessed
      if (!gap.is_assessed) {
        const p = weight >= 4 ? 'high' : 'medium';
        generated.push({
          skill_id: gap.skill_id,
          priority: p,
          recommendation_type: 'take_assessment',
          message: `Take an assessment to determine your baseline proficiency.`,
          priorityScore: weight >= 4 ? 1000 : 500, // Artificial boost to ensure they are at top
          gap_change: 0 // Not applicable
        });
        continue; // skip other rules
      }

      // R03 & R03b: Critical Gap
      if (gap.gap_category === 'critical') {
        generated.push({
          skill_id: gap.skill_id,
          priority: 'high',
          recommendation_type: 'study_resource',
          message: `Critical gap detected (${gap.gap} pts below requirement). Review foundational concepts immediately.`,
          priorityScore: priorityScore + 100,
          gap_change: gap.gap
        });
        
        generated.push({
          skill_id: gap.skill_id,
          priority: 'high',
          recommendation_type: 'practice_skill',
          message: `Intense practice needed to close critical gap.`,
          priorityScore,
          gap_change: gap.gap
        });
        ruleFired = true;
      }

      // R06: No prep in 7 days & gap >= medium
      if (!ruleFired && (gap.gap_category === 'medium' || gap.gap_category === 'critical')) {
        const hasPrep = await PreparationRepository.hasRecentPrepForSkill(studentId, gap.skill_id, 7);
        if (!hasPrep) {
          generated.push({
            skill_id: gap.skill_id,
            priority: 'high',
            recommendation_type: 'practice_skill',
            message: `You haven't logged any practice for this skill in the last 7 days. Consistency is key.`,
            priorityScore: priorityScore + 50,
            gap_change: gap.gap
          });
          ruleFired = true;
        }
      }

      // R04: Medium gap
      if (!ruleFired && gap.gap_category === 'medium') {
        generated.push({
          skill_id: gap.skill_id,
          priority: 'medium',
          recommendation_type: 'practice_skill',
          message: `Moderate gap (${gap.gap} pts). Dedicated practice will bring you to requirement.`,
          priorityScore,
          gap_change: gap.gap
        });
        ruleFired = true;
      }

      // R07: Regression check
      const currentScore = currentScoreMap.get(gap.skill_id);
      const bestScore = bestScoreMap.get(gap.skill_id);
      if (!ruleFired && currentScore !== undefined && bestScore !== undefined && currentScore < bestScore - 15) {
        generated.push({
          skill_id: gap.skill_id,
          priority: 'medium',
          recommendation_type: 'review_weak_area',
          message: `Score regression detected (dropped by ${bestScore - currentScore} pts). Review past mistakes.`,
          priorityScore: priorityScore + 25,
          gap_change: gap.gap
        });
        ruleFired = true;
      }

      // R05: Small gap
      if (!ruleFired && gap.gap_category === 'small') {
        generated.push({
          skill_id: gap.skill_id,
          priority: 'low',
          recommendation_type: 'review_weak_area',
          message: `Small gap (${gap.gap} pts). Light review needed to meet requirement.`,
          priorityScore,
          gap_change: gap.gap
        });
        ruleFired = true;
      }
    }

    // Sort by priorityScore desc
    generated.sort((a, b) => b.priorityScore - a.priorityScore);

    // Apply Max 10 rule
    const top10 = generated.slice(0, 10);

    // Save to DB using bulkUpsert
    if (top10.length > 0) {
      await RecommendationRepository.bulkUpsert(studentId, roleId, top10);
    }

    return top10;
  },

  async getActiveRecommendations(studentId, roleId) {
    if (!roleId) return [];
    let recs = await RecommendationRepository.getActiveRecommendations(studentId, roleId);
    if (!recs || recs.length === 0) {
      recs = await this.generateRecommendations(studentId, roleId);
    }
    return recs;
  },

  async dismiss(id, studentId) {
    return await RecommendationRepository.dismiss(id, studentId);
  }
};

module.exports = RecommendationService;
