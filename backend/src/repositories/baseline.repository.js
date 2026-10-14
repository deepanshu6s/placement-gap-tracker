const { query } = require('../config/db');

const BaselineRepository = {
  async findByStudentId(studentId) {
    const result = await query(
      `SELECT b.id, b.student_id, b.skill_id, b.role_id, b.proficiency_level,
              b.is_self_reported, b.created_at, b.updated_at,
              s.name AS skill_name, s.category AS skill_category
       FROM student_skill_baselines b
       JOIN skills s ON s.id = b.skill_id
       WHERE b.student_id = $1
       ORDER BY s.name ASC`,
      [studentId]
    );
    return result.rows;
  },

  async findByStudentAndSkill(studentId, skillId) {
    const result = await query(
      `SELECT b.id, b.student_id, b.skill_id, b.role_id, b.proficiency_level,
              b.is_self_reported, b.created_at, b.updated_at,
              s.name AS skill_name, s.category AS skill_category
       FROM student_skill_baselines b
       JOIN skills s ON s.id = b.skill_id
       WHERE b.student_id = $1 AND b.skill_id = $2`,
      [studentId, skillId]
    );
    return result.rows[0] || null;
  },

  async upsert(studentId, skillId, roleId, proficiencyLevel) {
    const result = await query(
      `INSERT INTO student_skill_baselines
         (student_id, skill_id, role_id, proficiency_level, is_self_reported, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW())
       ON CONFLICT (student_id, skill_id)
       DO UPDATE SET
         proficiency_level = EXCLUDED.proficiency_level,
         role_id = COALESCE(EXCLUDED.role_id, student_skill_baselines.role_id),
         updated_at = NOW()
       RETURNING *`,
      [studentId, skillId, roleId || null, proficiencyLevel]
    );
    return result.rows[0];
  },

  async bulkUpsert(studentId, roleId, ratings) {
    const results = [];
    for (const r of ratings) {
      if (!r.skill_id || !r.proficiency_level) continue;
      const saved = await this.upsert(studentId, r.skill_id, roleId, r.proficiency_level);
      results.push(saved);
    }
    return results;
  },
};

module.exports = BaselineRepository;
