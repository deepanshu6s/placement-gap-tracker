const { query, pool } = require('../config/db');

const StudentRepository = {
  async findByUserId(userId) {
    const result = await query(
      `SELECT sp.*, cr.name as target_role_name, cr.description as target_role_description
       FROM student_profiles sp
       LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
       WHERE sp.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  },

  async findById(id) {
    const result = await query(
      `SELECT sp.*, cr.name as target_role_name
       FROM student_profiles sp
       LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
       WHERE sp.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async create({ user_id, full_name, branch, batch_year, roll_number, cgpa, linkedin_url, github_url, target_role_id }) {
    const isComplete = !!(full_name && branch && batch_year);
    const result = await query(
      `INSERT INTO student_profiles
         (user_id, full_name, branch, batch_year, roll_number, cgpa, linkedin_url, github_url, target_role_id, profile_completed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [user_id, full_name, branch, batch_year, roll_number || null, cgpa || null, linkedin_url || null, github_url || null, target_role_id || null, isComplete]
    );
    return result.rows[0];
  },

  async update(id, { full_name, branch, batch_year, roll_number, cgpa, linkedin_url, github_url }) {
    const isComplete = !!(full_name && branch && batch_year);
    const result = await query(
      `UPDATE student_profiles SET
         full_name = COALESCE($2, full_name),
         branch = COALESCE($3, branch),
         batch_year = COALESCE($4, batch_year),
         roll_number = $5,
         cgpa = $6,
         linkedin_url = $7,
         github_url = $8,
         profile_completed = $9,
         updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id, full_name, branch, batch_year, roll_number || null, cgpa || null, linkedin_url || null, github_url || null, isComplete]
    );
    return result.rows[0] || null;
  },

  async setTargetRole(id, roleId) {
    const result = await query(
      `UPDATE student_profiles SET target_role_id = $2, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, roleId]
    );
    return result.rows[0] || null;
  },

  // Faculty-scoped listing
  async findByScopeWithReadiness(batchYear, branch, roleId) {
    const result = await query(
      `SELECT sp.id, sp.full_name, sp.roll_number, sp.branch, sp.batch_year, sp.cgpa,
              sp.target_role_id, cr.name as target_role_name,
              rs.score as readiness_score,
              u.email,
              COUNT(sg.id) FILTER (WHERE sg.gap_category = 'critical') as critical_gap_count
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
       LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
       LEFT JOIN skill_gaps sg ON sg.student_id = sp.id AND sg.role_id = sp.target_role_id
       WHERE sp.batch_year = $1 AND sp.branch = $2
       GROUP BY sp.id, cr.name, rs.score, u.email
       ORDER BY sp.full_name`,
      [batchYear, branch]
    );
    return result.rows;
  },

  async findAllWithReadiness() {
    const result = await query(
      `SELECT sp.id, sp.full_name, sp.roll_number, sp.branch, sp.batch_year, sp.cgpa,
              sp.target_role_id, cr.name as target_role_name,
              rs.score as readiness_score,
              u.email,
              COUNT(sg.id) FILTER (WHERE sg.gap_category = 'critical') as critical_gap_count
       FROM student_profiles sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN career_roles cr ON sp.target_role_id = cr.id
       LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
       LEFT JOIN skill_gaps sg ON sg.student_id = sp.id AND sg.role_id = sp.target_role_id
       GROUP BY sp.id, cr.name, rs.score, u.email
       ORDER BY sp.full_name`
    );
    return result.rows;
  },
};

module.exports = StudentRepository;
