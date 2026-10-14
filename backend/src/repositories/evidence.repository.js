const { query } = require('../config/db');

const EvidenceRepository = {
  /**
   * Create a new student evidence record.
   */
  async create(studentId, { skill_id, title, evidence_type, description, url }) {
    const result = await query(
      `INSERT INTO student_evidence (student_id, skill_id, title, evidence_type, description, url, status, submitted_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'submitted', NOW(), NOW(), NOW())
       RETURNING *`,
      [studentId, skill_id, title, evidence_type, description, url || null]
    );
    return result.rows[0];
  },

  /**
   * Get all evidence for a student, optionally filtered by skill or status.
   */
  async findByStudent(studentId, { skill_id = null, status = null } = {}) {
    let sql = `
      SELECT se.*,
             s.name AS skill_name,
             s.category AS skill_category,
             fp.full_name AS reviewer_name
      FROM student_evidence se
      JOIN skills s ON se.skill_id = s.id
      LEFT JOIN faculty_profiles fp ON se.reviewer_id = fp.id
      WHERE se.student_id = $1
    `;
    const params = [studentId];

    if (skill_id) {
      params.push(skill_id);
      sql += ` AND se.skill_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      sql += ` AND se.status = $${params.length}`;
    }

    sql += ` ORDER BY se.created_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Find a single evidence submission by ID.
   */
  async findById(evidenceId) {
    const result = await query(
      `SELECT se.*,
              s.name AS skill_name,
              s.category AS skill_category,
              sp.full_name AS student_name,
              sp.roll_number,
              sp.branch,
              sp.batch_year,
              fp.full_name AS reviewer_name
       FROM student_evidence se
       JOIN skills s ON se.skill_id = s.id
       JOIN student_profiles sp ON se.student_id = sp.id
       LEFT JOIN faculty_profiles fp ON se.reviewer_id = fp.id
       WHERE se.id = $1`,
      [evidenceId]
    );
    return result.rows[0] || null;
  },

  /**
   * Update student evidence (only by the student who owns it).
   * Status resets to 'submitted' when updated so faculty can re-review.
   */
  async update(evidenceId, studentId, { title, evidence_type, description, url }) {
    const result = await query(
      `UPDATE student_evidence
       SET title = $1,
           evidence_type = $2,
           description = $3,
           url = $4,
           status = 'submitted',
           submitted_at = NOW(),
           updated_at = NOW()
       WHERE id = $5 AND student_id = $6
       RETURNING *`,
      [title, evidence_type, description, url || null, evidenceId, studentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Delete student evidence (only by the student who owns it, and not if already accepted).
   */
  async delete(evidenceId, studentId) {
    const result = await query(
      `DELETE FROM student_evidence
       WHERE id = $1 AND student_id = $2 AND status != 'accepted'
       RETURNING *`,
      [evidenceId, studentId]
    );
    return result.rows[0] || null;
  },

  /**
   * Retrieve evidence queue for faculty review based on batch/branch scope.
   */
  async findForFacultyQueue({ facultyProfileId, isTpo = false, statusFilter = null }) {
    let sql;
    const params = [];

    if (isTpo) {
      sql = `
        SELECT se.*,
               s.name AS skill_name,
               sp.full_name AS student_name,
               sp.roll_number,
               sp.branch,
               sp.batch_year,
               u.email AS student_email,
               fp.full_name AS reviewer_name
        FROM student_evidence se
        JOIN skills s ON se.skill_id = s.id
        JOIN student_profiles sp ON se.student_id = sp.id
        JOIN users u ON sp.user_id = u.id
        LEFT JOIN faculty_profiles fp ON se.reviewer_id = fp.id
        WHERE 1=1
      `;
    } else {
      params.push(facultyProfileId);
      sql = `
        SELECT se.*,
               s.name AS skill_name,
               sp.full_name AS student_name,
               sp.roll_number,
               sp.branch,
               sp.batch_year,
               u.email AS student_email,
               fp.full_name AS reviewer_name
        FROM student_evidence se
        JOIN skills s ON se.skill_id = s.id
        JOIN student_profiles sp ON se.student_id = sp.id
        JOIN users u ON sp.user_id = u.id
        JOIN faculty_batch_scope fbs ON fbs.batch_year = sp.batch_year AND fbs.branch = sp.branch AND fbs.faculty_profile_id = $1
        LEFT JOIN faculty_profiles fp ON se.reviewer_id = fp.id
        WHERE 1=1
      `;
    }

    if (statusFilter && statusFilter !== 'all') {
      params.push(statusFilter);
      sql += ` AND se.status = $${params.length}`;
    }

    sql += ` ORDER BY
              CASE WHEN se.status = 'submitted' THEN 1
                   WHEN se.status = 'under_review' THEN 2
                   ELSE 3 END,
              se.submitted_at DESC`;

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Faculty review action: update review status and feedback.
   */
  async review(evidenceId, reviewerId, { status, faculty_feedback }) {
    const result = await query(
      `UPDATE student_evidence
       SET status = $1,
           reviewer_id = $2,
           faculty_feedback = $3,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [status, reviewerId, faculty_feedback || null, evidenceId]
    );
    return result.rows[0] || null;
  },

  /**
   * Get evidence portfolio statistics for a student.
   */
  async getStudentEvidenceStats(studentId) {
    const result = await query(
      `SELECT
         COUNT(id) AS total_evidence,
         COUNT(id) FILTER (WHERE status = 'accepted') AS accepted_count,
         COUNT(id) FILTER (WHERE status = 'submitted' OR status = 'under_review') AS pending_count,
         COUNT(id) FILTER (WHERE status = 'needs_improvement') AS revision_requested_count
       FROM student_evidence
       WHERE student_id = $1`,
      [studentId]
    );
    return {
      total_evidence: parseInt(result.rows[0].total_evidence, 10) || 0,
      accepted_count: parseInt(result.rows[0].accepted_count, 10) || 0,
      pending_count: parseInt(result.rows[0].pending_count, 10) || 0,
      revision_requested_count: parseInt(result.rows[0].revision_requested_count, 10) || 0,
    };
  },
};

module.exports = EvidenceRepository;
