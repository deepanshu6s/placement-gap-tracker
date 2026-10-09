const { query } = require('../config/db');

const FacultyRepository = {
  async findByUserId(userId) {
    const result = await query(
      `SELECT fp.*, u.email
       FROM faculty_profiles fp
       JOIN users u ON fp.user_id = u.id
       WHERE fp.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async getBatchScopes(facultyProfileId) {
    const result = await query(
      'SELECT batch_year, branch FROM faculty_batch_scope WHERE faculty_profile_id = $1',
      [facultyProfileId]
    );
    return result.rows;
  },

  // Check if faculty has scope for a given (batch_year, branch)
  async hasScope(facultyProfileId, batchYear, branch) {
    const result = await query(
      `SELECT 1 FROM faculty_batch_scope
       WHERE faculty_profile_id = $1 AND batch_year = $2 AND branch = $3`,
      [facultyProfileId, batchYear, branch]
    );
    return result.rows.length > 0;
  },

  // Get a specific student and verify faculty has scope
  async getStudentInScope(facultyProfileId, isTpo, studentId) {
    let sql;
    const params = [studentId];
    if (isTpo) {
      sql = `SELECT sp.id, sp.full_name, sp.roll_number, sp.branch, sp.batch_year,
                    sp.cgpa, sp.target_role_id, cr.name as target_role_name, u.email,
                    rs.score as readiness_score,
                    COUNT(sg.id) FILTER (WHERE sg.gap_category = 'critical') as critical_gap_count
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
             LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
             LEFT JOIN skill_gaps sg ON sg.student_id = sp.id AND sg.role_id = sp.target_role_id
             WHERE sp.id = $1
             GROUP BY sp.id, cr.name, rs.score, u.email`;
    } else {
      params.push(facultyProfileId);
      sql = `SELECT sp.id, sp.full_name, sp.roll_number, sp.branch, sp.batch_year,
                    sp.cgpa, sp.target_role_id, cr.name as target_role_name, u.email,
                    rs.score as readiness_score,
                    COUNT(sg.id) FILTER (WHERE sg.gap_category = 'critical') as critical_gap_count
             FROM student_profiles sp
             JOIN users u ON sp.user_id = u.id
             LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
             LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
             LEFT JOIN skill_gaps sg ON sg.student_id = sp.id AND sg.role_id = sp.target_role_id
             JOIN faculty_batch_scope fbs ON fbs.batch_year = sp.batch_year AND fbs.branch = sp.branch
             WHERE sp.id = $1 AND fbs.faculty_profile_id = $2
             GROUP BY sp.id, cr.name, rs.score, u.email`;
    }
    const result = await query(sql, params);
    return result.rows[0] || null;
  },

  async getStudentSkillGapsInScope(facultyProfileId, isTpo, studentId) {
    // Verify scope first
    const student = await this.getStudentInScope(facultyProfileId, isTpo, studentId);
    if (!student) return null;

    const result = await query(
      `SELECT sg.skill_id, sg.required_level, sg.current_score, sg.gap,
              sg.gap_category, sg.is_assessed,
              s.name as skill_name
       FROM skill_gaps sg
       JOIN skills s ON sg.skill_id = s.id
       WHERE sg.student_id = $1 AND sg.role_id = $2
       ORDER BY sg.gap DESC`,
      [studentId, student.target_role_id]
    );
    return { student, gaps: result.rows };
  },

  // Aggregate prep metrics (privacy-safe — no URLs/descriptions)
  async getAggregatePrepForStudent(facultyProfileId, isTpo, studentId) {
    const student = await this.getStudentInScope(facultyProfileId, isTpo, studentId);
    if (!student) return null;

    const result = await query(
      `SELECT
         COALESCE(SUM(hours_spent), 0) as total_prep_hours,
         COUNT(*) as total_activities,
         json_agg(
           json_build_object(
             'skill_id', pa.skill_id,
             'skill_name', s.name,
             'total_hours', skill_totals.total_hours
           )
         ) FILTER (WHERE pa.skill_id IS NOT NULL) as hours_by_skill
       FROM preparation_activities pa
       LEFT JOIN skills s ON pa.skill_id = s.id
       LEFT JOIN LATERAL (
         SELECT SUM(hours_spent) as total_hours
         FROM preparation_activities
         WHERE student_id = $1 AND skill_id = pa.skill_id
       ) skill_totals ON true
       WHERE pa.student_id = $1`,
      [studentId]
    );
    return { student, prep: result.rows[0] };
  },
};

module.exports = FacultyRepository;
