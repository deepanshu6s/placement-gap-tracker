const SkillRepository = require('../repositories/skill.repository');

const SkillService = {
  async getAllSkills(activeOnly = true) {
    return await SkillRepository.findAll(activeOnly);
  },

  async getSkillById(id) {
    const skill = await SkillRepository.findById(id);
    if (!skill) throw new Error('Skill not found');
    return skill;
  },

  async createSkill(data) {
    const existing = await SkillRepository.findByName(data.name);
    if (existing) throw new Error('Skill with this name already exists');
    return await SkillRepository.create(data);
  },

  async updateSkill(id, data) {
    const skill = await SkillRepository.update(id, data);
    if (!skill) throw new Error('Skill not found');
    return skill;
  },

  async deactivateSkill(id) {
    const counts = await SkillRepository.getQuestionCounts(id);
    const totalQuestions = counts.easy + counts.medium + counts.hard;
    // According to architecture, skill can be deactivated even if it has questions.
    // Deleting is restricted, but deactivating is fine.
    const skill = await SkillRepository.deactivate(id);
    if (!skill) throw new Error('Skill not found');
    return skill;
  },

  // Assessment Configs
  async getAssessmentConfig(skillId) {
    return await SkillRepository.getAssessmentConfig(skillId);
  },

  async updateAssessmentConfig(skillId, data) {
    // Validate counts sum up correctly
    if (data.easy_count + data.medium_count + data.hard_count !== data.total_questions) {
      throw new Error('Sum of easy, medium, and hard counts must equal total questions');
    }
    return await SkillRepository.upsertAssessmentConfig({ skill_id: skillId, ...data });
  },

  async getQuestionCounts(skillId) {
    return await SkillRepository.getQuestionCounts(skillId);
  }
};

module.exports = SkillService;
