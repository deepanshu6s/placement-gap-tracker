# API Contracts Standard & Registry

## Smart Placement Readiness & Skill Gap Tracker

**Baseline Specification**: [`docs/architecture_spec_v1_1.md`](docs/architecture_spec_v1_1.md) (Section 10 & 11)  
**Current Phase**: Phase 1 — Project Foundation  
**Status**: All feature endpoints are **PLANNED** (Only `GET /api/health` is IMPLEMENTED in Phase 1)

---

## 1. Global API Contract Standards

### Request Standards

- **Content-Type**: `application/json`
- **Authentication**: `Authorization: Bearer <access_token>` in header (except public endpoints).
- **Self-referential Convention**: Uses `/me` (e.g., `/api/skill-gaps/me`, `/api/readiness/me`, `/api/preparation/me`).
- **Input Validation**: Every request body and query param is strictly validated using Zod schemas before hitting controllers.
- **Deactivation**: Soft deletes must use `PATCH /:id/deactivate`, never HTTP `DELETE` for major catalogue items.

### Response Format Standard

#### Single Resource Success (HTTP 200 / 201)

```json
{
  "success": true,
  "data": {
    "id": "c1f7b022-7dfd-4b96-b09e-7fa76f571b05",
    "name": "Frontend Developer"
  },
  "error": null
}
```

#### Paginated List Success (HTTP 200)

```json
{
  "success": true,
  "data": [{ "id": "uuid-1", "name": "Item 1" }],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45
  },
  "error": null
}
```

