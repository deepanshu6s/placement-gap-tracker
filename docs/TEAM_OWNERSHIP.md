# Team Ownership & Work Allocation Matrix

## Smart Placement Readiness & Skill Gap Tracker

**Project Stack**: PERN (PostgreSQL 15 · Express.js · React 18 · Node.js)  
**Architecture Spec**: [`docs/architecture_spec_v1_1.md`](architecture_spec_v1_1.md) (Section 14)  
**Current Phase**: Phase 1 — Project Foundation

---

## 1. Five-Member Core Allocation Overview

| Role         | Domain / Focus                 | Functional Modules                                                   | Core Deliverable                                              |
| ------------ | ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Member 1** | Auth, Profile & Foundations    | M01 (Auth), M02 (Profiles)                                           | JWT authentication, RBAC, profiles, Day 1 stubs               |
| **Member 2** | Assessment & Scoring Engine    | M06 (Questions), M07 (Assessment), M08 (Scoring)                     | Question bank, session generator, timer & scoring             |
| **Member 3** | Skill Intelligence & Readiness | M03 (Roles), M04 (Skills), M05 (Mapping), M09 (Gap), M10 (Readiness) | Role catalogue, skill taxonomy, gap engine, readiness formula |
| **Member 4** | Preparation & Recommendations  | M11 (Preparation), M12 (Recommendations)                             | Activity logging, rule-based recommendation engine            |
| **Member 5** | Analytics & Shared UI Library  | M13 (Student Analytics), M14 (Faculty Analytics), UI Kit             | Charts, batch metrics, intervention lists, primitive UI kit   |

---

## 2. Detailed Member Specifications

### Member 1: Authentication + Student Profile + Authorization

- **Modules Owned**:
  - `M01`: Authentication & Authorization (JWT access + refresh token rotation, bcrypt hashing)
  - `M02`: User & Student Profile Management (Profiles, faculty scope model)
- **Frontend Ownership**:
  - `src/features/auth/` (`LoginForm`, `RegisterForm`, `useLogin`, `useRegister`, `useLogout`)
  - `src/features/profile/` (`ProfileForm`, `ProfileCard`, `RoleSelectorDropdown`, `useProfile`, `useTargetRole`)
  - `src/pages/auth/LoginPage.jsx`, `RegisterPage.jsx`
  - `src/pages/student/ProfilePage.jsx`
  - `src/layouts/AuthLayout.jsx`, `StudentLayout.jsx`, `FacultyLayout.jsx`
  - `src/routes/ProtectedRoute.jsx`, `RoleRoute.jsx`, `src/routes/index.jsx` (frozen after Phase 2)
  - `src/store/authStore.js`, `src/services/authService.js`, `src/services/studentService.js`, `src/services/api.js`
- **Backend Ownership**:
  - `src/routes/auth.routes.js`, `src/routes/student.routes.js`
  - `src/controllers/auth.controller.js`, `src/controllers/student.controller.js`
  - `src/services/auth.service.js`, `src/services/student.service.js`
  - `src/repositories/user.repository.js`, `src/repositories/student.repository.js`, `src/repositories/faculty.repository.js`
  - `src/middleware/authenticate.js`, `src/middleware/authorize.js`
  - `src/validators/auth.validators.js`, `src/validators/student.validators.js`
  - `src/utils/jwt.utils.js`, `src/utils/hash.utils.js`
- **Database Ownership**:
  - Tables: `users`, `refresh_tokens`, `student_profiles`, `faculty_profiles`, `faculty_batch_scope`
- **API Ownership**:
  - `/api/auth/*` (register, login, refresh, logout, me)
  - `/api/students/*` (profile CRUD, target-role, faculty-scoped list/view)
- **Dependencies**:
  - Independent. Unblocks other team members.
- **Integration Responsibilities**:
  - Deliver `middleware/authenticate.stub.js` and `src/services/api.js` on Day 1 of development.
  - Publish authenticated `req.user` shape (`{ id, role, studentProfileId }`).
