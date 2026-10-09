const { query } = require('../config/db');

const SkillRepository = {
  async findAll(activeOnly = true) {
    const whereClause = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(
      `SELECT id, name, category, description, is_active, created_at, updated_at
       FROM skills ${whereClause}
       ORDER BY category, name`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, name, category, description, is_active, created_at, updated_at FROM skills WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByName(name) {
    const result = await query(
      'SELECT id FROM skills WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  },

  async create({ name, category, description }) {
    const result = await query(
      `INSERT INTO skills (name, category, description)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, category, description || null]
    );
    return result.rows[0];
  },

  async update(id, { name, category, description }) {
    const result = await query(
      `UPDATE skills SET
         name = COALESCE($2, name),
         category = COALESCE($3, category),
         description = COALESCE($4, description),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, name, category, description]
    );
    return result.rows[0] || null;
  },

  async deactivate(id) {
    const result = await query(
      'UPDATE skills SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  async getQuestionCounts(skillId) {
    const result = await query(
      `SELECT difficulty, COUNT(*) as count
       FROM questions
       WHERE skill_id = $1 AND is_active = true
       GROUP BY difficulty`,
      [skillId]
    );
    const counts = { easy: 0, medium: 0, hard: 0 };
    result.rows.forEach((r) => { counts[r.difficulty] = parseInt(r.count); });
    return counts;
  },

  async getAssessmentConfig(skillId) {
    const result = await query(
      'SELECT * FROM assessment_configs WHERE skill_id = $1',
      [skillId]
    );
    return result.rows[0] || null;
  },

  async upsertAssessmentConfig({ skill_id, total_questions, time_limit_minutes, easy_count, medium_count, hard_count, cooldown_hours }) {
    const result = await query(
      `INSERT INTO assessment_configs
         (skill_id, total_questions, time_limit_minutes, easy_count, medium_count, hard_count, cooldown_hours)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (skill_id) DO UPDATE SET
         total_questions = EXCLUDED.total_questions,
         time_limit_minutes = EXCLUDED.time_limit_minutes,
         easy_count = EXCLUDED.easy_count,
         medium_count = EXCLUDED.medium_count,
         hard_count = EXCLUDED.hard_count,
         cooldown_hours = EXCLUDED.cooldown_hours,
         updated_at = NOW()
       RETURNING *`,
      [skill_id, total_questions, time_limit_minutes, easy_count, medium_count, hard_count, cooldown_hours]
    );
    return result.rows[0];
  },
};

module.exports = SkillRepository;
