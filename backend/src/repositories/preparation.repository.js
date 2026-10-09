const { query } = require('../config/db');

const PreparationRepository = {
  async create({ student_id, skill_id, activity_type, description, resource_url, hours_spent, activity_date }) {
    const result = await query(
      `INSERT INTO preparation_activities
         (student_id, skill_id, activity_type, description, resource_url, hours_spent, activity_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [student_id, skill_id || null, activity_type, description || null, resource_url || null, hours_spent, activity_date]
    );
    return result.rows[0];
  },

  async findByStudentId(studentId, filters = {}) {
    let sql = `SELECT pa.*, s.name as skill_name
               FROM preparation_activities pa
               LEFT JOIN skills s ON pa.skill_id = s.id
               WHERE pa.student_id = $1`;
    const params = [studentId];
    if (filters.skill_id) {
      params.push(filters.skill_id);
      sql += ` AND pa.skill_id = $${params.length}`;
    }
    sql += ' ORDER BY pa.activity_date DESC, pa.created_at DESC';
    const result = await query(sql, params);
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT * FROM preparation_activities WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async update(id, studentId, { skill_id, activity_type, description, resource_url, hours_spent, activity_date }) {
    const result = await query(
      `UPDATE preparation_activities SET
         skill_id = COALESCE($3, skill_id),
         activity_type = COALESCE($4, activity_type),
         description = $5,
         resource_url = $6,
         hours_spent = COALESCE($7, hours_spent),
         activity_date = COALESCE($8, activity_date)
       WHERE id = $1 AND student_id = $2 RETURNING *`,
      [id, studentId, skill_id, activity_type, description || null, resource_url || null, hours_spent, activity_date]
    );
    return result.rows[0] || null;
  },

  async delete(id, studentId) {
    const result = await query(
      'DELETE FROM preparation_activities WHERE id = $1 AND student_id = $2 RETURNING *',
      [id, studentId]
    );
    return result.rows[0] || null;
  },

  async getTotalHoursByStudent(studentId) {
    const result = await query(
      'SELECT COALESCE(SUM(hours_spent), 0) as total_hours FROM preparation_activities WHERE student_id = $1',
      [studentId]
    );
    return parseFloat(result.rows[0].total_hours);
  },

  // Check if prep was logged for skill in last N days (for recommendation engine)
  async hasRecentPrepForSkill(studentId, skillId, days = 7) {
    const result = await query(
      `SELECT 1 FROM preparation_activities
       WHERE student_id = $1 AND skill_id = $2
         AND activity_date >= CURRENT_DATE - $3::integer
       LIMIT 1`,
      [studentId, skillId, days]
    );
    return result.rows.length > 0;
  },

  // Faculty aggregate (privacy-safe: no URLs/descriptions)
  async getAggregateByScope(batchYear, branch) {
    const result = await query(
      `SELECT pa.skill_id, s.name as skill_name,
              SUM(pa.hours_spent) as total_hours,
              COUNT(*) as activity_count,
              AVG(pa.hours_spent) as avg_hours_per_activity
       FROM preparation_activities pa
       JOIN student_profiles sp ON pa.student_id = sp.id
       LEFT JOIN skills s ON pa.skill_id = s.id
       WHERE sp.batch_year = $1 AND sp.branch = $2
       GROUP BY pa.skill_id, s.name
       ORDER BY total_hours DESC`,
      [batchYear, branch]
    );
    return result.rows;
  },

  async getWeeklyTrendByScope(batchYear, branch, weeks = 8) {
    const result = await query(
      `SELECT
         DATE_TRUNC('week', pa.activity_date) as week_start,
         SUM(pa.hours_spent) as total_hours,
         COUNT(DISTINCT pa.student_id) as student_count
       FROM preparation_activities pa
       JOIN student_profiles sp ON pa.student_id = sp.id
       WHERE sp.batch_year = $1 AND sp.branch = $2
         AND pa.activity_date >= CURRENT_DATE - ($3 * 7)::integer
       GROUP BY week_start
       ORDER BY week_start`,
      [batchYear, branch, weeks]
    );
    return result.rows;
  },
};

module.exports = PreparationRepository;