- **Definition of Done**:
  - Student registration strictly forces `role = 'student'` (PHA-15).
  - JWT access tokens (15m in memory) + httpOnly refresh tokens (7d rotated) work securely.
  - Profile completion accurately calculated and verified.
  - > 75% test coverage for auth and profile services.

---

### Member 2: Question Bank + Assessment Engine + Scoring

- **Modules Owned**:
  - `M06`: Question Bank Management (MCQs with difficulty levels, options)
  - `M07`: Assessment Engine (Session generation, difficulty quota, cooldown)
  - `M08`: Assessment Attempts & Scoring (Submission, atomic scoring, history)
- **Frontend Ownership**:
  - `src/features/assessment/` (`AssessmentCard`, `QuestionCard`, `Timer`, `ProgressBar`, `useAssessmentSession`, `useSubmitAttempt`, `useCooldown`, `assessmentStore.js`)
  - `src/pages/student/AssessmentListPage.jsx`, `AssessmentSessionPage.jsx`, `AssessmentResultPage.jsx`
  - `src/pages/faculty/QuestionBankPage.jsx`
  - `src/services/assessmentService.js`
- **Backend Ownership**:
  - `src/routes/question.routes.js`, `src/routes/assessment.routes.js`
  - `src/controllers/question.controller.js`, `src/controllers/assessment.controller.js`
  - `src/services/question.service.js`, `src/services/assessment.service.js`, `src/services/scoring.service.js`
  - `src/repositories/question.repository.js`, `src/repositories/questionOption.repository.js`, `src/repositories/assessmentConfig.repository.js`, `src/repositories/attempt.repository.js`, `src/repositories/attemptQuestion.repository.js`, `src/repositories/attemptAnswer.repository.js`, `src/repositories/skillScore.repository.js`
  - `src/validators/question.validators.js`, `src/validators/assessment.validators.js`
  - `src/utils/scoring.utils.js`
- **Database Ownership**:
  - Tables: `questions`, `question_options`, `assessment_configs`, `assessment_attempts`, `attempt_questions`, `attempt_answers`, `student_skill_scores`
- **API Ownership**:
  - `/api/questions/*` (CRUD for questions and options, faculty only)
  - `/api/assessments/*` (config, cooldown, start, session questions, submit, history, result)
- **Dependencies**:
  - Depends on Member 1 (auth middleware, student profiles), Member 3 (skills catalog, `SkillGapService.recompute`).
- **Integration Responsibilities**:
  - In `ScoringService`, orchestrate post-submission transaction and trigger `SkillGapService.recompute(studentId, roleId)`.
  - Never expose `is_correct` to students in session payloads.
  - Enforce backend server timer checks on `/submit` (HTTP 422 if late).
  - Enforce partial unique index `(student_id, skill_id) WHERE status = 'in_progress'`.
- **Definition of Done**:
  - Zero double submissions possible (atomic 409 conflict check).
  - Assessment attempts snapshot served questions.
  - Verification that selected option belongs to question in backend.
  - `student_skill_scores` properly updates `current_score` and `best_score` (PHA-D06).

---

### Member 3: Career Roles + Skills + Skill Gap + Readiness Engine

- **Modules Owned**:
  - `M03`: Career Role Management (Catalogue and requirements)
  - `M04`: Skill Management (Global taxonomies)
  - `M05`: Role-Skill Mapping (Proficiency benchmarks and weights 1–5)
  - `M09`: Skill Gap Engine (Gap calculation, `is_assessed` flag, threshold categories)
  - `M10`: Readiness Score Engine (Role-relative readiness ratio formula, history)
- **Frontend Ownership**:
  - `src/features/skillGap/` (`GapBadge`, `SkillGapTable`, `ReadinessGauge`, `RadarChart`, `useSkillGaps`, `useReadinessScore`)
  - `src/pages/student/SkillGapPage.jsx`, `ReadinessPage.jsx`
  - `src/pages/faculty/RoleManagementPage.jsx`, `SkillManagementPage.jsx`
  - `src/services/roleService.js`, `src/services/skillService.js`, `src/services/skillGapService.js`, `src/services/readinessService.js`
