const FacultyRepository = require('../repositories/faculty.repository');
const StudentRepository = require('../repositories/student.repository');
const GapRepository = require('../repositories/gap.repository');
const PreparationRepository = require('../repositories/preparation.repository');

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

    return {
      skill_gaps: gaps,
      readiness_distribution: readiness,
      preparation_metrics: prep,
      weekly_prep_trend: prepTrend
    };
  }
};

module.exports = FacultyService;
