const FacultyRepository = require('../repositories/faculty.repository');
const StudentRepository = require('../repositories/student.repository');
const GapRepository = require('../repositories/gap.repository');
const PreparationRepository = require('../repositories/preparation.repository');
const AnalyticsRepository = require('../repositories/analytics.repository');

const FacultyService = {
  async getProfile(userId) {
    const profile = await FacultyRepository.findByUserId(userId);
    if (!profile) throw new Error('Faculty profile not found');
    
    const scopes = await FacultyRepository.getBatchScopes(profile.id);
    profile.scopes = scopes;
    return profile;
  },

  async getStudents(facultyProfileId, isTpo, batchYear, branch) {
    if (isTpo) {
      if (batchYear && branch) {
        return await StudentRepository.findByScopeWithReadiness(batchYear, branch);
      }
      return await StudentRepository.findAllWithReadiness();
    } else {
      if (!batchYear || !branch) {
        throw new Error('Batch year and branch are required for non-TPO faculty');
      }
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
      
      return await StudentRepository.findByScopeWithReadiness(batchYear, branch);
    }
  },

  async getStudentDetails(facultyProfileId, isTpo, studentId) {
    const student = await FacultyRepository.getStudentInScope(facultyProfileId, isTpo, studentId);
    if (!student) throw new Error('Student not found or out of scope');
    return student;
  },

  async getStudentSkillGaps(facultyProfileId, isTpo, studentId) {
    const data = await FacultyRepository.getStudentSkillGapsInScope(facultyProfileId, isTpo, studentId);
    if (!data) throw new Error('Student not found or out of scope');
    return data.gaps;
  },

  async getStudentPrepAggregate(facultyProfileId, isTpo, studentId) {
    const data = await FacultyRepository.getAggregatePrepForStudent(facultyProfileId, isTpo, studentId);
    if (!data) throw new Error('Student not found or out of scope');
    return data.prep;
  },

  // Batch-level aggregations
  async getBatchAnalytics(facultyProfileId, isTpo, batchYear, branch) {
    if (!isTpo) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }

    const gaps = await GapRepository.getAggregateGapsByScope(batchYear, branch);
    const readiness = await GapRepository.getReadinessDistributionByScope(batchYear, branch);
    const prep = await PreparationRepository.getAggregateByScope(batchYear, branch);
    const prepTrend = await PreparationRepository.getWeeklyTrendByScope(batchYear, branch, 8);

    const totalCriticalGaps = (gaps || []).reduce((sum, g) => sum + parseInt(g.critical_count || 0, 10), 0);
    const avgReadiness = readiness?.average_readiness !== null && readiness?.average_readiness !== undefined
      ? parseFloat(readiness.average_readiness)
      : null;

    return {
      avg_readiness: avgReadiness,
      critical_gaps_count: totalCriticalGaps,
      skill_gaps: gaps,
      readiness_distribution: readiness,
      preparation_metrics: prep,
      weekly_prep_trend: prepTrend
    };
  },

  /**
   * Comprehensive analytics overview — summary cards data.
   * Scope-enforced: non-TPO faculty must supply matching batchYear + branch.
   */
  async getAnalyticsOverview(facultyProfileId, isTpo, batchYear, branch) {
    if (!isTpo && batchYear && branch) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }
    const effectiveBatch  = isTpo ? batchYear  : batchYear;
    const effectiveBranch = isTpo ? branch     : branch;
    return AnalyticsRepository.getOverview(effectiveBatch, effectiveBranch);
  },

  /**
   * Role distribution — how many students target each career role.
   * Scope-enforced the same way.
   */
  async getAnalyticsRoleDistribution(facultyProfileId, isTpo, batchYear, branch) {
    if (!isTpo && batchYear && branch) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }
    return AnalyticsRepository.getRoleDistribution(batchYear, branch);
  },

  /**
   * Skill-gap heatmap — self-reported vs diagnostic per skill.
   * Scope-enforced.
   */
  async getAnalyticsSkillGaps(facultyProfileId, isTpo, batchYear, branch, roleId) {
    if (!isTpo && batchYear && branch) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }
    return AnalyticsRepository.getSkillGapHeatmap(batchYear, branch, roleId || null);
  },

  /**
   * Student support list — individual rows with support indicators.
   * Scope passed to repository so it enforces at SQL level.
   */
  async getStudentSupportList(facultyProfileId, isTpo, batchYear, branch) {
    // For non-TPO, at least one scope must match the supplied batch/branch
    if (!isTpo && batchYear && branch) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }
    return AnalyticsRepository.getStudentSupportList(facultyProfileId, isTpo, batchYear, branch);
  },

  /**
   * Auto-generated insights derived from skill-gap heatmap.
   * Scope-enforced same way as other analytics.
   */
  async getAnalyticsInsights(facultyProfileId, isTpo, batchYear, branch) {
    if (!isTpo && batchYear && branch) {
      const hasScope = await FacultyRepository.hasScope(facultyProfileId, batchYear, branch);
      if (!hasScope) throw new Error('Unauthorized scope');
    }
    return AnalyticsRepository.getInsights(batchYear, branch);
  },
};

module.exports = FacultyService;