- **Backend Ownership**:
  - `src/routes/role.routes.js`, `src/routes/skill.routes.js`, `src/routes/skillGap.routes.js`, `src/routes/readiness.routes.js`
  - `src/controllers/role.controller.js`, `src/controllers/skill.controller.js`, `src/controllers/skillGap.controller.js`, `src/controllers/readiness.controller.js`
  - `src/services/role.service.js`, `src/services/skill.service.js`, `src/services/skillGap.service.js`, `src/services/readiness.service.js`
  - `src/repositories/role.repository.js`, `src/repositories/roleSkill.repository.js`, `src/repositories/skill.repository.js`, `src/repositories/skillGap.repository.js`, `src/repositories/readiness.repository.js`
  - `src/validators/role.validators.js`
- **Database Ownership**:
  - Tables: `career_roles`, `skills`, `role_skill_requirements`, `skill_gaps`, `readiness_scores`, `readiness_score_history`
- **API Ownership**:
  - `/api/roles/*` (catalogue, requirements mapping, soft deactivation)
  - `/api/skills/*` (catalogue CRUD, question count)
  - `/api/skill-gaps/*` (student own gaps, manual recompute, faculty view)
  - `/api/readiness/*` (current score, historical timeline, faculty view)
- **Dependencies**:
  - Depends on Member 1 (auth) and Member 2 (`student_skill_scores`).
- **Integration Responsibilities**:
  - Expose callable interface `SkillGapService.recompute(studentId, roleId)`.
  - Chain `ReadinessService.recompute(studentId, roleId)` after gaps update.
  - Implement zero-skills edge case returning `readiness_score = NULL` and status `ROLE_HAS_NO_SKILLS` (PHA-07).
  - Accurately maintain `is_assessed` boolean to distinguish unassessed skills from score 0.
- **Definition of Done**:
  - Mathematical readiness formula matches specification exactly:
    $r_i = \min(\text{current\_score}_i, \text{required}_i) / \text{required}_i$; $\text{RS} = 100 \times \sum (r_i w_i) / \sum w_i$.
  - Gap categories accurately match thresholds: `none` (0), `small` (1–15), `medium` (16–35), `critical` (36–100).
  - Readiness history appends correctly on each change.

---

### Member 4: Preparation Tracker + Recommendation Engine

- **Modules Owned**:
  - `M11`: Preparation Tracker (Student self-directed activity logging)
  - `M12`: Recommendation Engine (Deterministic rule-based prioritization)
- **Frontend Ownership**:
  - `src/features/preparation/` (`ActivityLogForm`, `ActivityList`, `usePreparation`)
  - `src/features/recommendations/` (`RecommendationCard`, `PriorityBadge`, `useRecommendations`)
  - `src/pages/student/PreparationPage.jsx`, `RecommendationsPage.jsx`
  - `src/services/preparationService.js`, `src/services/recommendationService.js`
- **Backend Ownership**:
  - `src/routes/preparation.routes.js`, `src/routes/recommendation.routes.js`
  - `src/controllers/preparation.controller.js`, `src/controllers/recommendation.controller.js`
  - `src/services/preparation.service.js`, `src/services/recommendation.service.js`
  - `src/repositories/preparation.repository.js`, `src/repositories/recommendation.repository.js`
  - `src/validators/preparation.validators.js`
- **Database Ownership**:
  - Tables: `preparation_activities`, `recommendations`
- **API Ownership**:
  - `/api/preparation/*` (log activity, edit, delete, student private log view)
  - `/api/recommendations/*` (view active, trigger refresh, dismiss)
- **Dependencies**:
  - Depends on Member 1 (auth), Member 2 (attempt history for score drop Rule R07), Member 3 (skill gaps and role skill requirements).
- **Integration Responsibilities**:
  - Expose `RecommendationService.generate(studentId, roleId)` called asynchronously after assessments/role changes.
  - Enforce maximum 10 active recommendations per student per role (PHA-10).
  - Enforce partial unique indexes for recommendation upserts.
  - Enforce privacy boundary: do not expose student preparation URLs or detailed logs to faculty endpoints (PHA-11).
