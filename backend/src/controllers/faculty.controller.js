const FacultyService = require('../services/faculty.service');
const { successResponse, errorResponse } = require('../utils/response.utils');
const { sanitizeCSVCell, formatCSVRow } = require('../utils/csv.utils');

const FacultyController = {
  async getProfile(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      return successResponse(res, profile);
    } catch (err) {
      if (err.message === 'Faculty profile not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudents(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      
      const students = await FacultyService.getStudents(
        profile.id, 
        profile.is_tpo, 
        batch_year ? parseInt(batch_year) : null, 
        branch
      );
      return successResponse(res, students);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      if (err.message.includes('required for non-TPO')) return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  },

  async getStudentDetails(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const student = await FacultyService.getStudentDetails(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, student);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudentSkillGaps(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const gaps = await FacultyService.getStudentSkillGaps(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, gaps);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getStudentPrepAggregate(req, res, next) {
    try {
      const profile = await FacultyService.getProfile(req.user.userId);
      const prep = await FacultyService.getStudentPrepAggregate(profile.id, profile.is_tpo, req.params.studentId);
      return successResponse(res, prep);
    } catch (err) {
      if (err.message === 'Student not found or out of scope') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      next(err);
    }
  },

  async getBatchAnalytics(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      if (!batch_year || !branch) {
        return errorResponse(res, 400, 'BAD_REQUEST', 'batch_year and branch are required');
      }

      const profile = await FacultyService.getProfile(req.user.userId);
      const analytics = await FacultyService.getBatchAnalytics(profile.id, profile.is_tpo, parseInt(batch_year), branch);
      
      return successResponse(res, analytics);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  async getEvidenceQueue(req, res, next) {
    try {
      const EvidenceService = require('../services/evidence.service');
      const profile = await FacultyService.getProfile(req.user.userId);
      const queue = await EvidenceService.getFacultyQueue(profile.id, profile.is_tpo, req.query.status);
      return successResponse(res, queue);
    } catch (err) {
      next(err);
    }
  },

  async reviewEvidence(req, res, next) {
    try {
      const EvidenceService = require('../services/evidence.service');
      const profile = await FacultyService.getProfile(req.user.userId);
      const reviewed = await EvidenceService.reviewEvidence(
        profile.id,
        profile.is_tpo,
        req.params.id,
        req.body
      );
      return successResponse(res, reviewed);
    } catch (err) {
      if (err.message === 'Evidence submission not found') return errorResponse(res, 404, 'NOT_FOUND', err.message);
      if (err.message?.includes('authorization')) return errorResponse(res, 403, 'FORBIDDEN', err.message);
      if (err.message?.includes('Invalid review status') || err.message?.includes('required')) {
        return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      }
      next(err);
    }
  },

  async exportStudentsCSV(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const students = await FacultyService.getStudents(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch
      );

      const headers = ['Student Name', 'Roll Number', 'Branch', 'Batch Year', 'Target Role', 'Readiness Score (%)', 'Readiness Status'];
      const rows = students.length > 0
        ? students.map((s) => {
            const score = s.readiness_score !== null && s.readiness_score !== undefined
              ? Math.round(s.readiness_score)
              : null;
            let status = 'Active Prep';
            if (score !== null) {
              if (score >= 70) status = 'Placement Ready';
              else if (score < 50) status = 'Needs Intervention';
            } else {
              status = 'Unassessed';
            }

            return formatCSVRow([
              s.full_name,
              s.roll_number,
              s.branch,
              s.batch_year,
              s.target_role_name || 'Unassigned',
              score !== null ? `${score}%` : 'Not Assessed',
              status,
            ], 'N/A');
          })
        : [formatCSVRow(['(No student records found)', 'N/A', branch || 'N/A', batch_year || 'N/A', 'N/A', 'N/A', 'N/A'])];

      const csvContent = [headers.join(','), ...rows].join('\r\n');
      const filename = `cohort_roster_${branch || 'all'}_${batch_year || 'all'}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      if (err.message?.includes('required for non-TPO')) return errorResponse(res, 400, 'BAD_REQUEST', err.message);
      next(err);
    }
  },

  /* =====================================================================
   * ANALYTICS ENDPOINTS — Phase 1-4 of TASK 4
   * All require authenticate + authorize(['faculty','admin']) via routes.
   * All re-enforce scope restrictions via the service layer.
   * ===================================================================== */

  async getAnalyticsOverview(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const overview = await FacultyService.getAnalyticsOverview(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch || null
      );
      return successResponse(res, overview);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  async getAnalyticsRoleDistribution(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const distribution = await FacultyService.getAnalyticsRoleDistribution(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch || null
      );
      return successResponse(res, distribution);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  async getAnalyticsSkillGaps(req, res, next) {
    try {
      const { batch_year, branch, role_id } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const heatmap = await FacultyService.getAnalyticsSkillGaps(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch || null,
        role_id || null
      );
      return successResponse(res, heatmap);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  async getStudentSupportList(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const list = await FacultyService.getStudentSupportList(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch || null
      );
      return successResponse(res, list);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  async getAnalyticsInsights(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const insights = await FacultyService.getAnalyticsInsights(
        profile.id,
        profile.is_tpo,
        batch_year ? parseInt(batch_year, 10) : null,
        branch || null
      );
      return successResponse(res, insights);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },

  /**
   * Comprehensive analytics export: cohort overview + role distribution + skill gaps
   * as a structured CSV. Separate from the student roster export.
   */
  async exportAnalyticsCSV(req, res, next) {
    try {
      const { batch_year, branch } = req.query;
      const profile = await FacultyService.getProfile(req.user.userId);
      const batchYearInt = batch_year ? parseInt(batch_year, 10) : null;

      const [overview, roleDistrib, skillGaps] = await Promise.all([
        FacultyService.getAnalyticsOverview(profile.id, profile.is_tpo, batchYearInt, branch || null),
        FacultyService.getAnalyticsRoleDistribution(profile.id, profile.is_tpo, batchYearInt, branch || null),
        FacultyService.getAnalyticsSkillGaps(profile.id, profile.is_tpo, batchYearInt, branch || null, null),
      ]);

      const safeScope = sanitizeCSVCell(branch || 'All branches');
      const safeBatch = sanitizeCSVCell(batch_year || 'All batches');

      const roleRows = (roleDistrib && roleDistrib.length > 0)
        ? roleDistrib.map(r => formatCSVRow([
            r.role_name,
            r.student_count,
            r.avg_readiness !== null && r.avg_readiness !== undefined ? Math.round(r.avg_readiness) : 'N/A',
          ]))
        : [formatCSVRow(['(No roles recorded)', 0, 'N/A'])];

      const skillGapRows = (skillGaps && skillGaps.length > 0)
        ? skillGaps.map(sg => formatCSVRow([
            sg.skill_name,
            sg.role_name,
            sg.required_level,
            sg.baseline_beginner,
            sg.baseline_intermediate,
            sg.baseline_proficient,
            sg.baseline_not_sure,
            sg.baseline_missing,
            sg.has_assessment,
            sg.avg_diagnostic_score !== null && sg.avg_diagnostic_score !== undefined ? Math.round(sg.avg_diagnostic_score) : 'N/A',
            sg.gap_critical,
          ]))
        : [formatCSVRow(['(No skill gaps recorded)', 'N/A', 'N/A', 0, 0, 0, 0, 0, 0, 'N/A', 0])];

      const lines = [
        `Placement Readiness Analytics Export`,
        `Generated: ${new Date().toISOString()}`,
        `Scope: ${safeScope} | Batch: ${safeBatch}`,
        ``,
        `OVERVIEW METRICS`,
        formatCSVRow(['Total Students', overview?.total_students ?? 0]),
        formatCSVRow(['Students with Target Role', overview?.students_with_role ?? 0]),
        formatCSVRow(['Students with Skill Baseline', overview?.students_with_baseline ?? 0]),
        formatCSVRow(['Students with Diagnostic Assessment', overview?.students_with_assessment ?? 0]),
        formatCSVRow(['Total Learning Tasks Completed', overview?.total_tasks_completed ?? 0]),
        formatCSVRow(['Evidence Pending Review', overview?.evidence_pending_review ?? 0]),
        formatCSVRow(['Evidence Needing Revision', overview?.evidence_needs_revision ?? 0]),
        formatCSVRow(['Average Readiness Score', overview?.avg_readiness_score !== null && overview?.avg_readiness_score !== undefined ? `${Math.round(overview.avg_readiness_score)}%` : 'N/A']),
        ``,
        `ROLE DISTRIBUTION`,
        `Role Name,Student Count,Avg Readiness (%)`,
        ...roleRows,
        ``,
        `SKILL GAP HEATMAP (Self-Reported)`,
        `Skill,Role,Required Level,Beginner,Intermediate,Proficient,Not Sure,No Baseline,Has Assessment,Avg Diagnostic Score,Critical Gaps`,
        ...skillGapRows,
      ];

      const csvContent = lines.join('\r\n');
      const filename = `analytics_report_${branch || 'all'}_${batch_year || 'all'}_${Date.now()}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    } catch (err) {
      if (err.message === 'Unauthorized scope') return errorResponse(res, 403, 'FORBIDDEN', err.message);
      next(err);
    }
  },
};

module.exports = FacultyController;
