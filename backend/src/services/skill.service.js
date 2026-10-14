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
  },

  async getSkillDetail(skillId, userId) {
    const skill = await SkillRepository.findById(skillId);
    if (!skill) throw new Error('Skill not found');

    const { getSkillContent } = require('../data/skillContent');
    const content = getSkillContent(skill.name, skill.category);

    let studentProfile = null;
    let targetRequirement = null;
    let selfReportedLevel = null;
    let diagnosticScore = null;
    let prepHistory = [];
    let prepHours = 0;

    if (userId) {
      const StudentRepository = require('../repositories/student.repository');
      const RoleRepository = require('../repositories/role.repository');
      const BaselineRepository = require('../repositories/baseline.repository');
      const GapRepository = require('../repositories/gap.repository');
      const PreparationRepository = require('../repositories/preparation.repository');

      studentProfile = await StudentRepository.findByUserId(userId);
      if (studentProfile) {
        if (studentProfile.target_role_id) {
          const reqs = await RoleRepository.getSkillRequirements(studentProfile.target_role_id);
          targetRequirement = (reqs || []).find((r) => r.skill_id === skillId) || null;
        }

        const baseline = await BaselineRepository.findByStudentAndSkill(studentProfile.id, skillId);
        selfReportedLevel = baseline?.proficiency_level || null;

        const scores = await GapRepository.getAllSkillScores(studentProfile.id);
        const scoreRec = (scores || []).find((s) => s.skill_id === skillId);
        if (scoreRec) {
          diagnosticScore = {
            current_score: scoreRec.current_score,
            best_score: scoreRec.best_score,
            attempt_count: scoreRec.attempt_count,
            last_attempted_at: scoreRec.last_attempted_at,
          };
        }

        prepHistory = await PreparationRepository.findByStudentId(studentProfile.id, { skill_id: skillId });
        prepHours = prepHistory.reduce((sum, p) => sum + (parseFloat(p.hours_spent) || 0), 0);
      }
    }

    // Task progress and Evidence for this skill
    let tasksData = { total_tasks: 0, completed_tasks: 0, in_progress_tasks: 0, tasks: content.learningTasks || [] };
    let evidenceList = [];

    if (studentProfile) {
      const TaskProgressService = require('./taskProgress.service');
      const EvidenceRepository = require('../repositories/evidence.repository');

      try {
        tasksData = await TaskProgressService.getSkillTasksWithProgress(studentProfile.id, skillId);
        evidenceList = await EvidenceRepository.findByStudent(studentProfile.id, { skill_id: skillId });
      } catch (err) {
        console.error('Failed to load tasks/evidence for skill detail:', err);
      }
    }

    // Determine honest gap status
    let status = 'not_evaluated';
    let statusLabel = 'Not Evaluated Yet';

    if (diagnosticScore) {
      if (targetRequirement && diagnosticScore.current_score >= targetRequirement.required_level) {
        status = 'meets_target';
        statusLabel = 'Benchmark Met (Diagnostic Verified)';
      } else {
        const gap = targetRequirement ? targetRequirement.required_level - diagnosticScore.current_score : 0;
        status = gap > 35 ? 'needs_attention' : 'in_progress';
        statusLabel = gap > 35 ? 'Critical Gap (Diagnostic Verified)' : 'Moderate Gap (Diagnostic Verified)';
      }
    } else if (selfReportedLevel) {
      if (selfReportedLevel === 'proficient') {
        status = 'meets_self_reported';
        statusLabel = 'Meets Target (Self-Reported)';
      } else if (selfReportedLevel === 'intermediate') {
        status = 'in_progress';
        statusLabel = 'In Progress (Self-Reported Intermediate)';
      } else if (selfReportedLevel === 'beginner') {
        status = 'needs_attention';
        statusLabel = 'Needs Attention (Self-Reported Beginner)';
      } else {
        status = 'needs_evaluation';
        statusLabel = 'Evaluation Needed';
      }
    }

    return {
      skill,
      target_role: studentProfile?.target_role_id
        ? {
            id: studentProfile.target_role_id,
            name: studentProfile.target_role_name,
          }
        : null,
      target_requirement: targetRequirement,
      student_evaluation: {
        self_reported_level: selfReportedLevel,
        diagnostic_score: diagnosticScore,
        status,
        status_label: statusLabel,
        prep_hours: parseFloat(prepHours.toFixed(1)),
        prep_sessions_count: prepHistory.length,
      },
      content,
      learning_tasks: tasksData,
      evidence: evidenceList,
    };
  },
};

module.exports = SkillService;
