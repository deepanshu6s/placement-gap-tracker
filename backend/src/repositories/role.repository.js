const { query } = require('../config/db');

const RoleRepository = {
  async findAll(activeOnly = true) {
    const whereClause = activeOnly ? 'WHERE is_active = true' : '';
    const result = await query(
      `SELECT id, name, description, is_active, created_at, updated_at
       FROM career_roles ${whereClause}
       ORDER BY name`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(
      'SELECT id, name, description, is_active, created_at, updated_at FROM career_roles WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  async findByName(name) {
    const result = await query(
      'SELECT id, name FROM career_roles WHERE LOWER(name) = LOWER($1)',
      [name]
    );
    return result.rows[0] || null;
  },

  async create({ name, description, created_by }) {
    const result = await query(
      `INSERT INTO career_roles (name, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, created_by || null]
    );
    return result.rows[0];
  },

  async update(id, { name, description }) {
    const result = await query(
      `UPDATE career_roles SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id, name, description]
    );
    return result.rows[0] || null;
  },

  async deactivate(id) {
    const result = await query(
      `UPDATE career_roles SET is_active = false, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0] || null;
  },

  // Role-Skill Requirements
  async getSkillRequirements(roleId) {
    const result = await query(
      `SELECT rsr.id, rsr.role_id, rsr.skill_id, rsr.required_level, rsr.weight,
              s.name as skill_name, s.category as skill_category, s.description as skill_description
       FROM role_skill_requirements rsr
       JOIN skills s ON rsr.skill_id = s.id
       WHERE rsr.role_id = $1 AND s.is_active = true
       ORDER BY rsr.weight DESC, s.name`,
      [roleId]
    );
    return result.rows;
  },

  async addSkillRequirement({ role_id, skill_id, required_level, weight }) {
    const result = await query(
      `INSERT INTO role_skill_requirements (role_id, skill_id, required_level, weight)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (role_id, skill_id) DO UPDATE SET
         required_level = EXCLUDED.required_level,
         weight = EXCLUDED.weight,
         updated_at = NOW()
       RETURNING *`,
      [role_id, skill_id, required_level, weight]
    );
    return result.rows[0];
  },

  async updateSkillRequirement(roleId, skillId, { required_level, weight }) {
    const result = await query(
      `UPDATE role_skill_requirements SET
         required_level = COALESCE($3, required_level),
         weight = COALESCE($4, weight),
         updated_at = NOW()
       WHERE role_id = $1 AND skill_id = $2
       RETURNING *`,
      [roleId, skillId, required_level, weight]
    );
    return result.rows[0] || null;
  },

  async removeSkillRequirement(roleId, skillId) {
    const result = await query(
      'DELETE FROM role_skill_requirements WHERE role_id = $1 AND skill_id = $2 RETURNING *',
      [roleId, skillId]
    );
    return result.rows[0] || null;
  },

  // Null out students' target_role when role is deactivated
  async clearStudentTargetRole(roleId) {
    await query(
      'UPDATE student_profiles SET target_role_id = NULL, updated_at = NOW() WHERE target_role_id = $1',
      [roleId]
    );
  },
};

module.exports = RoleRepository;
