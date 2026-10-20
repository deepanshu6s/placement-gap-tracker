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

  // =========================================================================
  // TASK 4: Analytics Endpoints Integration Tests
  // =========================================================================

  it('7. GET /api/faculty/analytics/overview returns cohort summary metrics', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/overview?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('total_students');
    expect(res.body.data).toHaveProperty('students_with_role');
    expect(res.body.data).toHaveProperty('students_without_role');
    expect(res.body.data).toHaveProperty('students_with_baseline');
    expect(res.body.data).toHaveProperty('students_with_assessment');
    expect(res.body.data).toHaveProperty('total_tasks_completed');
    expect(res.body.data).toHaveProperty('evidence_pending_review');
    expect(res.body.data).toHaveProperty('evidence_needs_revision');
    expect(typeof res.body.data.total_students).toBe('number');
  });

  it('8. GET /api/faculty/analytics/role-distribution returns per-role student counts and readiness', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/role-distribution?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const first = res.body.data[0];
      expect(first).toHaveProperty('role_name');
      expect(first).toHaveProperty('student_count');
      expect(typeof first.student_count).toBe('number');
    }
  });

  it('9. GET /api/faculty/analytics/skill-gaps separates self-reported baseline from diagnostic scores', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/skill-gaps?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const row = res.body.data[0];
      expect(row).toHaveProperty('skill_name');
      expect(row).toHaveProperty('required_level');
      expect(row).toHaveProperty('baseline_beginner');
      expect(row).toHaveProperty('baseline_intermediate');
      expect(row).toHaveProperty('baseline_proficient');
      expect(row).toHaveProperty('baseline_missing');
      expect(row).toHaveProperty('has_assessment');
      expect(row).toHaveProperty('avg_diagnostic_score');
      expect(row).toHaveProperty('gap_critical');
    }
  });

  it('10. GET /api/faculty/analytics/student-support returns scoped student support indicators', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/student-support?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    if (res.body.data.length > 0) {
      const student = res.body.data[0];
      expect(student).toHaveProperty('full_name');
      expect(student).toHaveProperty('support_indicators');
      expect(Array.isArray(student.support_indicators)).toBe(true);
      // Privacy check: ensure password_hash or sensitive auth tokens are never leaked
      expect(student.password_hash).toBeUndefined();
      expect(student.password).toBeUndefined();
    }
  });

  it('11. GET /api/faculty/analytics/insights returns actionable suggestions or empty array', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/insights?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('12. GET /api/faculty/analytics/export returns structured CSV with overview, distribution, and skill gaps', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/export?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.headers['content-disposition']).toMatch(/attachment; filename=/);
    expect(res.text).toContain('Placement Readiness Analytics Export');
    expect(res.text).toContain('OVERVIEW METRICS');
    expect(res.text).toContain('ROLE DISTRIBUTION');
    expect(res.text).toContain('SKILL GAP HEATMAP (Self-Reported)');
  });

  it('13. Out-of-scope access to analytics returns 403 for standard faculty', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/overview?batch_year=2099&branch=CIVIL')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('14. Unauthenticated access to analytics returns 401', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/overview?batch_year=2024&branch=CS');

    expect(res.status).toBe(401);
  });

  it('15. Out-of-scope analytics export returns 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/export?batch_year=2099&branch=CIVIL')
      .set('Authorization', `Bearer ${facultyToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('16. TPO administrator can access campus-wide analytics export', async () => {
    const res = await request(app)
      .get('/api/faculty/analytics/export?batch_year=2024&branch=CS')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Placement Readiness Analytics Export');
  });

  it('17. Empty cohort export produces a valid, structured CSV with clean headers and indicators', async () => {
    // 2030 Batch has 0 students in the database
    const res = await request(app)
      .get('/api/faculty/analytics/export?batch_year=2030&branch=CS')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/csv/);
    expect(res.text).toContain('Total Students,0');
    expect(res.text).toContain('OVERVIEW METRICS');
    expect(res.text).toContain('ROLE DISTRIBUTION');
    expect(res.text).toContain('(No roles recorded),0,N/A');
    expect(res.text).toContain('SKILL GAP HEATMAP (Self-Reported)');
  });

  it('18. Scope parameters in CSV export header are sanitized against formula injection', async () => {
    // Pass URL-encoded formula string %3D1%2B1 for '=1+1'
    const res = await request(app)
      .get('/api/faculty/analytics/export?batch_year=2024&branch=%3D1%2B1')
      .set('Authorization', `Bearer ${tpoToken}`);

    expect(res.status).toBe(200);
    // Formula trigger '=' must be escaped with a single quote
    expect(res.text).toContain("'=1+1");
  });
});
