const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('Faculty Analytics, Batch Scope & CSV Export Verification', () => {
  let facultyToken;
  let tpoToken;
  let studentToken;
  let testUserId;

  beforeAll(async () => {
    // 1. Log in as faculty
    const facLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'faculty@college.edu', password: 'faculty_password' });
    expect(facLogin.status).toBe(200);
    facultyToken = facLogin.body.data.accessToken;

    // 2. Log in as TPO
    const tpoLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'tpo@college.edu', password: 'tpo_password' });
    expect(tpoLogin.status).toBe(200);
    tpoToken = tpoLogin.body.data.accessToken;

    // 3. Register a test student to verify role authorization
    const studentEmail = `student_auth_test_${Date.now()}@college.edu`;
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email: studentEmail, password: 'Password123!' });
    expect(regRes.status).toBe(201);
    testUserId = regRes.body.data.id;

    const studentLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: studentEmail, password: 'Password123!' });
    expect(studentLogin.status).toBe(200);
    studentToken = studentLogin.body.data.accessToken;
  });

  afterAll(async () => {
    if (testUserId) {
      await pool.query('DELETE FROM users WHERE id = $1', [testUserId]);
    }
  });

  it('1. Faculty Profile loads with assigned batch scopes', async () => {
    const res = await request(app)
      .get('/api/faculty/me')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_tpo).toBe(false);
    expect(res.body.data.scopes).toBeDefined();
    expect(Array.isArray(res.body.data.scopes)).toBe(true);
  });

  it('2. Batch Analytics returns top-level avg_readiness and critical_gaps_count within scope', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/batch?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('avg_readiness');
    expect(res.body.data).toHaveProperty('critical_gaps_count');
    expect(res.body.data).toHaveProperty('skill_gaps');
    expect(res.body.data).toHaveProperty('readiness_distribution');
    expect(res.body.data).toHaveProperty('preparation_metrics');
    expect(res.body.data).toHaveProperty('weekly_prep_trend');
  });

  it('3. Standard faculty cannot access out-of-scope batch analytics (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/batch?batch_year=2099&branch=CIVIL')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('4. TPO administrator has campus-wide scope access', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/batch?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('5. Cohort CSV Export generates proper text/csv with sanitized headers and rows', async () => {
    const res = await request(app)
      .get('/api/faculty/students/export?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=/);
    expect(res.text).toContain('Student Name,Roll Number,Branch,Batch Year,Target Role,Readiness Score (%),Readiness Status');
  });

  it('6. Students cannot access faculty CSV export or analytics (403 Forbidden)', async () => {
    const exportRes = await request(app)
      .get('/api/faculty/students/export?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(exportRes.status).toBe(403);

    const analyticsRes = await request(app)
      .get('/api/faculty/analytics/batch?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(analyticsRes.status).toBe(403);
  });
});
