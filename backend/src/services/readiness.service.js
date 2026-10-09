const GapRepository = require('../repositories/gap.repository');
const RoleRepository = require('../repositories/role.repository');
const RecommendationService = require('./recommendation.service'); // we'll create this next

const ReadinessService = {
  async recompute(studentId, roleId) {
    if (!roleId) return null;

    const requirements = await RoleRepository.getSkillRequirements(roleId);
    let totalWeight = 0;
    
    // PHA-07: APPROVED behavior
    if (!requirements || requirements.length === 0) {
      return {
        score: null,
        code: 'ROLE_HAS_NO_SKILLS',
        message: 'Selected role has no defined skill requirements.'
      };
    }

    const scores = await GapRepository.getAllSkillScores(studentId);
    const scoreMap = new Map(scores.map(s => [s.skill_id, s.current_score]));

    let weightedSum = 0;

    for (const req of requirements) {
      totalWeight += req.weight;
      
      const isAssessed = scoreMap.has(req.skill_id);
      let ri = 0;
      
      if (isAssessed) {
        const currentScore = scoreMap.get(req.skill_id);
        if (req.required_level === 0) {
          ri = 1.0;
        } else {
          ri = Math.min(currentScore, req.required_level) / req.required_level;
        }
      }
      
      weightedSum += (ri * req.weight);
    }

    if (totalWeight === 0) {
      return {
        score: null,
        code: 'ROLE_HAS_NO_SKILLS',
        message: 'Selected role has no defined skill requirements.'
      };
    }

    const rawScore = 100 * (weightedSum / totalWeight);
    const score = Math.min(100, Math.max(0, parseFloat(rawScore.toFixed(2))));

    // Store in DB
    await GapRepository.upsertReadinessScore(studentId, roleId, score);
    await GapRepository.appendReadinessHistory(studentId, roleId, score);

    // Trigger recommendations generation asynchronously
    if (RecommendationService && RecommendationService.generateRecommendations) {
      RecommendationService.generateRecommendations(studentId, roleId).catch(err => {
        console.error('Recommendation generation failed:', err);
      });
    }

    return {
      score,
      status: 'SUCCESS'
    };
  },

  async getScore(studentId, roleId) {
    if (!roleId) return { score: null, status: 'NO_ROLE_SELECTED' };
    
    const dbScore = await GapRepository.getReadinessScore(studentId, roleId);
    if (dbScore && dbScore.score !== null) {
      return { score: parseFloat(dbScore.score), status: 'SUCCESS' };
    }

    // Check if it's because there are no skills
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return { score: null, status: 'ROLE_HAS_NO_SKILLS', message: 'Selected role has no defined skill requirements.' };
    }
    
    return { score: null, status: 'NO_SCORE_YET' };
  },

  async getHistory(studentId, roleId) {
    if (!roleId) return [];
    return await GapRepository.getReadinessHistory(studentId, roleId);
  }
};

module.exports = ReadinessService;
