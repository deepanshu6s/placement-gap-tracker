const request = require('supertest');
const app = require('../../src/app');
const { pool } = require('../../src/config/db');

describe('Task 3 Integration: Learning Workspace, Evidence Portfolio, and Assessment Remediation', () => {
  let student1Token, student1UserId, student1ProfileId;
  let student2Token, student2UserId, student2ProfileId;
  let facultyToken, facultyUserId, facultyProfileId;
  let testSkillId;
  let testRoleId;
  let testEvidenceId;
  let testAttemptId;

  beforeAll(async () => {
    // 1. Create Student 1
    const s1Creds = {
      email: `student_ws1_${Date.now()}@test.edu`,
      password: 'Password123!',
    };
    const s1Reg = await request(app).post('/api/auth/register').send(s1Creds);
    student1UserId = s1Reg.body.data.id;
    const s1Login = await request(app).post('/api/auth/login').send(s1Creds);
    student1Token = s1Login.body.data.accessToken;

    // 2. Create Student 2
    const s2Creds = {
      email: `student_ws2_${Date.now()}@test.edu`,
      password: 'Password123!',
    };
    const s2Reg = await request(app).post('/api/auth/register').send(s2Creds);
    student2UserId = s2Reg.body.data.id;
    const s2Login = await request(app).post('/api/auth/login').send(s2Creds);
    student2Token = s2Login.body.data.accessToken;

    // 3. Create Faculty (TPO)
    const facCreds = {
      email: `faculty_ws_${Date.now()}@test.edu`,
      password: 'Password123!',
    };
    const facReg = await request(app).post('/api/auth/register').send(facCreds);
    facultyUserId = facReg.body.data.id;
    await pool.query("UPDATE users SET role = 'faculty' WHERE id = $1", [facultyUserId]);
    const facLogin = await request(app).post('/api/auth/login').send(facCreds);
    facultyToken = facLogin.body.data.accessToken;

    // Seed/find a role and skill
    const roleRes = await pool.query('SELECT id FROM career_roles WHERE is_active = true LIMIT 1');
    testRoleId = roleRes.rows[0].id;

    const skillRes = await pool.query('SELECT id, name FROM skills WHERE is_active = true LIMIT 1');
    testSkillId = skillRes.rows[0].id;

    // Setup student 1 profile
    const p1Res = await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${student1Token}`)
      .send({
        full_name: 'Workspace Student 1',
        roll_number: `WS1-${Date.now().toString().slice(-4)}`,
        branch: 'CS',
        batch_year: 2025,
        target_role_id: testRoleId,
        profile_completed: true,
      });
    student1ProfileId = p1Res.body.data.id;

    // Setup student 2 profile
    const p2Res = await request(app)
      .post('/api/students/me')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({
        full_name: 'Workspace Student 2',
        roll_number: `WS2-${Date.now().toString().slice(-4)}`,
        branch: 'CS',
        batch_year: 2025,
        target_role_id: testRoleId,
        profile_completed: true,
      });
    student2ProfileId = p2Res.body.data.id;

    // Setup faculty profile (TPO for global review access)
    const fpRes = await pool.query(
      `INSERT INTO faculty_profiles (user_id, full_name, department, is_tpo)
       VALUES ($1, 'Prof. Mentor', 'Computer Science', true)
       RETURNING id`,
      [facultyUserId]
    );
    facultyProfileId = fpRes.rows[0].id;
  });

  afterAll(async () => {
    // Clean up
    if (student1UserId) {
      await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [
        student1UserId,
        student2UserId,
        facultyUserId,
      ]);
    }
    await pool.end();
  });

  // =========================================================================
  // 1. SKILL DETAIL & LEARNING TASKS WORKSPACE
  // =========================================================================
  describe('Skill Detail & Learning Tasks Progress', () => {
    it('GET /api/skills/:id/detail returns learning_tasks structure for authenticated student', async () => {
      const res = await request(app)
        .get(`/api/skills/${testSkillId}/detail`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('learning_tasks');
      expect(res.body.data.learning_tasks).toHaveProperty('tasks');
      expect(Array.isArray(res.body.data.learning_tasks.tasks)).toBe(true);
      expect(res.body.data.learning_tasks.tasks.length).toBeGreaterThan(0);
    });

    it('GET /api/students/skills/:skillId/tasks retrieves tasks with initial not_started statuses', async () => {
      const res = await request(app)
        .get(`/api/students/skills/${testSkillId}/tasks`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks.length).toBeGreaterThan(0);
      expect(res.body.data.tasks[0].status).toBe('not_started');
    });

    it('PUT /api/students/skills/:skillId/tasks/:taskKey updates progress to completed with reflection notes', async () => {
      const getRes = await request(app)
        .get(`/api/students/skills/${testSkillId}/tasks`)
        .set('Authorization', `Bearer ${student1Token}`);
      const taskKey = getRes.body.data.tasks[0].key;

      const res = await request(app)
        .put(`/api/students/skills/${testSkillId}/tasks/${taskKey}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          status: 'completed',
          notes: 'Finished practical exercises and passed all unit test cases.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(res.body.data.notes).toContain('Finished practical exercises');
      expect(res.body.data.completed_at).not.toBeNull();

      // Verify update reflects in overall tasks query
      const verifyRes = await request(app)
        .get(`/api/students/skills/${testSkillId}/tasks`)
        .set('Authorization', `Bearer ${student1Token}`);

      expect(verifyRes.body.data.completed_tasks).toBe(1);
    });

    it('rejects invalid task status with 400 Bad Request', async () => {
      const res = await request(app)
        .put(`/api/students/skills/${testSkillId}/tasks/some_task`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          status: 'invalid_status_value',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 2. STUDENT EVIDENCE PORTFOLIO
  // =========================================================================
  describe('Student Evidence Portfolio', () => {
    it('POST /api/students/evidence allows student to submit valid project evidence', async () => {
      const res = await request(app)
        .post('/api/students/evidence')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          skill_id: testSkillId,
          title: 'Full-Stack Portfolio Project',
          evidence_type: 'github_repo',
          description: 'Production-ready web application with PostgreSQL schema, relational queries, and automated testing.',
          url: 'https://github.com/student/placement-project',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.status).toBe('submitted');
      expect(res.body.data.title).toBe('Full-Stack Portfolio Project');
      testEvidenceId = res.body.data.id;
    });

    it('POST /api/students/evidence rejects invalid URL schemes', async () => {
      const res = await request(app)
        .post('/api/students/evidence')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          skill_id: testSkillId,
          title: 'Malicious Protocol Test',
          evidence_type: 'github_repo',
          description: 'Testing URL scheme validation.',
          url: 'ftp://insecure-host/file.zip',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('HTTP');
    });

    it('GET /api/students/evidence returns student submissions', async () => {
      const res = await request(app)
        .get('/api/students/evidence')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((e) => e.id === testEvidenceId)).toBe(true);
    });

    it('enforces student isolation: Student 2 cannot update or delete Student 1 evidence', async () => {
      const updateRes = await request(app)
        .put(`/api/students/evidence/${testEvidenceId}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          title: 'Hacked Title',
          description: 'Attempting cross-student tampering.',
        });

      expect(updateRes.status).toBe(403);

      const deleteRes = await request(app)
        .delete(`/api/students/evidence/${testEvidenceId}`)
        .set('Authorization', `Bearer ${student2Token}`);

      expect(deleteRes.status).toBe(403);
    });

    it('PUT /api/students/evidence/:id allows student 1 to update their submission', async () => {
      const res = await request(app)
        .put(`/api/students/evidence/${testEvidenceId}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          title: 'Full-Stack Portfolio Project (v2)',
          evidence_type: 'github_repo',
          description: 'Updated with detailed README, architecture diagrams, and test suite results.',
          url: 'https://github.com/student/placement-project',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Full-Stack Portfolio Project (v2)');
    });
  });

  // =========================================================================
  // 3. FACULTY EVIDENCE REVIEW WORKFLOW
  // =========================================================================
  describe('Faculty Evidence Review Workflow', () => {
    it('GET /api/faculty/evidence returns review queue for authorized faculty', async () => {
      const res = await request(app)
        .get('/api/faculty/evidence')
        .set('Authorization', `Bearer ${facultyToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((e) => e.id === testEvidenceId)).toBe(true);
    });

    it('PUT /api/faculty/evidence/:id/review rejects needs_improvement without feedback comment', async () => {
      const res = await request(app)
        .put(`/api/faculty/evidence/${testEvidenceId}/review`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'needs_improvement',
          faculty_feedback: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('feedback is required');
    });

    it('PUT /api/faculty/evidence/:id/review accepts valid review with feedback', async () => {
      const res = await request(app)
        .put(`/api/faculty/evidence/${testEvidenceId}/review`)
        .set('Authorization', `Bearer ${facultyToken}`)
        .send({
          status: 'accepted',
          faculty_feedback: 'Demonstrates solid proficiency in schema normalization and query optimization. Approved.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('accepted');
      expect(res.body.data.faculty_feedback).toContain('Demonstrates solid proficiency');
      expect(res.body.data.reviewed_at).not.toBeNull();
    });

    it('blocks student accounts from performing faculty reviews', async () => {
      const res = await request(app)
        .put(`/api/faculty/evidence/${testEvidenceId}/review`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          status: 'accepted',
          faculty_feedback: 'Self approval attempt.',
        });

      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // 4. ASSESSMENT REMEDIATION & EXPLANATION REVIEW
  // =========================================================================
  describe('Assessment Remediation & Question Explanations', () => {
    it('GET /api/assessments/attempts/:id/review returns explanations and concepts for completed test', async () => {
      // Start an attempt for Student 1
      const startRes = await request(app)
        .post('/api/assessments/start')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ skill_id: testSkillId });

      if (startRes.status === 201) {
        testAttemptId = startRes.body.data.id;
        const qRes = await request(app)
          .get(`/api/assessments/attempts/${testAttemptId}/questions`)
          .set('Authorization', `Bearer ${student1Token}`);

        const qs = qRes.body.data;
        const answers = qs.map((q) => ({
          question_id: q.id,
          selected_option_id: q.options[0]?.id,
        }));

        // Submit attempt
        await request(app)
          .post(`/api/assessments/attempts/${testAttemptId}/submit`)
          .set('Authorization', `Bearer ${student1Token}`)
          .send({ answers });

        // Retrieve full review
        const reviewRes = await request(app)
          .get(`/api/assessments/attempts/${testAttemptId}/review`)
          .set('Authorization', `Bearer ${student1Token}`);

        expect(reviewRes.status).toBe(200);
        expect(reviewRes.body.success).toBe(true);
        expect(reviewRes.body.data).toHaveProperty('attempt');
        expect(reviewRes.body.data).toHaveProperty('questions');
        expect(Array.isArray(reviewRes.body.data.questions)).toBe(true);

        const firstQ = reviewRes.body.data.questions[0];
        expect(firstQ).toHaveProperty('explanation');
        expect(firstQ).toHaveProperty('concept_tested');
        expect(firstQ).toHaveProperty('correct_option_text');
        expect(firstQ.explanation).not.toBeNull();
      }
    });
  });

  // =========================================================================
  // 5. ROADMAP INTEGRATION WITH TASKS & EVIDENCE
  // =========================================================================
  describe('Roadmap Integration', () => {
    it('GET /api/students/roadmap includes task and evidence metrics', async () => {
      const res = await request(app)
        .get('/api/students/roadmap')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('metrics');
      expect(res.body.data.metrics).toHaveProperty('tasks_completed');
      expect(res.body.data.metrics).toHaveProperty('evidence_accepted');
      expect(res.body.data.metrics.tasks_completed).toBeGreaterThanOrEqual(1);
    });
  });
});
