const { query } = require('../config/db');

const RecommendationRepository = {
  // Upsert a recommendation (using partial indexes from spec)
  async upsert({ student_id, role_id, skill_id, priority, recommendation_type, message }) {
    if (skill_id) {
      await query(
        `INSERT INTO recommendations
           (student_id, role_id, skill_id, priority, recommendation_type, message, generated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT ON CONSTRAINT uq_recommendation_with_skill DO UPDATE SET
           priority = EXCLUDED.priority,
           message = EXCLUDED.message,
           generated_at = NOW(),
           is_dismissed = false,
           dismissed_at = NULL
         WHERE recommendations.is_dismissed = false
           OR (recommendations.is_dismissed = true AND
               ABS((
                 SELECT gap FROM skill_gaps
                 WHERE student_id = EXCLUDED.student_id
                   AND role_id = EXCLUDED.role_id
                   AND skill_id = EXCLUDED.skill_id
               ) - (
                 SELECT gap FROM skill_gaps
                 WHERE student_id = recommendations.student_id
                   AND role_id = recommendations.role_id
                   AND skill_id = recommendations.skill_id
               )) > 10)`,
        [student_id, role_id, skill_id, priority, recommendation_type, message]
      );
    } else {
      await query(
        `INSERT INTO recommendations
           (student_id, role_id, skill_id, priority, recommendation_type, message, generated_at)
         VALUES ($1, $2, NULL, $3, $4, $5, NOW())
         ON CONFLICT ON CONSTRAINT uq_recommendation_no_skill DO UPDATE SET
           priority = EXCLUDED.priority,
           message = EXCLUDED.message,
           generated_at = NOW()`,
        [student_id, role_id, priority, recommendation_type, message]
      );
    }
  },

  // Simpler bulk upsert approach
  async bulkUpsert(student_id, role_id, recommendations) {
    for (const rec of recommendations) {
      if (rec.skill_id) {
        await query(
          `INSERT INTO recommendations
             (student_id, role_id, skill_id, priority, recommendation_type, message, generated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (student_id, role_id, skill_id, recommendation_type)
           WHERE skill_id IS NOT NULL
           DO UPDATE SET
             priority = EXCLUDED.priority,
             message = EXCLUDED.message,
             generated_at = NOW(),
             is_dismissed = CASE
               WHEN recommendations.is_dismissed = true AND $7 > 10 THEN false
               ELSE recommendations.is_dismissed
             END,
             dismissed_at = CASE
               WHEN recommendations.is_dismissed = true AND $7 > 10 THEN NULL
               ELSE recommendations.dismissed_at
             END`,
          [student_id, role_id, rec.skill_id, rec.priority, rec.recommendation_type, rec.message, rec.gap_change || 0]
        );
      } else {
        await query(
          `INSERT INTO recommendations
             (student_id, role_id, skill_id, priority, recommendation_type, message, generated_at)
           VALUES ($1, $2, NULL, $3, $4, $5, NOW())
           ON CONFLICT (student_id, role_id, recommendation_type)
           WHERE skill_id IS NULL
           DO UPDATE SET
             priority = EXCLUDED.priority,
             message = EXCLUDED.message,
             generated_at = NOW()`,
          [student_id, role_id, rec.priority, rec.recommendation_type, rec.message]
        );
      }
    }
  },

  async getActiveRecommendations(studentId, roleId) {
    const result = await query(
      `SELECT r.*, s.name as skill_name
       FROM recommendations r
       LEFT JOIN skills s ON r.skill_id = s.id
       WHERE r.student_id = $1 AND r.role_id = $2 AND r.is_dismissed = false
       ORDER BY
         CASE r.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         r.generated_at DESC`,
      [studentId, roleId]
    );
    return result.rows;
  },

  async getActiveCount(studentId, roleId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM recommendations WHERE student_id = $1 AND role_id = $2 AND is_dismissed = false',
      [studentId, roleId]
    );
    return parseInt(result.rows[0].count);
  },

  async findById(id) {
    const result = await query('SELECT * FROM recommendations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async dismiss(id, studentId) {
    const result = await query(
      `UPDATE recommendations SET is_dismissed = true, dismissed_at = NOW()
       WHERE id = $1 AND student_id = $2 RETURNING *`,
      [id, studentId]
    );
    return result.rows[0] || null;
  },

  // Get dismissed recommendations (to check suppression)
  async getDismissedForSkill(studentId, roleId, skillId) {
    const result = await query(
      `SELECT * FROM recommendations
       WHERE student_id = $1 AND role_id = $2 AND skill_id = $3 AND is_dismissed = true`,
      [studentId, roleId, skillId]
    );
    return result.rows;
  },
};

module.exports = RecommendationRepository;
