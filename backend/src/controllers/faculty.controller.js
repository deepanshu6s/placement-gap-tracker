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
};

module.exports = FacultyController;