#### Error Response (HTTP 4xx / 5xx)

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input provided",
    "details": [{ "field": "email", "message": "Email address is invalid" }]
  }
}
```

---

## 2. Foundation Route (IMPLEMENTED)

| Method | Endpoint      | Owner         | Auth Level | Purpose                                              | Status          |
| ------ | ------------- | ------------- | ---------- | ---------------------------------------------------- | --------------- |
| `GET`  | `/api/health` | Lead / Shared | Public     | Server liveness & database connectivity verification | **IMPLEMENTED** |

---

## 3. Route Groups Registry (PLANNED for Phase 2+)

### Group 1: `/api/auth` (Owner: Member 1)

| Method | Endpoint             | Auth Level      | Purpose                                                            | Status      |
| ------ | -------------------- | --------------- | ------------------------------------------------------------------ | ----------- |
| `POST` | `/api/auth/register` | Public          | Register as student (role forced to `student`)                     | **PLANNED** |
| `POST` | `/api/auth/login`    | Public          | Login with credentials, issues JWT access + httpOnly refresh token | **PLANNED** |
| `POST` | `/api/auth/refresh`  | Public (Cookie) | Exchange refresh cookie for new access token                       | **PLANNED** |
| `POST` | `/api/auth/logout`   | Authenticated   | Revoke refresh token and clear cookie                              | **PLANNED** |
| `GET`  | `/api/auth/me`       | Authenticated   | Fetch authenticated user info (`id`, `email`, `role`)              | **PLANNED** |

---

### Group 2: `/api/students` (Owner: Member 1)

| Method | Endpoint                    | Auth Level | Purpose                                                    | Status      |
| ------ | --------------------------- | ---------- | ---------------------------------------------------------- | ----------- |
| `GET`  | `/api/students/profile`     | Student    | Get own profile (branch, batch year, CGPA, target role)    | **PLANNED** |
| `PUT`  | `/api/students/profile`     | Student    | Update own profile details                                 | **PLANNED** |
| `PUT`  | `/api/students/target-role` | Student    | Select or change target career role                        | **PLANNED** |
| `GET`  | `/api/students`             | Faculty    | List students scoped to faculty's `(batch_year, branch)`   | **PLANNED** |
| `GET`  | `/api/students/:id`         | Faculty    | View a specific student's profile (scoped, IDOR-protected) | **PLANNED** |

---

### Group 3: `/api/roles` (Owner: Member 3)

| Method   | Endpoint                             | Auth Level    | Purpose                                                 | Status      |
| -------- | ------------------------------------ | ------------- | ------------------------------------------------------- | ----------- |
| `GET`    | `/api/roles`                         | Authenticated | List all active career roles                            | **PLANNED** |
| `GET`    | `/api/roles/:id`                     | Authenticated | Get career role details                                 | **PLANNED** |
| `POST`   | `/api/roles`                         | Faculty       | Create new career role                                  | **PLANNED** |
| `PUT`    | `/api/roles/:id`                     | Faculty       | Update role metadata                                    | **PLANNED** |
| `PATCH`  | `/api/roles/:id/deactivate`          | Faculty       | Soft-deactivate career role                             | **PLANNED** |
| `GET`    | `/api/roles/:roleId/skills`          | Authenticated | Get skill requirements mapped to a role                 | **PLANNED** |
| `POST`   | `/api/roles/:roleId/skills`          | Faculty       | Map a skill requirement with weight and level to a role | **PLANNED** |
| `PUT`    | `/api/roles/:roleId/skills/:skillId` | Faculty       | Update skill weight/level for a role                    | **PLANNED** |
| `DELETE` | `/api/roles/:roleId/skills/:skillId` | Faculty       | Remove skill requirement from a role                    | **PLANNED** |

---

### Group 4: `/api/skills` (Owner: Member 3)

| Method  | Endpoint                         | Auth Level    | Purpose                                   | Status      |
| ------- | -------------------------------- | ------------- | ----------------------------------------- | ----------- |
| `GET`   | `/api/skills`                    | Authenticated | List global skill catalogue               | **PLANNED** |
| `GET`   | `/api/skills/:id`                | Authenticated | Get skill details                         | **PLANNED** |
| `GET`   | `/api/skills/:id/question-count` | Faculty       | Check question distribution by difficulty | **PLANNED** |
| `POST`  | `/api/skills`                    | Faculty       | Create new skill                          | **PLANNED** |
| `PUT`   | `/api/skills/:id`                | Faculty       | Update skill information                  | **PLANNED** |
| `PATCH` | `/api/skills/:id/deactivate`     | Faculty       | Soft-deactivate skill                     | **PLANNED** |

---

### Group 5: `/api/questions` (Owner: Member 2)

| Method  | Endpoint                        | Auth Level | Purpose                                            | Status      |
| ------- | ------------------------------- | ---------- | -------------------------------------------------- | ----------- |
| `GET`   | `/api/questions`                | Faculty    | List questions filtered by skill_id and difficulty | **PLANNED** |
| `GET`   | `/api/questions/:id`            | Faculty    | Get question and options (including `is_correct`)  | **PLANNED** |
| `POST`  | `/api/questions`                | Faculty    | Create question with options (atomic validation)   | **PLANNED** |
| `PUT`   | `/api/questions/:id`            | Faculty    | Update question and options                        | **PLANNED** |
| `PATCH` | `/api/questions/:id/deactivate` | Faculty    | Soft-deactivate question                           | **PLANNED** |

---

### Group 6: `/api/assessments` (Owner: Member 2)

| Method | Endpoint                              | Auth Level    | Purpose                                                    | Status      |
| ------ | ------------------------------------- | ------------- | ---------------------------------------------------------- | ----------- |
| `GET`  | `/api/assessments/config/:skillId`    | Authenticated | Get assessment configuration parameters                    | **PLANNED** |
| `POST` | `/api/assessments/config`             | Faculty       | Create assessment configuration for a skill                | **PLANNED** |
| `PUT`  | `/api/assessments/config/:skillId`    | Faculty       | Update assessment config parameters                        | **PLANNED** |
| `GET`  | `/api/assessments/cooldown/:skillId`  | Student       | Check cooldown status and remaining wait time              | **PLANNED** |
| `POST` | `/api/assessments/start/:skillId`     | Student       | Start session (generates attempt with random questions)    | **PLANNED** |
| `GET`  | `/api/assessments/session/:attemptId` | Student       | Fetch questions for active session (`is_correct` excluded) | **PLANNED** |
| `POST` | `/api/assessments/submit/:attemptId`  | Student       | Submit answers; enforces backend timer; updates score      | **PLANNED** |
| `GET`  | `/api/assessments/history`            | Student       | Fetch student's completed attempt history                  | **PLANNED** |
| `GET`  | `/api/assessments/result/:attemptId`  | Student       | Fetch score and breakdown for a completed attempt          | **PLANNED** |

---

### Group 7: `/api/skill-gaps` (Owner: Member 3)

| Method | Endpoint                              | Auth Level | Purpose                                               | Status      |
| ------ | ------------------------------------- | ---------- | ----------------------------------------------------- | ----------- |
| `GET`  | `/api/skill-gaps/me`                  | Student    | Fetch student skill gaps against active target role   | **PLANNED** |
| `POST` | `/api/skill-gaps/recompute`           | Student    | Trigger recalculation of skill gaps                   | **PLANNED** |
| `GET`  | `/api/skill-gaps/students/:studentId` | Faculty    | View student's gaps (scoped to assigned batch/branch) | **PLANNED** |

---

### Group 8: `/api/readiness` (Owner: Member 3)

| Method | Endpoint                             | Auth Level | Purpose                                                       | Status      |
| ------ | ------------------------------------ | ---------- | ------------------------------------------------------------- | ----------- |
| `GET`  | `/api/readiness/me`                  | Student    | Current readiness score (returns NULL if zero skills, PHA-07) | **PLANNED** |
| `GET`  | `/api/readiness/me/history`          | Student    | Historical readiness timeline for progress tracking           | **PLANNED** |
| `GET`  | `/api/readiness/students/:studentId` | Faculty    | View a specific student's readiness score (scoped)            | **PLANNED** |

---

### Group 9: `/api/preparation` (Owner: Member 4)

| Method   | Endpoint               | Auth Level | Purpose                                             | Status      |
| -------- | ---------------------- | ---------- | --------------------------------------------------- | ----------- |
| `GET`    | `/api/preparation/me`  | Student    | View own activity log with URLs and notes (private) | **PLANNED** |
| `POST`   | `/api/preparation`     | Student    | Log new study/practice activity                     | **PLANNED** |
| `PUT`    | `/api/preparation/:id` | Student    | Update existing prep activity (IDOR verified)       | **PLANNED** |
| `DELETE` | `/api/preparation/:id` | Student    | Delete prep activity (IDOR verified)                | **PLANNED** |

---

### Group 10: `/api/recommendations` (Owner: Member 4)

| Method  | Endpoint                           | Auth Level | Purpose                                     | Status      |
| ------- | ---------------------------------- | ---------- | ------------------------------------------- | ----------- |
| `GET`   | `/api/recommendations/me`          | Student    | Get active recommendations (max 10, PHA-10) | **PLANNED** |
| `POST`  | `/api/recommendations/refresh`     | Student    | Refresh recommendations (rate-limited 1/hr) | **PLANNED** |
| `PATCH` | `/api/recommendations/:id/dismiss` | Student    | Dismiss an active recommendation            | **PLANNED** |

---

### Group 11: `/api/analytics` (Student-facing) (Owner: Member 5)

| Method | Endpoint                                | Auth Level | Purpose                                                | Status      |
| ------ | --------------------------------------- | ---------- | ------------------------------------------------------ | ----------- |
| `GET`  | `/api/analytics/me/overview`            | Student    | High-level summary (readiness, gaps count, prep hours) | **PLANNED** |
| `GET`  | `/api/analytics/me/skill-progress`      | Student    | Skill score progression over time                      | **PLANNED** |
| `GET`  | `/api/analytics/me/assessment-history`  | Student    | Full chronological assessment attempts table           | **PLANNED** |
| `GET`  | `/api/analytics/me/preparation-summary` | Student    | Weekly and skill-wise preparation hours distribution   | **PLANNED** |

---

### Group 12: `/api/faculty` (Faculty/TPO analytics) (Owner: Member 5)

| Method | Endpoint                                     | Auth Level | Purpose                                                              | Status      |
| ------ | -------------------------------------------- | ---------- | -------------------------------------------------------------------- | ----------- |
| `GET`  | `/api/faculty/analytics/batch-overview`      | Faculty    | Batch readiness distribution & cohort metrics (scoped)               | **PLANNED** |
| `GET`  | `/api/faculty/analytics/skill-gaps`          | Faculty    | Aggregate skill gaps across cohort                                   | **PLANNED** |
| `GET`  | `/api/faculty/analytics/intervention-list`   | Faculty    | Students flagged with critical gaps (≥ 3 critical gaps)              | **PLANNED** |
| `GET`  | `/api/faculty/analytics/students/:studentId` | Faculty    | Detailed analytics for student (scoped; aggregate prep only, PHA-11) | **PLANNED** |
