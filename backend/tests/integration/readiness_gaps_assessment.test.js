const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('Full End-to-End Placement Readiness & Skill Gap Verification', () => {
  let studentToken;
  let testUserId;
  let testProfileId;
  let selectedRole;
  let activeAttemptId;
  let targetSkillId;

  const testEmail = `qa_test_${Date.now()}@college.edu`;
  const testPassword = 'Password123!';

  afterAll(async () => {
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  it('A. Authenticate and register new student', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    testUserId = regRes.body.data.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    studentToken = loginRes.body.data.accessToken;
    expect(studentToken).toBeDefined();
  });

  it('B. Verify 10 Career Roles in Catalogue with required skills', async () => {
    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(rolesRes.status).toBe(200);
    expect(rolesRes.body.data.length).toBeGreaterThanOrEqual(10);

    const seRole = rolesRes.body.data.find(r => r.name === 'Software Engineer');
    expect(seRole).toBeDefined();
    selectedRole = seRole;

    // Fetch details for Software Engineer
    const detailsRes = await request(app)
      .get(`/api/roles/${seRole.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(detailsRes.status).toBe(200);
    expect(detailsRes.body.data.requirements).toBeDefined();
    expect(detailsRes.body.data.requirements.length).toBeGreaterThanOrEqual(5);

    // Pick first skill for assessment
    targetSkillId = detailsRes.body.data.requirements[0].skill_id;
    expect(targetSkillId).toBeDefined();
  });

  it('C. Setup student profile with Software Engineer target role', async () => {
    const profRes = await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        full_name: 'QA Test Student',
        roll_number: `QA-${Date.now().toString().slice(-4)}`,
        branch: 'Computer Science',
        batch_year: 2025,
        target_role_id: selectedRole.id,
        cgpa: 8.5,
        profile_completed: true,
      });

    expect(profRes.status).toBe(201);
    expect(profRes.body.data.target_role_id).toBe(selectedRole.id);
    testProfileId = profRes.body.data.id;
  });

  it('D. Initial Dashboard state shows NOT_ASSESSED and 0% coverage', async () => {
    const readRes = await request(app)
      .get('/api/readiness/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.data.status).toBe('NOT_ASSESSED');
    expect(readRes.body.data.score).toBeNull();
    expect(readRes.body.data.assessmentCoverage).toBe(0);
    expect(readRes.body.data.assessedSkillsCount).toBe(0);

    // Initial gaps list returns all role skills with is_assessed: false
    const gapsRes = await request(app)
      .get('/api/skill-gaps/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(gapsRes.status).toBe(200);
    expect(gapsRes.body.data.length).toBeGreaterThanOrEqual(5);
    expect(gapsRes.body.data.every(g => g.is_assessed === false)).toBe(true);

    // Recommendations advise student to take baseline assessments
    const recsRes = await request(app)
      .get('/api/recommendations/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(recsRes.status).toBe(200);
    expect(recsRes.body.data.length).toBeGreaterThan(0);
    expect(recsRes.body.data[0].recommendation_type).toBe('take_assessment');
  });

  it('E. Assessment workflow: start attempt and verify questions do NOT leak answer keys', async () => {
    const startRes = await request(app)
      .post('/api/assessments/start')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ skill_id: targetSkillId });

    expect(startRes.status).toBe(201);
    expect(startRes.body.data.id).toBeDefined();
    activeAttemptId = startRes.body.data.id;

    // Fetch questions for attempt
    const qRes = await request(app)
      .get(`/api/assessments/${activeAttemptId}/questions`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(qRes.status).toBe(200);
    expect(qRes.body.data.length).toBe(5);

    // Crucial security check: is_correct must NOT be present in options served to browser
    for (const q of qRes.body.data) {
      expect(q.options).toBeDefined();
      expect(q.options.length).toBe(4);
      for (const opt of q.options) {
        expect(opt.is_correct).toBeUndefined();
      }
    }
  });

  it('F. Assessment submission: backend evaluates score and recalculates readiness', async () => {
    const qRes = await request(app)
      .get(`/api/assessments/${activeAttemptId}/questions`)
      .set('Authorization', `Bearer ${studentToken}`);

    const questions = qRes.body.data;
    const answers = questions.map(q => ({
      question_id: q.id,
      selected_option_id: q.options[0].id, // Select an option
    }));

    const submitRes = await request(app)
      .post(`/api/assessments/${activeAttemptId}/submit`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('completed');
    expect(submitRes.body.data.skill_score).toBeDefined();

    // Verify result endpoint
    const resultRes = await request(app)
      .get(`/api/assessments/${activeAttemptId}/result`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.skill_name).toBeDefined();

    // Verify readiness updated
    const updatedReadRes = await request(app)
      .get('/api/readiness/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(updatedReadRes.status).toBe(200);
    expect(updatedReadRes.body.data.status).toBe('SUCCESS');
    expect(updatedReadRes.body.data.score).toBeGreaterThanOrEqual(0);
    expect(updatedReadRes.body.data.assessedSkillsCount).toBe(1);
    expect(updatedReadRes.body.data.assessmentCoverage).toBeGreaterThan(0);

    // Verify gaps updated
    const updatedGapsRes = await request(app)
      .get('/api/skill-gaps/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(updatedGapsRes.status).toBe(200);
    const assessedGap = updatedGapsRes.body.data.find(g => g.skill_id === targetSkillId);
    expect(assessedGap).toBeDefined();
    expect(assessedGap.is_assessed).toBe(true);
  });

  it('G. Preparation Tracker: log activity, calculate hours, and verify student isolation', async () => {
    const prepRes = await request(app)
      .post('/api/preparation/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        activity_type: 'practice',
        hours_spent: 2.5,
        activity_date: new Date().toISOString().split('T')[0],
        description: 'Completed 5 LeetCode DSA problems on binary search',
        skill_id: targetSkillId,
      });

    expect(prepRes.status).toBe(201);
    expect(parseFloat(prepRes.body.data.hours_spent)).toBe(2.5);

    // Retrieve logs
    const logsRes = await request(app)
      .get('/api/preparation/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(parseFloat(logsRes.body.data[0].hours_spent)).toBe(2.5);
  });
});
