const TaskProgressRepository = require('../repositories/taskProgress.repository');
const SkillRepository = require('../repositories/skill.repository');
const { getSkillContent } = require('../data/skillContent');

const VALID_STATUSES = ['not_started', 'in_progress', 'completed'];

const TaskProgressService = {
  /**
   * Get learning tasks for a skill merged with student's current progress.
   */
  async getSkillTasksWithProgress(studentId, skillId) {
    const skill = await SkillRepository.findById(skillId);
    if (!skill) throw new Error('Skill not found');

    const content = getSkillContent(skill.name, skill.category);
    const tasks = content.learningTasks || [];

    const progressRows = await TaskProgressRepository.findByStudentAndSkill(studentId, skillId);
    const progressMap = {};
    for (const row of progressRows) {
      progressMap[row.task_key] = row;
    }

    const mergedTasks = tasks.map((task) => {
      const record = progressMap[task.key];
      return {
        ...task,
        status: record ? record.status : 'not_started',
        notes: record ? record.notes : '',
        completed_at: record ? record.completed_at : null,
        updated_at: record ? record.updated_at : null,
      };
    });

    const total = mergedTasks.length;
    const completed = mergedTasks.filter((t) => t.status === 'completed').length;
    const inProgress = mergedTasks.filter((t) => t.status === 'in_progress').length;

    return {
      skill_id: skill.id,
      skill_name: skill.name,
      total_tasks: total,
      completed_tasks: completed,
      in_progress_tasks: inProgress,
      tasks: mergedTasks,
    };
  },

  /**
   * Update student task progress.
   */
  async updateTaskProgress(studentId, skillId, taskKey, { status, notes }) {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid task status: ${status}. Expected one of: ${VALID_STATUSES.join(', ')}`);
    }

    const skill = await SkillRepository.findById(skillId);
    if (!skill) throw new Error('Skill not found');

    const record = await TaskProgressRepository.upsertTaskProgress(studentId, skillId, taskKey, {
      status,
      notes,
    });

    return record;
  },

  /**
   * Get student task stats.
   */
  async getStudentTaskStats(studentId) {
    return await TaskProgressRepository.getStudentTaskStats(studentId);
  },
};

module.exports = TaskProgressService;
