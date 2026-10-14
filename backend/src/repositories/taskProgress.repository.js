const { query } = require('../config/db');

const TaskProgressRepository = {
  /**
   * Get all task progress records for a student and skill.
   */
  async findByStudentAndSkill(studentId, skillId) {
    const result = await query(
      `SELECT id, student_id, skill_id, task_key, status, notes, completed_at, created_at, updated_at
       FROM student_task_progress
       WHERE student_id = $1 AND skill_id = $2
       ORDER BY created_at ASC`,
      [studentId, skillId]
    );
    return result.rows;
  },

  /**
   * Upsert a learning task progress status.
   * If status is 'completed', sets completed_at = NOW(). If status is changed back, completed_at becomes NULL.
   */
  async upsertTaskProgress(studentId, skillId, taskKey, { status, notes }) {
    const isCompleted = status === 'completed';
    const result = await query(
      `INSERT INTO student_task_progress (student_id, skill_id, task_key, status, notes, completed_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CASE WHEN $6::boolean THEN NOW() ELSE NULL END, NOW())
       ON CONFLICT (student_id, skill_id, task_key)
       DO UPDATE SET
         status = EXCLUDED.status,
         notes = COALESCE(EXCLUDED.notes, student_task_progress.notes),
         completed_at = CASE
           WHEN EXCLUDED.status = 'completed' AND student_task_progress.completed_at IS NULL THEN NOW()
           WHEN EXCLUDED.status != 'completed' THEN NULL
           ELSE student_task_progress.completed_at
         END,
         updated_at = NOW()
       RETURNING *`,
      [studentId, skillId, taskKey, status, notes || null, isCompleted]
    );
    return result.rows[0];
  },

  /**
   * Get aggregate task progress counts for a student.
   */
  async getStudentTaskStats(studentId) {
    const result = await query(
      `SELECT
         COUNT(id) AS total_tasks_touched,
         COUNT(id) FILTER (WHERE status = 'completed') AS completed_tasks,
         COUNT(id) FILTER (WHERE status = 'in_progress') AS in_progress_tasks
       FROM student_task_progress
       WHERE student_id = $1`,
      [studentId]
    );
    return {
      total_tasks_touched: parseInt(result.rows[0].total_tasks_touched, 10) || 0,
      completed_tasks: parseInt(result.rows[0].completed_tasks, 10) || 0,
      in_progress_tasks: parseInt(result.rows[0].in_progress_tasks, 10) || 0,
    };
  },
};

module.exports = TaskProgressRepository;
