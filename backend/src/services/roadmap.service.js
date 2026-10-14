const RoleRepository = require('../repositories/role.repository');
const GapRepository = require('../repositories/gap.repository');
const BaselineRepository = require('../repositories/baseline.repository');
const PreparationRepository = require('../repositories/preparation.repository');
const StudentRepository = require('../repositories/student.repository');
const TaskProgressRepository = require('../repositories/taskProgress.repository');
const EvidenceRepository = require('../repositories/evidence.repository');
const { getSkillContent } = require('../data/skillContent');

const RoadmapService = {
  async getRoadmap(studentId, explicitRoleId = null) {
    let roleId = explicitRoleId;
    if (!roleId) {
      const profile = await StudentRepository.findById(studentId);
      roleId = profile?.target_role_id || null;
    }

    if (!roleId) {
      return {
        target_role: null,
        items: [],
        metrics: {
          total_skills: 0,
          skills_with_baseline: 0,
          skills_in_progress: 0,
          skills_meeting_target: 0,
          skills_needing_attention: 0,
          total_prep_hours: 0,
          tasks_completed: 0,
          evidence_accepted: 0,
          evidence_pending: 0,
        },
      };
    }

    const role = await RoleRepository.findById(roleId);
    const requirements = await RoleRepository.getSkillRequirements(roleId);
    if (!requirements || requirements.length === 0) {
      return {
        target_role: role ? { id: role.id, name: role.name, description: role.description } : null,
        items: [],
        metrics: {
          total_skills: 0,
          skills_with_baseline: 0,
          skills_in_progress: 0,
          skills_meeting_target: 0,
          skills_needing_attention: 0,
          total_prep_hours: 0,
          tasks_completed: 0,
          evidence_accepted: 0,
          evidence_pending: 0,
        },
      };
    }

    // Parallel fetch of student signals
    const [baselines, skillScores, prepActivities, taskStats, evidenceList] = await Promise.all([
      BaselineRepository.findByStudentId(studentId),
      GapRepository.getAllSkillScores(studentId),
      PreparationRepository.findByStudentId(studentId),
      TaskProgressRepository.getStudentTaskStats(studentId),
      EvidenceRepository.findByStudent(studentId),
    ]);

    const baselineMap = new Map(baselines.map((b) => [b.skill_id, b]));
    const scoreMap = new Map(skillScores.map((s) => [s.skill_id, s]));

    // Map evidence by skill_id
    const evidenceBySkill = new Map();
    let evidenceAcceptedCount = 0;
    let evidencePendingCount = 0;
    for (const ev of evidenceList) {
      if (!evidenceBySkill.has(ev.skill_id)) {
        evidenceBySkill.set(ev.skill_id, []);
      }
      evidenceBySkill.get(ev.skill_id).push(ev);
      if (ev.status === 'accepted') evidenceAcceptedCount++;
      if (ev.status === 'submitted' || ev.status === 'under_review') evidencePendingCount++;
    }

    // Prep hours mapped per skill
    const prepMap = new Map();
    let totalPrepHours = 0;
    for (const act of prepActivities) {
      const hrs = parseFloat(act.hours_spent) || 0;
      totalPrepHours += hrs;
      if (act.skill_id) {
        prepMap.set(act.skill_id, (prepMap.get(act.skill_id) || 0) + hrs);
      }
    }

    let skillsWithBaseline = 0;
    let skillsInProgress = 0;
    let skillsMeetingTarget = 0;
    let skillsNeedingAttention = 0;

    const items = requirements.map((req) => {
      const baseline = baselineMap.get(req.skill_id);
      const scoreRecord = scoreMap.get(req.skill_id);
      const prepHours = parseFloat((prepMap.get(req.skill_id) || 0).toFixed(1));
      const content = getSkillContent(req.skill_name, req.skill_category);

      const hasDiagnostic = Boolean(scoreRecord && scoreRecord.current_score !== undefined);
      const diagnosticScore = hasDiagnostic ? scoreRecord.current_score : null;
      const selfLevel = baseline ? baseline.proficiency_level : null;

      if (selfLevel) skillsWithBaseline++;

      let priority = 'medium';
      let priorityRank = 2;
      let status = 'not_evaluated';
      let statusLabel = 'Not Evaluated Yet';
      let reason = '';
      let recommendedAction = '';
      let expectedOutcome = '';

      if (hasDiagnostic) {
        if (diagnosticScore >= req.required_level) {
          priority = 'low';
          priorityRank = 1;
          status = 'meets_target';
          statusLabel = 'Benchmark Met';
          reason = `Verified diagnostic score (${diagnosticScore}%) meets role target (${req.required_level}%).`;
          recommendedAction = 'Maintain mastery with periodic practice or mock challenges.';
          expectedOutcome = 'Readiness preserved for technical screening.';
          skillsMeetingTarget++;
        } else {
          const gap = req.required_level - diagnosticScore;
          if (gap > 35) {
            priority = 'critical';
            priorityRank = 4;
            status = 'needs_attention';
            statusLabel = 'Critical Gap';
            reason = `Verified score (${diagnosticScore}%) is ${gap}% below required benchmark (${req.required_level}%).`;
            recommendedAction = 'Review fundamental concepts immediately and work through beginner exercises.';
            expectedOutcome = 'Close critical knowledge gaps before testing again.';
            skillsNeedingAttention++;
          } else {
            priority = 'high';
            priorityRank = 3;
            status = 'in_progress';
            statusLabel = 'Moderate Gap';
            reason = `Verified score (${diagnosticScore}%) is ${gap}% below required benchmark (${req.required_level}%).`;
            recommendedAction = 'Solve intermediate problems and review weak areas.';
            expectedOutcome = 'Attain the benchmark requirement on next evaluation.';
            skillsInProgress++;
          }
        }
      } else if (selfLevel) {
        if (selfLevel === 'beginner') {
          priority = req.weight >= 4 ? 'critical' : 'high';
          priorityRank = req.weight >= 4 ? 4 : 3;
          status = 'needs_attention';
          statusLabel = 'Beginner (Self-Reported)';
          reason = `Self-evaluated as Beginner. Target role requires ${req.required_level}% proficiency.`;
          recommendedAction = 'Work through core concepts and complete guided practical exercises.';
          expectedOutcome = 'Progress from beginner to independent problem solving.';
          skillsNeedingAttention++;
        } else if (selfLevel === 'not_sure') {
          priority = 'medium';
          priorityRank = 2;
          status = 'needs_evaluation';
          statusLabel = 'Uncertain Baseline';
          reason = 'Proficiency level not yet determined. Baseline evaluation recommended.';
          recommendedAction = 'Review topic checklist or take an assessment to determine baseline.';
          expectedOutcome = 'Clear diagnosis of knowledge level.';
          skillsInProgress++;
        } else if (selfLevel === 'intermediate') {
          priority = 'medium';
          priorityRank = 2;
          status = 'in_progress';
          statusLabel = 'Intermediate (Self-Reported)';
          reason = `Self-evaluated as Intermediate. Target benchmark is ${req.required_level}%.`;
          recommendedAction = 'Complete practical hands-on challenge and take a diagnostic test.';
          expectedOutcome = 'Validate skills with evidence and confirm benchmark attainment.';
          skillsInProgress++;
        } else if (selfLevel === 'proficient') {
          priority = 'low';
          priorityRank = 1;
          status = 'meets_self_reported';
          statusLabel = 'Proficient (Self-Reported)';
          reason = `Self-evaluated as Proficient. Role requirement is ${req.required_level}%.`;
          recommendedAction = 'Take diagnostic assessment to produce verified proof for placement.';
          expectedOutcome = 'Verified readiness score visible on campus roster.';
          skillsMeetingTarget++;
        }
      } else {
        priority = 'medium';
        priorityRank = 2;
        status = 'not_evaluated';
        statusLabel = 'Not Evaluated Yet';
        reason = 'No self-rating or diagnostic assessment completed for this requirement.';
        recommendedAction = 'Rate this skill in your Skill Baseline flow or review the skill guide.';
        expectedOutcome = 'Targeted roadmap prioritization tailored to your level.';
        skillsInProgress++;
      }

      const skillEvidences = evidenceBySkill.get(req.skill_id) || [];
      const hasAcceptedEvidence = skillEvidences.some((e) => e.status === 'accepted');
      const needsRevisionEvidence = skillEvidences.find((e) => e.status === 'needs_improvement');
      const pendingEvidence = skillEvidences.some((e) => e.status === 'submitted' || e.status === 'under_review');

      // If faculty requested revision on evidence, surface this as an immediate actionable priority
      if (needsRevisionEvidence) {
        priority = 'high';
        priorityRank = Math.max(priorityRank, 3);
        reason = `Faculty requested revision on "${needsRevisionEvidence.title}": ${needsRevisionEvidence.faculty_feedback || 'Please review notes and resubmit'}`;
        recommendedAction = 'Update and resubmit your evidence in your Evidence Portfolio.';
        expectedOutcome = 'Obtain faculty verification for this competency.';
      }

      return {
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        skill_category: req.skill_category,
        required_level: req.required_level,
        weight: req.weight,
        priority,
        priority_rank: priorityRank,
        status,
        status_label: statusLabel,
        reason,
        recommended_action: recommendedAction,
        expected_outcome: expectedOutcome,
        self_reported_level: selfLevel,
        diagnostic_score: diagnosticScore,
        prep_hours: prepHours,
        prerequisites: content.prerequisites || [],
        mini_challenge: content.miniChallenge || null,
        top_resource: content.resources?.[0] || null,
        evidence_count: skillEvidences.length,
        has_accepted_evidence: hasAcceptedEvidence,
        has_pending_evidence: pendingEvidence,
        needs_revision_evidence: Boolean(needsRevisionEvidence),
      };
    });

    // Sort: highest priority rank first (critical=4, high=3, medium=2, low=1), then highest role weight (5 to 1)
    items.sort((a, b) => {
      if (b.priority_rank !== a.priority_rank) return b.priority_rank - a.priority_rank;
      return (b.weight || 0) - (a.weight || 0);
    });

    return {
      target_role: role ? { id: role.id, name: role.name, description: role.description } : null,
      items,
      metrics: {
        total_skills: requirements.length,
        skills_with_baseline: skillsWithBaseline,
        skills_in_progress: skillsInProgress,
        skills_meeting_target: skillsMeetingTarget,
        skills_needing_attention: skillsNeedingAttention,
        total_prep_hours: parseFloat(totalPrepHours.toFixed(1)),
        tasks_completed: taskStats.completed_tasks,
        tasks_in_progress: taskStats.in_progress_tasks,
        evidence_accepted: evidenceAcceptedCount,
        evidence_pending: evidencePendingCount,
      },
    };
  },
};

module.exports = RoadmapService;
