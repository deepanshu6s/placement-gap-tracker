const { pool } = require('../config/db');
const AssessmentRepository = require('../repositories/assessment.repository');
const GapRepository = require('../repositories/gap.repository');
const GapService = require('./gap.service');
const ReadinessService = require('./readiness.service');
const StudentRepository = require('../repositories/student.repository');

const AssessmentService = {
  async startAttempt(studentId, skillId) {
    // 1. Check for active attempt
    const active = await AssessmentRepository.findActiveAttempt(studentId, skillId);
    if (active) {
      // Check if timed out
      const config = await AssessmentRepository.getAssessmentConfig(skillId);
      const timeLimitMs = (config ? config.time_limit_minutes : 15) * 60 * 1000;
      const elapsed = Date.now() - new Date(active.started_at).getTime();
      
      if (elapsed > timeLimitMs + 60000) { // 1 min grace
        await AssessmentRepository.timeoutAttempt(active.id);
      } else {
        return active; // Return existing active attempt
      }
    }

    // 2. Check cooldown
    const config = await AssessmentRepository.getAssessmentConfig(skillId);
    if (!config) throw new Error('Skill not configured for assessments');
    
    const lastAttempt = await AssessmentRepository.findLastCompletedAttempt(studentId, skillId);
    if (lastAttempt) {
      const cooldownMs = config.cooldown_hours * 60 * 60 * 1000;
      const timeSince = Date.now() - new Date(lastAttempt.submitted_at).getTime();
      if (timeSince < cooldownMs) {
        throw new Error(`Cooldown active. Try again in ${Math.ceil((cooldownMs - timeSince) / 3600000)} hours`);
      }
    }

    // 3. Select Questions
    const questions = await AssessmentRepository.selectQuestionsByDifficulty(
      skillId, config.easy_count, config.medium_count, config.hard_count
    );

    if (questions.length < config.total_questions) {
      throw new Error('Not enough active questions available for this skill config');
    }

    // 4. Create Attempt in Tx
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const attempt = await AssessmentRepository.createAttempt(client, {
        student_id: studentId,
        skill_id: skillId,
        questions_served: questions.length
      });
      await AssessmentRepository.createAttemptQuestions(client, attempt.id, questions);
      await client.query('COMMIT');
      return attempt;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async getAttemptQuestions(attemptId, studentId) {
    const attempt = await AssessmentRepository.findAttemptById(attemptId);
    if (!attempt || attempt.student_id !== studentId) {
      throw new Error('Attempt not found');
    }
    return await AssessmentRepository.getQuestionsForAttempt(attemptId);
  },

  async submitAttempt(attemptId, studentId, studentAnswers) {
    const attempt = await AssessmentRepository.findAttemptById(attemptId);
    if (!attempt || attempt.student_id !== studentId) {
      throw new Error('Attempt not found');
    }
    if (attempt.status !== 'in_progress') {
      throw new Error('Attempt already completed or timed out');
    }

    // Score answers
    const processedAnswers = [];
    let correctCount = 0;

    for (const ans of studentAnswers) {
      // Validate option belongs to question
      if (ans.selected_option_id) {
        const valid = await AssessmentRepository.verifyOptionOwnership(ans.question_id, ans.selected_option_id);
        if (!valid) throw new Error(`Invalid option for question ${ans.question_id}`);
        
        const option = await AssessmentRepository.getOptionCorrectness(ans.selected_option_id);
        const isCorrect = option ? option.is_correct : false;
        if (isCorrect) correctCount++;
        
        processedAnswers.push({
          question_id: ans.question_id,
          selected_option_id: ans.selected_option_id,
          is_correct: isCorrect
        });
      } else {
        processedAnswers.push({
          question_id: ans.question_id,
          selected_option_id: null,
          is_correct: false
        });
      }
    }

    const rawScore = correctCount;
    const skillScore = attempt.questions_served > 0 ? Math.round((correctCount / attempt.questions_served) * 100) : 0;

    const client = await pool.connect();
    let completedAttempt;
    try {
      await client.query('BEGIN');
      completedAttempt = await AssessmentRepository.submitAttempt(client, attempt.id, {
        answers: processedAnswers,
        rawScore,
        skillScore
      });

      // Upsert into student_skill_scores (GapRepository uses client)
      await GapRepository.upsertSkillScore(client, studentId, attempt.skill_id, skillScore);
      
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Await recomputation so scores and gaps are persisted before returning
    const profile = await StudentRepository.findById(studentId);
    if (profile && profile.target_role_id) {
      try {
        await GapService.recompute(studentId, profile.target_role_id);
        await ReadinessService.recompute(studentId, profile.target_role_id);
      } catch (err) {
        console.error('Post-assessment recompute failed:', err);
      }
    }

    return completedAttempt;
  },

  async getAttemptResult(attemptId, studentId) {
    const attempt = await AssessmentRepository.findAttemptById(attemptId);
    if (!attempt || attempt.student_id !== studentId) {
      throw new Error('Attempt not found');
    }
    return await AssessmentRepository.getAttemptResult(attemptId);
  },

  async getAttemptReview(attemptId, studentId) {
    const attempt = await AssessmentRepository.findAttemptById(attemptId);
    if (!attempt || attempt.student_id !== studentId) {
      throw new Error('Attempt not found');
    }
    if (attempt.status !== 'completed' && attempt.status !== 'timed_out') {
      throw new Error('Attempt is still in progress');
    }
    return await AssessmentRepository.getAttemptReview(attemptId);
  }
};

module.exports = AssessmentService;
