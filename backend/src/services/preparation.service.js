const PreparationRepository = require('../repositories/preparation.repository');

const PreparationService = {
  async logActivity(studentId, data) {
    return await PreparationRepository.create({ student_id: studentId, ...data });
  },

  async getActivities(studentId, filters = {}) {
    return await PreparationRepository.findByStudentId(studentId, filters);
  },

  async updateActivity(id, studentId, data) {
    const activity = await PreparationRepository.update(id, studentId, data);
    if (!activity) throw new Error('Activity not found or unauthorized');
    return activity;
  },

  async deleteActivity(id, studentId) {
    const activity = await PreparationRepository.delete(id, studentId);
    if (!activity) throw new Error('Activity not found or unauthorized');
    return activity;
  },

  async getTotalHours(studentId) {
    return await PreparationRepository.getTotalHoursByStudent(studentId);
  }
};

module.exports = PreparationService;
