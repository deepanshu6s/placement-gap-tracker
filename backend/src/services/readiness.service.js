const GapRepository = require('../repositories/gap.repository');
const RoleRepository = require('../repositories/role.repository');
const RecommendationService = require('./recommendation.service');

const ReadinessService = {
  async recompute(studentId, roleId) {
    if (!roleId) return null;

    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return {
        score: null,
        status: 'ROLE_HAS_NO_SKILLS',
        assessedSkillsCount: 0,
        totalSkillsCount: 0,
        assessmentCoverage: 0,
        isFullyAssessed: false,
        message: 'Selected role has no defined skill requirements.'
      };
    }

    const scores = await GapRepository.getAllSkillScores(studentId);
    const scoreMap = new Map(scores.map(s => [s.skill_id, s.current_score]));

    const totalSkillsCount = requirements.length;
    const assessedReqs = requirements.filter(req => scoreMap.has(req.skill_id));
    const assessedSkillsCount = assessedReqs.length;
    const assessmentCoverage = totalSkillsCount > 0
      ? Math.round((assessedSkillsCount / totalSkillsCount) * 100)
      : 0;

    // Requirement 7: If no valid skill scores exist, show "Not Assessed" rather than presenting 0%
    if (assessedSkillsCount === 0) {
      await GapRepository.upsertReadinessScore(studentId, roleId, null);

    if (RecommendationService && RecommendationService.generateRecommendations) {
      try {
        await RecommendationService.generateRecommendations(studentId, roleId);
      } catch (err) {
        console.error('Recommendation generation failed:', err);
      }
    }

      return {
        score: null,
        status: 'NOT_ASSESSED',
        assessedSkillsCount: 0,
        totalSkillsCount,
        assessmentCoverage: 0,
        isFullyAssessed: false,
        message: 'No skills assessed yet.'
      };
    }

    // Readiness = SUM(Current Skill Score × Skill Weight) / SUM(Weights of skills included in the calculation)
    let assessedWeightSum = 0;
    let weightedScoreSum = 0;

    for (const req of assessedReqs) {
      const currentScore = scoreMap.get(req.skill_id);
      const validScore = Math.max(0, Math.min(100, Number(currentScore) || 0));
      const validWeight = Math.max(1, Number(req.weight) || 1);

      assessedWeightSum += validWeight;
      weightedScoreSum += (validScore * validWeight);
    }

    const rawScore = assessedWeightSum > 0 ? (weightedScoreSum / assessedWeightSum) : 0;
    const score = Math.min(100, Math.max(0, parseFloat(rawScore.toFixed(2))));

    // Store in DB
    await GapRepository.upsertReadinessScore(studentId, roleId, score);
    await GapRepository.appendReadinessHistory(studentId, roleId, score);

    // Trigger recommendations generation
    if (RecommendationService && RecommendationService.generateRecommendations) {
      try {
        await RecommendationService.generateRecommendations(studentId, roleId);
      } catch (err) {
        console.error('Recommendation generation failed:', err);
      }
    }

    return {
      score,
      status: 'SUCCESS',
      assessedSkillsCount,
      totalSkillsCount,
      assessmentCoverage,
      isFullyAssessed: assessedSkillsCount === totalSkillsCount
    };
  },

  async getScore(studentId, roleId) {
    if (!roleId) return { score: null, status: 'NO_ROLE_SELECTED' };
    
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return {
        score: null,
        status: 'ROLE_HAS_NO_SKILLS',
        assessedSkillsCount: 0,
        totalSkillsCount: 0,
        assessmentCoverage: 0,
        isFullyAssessed: false,
        message: 'Selected role has no defined skill requirements.'
      };
    }

    const scores = await GapRepository.getAllSkillScores(studentId);
    const scoreMap = new Map(scores.map(s => [s.skill_id, s.current_score]));
    const totalSkillsCount = requirements.length;
    const assessedReqs = requirements.filter(req => scoreMap.has(req.skill_id));
    const assessedSkillsCount = assessedReqs.length;
    const assessmentCoverage = totalSkillsCount > 0
      ? Math.round((assessedSkillsCount / totalSkillsCount) * 100)
      : 0;

    if (assessedSkillsCount === 0) {
      return {
        score: null,
        status: 'NOT_ASSESSED',
        assessedSkillsCount: 0,
        totalSkillsCount,
        assessmentCoverage: 0,
        isFullyAssessed: false,
        message: 'No skills assessed yet.'
      };
    }

    const dbScore = await GapRepository.getReadinessScore(studentId, roleId);
    if (dbScore && dbScore.score !== null) {
      return {
        score: parseFloat(dbScore.score),
        status: 'SUCCESS',
        assessedSkillsCount,
        totalSkillsCount,
        assessmentCoverage,
        isFullyAssessed: assessedSkillsCount === totalSkillsCount
      };
    }

    // If not calculated yet or stale, recompute
    return await this.recompute(studentId, roleId);
  },

  async getHistory(studentId, roleId) {
    if (!roleId) return [];
    return await GapRepository.getReadinessHistory(studentId, roleId);
  }
};

module.exports = ReadinessService;
