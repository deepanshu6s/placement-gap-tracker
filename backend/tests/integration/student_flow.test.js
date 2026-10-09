const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('Student E2E Flow', () => {
  let userToken;
  let refreshTokenCookie;
  let testUserId;
  let activeAttemptId;
  let skillIdForTest;

  const testUser = {
    email: `student_e2e_${Date.now()}@college.edu`,
    password: 'securePassword123'
  };

  afterAll(async () => {
    // Cleanup the specific test user to avoid clutter
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
    await pool.end();
  });

  it('1. Register a new student', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    if (res.status !== 201) console.error('Register failed:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(testUser.email);
    expect(res.body.data.role).toBe('student');
    
    testUserId = res.body.data.id;
  });

  it('2. Login as the student', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send(testUser);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    userToken = res.body.data.accessToken;
  });

  it('3. Fetch Roles and select target role', async () => {
    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(rolesRes.status).toBe(200);
    const roles = rolesRes.body.data;
    expect(roles.length).toBeGreaterThan(0);
    
    const targetRole = roles[0];

    const profileRes = await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        full_name: 'E2E Test Student',
        roll_number: 'E2E-101',
        branch: 'CS',
        batch_year: 2024,
        target_role_id: targetRole.id,
        profile_completed: true
      });

    expect(profileRes.status).toBe(201);
    expect(profileRes.body.data.target_role_id).toBe(targetRole.id);
  });

  it('4. Get Readiness (initially N/A or 0)', async () => {
    const readRes = await request(app)
      .get('/api/readiness/me')
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(readRes.status).toBe(200);
  });

  it('5. Start Assessment', async () => {
    // Get roles details to find a skill
    const profileRes = await request(app).get('/api/students/me').set('Authorization', `Bearer ${userToken}`);
    const roleId = profileRes.body.data.target_role_id;
    
    const roleDetails = await request(app).get(`/api/roles/${roleId}`).set('Authorization', `Bearer ${userToken}`);
    const reqSkills = roleDetails.body.data.requirements;
    
    if (reqSkills && reqSkills.length > 0) {
      skillIdForTest = reqSkills[0].skill_id;
      
      const startRes = await request(app)
        .post('/api/assessments/start')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ skill_id: skillIdForTest });
        
      expect(startRes.status).toBe(201);
      activeAttemptId = startRes.body.data.id;
    }
  });

  it('6. Submit Assessment', async () => {
    if (!activeAttemptId) return; // Skip if role had no skills

    const qsRes = await request(app)
      .get(`/api/assessments/${activeAttemptId}/questions`)
      .set('Authorization', `Bearer ${userToken}`);
      
    expect(qsRes.status).toBe(200);
    const questions = qsRes.body.data;
    
    const answers = questions.map(q => ({
      question_id: q.id,
      selected_option_id: q.options[0].id // Just pick the first option
    }));

    const submitRes = await request(app)
      .post(`/api/assessments/${activeAttemptId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ answers });

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('completed');
  });
});