- **Definition of Done**:
  - 8 rules evaluated in strict precedence order with conflict suppression (e.g. R06 suppressed if R03 fired).
  - Full IDOR ownership enforcement on update/delete of preparation logs.
  - URL format validated before storage.

---

### Member 5: Student Analytics + Faculty/TPO Analytics + UI Library

- **Modules Owned**:
  - `M13`: Student Analytics (Readiness trends, prep summaries, attempt history)
  - `M14`: Faculty & TPO Analytics (Cohort distributions, skill gap heatmaps, intervention flags)
  - Shared UI Primitive Library (`components/ui/`)
- **Frontend Ownership**:
  - `src/components/ui/` (`Button`, `Card`, `Badge`, `Modal`, `Spinner`, `Input`, `Alert`)
  - `src/components/charts/` (Recharts wrappers: Radar, Line, Bar, Gauge)
  - `src/features/studentAnalytics/` (`ScoreHistoryChart`, `PrepSummaryChart`, `AssessmentHistoryTable`, `useStudentAnalytics`)
  - `src/features/facultyAnalytics/` (`BatchDistributionChart`, `SkillGapHeatmap`, `InterventionTable`, `useFacultyAnalytics`, `useBatchOverview`, `useInterventionList`)
  - `src/pages/student/DashboardPage.jsx` (integration coordinator)
  - `src/pages/faculty/FacultyDashboardPage.jsx`, `BatchOverviewPage.jsx`, `StudentDetailPage.jsx`
  - `src/store/uiStore.js`, `src/context/ThemeContext.jsx`, `src/services/analyticsService.js`, `src/services/facultyService.js`
- **Backend Ownership**:
  - `src/routes/analytics.routes.js`, `src/routes/faculty.routes.js`
  - `src/controllers/analytics.controller.js`, `src/controllers/faculty.controller.js`
  - `src/services/analytics.service.js`, `src/services/facultyAnalytics.service.js`
- **Database Ownership**:
  - Read-only across all tables; owns analytics aggregation queries and views.
- **API Ownership**:
  - `/api/analytics/me/*` (overview, skill progress, assessment history, preparation summary)
  - `/api/faculty/analytics/*` (batch overview, skill gaps summary, intervention list, student analytics drilldown)
- **Dependencies**:
  - Reads data produced by Members 1, 2, 3, and 4.
- **Integration Responsibilities**:
  - Coordinate student dashboard widget assembly in Phase 6.
  - Provide shared UI primitives on Day 1 of Phase 1 for all members.
  - Enforce faculty scope (`faculty_batch_scope`) on all faculty analytics queries.
  - Present only aggregate preparation metrics for students to faculty (PHA-11).
- **Definition of Done**:
  - Responsive, wow-factor dashboards with Recharts.
  - Intervention list accurately detects students with $\ge 3$ critical skill gaps.
  - All queries optimized to prevent N+1 performance pitfalls.

---

## 3. Shared Files & Coordination Protocol

| Shared File / Area              | Primary Coordinator | Impacted Members | Coordination Rule                                                 |
| ------------------------------- | ------------------- | ---------------- | ----------------------------------------------------------------- |
| `backend/src/routes/index.js`   | Member 1            | All Members      | Mounts sub-routers; coordinate route prefixes                     |
| `backend/src/config/db.js`      | Member 1            | All Members      | Database pool config; do not modify without consensus             |
| `frontend/src/routes/index.jsx` | Member 1            | All Members      | Central router tree; frozen after Phase 2                         |
| `frontend/src/components/ui/`   | Member 5            | All Members      | Foundation UI components; backwards-compatible prop changes only  |
| `API_CONTRACTS.md`              | Lead / Member 1     | All Members      | Any request/response contract change requires updating this first |
| `DECISIONS.md`                  | Team Consensus      | All Members      | Authoritative record of architectural decisions                   |
