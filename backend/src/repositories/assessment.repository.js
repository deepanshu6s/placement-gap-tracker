const { query, pool } = require('../config/db');

const AssessmentRepository = {
  // -------------------------
  // Questions
  // -------------------------
  async findQuestions({ skill_id, difficulty, activeOnly = true }) {
    let sql = 'SELECT q.id, q.skill_id, q.question_text, q.difficulty, q.is_active FROM questions q WHERE 1=1';
    const params = [];
    if (skill_id) { params.push(skill_id); sql += ` AND q.skill_id = $${params.length}`; }
    if (difficulty) { params.push(difficulty); sql += ` AND q.difficulty = $${params.length}`; }
    if (activeOnly) sql += ' AND q.is_active = true';
    sql += ' ORDER BY q.created_at';
    const result = await query(sql, params);
    return result.rows;
  },

  async findQuestionById(id) {
    const result = await query(
      `SELECT q.*, json_agg(
         json_build_object('id', qo.id, 'option_text', qo.option_text, 'is_correct', qo.is_correct, 'display_order', qo.display_order)
         ORDER BY qo.display_order
       ) as options
       FROM questions q
       JOIN question_options qo ON qo.question_id = q.id
       WHERE q.id = $1
       GROUP BY q.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  async createQuestion({ skill_id, question_text, difficulty, created_by, options }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const qRes = await client.query(
        `INSERT INTO questions (skill_id, question_text, difficulty, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [skill_id, question_text, difficulty, created_by || null]
      );
      const question = qRes.rows[0];
      for (const opt of options) {
        await client.query(
          `INSERT INTO question_options (question_id, option_text, is_correct, display_order)
           VALUES ($1, $2, $3, $4)`,
          [question.id, opt.option_text, opt.is_correct, opt.display_order]
        );
      }
      await client.query('COMMIT');
      return question;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async deactivateQuestion(id) {
    const result = await query(
      'UPDATE questions SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  },

  // Select random questions by difficulty band
  async selectQuestionsByDifficulty(skillId, easyCount, mediumCount, hardCount) {
    const result = await query(
      `(SELECT id FROM questions WHERE skill_id = $1 AND difficulty = 'easy' AND is_active = true ORDER BY RANDOM() LIMIT $2)
       UNION ALL
       (SELECT id FROM questions WHERE skill_id = $1 AND difficulty = 'medium' AND is_active = true ORDER BY RANDOM() LIMIT $3)
       UNION ALL
       (SELECT id FROM questions WHERE skill_id = $1 AND difficulty = 'hard' AND is_active = true ORDER BY RANDOM() LIMIT $4)`,
      [skillId, easyCount, mediumCount, hardCount]
    );
    return result.rows.map((r) => r.id);
  },

  // Get questions with options (no is_correct for student)
  async getQuestionsForAttempt(attemptId) {
    const result = await query(
      `SELECT aq.display_order, q.id, q.question_text, q.difficulty,
              json_agg(
                json_build_object('id', qo.id, 'option_text', qo.option_text, 'display_order', qo.display_order)
                ORDER BY qo.display_order
              ) as options
       FROM attempt_questions aq
       JOIN questions q ON aq.question_id = q.id
       JOIN question_options qo ON qo.question_id = q.id
       WHERE aq.attempt_id = $1
       GROUP BY aq.display_order, q.id, q.question_text, q.difficulty
       ORDER BY aq.display_order`,
      [attemptId]
    );
    return result.rows;
  },

  // -------------------------
  // Attempts
  // -------------------------
  async getAssessmentConfig(skillId) {
    const result = await query(
      'SELECT * FROM assessment_configs WHERE skill_id = $1',
      [skillId]
    );
    return result.rows[0] || null;
  },

  async findActiveAttempt(studentId, skillId) {
    const result = await query(
      `SELECT * FROM assessment_attempts
       WHERE student_id = $1 AND skill_id = $2 AND status = 'in_progress'`,
      [studentId, skillId]
    );
    return result.rows[0] || null;
  },

  async findAttemptById(attemptId) {
    const result = await query(
      'SELECT * FROM assessment_attempts WHERE id = $1',
      [attemptId]
    );
    return result.rows[0] || null;
  },

  async findLastCompletedAttempt(studentId, skillId) {
    const result = await query(
      `SELECT * FROM assessment_attempts
       WHERE student_id = $1 AND skill_id = $2
         AND status IN ('completed', 'timed_out')
       ORDER BY submitted_at DESC LIMIT 1`,
      [studentId, skillId]
    );
    return result.rows[0] || null;
  },

  async createAttempt(client, { student_id, skill_id, questions_served }) {
    const result = await client.query(
      `INSERT INTO assessment_attempts (student_id, skill_id, started_at, status, questions_served)
       VALUES ($1, $2, NOW(), 'in_progress', $3) RETURNING *`,
      [student_id, skill_id, questions_served]
    );
    return result.rows[0];
  },

  async createAttemptQuestions(client, attemptId, questionIds) {
    for (let i = 0; i < questionIds.length; i++) {
      await client.query(
        'INSERT INTO attempt_questions (attempt_id, question_id, display_order) VALUES ($1, $2, $3)',
        [attemptId, questionIds[i], i + 1]
      );
    }
  },

  async submitAttempt(client, attemptId, { answers, rawScore, skillScore }) {
    // Save each answer
    for (const ans of answers) {
      await client.query(
        `INSERT INTO attempt_answers (attempt_id, question_id, selected_option_id, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, ans.question_id, ans.selected_option_id || null, ans.is_correct]
      );
    }
    // Update attempt status
    const result = await client.query(
      `UPDATE assessment_attempts SET
         status = 'completed',
         submitted_at = NOW(),
         raw_score = $2,
         skill_score = $3
       WHERE id = $1 RETURNING *`,
      [attemptId, rawScore, skillScore]
    );
    return result.rows[0];
  },

  async timeoutAttempt(attemptId) {
    const result = await query(
      `UPDATE assessment_attempts SET status = 'timed_out', submitted_at = NOW()
       WHERE id = $1 RETURNING *`,
      [attemptId]
    );
    return result.rows[0] || null;
  },

  async getAttemptHistory(studentId) {
    const result = await query(
      `SELECT aa.id, aa.skill_id, aa.started_at, aa.submitted_at, aa.status,
              aa.skill_score, aa.questions_served,
              s.name as skill_name
       FROM assessment_attempts aa
       JOIN skills s ON aa.skill_id = s.id
       WHERE aa.student_id = $1
       ORDER BY aa.started_at DESC`,
      [studentId]
    );
    return result.rows;
  },

  async getAttemptResult(attemptId) {
    const result = await query(
      `SELECT aa.*, s.name as skill_name,
              COUNT(aans.id) FILTER (WHERE aans.is_correct = true) as correct_count,
              COUNT(aans.id) as total_answered
       FROM assessment_attempts aa
       JOIN skills s ON aa.skill_id = s.id
       LEFT JOIN attempt_answers aans ON aans.attempt_id = aa.id
       WHERE aa.id = $1
       GROUP BY aa.id, s.name`,
      [attemptId]
    );
    return result.rows[0] || null;
  },

  /**
   * Detailed attempt review: questions, student answers, correct answers, and explanations.
   */
  async getAttemptReview(attemptId) {
    const attempt = await this.getAttemptResult(attemptId);
    if (!attempt) return null;

    const questionsResult = await query(
      `SELECT
         q.id AS question_id,
         q.question_text,
         q.difficulty,
         q.concept_tested,
         q.explanation,
         aq.display_order,
         aans.selected_option_id,
         sel_qo.option_text AS selected_option_text,
         COALESCE(aans.is_correct, false) AS is_correct,
         corr_qo.id AS correct_option_id,
         corr_qo.option_text AS correct_option_text,
         json_agg(
           json_build_object(
             'id', qo.id,
             'option_text', qo.option_text,
             'is_correct', qo.is_correct,
             'display_order', qo.display_order
           ) ORDER BY qo.display_order ASC
         ) AS options
       FROM attempt_questions aq
       JOIN questions q ON aq.question_id = q.id
       LEFT JOIN attempt_answers aans ON aans.attempt_id = aq.attempt_id AND aans.question_id = q.id
       LEFT JOIN question_options sel_qo ON sel_qo.id = aans.selected_option_id
       LEFT JOIN question_options corr_qo ON corr_qo.question_id = q.id AND corr_qo.is_correct = true
       JOIN question_options qo ON qo.question_id = q.id
       WHERE aq.attempt_id = $1
       GROUP BY q.id, aq.display_order, aans.selected_option_id, sel_qo.option_text, aans.is_correct, corr_qo.id, corr_qo.option_text
       ORDER BY aq.display_order ASC`,
      [attemptId]
    );

    return {
      attempt,
      questions: questionsResult.rows,
    };
  },

  // Verify option belongs to question (IDOR prevention)
  async verifyOptionOwnership(questionId, optionId) {
    const result = await query(
      'SELECT 1 FROM question_options WHERE id = $1 AND question_id = $2',
      [optionId, questionId]
    );
    return result.rows.length > 0;
  },

  async getOptionCorrectness(optionId) {
    const result = await query(
      'SELECT is_correct FROM question_options WHERE id = $1',
      [optionId]
    );
    return result.rows[0] || null;
  },
};

module.exports = AssessmentRepository;
