const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('Personalized Skill Baseline & Roadmap E2E Tests', () => {
  let studentAToken;
  let studentAId;
  let studentBToken;
  let studentBId;
  let targetRoleId;
  let roleSkills = [];

  const studentAUser = {
    email: `student_base_a_${Date.now()}@college.edu`,
    password: 'password123',
  };

  const studentBUser = {
    email: `student_base_b_${Date.now()}@college.edu`,
    password: 'password123',
  };

  beforeAll(async () => {
    // 1. Register & setup Student A
    const regA = await request(app).post('/api/auth/register').send(studentAUser);
    studentAId = regA.body.data.id;
    const loginA = await request(app).post('/api/auth/login').send(studentAUser);
    studentAToken = loginA.body.data.accessToken;

    // Get active role
    const rolesRes = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${studentAToken}`);
    const roles = rolesRes.body.data;
    expect(roles.length).toBeGreaterThan(0);
    targetRoleId = roles[0].id;

    // Setup Student A profile
    await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        full_name: 'Student Baseline A',
        roll_number: `ROLL-A-${Date.now().toString().slice(-4)}`,
        branch: 'CS',
        batch_year: 2025,
        target_role_id: targetRoleId,
        profile_completed: true,
      });

    // Fetch role details for requirements
    const roleDetails = await request(app)
      .get(`/api/roles/${targetRoleId}`)
      .set('Authorization', `Bearer ${studentAToken}`);
    roleSkills = roleDetails.body.data.requirements || [];

    // 2. Register & setup Student B
    const regB = await request(app).post('/api/auth/register').send(studentBUser);
    studentBId = regB.body.data.id;
    const loginB = await request(app).post('/api/auth/login').send(studentBUser);
    studentBToken = loginB.body.data.accessToken;

    await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({
        full_name: 'Student Baseline B',
        roll_number: `ROLL-B-${Date.now().toString().slice(-4)}`,
        branch: 'IT',
        batch_year: 2025,
        target_role_id: targetRoleId,
        profile_completed: true,
      });
  });

  afterAll(async () => {
    if (studentAId) {
      await pool.query('DELETE FROM users WHERE id = $1', [studentAId]);
    }
    if (studentBId) {
      await pool.query('DELETE FROM users WHERE id = $1', [studentBId]);
    }
    await pool.end();
  });

  it('1. GET /api/students/skill-baseline returns role requirements in unrated state initially', async () => {
    const res = await request(app)
      .get('/api/students/skill-baseline')
      .set('Authorization', `Bearer ${studentAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.target_role.id).toBe(targetRoleId);
    expect(res.body.data.skills.length).toBe(roleSkills.length);
    expect(res.body.data.summary.total_skills).toBe(roleSkills.length);
    expect(res.body.data.summary.rated_count).toBe(0);
    expect(res.body.data.summary.is_complete).toBe(false);
  });

  it('2. POST /api/students/skill-baseline rejects invalid proficiency levels', async () => {
    if (roleSkills.length === 0) return;

    const res = await request(app)
      .post('/api/students/skill-baseline')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        role_id: targetRoleId,
        ratings: [
          { skill_id: roleSkills[0].skill_id, proficiency_level: 'master_expert' },
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('3. POST /api/students/skill-baseline saves self-reported skill ratings and updates summary', async () => {
    if (roleSkills.length === 0) return;

    const levels = ['proficient', 'intermediate', 'beginner', 'not_sure'];
    const ratings = roleSkills.map((s, idx) => ({
      skill_id: s.skill_id,
      proficiency_level: levels[idx % levels.length],
    }));

    const res = await request(app)
      .post('/api/students/skill-baseline')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        role_id: targetRoleId,
        ratings,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.summary.rated_count).toBe(roleSkills.length);
    expect(res.body.data.summary.is_complete).toBe(true);
    expect(res.body.data.summary.unrated_count).toBe(0);
  });

  it('4. POST /api/students/skill-baseline is idempotent (repeated save succeeds without duplicate errors)', async () => {
    if (roleSkills.length === 0) return;

    const ratings = [
      { skill_id: roleSkills[0].skill_id, proficiency_level: 'proficient' },
    ];

    const res = await request(app)
      .post('/api/students/skill-baseline')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        role_id: targetRoleId,
        ratings,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('5. Account Isolation: Student B cannot see Student A ratings', async () => {
    const resB = await request(app)
      .get('/api/students/skill-baseline')
      .set('Authorization', `Bearer ${studentBToken}`);

    expect(resB.status).toBe(200);
    expect(resB.body.success).toBe(true);
    // Student B has not rated skills yet
    expect(resB.body.data.summary.rated_count).toBe(0);
    resB.body.data.skills.forEach((s) => {
      expect(s.proficiency_level).toBeNull();
      expect(s.is_rated).toBe(false);
    });
  });

  it('6. PUT /api/students/skill-baseline/:skillId updates single skill rating', async () => {
    if (roleSkills.length === 0) return;

    const targetSkill = roleSkills[0];
    const res = await request(app)
      .put(`/api/students/skill-baseline/${targetSkill.skill_id}`)
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ proficiency_level: 'beginner' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.proficiency_level).toBe('beginner');
    expect(res.body.data.is_self_reported).toBe(true);
  });

  it('7. GET /api/skills/:id/detail returns skill overview, requirement, evaluation, and content', async () => {
    if (roleSkills.length === 0) return;

    const skillId = roleSkills[0].skill_id;
    const res = await request(app)
      .get(`/api/skills/${skillId}/detail`)
      .set('Authorization', `Bearer ${studentAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skill.id).toBe(skillId);
    expect(res.body.data.student_evaluation.self_reported_level).toBe('beginner');
    expect(res.body.data.student_evaluation.status).toBe('needs_attention');
    expect(res.body.data.content).toHaveProperty('concepts');
    expect(res.body.data.content).toHaveProperty('exercises');
    expect(res.body.data.content).toHaveProperty('resources');
  });

  it('8. GET /api/skills/:id/detail returns 404 for non-existent skill', async () => {
    const res = await request(app)
      .get('/api/skills/00000000-0000-0000-0000-000000000000/detail')
      .set('Authorization', `Bearer ${studentAToken}`);

    expect(res.status).toBe(404);
  });

  it('9. GET /api/students/roadmap returns prioritized actionable items without fabricated scores', async () => {
    const res = await request(app)
      .get('/api/students/roadmap')
      .set('Authorization', `Bearer ${studentAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items.length).toBe(roleSkills.length);
    expect(res.body.data.metrics.total_skills).toBe(roleSkills.length);

    // Each roadmap item must contain actionable explainable fields
    res.body.data.items.forEach((item) => {
      expect(item).toHaveProperty('skill_name');
      expect(item).toHaveProperty('priority');
      expect(item).toHaveProperty('status');
      expect(item).toHaveProperty('recommended_action');
      expect(item).toHaveProperty('expected_outcome');
      expect(item).toHaveProperty('reason');
    });
  });
});
