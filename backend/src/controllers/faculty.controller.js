const FacultyService = require('../services/faculty.service');
const { successResponse, errorResponse } = require('../utils/response.utils');

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

      // Protect against CSV formula injection and handle delimiters
      const sanitizeCSV = (val) => {
        if (val === null || val === undefined) return 'N/A';
        const str = String(val).trim();
        let safe = str;
        // Formula injection protection: prepend single quote if starting with =, +, -, @
        if (/^[=+@-]/.test(safe)) {
          safe = `'${safe}`;
        }
        if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
          return `"${safe.replace(/"/g, '""')}"`;
        }
        return safe;
      };

      const headers = ['Student Name', 'Roll Number', 'Branch', 'Batch Year', 'Target Role', 'Readiness Score (%)', 'Readiness Status'];
      const rows = students.map((s) => {
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

        return [
          sanitizeCSV(s.full_name),
          sanitizeCSV(s.roll_number),
          sanitizeCSV(s.branch),
          sanitizeCSV(s.batch_year),
          sanitizeCSV(s.target_role_name || 'Unassigned'),
          sanitizeCSV(score !== null ? `${score}%` : 'Not Assessed'),
          sanitizeCSV(status),
        ].join(',');
      });

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

      const sanitize = (v) => {
        if (v === null || v === undefined) return '';
        const s = String(v).trim();
        const safe = /^[=+@-]/.test(s) ? `'${s}` : s;
        return (safe.includes(',') || safe.includes('"') || safe.includes('\n'))
          ? `"${safe.replace(/"/g, '""')}"` : safe;
      };

      const lines = [
        `Placement Readiness Analytics Export`,
        `Generated: ${new Date().toISOString()}`,
        `Scope: ${branch || 'All branches'} | Batch: ${batch_year || 'All batches'}`,
        ``,
        `OVERVIEW METRICS`,
        `Total Students,${overview.total_students}`,
        `Students with Target Role,${overview.students_with_role}`,
        `Students with Skill Baseline,${overview.students_with_baseline}`,
        `Students with Diagnostic Assessment,${overview.students_with_assessment}`,
        `Total Learning Tasks Completed,${overview.total_tasks_completed}`,
        `Evidence Pending Review,${overview.evidence_pending_review}`,
        `Evidence Needing Revision,${overview.evidence_needs_revision}`,
        `Average Readiness Score,${overview.avg_readiness_score !== null ? `${Math.round(overview.avg_readiness_score)}%` : 'N/A'}`,
        ``,
        `ROLE DISTRIBUTION`,
        `Role Name,Student Count,Avg Readiness (%)`,
        ...roleDistrib.map(r => [
          sanitize(r.role_name),
          sanitize(r.student_count),
          sanitize(r.avg_readiness !== null ? Math.round(r.avg_readiness) : 'N/A'),
        ].join(',')),
        ``,
        `SKILL GAP HEATMAP (Self-Reported)`,
        `Skill,Role,Required Level,Beginner,Intermediate,Proficient,Not Sure,No Baseline,Has Assessment,Avg Diagnostic Score,Critical Gaps`,
        ...skillGaps.map(sg => [
          sanitize(sg.skill_name),
          sanitize(sg.role_name),
          sanitize(sg.required_level),
          sanitize(sg.baseline_beginner),
          sanitize(sg.baseline_intermediate),
          sanitize(sg.baseline_proficient),
          sanitize(sg.baseline_not_sure),
          sanitize(sg.baseline_missing),
          sanitize(sg.has_assessment),
          sanitize(sg.avg_diagnostic_score !== null ? Math.round(sg.avg_diagnostic_score) : 'N/A'),
          sanitize(sg.gap_critical),
        ].join(',')),
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
