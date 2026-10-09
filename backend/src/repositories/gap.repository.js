const { query, pool } = require('../config/db');

const GapRepository = {
  // Upsert all skill gaps for a student/role
  async upsertSkillGaps(studentId, roleId, gaps) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const gap of gaps) {
        await client.query(
          `INSERT INTO skill_gaps
             (student_id, role_id, skill_id, required_level, current_score, gap, gap_category, is_assessed, computed_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (student_id, role_id, skill_id) DO UPDATE SET
             required_level = EXCLUDED.required_level,
             current_score = EXCLUDED.current_score,
             gap = EXCLUDED.gap,
             gap_category = EXCLUDED.gap_category,
             is_assessed = EXCLUDED.is_assessed,
             computed_at = NOW()`,
          [studentId, roleId, gap.skill_id, gap.required_level, gap.current_score, gap.gap, gap.gap_category, gap.is_assessed]
        );
      }
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getSkillGaps(studentId, roleId) {
    const result = await query(
      `SELECT sg.*, s.name as skill_name, s.category as skill_category
       FROM skill_gaps sg
       JOIN skills s ON sg.skill_id = s.id
       WHERE sg.student_id = $1 AND sg.role_id = $2
       ORDER BY sg.gap DESC, sg.required_level DESC`,
      [studentId, roleId]
    );
    return result.rows;
  },

  async getSkillGapsForStudent(studentId) {
    const result = await query(
      `SELECT sg.*, s.name as skill_name, s.category as skill_category, cr.name as role_name
       FROM skill_gaps sg
       JOIN skills s ON sg.skill_id = s.id
       JOIN career_roles cr ON sg.role_id = cr.id
       WHERE sg.student_id = $1`,
      [studentId]
    );
    return result.rows;
  },

  // Readiness scores
  async upsertReadinessScore(studentId, roleId, score) {
    await query(
      `INSERT INTO readiness_scores (student_id, role_id, score, computed_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (student_id, role_id) DO UPDATE SET
         score = EXCLUDED.score,
         computed_at = NOW()`,
      [studentId, roleId, score]
    );
  },

  async appendReadinessHistory(studentId, roleId, score) {
    if (score !== null) {
      await query(
        `INSERT INTO readiness_score_history (student_id, role_id, score)
         VALUES ($1, $2, $3)`,
        [studentId, roleId, score]
      );
    }
  },

  async getReadinessScore(studentId, roleId) {
    const result = await query(
      `SELECT score, computed_at FROM readiness_scores
       WHERE student_id = $1 AND role_id = $2`,
      [studentId, roleId]
    );
    return result.rows[0] || null;
  },

  async getReadinessHistory(studentId, roleId) {
    const result = await query(
      `SELECT score, recorded_at FROM readiness_score_history
       WHERE student_id = $1 AND role_id = $2
       ORDER BY recorded_at ASC`,
      [studentId, roleId]
    );
    return result.rows;
  },

  // Student skill scores
  async upsertSkillScore(client, studentId, skillId, score) {
    await client.query(
      `INSERT INTO student_skill_scores
         (student_id, skill_id, current_score, best_score, attempt_count, last_attempted_at)
       VALUES ($1, $2, $3, $3, 1, NOW())
       ON CONFLICT (student_id, skill_id) DO UPDATE SET
         current_score = EXCLUDED.current_score,
         best_score = GREATEST(student_skill_scores.best_score, EXCLUDED.current_score),
         attempt_count = student_skill_scores.attempt_count + 1,
         last_attempted_at = NOW()`,
      [studentId, skillId, score]
    );
  },

  async getSkillScore(studentId, skillId) {
    const result = await query(
      'SELECT * FROM student_skill_scores WHERE student_id = $1 AND skill_id = $2',
      [studentId, skillId]
    );
    return result.rows[0] || null;
  },

  async getAllSkillScores(studentId) {
    const result = await query(
      `SELECT sss.*, s.name as skill_name, s.category
       FROM student_skill_scores sss
       JOIN skills s ON sss.skill_id = s.id
       WHERE sss.student_id = $1
       ORDER BY s.name`,
      [studentId]
    );
    return result.rows;
  },

  // Faculty aggregate gap data (privacy-safe)
  async getAggregateGapsByScope(batchYear, branch) {
    const result = await query(
      `SELECT sg.skill_id, s.name as skill_name,
              AVG(sg.gap) as avg_gap,
              COUNT(*) FILTER (WHERE sg.gap_category = 'critical') as critical_count,
              COUNT(*) as total_students,
              COUNT(*) FILTER (WHERE sg.is_assessed = false) as unassessed_count
       FROM skill_gaps sg
       JOIN student_profiles sp ON sg.student_id = sp.id
       JOIN skills s ON sg.skill_id = s.id
       WHERE sp.batch_year = $1 AND sp.branch = $2
       GROUP BY sg.skill_id, s.name
       ORDER BY avg_gap DESC`,
      [batchYear, branch]
    );
    return result.rows;
  },

  async getReadinessDistributionByScope(batchYear, branch) {
    const result = await query(
      `SELECT
         COUNT(*) FILTER (WHERE rs.score <= 20) as not_ready,
         COUNT(*) FILTER (WHERE rs.score > 20 AND rs.score <= 45) as early_stage,
         COUNT(*) FILTER (WHERE rs.score > 45 AND rs.score <= 65) as developing,
         COUNT(*) FILTER (WHERE rs.score > 65 AND rs.score <= 80) as almost_ready,
         COUNT(*) FILTER (WHERE rs.score > 80 AND rs.score <= 92) as ready,
         COUNT(*) FILTER (WHERE rs.score > 92) as highly_ready,
         COUNT(*) FILTER (WHERE rs.score IS NULL) as no_role_or_unassessed,
         AVG(rs.score) as average_readiness
       FROM student_profiles sp
       LEFT JOIN readiness_scores rs ON rs.student_id = sp.id AND rs.role_id = sp.target_role_id
       WHERE sp.batch_year = $1 AND sp.branch = $2`,
      [batchYear, branch]
    );
    return result.rows[0];
  },
};

module.exports = GapRepository;
