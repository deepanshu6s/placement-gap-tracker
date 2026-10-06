# Smart Placement Readiness & Skill Gap Tracker
## Architecture Specification v1.1 — Approved Final
**Stack**: PERN (PostgreSQL 15 · Express · React 18 · Node)
**Version**: 1.1 — Approved Final
**Date**: 2026-10-06
**Based on**: v1.0 corrected by architecture_review.md findings and approved in DECISIONS.md
**Status**: APPROVED — All 6 PHA items resolved and recorded in DECISIONS.md

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Functional Modules](#3-functional-modules)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Database Design — 20 Operational Tables](#5-database-design--20-operational-tables)
6. [ER Diagram](#6-er-diagram)
7. [Readiness Score Design (Corrected)](#7-readiness-score-design-corrected)
8. [Skill Gap Design](#8-skill-gap-design)
9. [Recommendation Engine](#9-recommendation-engine)
10. [API Architecture](#10-api-architecture)
11. [API Contract Standard](#11-api-contract-standard)
12. [Frontend Architecture](#12-frontend-architecture)
13. [Backend Architecture](#13-backend-architecture)
14. [Team Architecture (Corrected)](#14-team-architecture-corrected)
15. [Development Phases (Corrected — Parallel)](#15-development-phases-corrected--parallel)
16. [Git/GitHub Collaboration Strategy](#16-gitgithub-collaboration-strategy)
17. [Security Architecture](#17-security-architecture)
18. [Testing Strategy](#18-testing-strategy)
19. [Deployment Architecture](#19-deployment-architecture)
20. [Risks & Mitigations](#20-risks--mitigations)
21. [Scope Definitions](#21-scope-definitions)
22. [Technology Stack (Final)](#22-technology-stack-final)
23. [Edge-Case Behavior Reference](#23-edge-case-behavior-reference)
24. [Performance & Index Design](#24-performance--index-design)
25. [Future ML Integration Scope](#25-future-ml-integration-scope)
26. [Final Blueprint](#26-final-blueprint)
27. [Approved Decisions Register](#27-approved-decisions-register)

---

## 1. System Overview

The **Smart Placement Readiness & Skill Gap Tracker** is a full-stack web platform that helps students measure their readiness for campus placement drives. It operationalizes:

```
Assess → Analyze → Identify Gap → Recommend → Practice → Reassess → Measure Improvement
```

### End-to-end workflow

1. **Registration & Profile**: Student registers → completes profile (branch, batch year, CGPA) → selects a target career role.
2. **Assessment**: Student takes MCQ-based skill assessments. The backend selects questions by difficulty band, enforces a time limit, and scores the submission atomically.
3. **Gap Analysis**: The Skill Gap Engine computes `gap = max(0, required_level − current_score)` for every skill in the target role. Unassessed skills are flagged separately.
4. **Readiness Score**: A single composite score (0–100) computed as a weighted average of per-skill readiness ratios relative to role requirements. If the student meets all requirements, the score is 100.
5. **Recommendations**: A deterministic rule-based engine generates prioritized, actionable recommendations based on gap severity, skill weight, and preparation history.
6. **Preparation Tracking**: Student manually logs study activities.
7. **Faculty/TPO Dashboard**: Batch-level readiness distributions, common skill gaps, and intervention lists — all scoped to the faculty's assigned batches.

### Architectural principles
- **Strict layering**: Route → Controller → Service → Repository → PostgreSQL. No layer skips.
- **Stateless API**: All state in PostgreSQL. Backend is horizontally scalable.
- **Rule-based intelligence only in MVP**: All formulas are deterministic and auditable.
- **Database as first line of defense**: All business invariants that PostgreSQL can enforce, it does.
- **ML-ready schema**: The schema collects sufficient data for future ML without adding ML now.

---

## 2. User Roles & Permissions

### 2.1 Student

| Permission | Allowed? | Notes |
|---|---|---|
| Register and login | ✅ | Role hard-coded to `student` on registration |
| Create and edit own profile | ✅ | |
| Select target career role | ✅ | One at a time |
| Take skill assessments | ✅ | Subject to cooldown |
| View own skill gaps and readiness score | ✅ | |
| Log preparation activities | ✅ | |
| View personalized recommendations | ✅ | |
| View own analytics and progress | ✅ | |
| View other students' data | ❌ | |
| Manage questions, roles, or skills | ❌ | |
| Access faculty dashboard | ❌ | |

**Cooldown**: A student may retake a skill assessment only after `cooldown_hours` have elapsed since their last completed or timed-out attempt for that skill (configurable per skill, default 24h).

### 2.2 Faculty / TPO

| Permission | Allowed? | Notes |
|---|---|---|
| Login | ✅ | Account created by seed script (no self-registration) |
| View batch-level analytics | ✅ | Scoped to assigned batches/branches |
| View individual student readiness scores | ✅ | Scoped |
| Identify students needing intervention | ✅ | Scoped |
| Create/edit career roles | ✅ | |
| Create/edit skills and role-skill mappings | ✅ | |
| Manage MCQ questions | ✅ | |
| Configure assessment parameters per skill | ✅ | |
| View student's detailed preparation activities | ❌ | **[PHA-11: APPROVED]** Aggregate preparation metrics only; no access to student resource URLs, descriptions, or individual private log rows |
| Edit student profile data | ❌ | |
| Take assessments | ❌ | |
| Self-register | ❌ | Accounts created via seed/admin only |

**Scope**: Faculty is scoped to specific `(batch_year, branch)` pairs in `faculty_batch_scope`. TPO (`is_tpo = true`) bypasses scope checks and can see all students. Scope enforced at repository layer.

### 2.3 Admin
No admin UI in MVP. Admin actions are performed via seed scripts and direct DB access. A future admin panel is optional (Phase 12+).

---

## 3. Functional Modules

| ID | Module | Owner | Description |
|---|---|---|---|
| M01 | Authentication & Authorization | M1 | JWT registration/login/refresh/logout, authenticate/authorize middleware |
| M02 | User & Student Profile | M1 | Student profile CRUD, faculty profile, faculty batch scope |
| M03 | Career Role Management | M3 | Career role CRUD, soft deactivation |
| M04 | Skill Management | M3 | Global skill catalogue CRUD |
| M05 | Role-Skill Mapping | M3 | required_level and weight per (role, skill) |
| M06 | Question Bank | M2 | MCQ question and option CRUD, faculty-only |
| M07 | Assessment Engine | M2 | Session generation, question selection by difficulty band |
| M08 | Assessment Attempts & Scoring | M2 | Attempt tracking, submission, scoring, skill score update |
| M09 | Skill Gap Engine | M3 | Gap computation, classification, `is_assessed` tracking |
| M10 | Readiness Score Engine | M3 | Role-relative weighted readiness formula, history |
| M11 | Preparation Tracker | M4 | Student activity log CRUD |
| M12 | Recommendation Engine | M4 | Rule-based recommendation generation with precedence |
| M13 | Student Analytics | M5 | Time-series charts for student dashboard |
| M14 | Faculty/TPO Analytics | M5 | Batch-level aggregations, intervention list |

### Module communication rules
- Cross-module calls use direct service imports (not HTTP self-calls).
- `ScoringService` (M2) calls `SkillGapService.recompute(studentId, roleId)` (M3) after a transaction commits.
- `SkillGapService` (M3) calls `ReadinessService.recompute(studentId, roleId)` (M3) immediately after.
- `RecommendationService` (M4) is triggered asynchronously after the gap/readiness recomputation settles.
- M5 reads from all tables but never writes to any other module's tables.

---

## 4. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│  React 18 + Vite  │  Tailwind CSS  │  React Router v6             │
│  Axios            │  TanStack React Query  │  Zustand              │
│  Recharts (charts only)                                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  HTTPS / REST / JSON
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS API LAYER                             │
│  CORS  │  Helmet  │  express-rate-limit  │  Morgan  │  body-parser │
│  Routes: /api/auth  /api/students  /api/roles  /api/skills         │
│          /api/assessments  /api/questions  /api/skill-gaps         │
│          /api/readiness  /api/preparation  /api/recommendations     │
│          /api/analytics  /api/faculty                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
              ┌────────────────▼──────────────────┐
              │         MIDDLEWARE PIPELINE        │
              │  authenticate() → authorize([])   │
              │  validateRequest(zodSchema)        │
              │  rateLimiter (per-route)           │
              └────────────────┬──────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER (Business Logic)                   │
│  AuthService  StudentService  RoleService  SkillService            │
│  AssessmentService  ScoringService  SkillGapService               │
│  ReadinessService  PreparationService  RecommendationService       │
│  AnalyticsService  FacultyAnalyticsService                        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER (Data Access)                  │
│  All SQL via node-postgres parameterized queries ($1, $2, ...)     │
│  No string interpolation. No ORM.                                  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                       │
│  PostgreSQL 15 │ pg-pool │ node-pg-migrate (migrations)           │
└─────────────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │  FUTURE ML SERVICE (Phase 12+ only) │
  │  Python + FastAPI                   │
  │  Called via HTTP from Express       │
  │  Falls back to rule-based on error  │
  └──────────────────────────────────────┘
```

### Dependency Direction Rule (never violate)
```
Route → Controller → Service → Repository → PostgreSQL
                  ↑
          (Service may call other Services — one direction only, no cycles)
```

---

## 5. Database Design — 20 Operational Tables

> **Design principles**:
> - Third Normal Form (3NF) throughout.
> - Cached/derived values (`skill_gaps`, `readiness_scores`) are clearly labelled.
> - All FKs explicitly declared with correct ON DELETE rules.
> - All timestamps use `TIMESTAMPTZ`.
> - Soft deletes use `is_active BOOLEAN` (not `deleted_at`).
> - Every business invariant that PostgreSQL can enforce, it does.

---

### Table 1: `users`
**Purpose**: Master user record for all roles.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `email` | `VARCHAR(255)` | UNIQUE NOT NULL |
| `password_hash` | `TEXT` | NOT NULL |
| `role` | `ENUM('student','faculty','admin')` | NOT NULL |
| `is_active` | `BOOLEAN` | NOT NULL DEFAULT true |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**Security note**: `role` is NEVER set from the client request body. Registration hard-codes `role = 'student'`. Faculty accounts are inserted via seed script.

---

### Table 2: `refresh_tokens`
**Purpose**: Server-side refresh token storage for logout and token rotation.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → `users.id` ON DELETE CASCADE |
| `token_hash` | `TEXT` | NOT NULL (SHA-256 of raw token) |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `revoked` | `BOOLEAN` | NOT NULL DEFAULT false |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

---

### Table 3: `student_profiles`
**Purpose**: Extended profile for student users.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → `users.id` UNIQUE ON DELETE CASCADE |
| `full_name` | `VARCHAR(150)` | NOT NULL |
| `roll_number` | `VARCHAR(50)` | UNIQUE |
| `branch` | `VARCHAR(100)` | NOT NULL |
| `batch_year` | `INTEGER` | NOT NULL CHECK(batch_year BETWEEN 2000 AND 2100) |
| `cgpa` | `NUMERIC(4,2)` | CHECK(cgpa >= 0 AND cgpa <= 10) |
| `linkedin_url` | `TEXT` | |
| `github_url` | `TEXT` | |
| `target_role_id` | `UUID` | FK → `career_roles.id` NULLABLE ON DELETE SET NULL |
| `profile_completed` | `BOOLEAN` | NOT NULL DEFAULT false |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**Note**: `profile_completed` is a cached boolean recomputed by `StudentService.updateProfile()` every time profile fields change. It is not a source-of-truth field.

**ON DELETE rule for target_role_id**: `SET NULL` — if a role is deleted (physically, not just deactivated), the student's target role becomes NULL. Role deactivation (is_active = false) does NOT delete the role record; it triggers the service to null out affected students' target_role_id.

---

### Table 4: `faculty_profiles`
**Purpose**: Extended profile for faculty/TPO users.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `user_id` | `UUID` | FK → `users.id` UNIQUE ON DELETE CASCADE |
| `full_name` | `VARCHAR(150)` | NOT NULL |
| `department` | `VARCHAR(100)` | |
| `is_tpo` | `BOOLEAN` | NOT NULL DEFAULT false |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

---

### Table 5: `faculty_batch_scope`
**Purpose**: Scopes each faculty member to specific (batch_year, branch) pairs.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `faculty_profile_id` | `UUID` | FK → `faculty_profiles.id` ON DELETE CASCADE |
| `batch_year` | `INTEGER` | NOT NULL |
| `branch` | `VARCHAR(100)` | NOT NULL |
| UNIQUE | | `(faculty_profile_id, batch_year, branch)` |

**Scope enforcement**: All queries that return student data (except for TPO) must JOIN with `faculty_batch_scope` to limit results to the faculty's scope. This is enforced at the repository layer.

---

### Table 6: `career_roles`
**Purpose**: Catalogue of placeable career roles.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `name` | `VARCHAR(150)` | UNIQUE NOT NULL |
| `description` | `TEXT` | |
| `is_active` | `BOOLEAN` | NOT NULL DEFAULT true |
| `created_by` | `UUID` | FK → `users.id` ON DELETE SET NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**Deactivation cascade**: When `is_active` is set to `false`, the service layer sets `target_role_id = NULL` for all students targeting this role.

---

### Table 7: `skills`
**Purpose**: Global skill catalogue.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `name` | `VARCHAR(150)` | UNIQUE NOT NULL |
| `category` | `ENUM('technical','soft','domain','aptitude')` | NOT NULL |
| `description` | `TEXT` | |
| `is_active` | `BOOLEAN` | NOT NULL DEFAULT true |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

---

### Table 8: `role_skill_requirements`
**Purpose**: Maps skills to roles with required proficiency and weight.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `role_id` | `UUID` | FK → `career_roles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` ON DELETE CASCADE |
| `required_level` | `INTEGER` | NOT NULL CHECK(required_level >= 0 AND required_level <= 100) |
| `weight` | `INTEGER` | NOT NULL CHECK(weight >= 1 AND weight <= 5) |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| UNIQUE | | `(role_id, skill_id)` |

**Staleness detection**: `updated_at` is used to detect when role requirements changed after a student's `skill_gaps.computed_at` — triggering lazy recomputation on next dashboard load.

---

### Table 9: `questions`
**Purpose**: MCQ question bank.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `skill_id` | `UUID` | FK → `skills.id` ON DELETE RESTRICT |
| `question_text` | `TEXT` | NOT NULL |
| `difficulty` | `ENUM('easy','medium','hard')` | NOT NULL |
| `is_active` | `BOOLEAN` | NOT NULL DEFAULT true |
| `created_by` | `UUID` | FK → `users.id` ON DELETE SET NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**ON DELETE RESTRICT on skill_id**: Cannot delete a skill that has questions. Must deactivate the skill instead.

---

### Table 10: `question_options`
**Purpose**: Options for each MCQ question (normalized).

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `question_id` | `UUID` | FK → `questions.id` ON DELETE CASCADE |
| `option_text` | `TEXT` | NOT NULL |
| `is_correct` | `BOOLEAN` | NOT NULL DEFAULT false |
| `display_order` | `INTEGER` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**Critical DB constraint** (enforces exactly one correct answer per question):
```sql
CREATE UNIQUE INDEX uq_one_correct_per_question
ON question_options (question_id)
WHERE is_correct = true;
```
Service must also validate at least one correct answer exists on question creation.

---

### Table 11: `assessment_configs`
**Purpose**: Assessment parameters per skill.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `skill_id` | `UUID` | FK → `skills.id` UNIQUE ON DELETE CASCADE |
| `total_questions` | `INTEGER` | NOT NULL DEFAULT 10 CHECK(total_questions >= 1) |
| `time_limit_minutes` | `INTEGER` | NOT NULL DEFAULT 15 CHECK(time_limit_minutes >= 1) |
| `easy_count` | `INTEGER` | NOT NULL DEFAULT 3 CHECK(easy_count >= 0) |
| `medium_count` | `INTEGER` | NOT NULL DEFAULT 5 CHECK(medium_count >= 0) |
| `hard_count` | `INTEGER` | NOT NULL DEFAULT 2 CHECK(hard_count >= 0) |
| `cooldown_hours` | `INTEGER` | NOT NULL DEFAULT 24 CHECK(cooldown_hours >= 0) |
| CONSTRAINT | | `CHECK(easy_count + medium_count + hard_count = total_questions)` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**Note**: `passing_level` removed — it was defined but never used in any business rule.

---

### Table 12: `assessment_attempts`
**Purpose**: Records each student attempt at a skill assessment.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` ON DELETE RESTRICT |
| `started_at` | `TIMESTAMPTZ` | NOT NULL |
| `submitted_at` | `TIMESTAMPTZ` | NULL = not yet submitted |
| `status` | `ENUM('in_progress','completed','timed_out','abandoned')` | NOT NULL DEFAULT 'in_progress' |
| `raw_score` | `NUMERIC(5,2)` | NULL until completed |
| `skill_score` | `INTEGER` | CHECK(skill_score >= 0 AND skill_score <= 100), NULL until completed |
| `questions_served` | `INTEGER` | NOT NULL |

**Race condition prevention** (prevents duplicate active sessions):
```sql
CREATE UNIQUE INDEX one_active_attempt_per_student_skill
ON assessment_attempts (student_id, skill_id)
WHERE status = 'in_progress';
```

**Index for cooldown query**:
```sql
CREATE INDEX idx_attempts_student_skill_status
ON assessment_attempts (student_id, skill_id, status);
```

---

### Table 13: `attempt_questions`
**Purpose**: Snapshot of questions served in an attempt (immutable after creation).

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `attempt_id` | `UUID` | FK → `assessment_attempts.id` ON DELETE CASCADE |
| `question_id` | `UUID` | FK → `questions.id` ON DELETE RESTRICT |
| `display_order` | `INTEGER` | NOT NULL |
| UNIQUE | | `(attempt_id, question_id)` |

**Rationale**: Snapshotting served questions ensures scoring consistency even if questions are later edited or deactivated.

---

### Table 14: `attempt_answers`
**Purpose**: Student's submitted answer per question per attempt.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `attempt_id` | `UUID` | FK → `assessment_attempts.id` ON DELETE CASCADE |
| `question_id` | `UUID` | FK → `questions.id` ON DELETE RESTRICT |
| `selected_option_id` | `UUID` | FK → `question_options.id` ON DELETE RESTRICT, NULLABLE (NULL = unanswered) |
| `is_correct` | `BOOLEAN` | NOT NULL (denormalized for fast scoring, computed at submission) |
| UNIQUE | | `(attempt_id, question_id)` |

**Backend validation (mandatory)**: Before writing any answer, `ScoringService` must verify:
```
SELECT 1 FROM question_options 
WHERE id = $selected_option_id AND question_id = $question_id
```
If this returns no rows, reject the submission with 400 Bad Request.

---

### Table 15: `student_skill_scores`
**Purpose**: Current and best skill score per student per skill. Row only exists after at least one completed attempt.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` ON DELETE RESTRICT |
| `current_score` | `INTEGER` | NOT NULL CHECK(current_score >= 0 AND current_score <= 100) |
| `best_score` | `INTEGER` | NOT NULL CHECK(best_score >= 0 AND best_score <= 100) |
| `attempt_count` | `INTEGER` | NOT NULL DEFAULT 1 CHECK(attempt_count >= 1) |
| `last_attempted_at` | `TIMESTAMPTZ` | NOT NULL |
| UNIQUE | | `(student_id, skill_id)` |

**Semantics**:
- `current_score` = score from the most recent COMPLETED attempt.
- `best_score` = highest score across all COMPLETED attempts.
- A row does NOT exist if the student has never had a completed attempt for this skill.
- This absence is the signal for "never assessed."

---

### Table 16: `skill_gaps`
**Purpose**: Computed and cached skill gap per (student, role, skill). Upserted on every gap recomputation.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `role_id` | `UUID` | FK → `career_roles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` ON DELETE RESTRICT |
| `required_level` | `INTEGER` | NOT NULL (snapshot from role_skill_requirements at computation time) |
| `current_score` | `INTEGER` | NOT NULL (0 if unassessed) |
| `gap` | `INTEGER` | NOT NULL CHECK(gap >= 0 AND gap <= 100) |
| `gap_category` | `ENUM('none','small','medium','critical')` | NOT NULL |
| `is_assessed` | `BOOLEAN` | NOT NULL DEFAULT false |
| `computed_at` | `TIMESTAMPTZ` | NOT NULL |
| UNIQUE | | `(student_id, role_id, skill_id)` |

**`is_assessed` semantics**:
- `false`: Student has no row in `student_skill_scores` for this skill — truly never completed an attempt.
- `true`: Student has at least one completed attempt (even if score = 0).

**Gap classification** (see Section 8 for thresholds).

---

### Table 17: `readiness_scores`
**Purpose**: Cached current readiness score per (student, role). Upserted on every recomputation.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `role_id` | `UUID` | FK → `career_roles.id` ON DELETE CASCADE |
| `score` | `NUMERIC(5,2)` | NULLABLE CHECK(score IS NULL OR (score >= 0 AND score <= 100)) |
| `computed_at` | `TIMESTAMPTZ` | NOT NULL |
| UNIQUE | | `(student_id, role_id)` |

**Zero-skills role behavior (PHA-07: APPROVED)**: When a target role has no required skills configured, `score` is set to `NULL` (or no score row is generated). The API/UI returns `{ score: null, status: 'ROLE_HAS_NO_SKILLS' }`.

---

### Table 18: `readiness_score_history`
**Purpose**: Append-only history of readiness scores for progress charts and future ML.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `role_id` | `UUID` | FK → `career_roles.id` ON DELETE RESTRICT |
| `score` | `NUMERIC(5,2)` | NOT NULL CHECK(score >= 0 AND score <= 100) |
| `recorded_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

**ON DELETE RESTRICT on role_id**: Preserves history integrity. Roles must be deactivated (not deleted) once students have readiness history for them.

---

### Table 19: `preparation_activities`
**Purpose**: Student-logged preparation entries.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` NULLABLE ON DELETE SET NULL |
| `activity_type` | `ENUM('study','practice','mock_test','video','reading','other')` | NOT NULL |
| `description` | `TEXT` | |
| `resource_url` | `TEXT` | URL format validated by Zod before storage |
| `hours_spent` | `NUMERIC(4,2)` | NOT NULL CHECK(hours_spent > 0 AND hours_spent <= 24) |
| `activity_date` | `DATE` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL DEFAULT NOW() |

---

### Table 20: `recommendations`
**Purpose**: Generated recommendations per (student, role, skill, type). Upserted on regeneration.

| Column | Type | Constraints |
|---|---|---|
| `id` | `UUID` | PK |
| `student_id` | `UUID` | FK → `student_profiles.id` ON DELETE CASCADE |
| `role_id` | `UUID` | FK → `career_roles.id` ON DELETE CASCADE |
| `skill_id` | `UUID` | FK → `skills.id` NULLABLE ON DELETE CASCADE |
| `priority` | `ENUM('high','medium','low')` | NOT NULL |
| `recommendation_type` | `ENUM('take_assessment','practice_skill','study_resource','review_weak_area')` | NOT NULL |
| `message` | `TEXT` | NOT NULL |
| `is_dismissed` | `BOOLEAN` | NOT NULL DEFAULT false |
| `generated_at` | `TIMESTAMPTZ` | NOT NULL |
| `dismissed_at` | `TIMESTAMPTZ` | NULL until dismissed |

**Upsert constraints** (two partial unique indexes to handle nullable `skill_id`):
```sql
CREATE UNIQUE INDEX uq_recommendation_with_skill
ON recommendations (student_id, role_id, skill_id, recommendation_type)
WHERE skill_id IS NOT NULL;

CREATE UNIQUE INDEX uq_recommendation_no_skill
ON recommendations (student_id, role_id, recommendation_type)
WHERE skill_id IS NULL;
```

---

### Summary: 20 Operational MVP Tables
All 20 tables are normalized to 3NF. Column `is_assessed` is integrated directly into Table 16 (`skill_gaps`). Per decision **PHA-D13 (APPROVED)**, the `placement_outcomes` table is omitted from MVP and reserved for Phase 12+. Total tables in MVP: exactly 20.

---

## 6. ER Diagram

```
users (id, email, role)
  │
  ├─── student_profiles (id, user_id, batch_year, branch, target_role_id)
  │         │
  │         ├──[target_role_id FK]─────────────────────────────┐
  │         │                                                   │
  │         ├── assessment_attempts (id, student_id, skill_id) │
  │         │       │                                           │
  │         │       ├── attempt_questions (attempt_id,          │
  │         │       │     question_id)                          │
  │         │       └── attempt_answers (attempt_id,            │
  │         │             question_id, selected_option_id)      │
  │         │                                                   │
  │         ├── student_skill_scores (student_id, skill_id,     │
  │         │     current_score, best_score)                    │
  │         │                                                   │
  │         ├── skill_gaps (student_id, role_id, skill_id,      │
  │         │     gap, gap_category, is_assessed)               │
  │         │                                                   │
  │         ├── readiness_scores (student_id, role_id, score)  │
  │         ├── readiness_score_history (student_id, role_id,  │
  │         │     score, recorded_at)                           │
  │         │                                                   │
  │         ├── preparation_activities (student_id, skill_id)  │
  │         │                                                   │
  │         └── recommendations (student_id, role_id, skill_id,│
  │               priority, recommendation_type)                │
  │                                                             │
  └─── faculty_profiles (id, user_id, is_tpo)                  │
            │                                                   │
            └── faculty_batch_scope (faculty_id,               │
                  batch_year, branch)                           │
                                                                │
career_roles (id, name, is_active) ◄────────────────────────────┘
  │
  └── role_skill_requirements (role_id, skill_id,
        required_level, weight, updated_at)
            │
            ▼
skills (id, name, category, is_active)
  │
  ├── questions (id, skill_id, difficulty, is_active)
  │     │
  │     └── question_options (id, question_id, option_text, is_correct)
  │
  └── assessment_configs (id, skill_id, total_questions, time_limit_minutes,
        easy_count, medium_count, hard_count, cooldown_hours)

refresh_tokens (id, user_id, token_hash, expires_at, revoked)
```

---

## 7. Readiness Score Design (Corrected)

### Formula

```
Per-skill readiness ratio:
  r_i = min(current_score_i, required_level_i) / required_level_i
  Special case: if required_level_i = 0, then r_i = 1.0 (skill has no barrier)
  If student is unassessed for skill i (is_assessed = false): current_score_i = 0, r_i = 0.0

Placement Readiness Score:
  RS = 100 × Σ(r_i × weight_i) / Σ(weight_i)
  Range: [0, 100]
```

### Why This Formula

| Property | Satisfied? |
|---|---|
| RS = 100 when student meets all requirements | ✅ |
| RS = 0 when nothing assessed | ✅ |
| Uses required_level in computation | ✅ |
| Exceeding requirement capped at requirement | ✅ |
| Unassessed skill contributes 0 | ✅ |
| Range strictly 0–100 | ✅ |
| Deterministic | ✅ |
| Easy to explain | ✅ "You've met X% of what this role requires" |
| Viva defensible | ✅ |

### Score Interpretation Labels

| RS Range | Label | Meaning |
|---|---|---|
| 0–20 | Not Ready | Most skills unassessed or critical gaps |
| 21–45 | Early Stage | Several critical gaps; assessment needed |
| 46–65 | Developing | Moderate gaps; focused preparation needed |
| 66–80 | Almost Ready | Minor gaps; refinement needed |
| 81–92 | Ready | Small gaps; competitive for most companies |
| 93–100 | Highly Ready | Requirements fully met or exceeded |

### Recalculation Triggers

1. Student completes an assessment attempt (synchronous, within transaction).
2. Student changes target role (synchronous).
3. Faculty changes `role_skill_requirements` weights/levels (lazy — detected via `updated_at` staleness on next load).

### Edge: Role with Zero Skills (PHA-07: APPROVED)
If a role has no skills in `role_skill_requirements`, `Σ(weight_i) = 0`, making the formula mathematically undefined (division by zero).
- **Behavior**: Return `readiness_score = NULL`.
- **API Status / Code**: Return `ROLE_HAS_NO_SKILLS` with message: `"This role has no defined skill requirements yet."`
- **Constraint**: Must NEVER return 100 (vacuously ready) or 0 (false failure).
- **UI Behavior**: Readiness gauge displays an unconfigured/prompt state requesting role configuration.

---

## 8. Skill Gap Design

### Formula
```
gap_i = max(0, required_level_i − current_score_i)
```
Never negative. Student scoring above requirement has gap = 0.

### Gap Classification

| Gap Value | Category | Label | Recommended Action |
|---|---|---|---|
| 0 | `none` | No Gap | Maintain; no recommendation |
| 1–15 | `small` | Small Gap | Light review |
| 16–35 | `medium` | Medium Gap | Focused practice |
| 36–100 | `critical` | Critical Gap | Immediate priority |

**`is_assessed = false`** is displayed as "Not Yet Assessed" on the frontend regardless of the gap value, with "Take Assessment" as the call to action. Do not display gap numbers for unassessed skills — the number is misleading (it's just the required_level).

### Aggregate Gap Metrics for Faculty Analytics

- **Average gap score**: AVG(gap) across all role skills for a student.
- **Critical gap count**: COUNT(*) WHERE gap_category = 'critical'.
- **Intervention threshold**: `critical_gap_count >= 3` → flag student for intervention.

---

## 9. Recommendation Engine

### Design Philosophy
Deterministic rule-based engine. No ML, no probability, no randomness. Every recommendation traces to a specific rule. Viva-defensible.

### Priority Score Formula
```
priority_score = gap_i × weight_i
```
Used to order recommendations within a priority level.

### Priority Thresholds

| priority_score | Priority |
|---|---|
| ≥ 150 | HIGH |
| 75–149 | MEDIUM |
| < 75 | LOW |

**Configuration note**: Thresholds are defined in `config/constants.js` and loaded dynamically.

### Rule Set with Precedence

Rules are evaluated IN ORDER. Once a rule fires for (skill, recommendation_type), skip later rules for the same pair.

| Order | Rule | Condition | Type | Priority |
|---|---|---|---|---|
| 1 | R01 | Skill never assessed AND weight ≥ 4 | take_assessment | HIGH |
| 2 | R02 | Skill never assessed AND weight < 4 | take_assessment | MEDIUM |
| 3 | R03 | gap_category = 'critical' | study_resource | HIGH |
| 4 | R03b | gap_category = 'critical' | practice_skill | HIGH |
| 5 | R06 | No prep logged for this skill in 7 days AND gap ≥ 'medium' | practice_skill | HIGH — **SKIP if R03b already generated** |
| 6 | R04 | gap_category = 'medium' | practice_skill | MEDIUM |
| 7 | R07 | current_score < best_score − 15 (score dropped) | review_weak_area | MEDIUM |
| 8 | R05 | gap_category = 'small' | review_weak_area | LOW |
| 9 | R08 | gap = 0 (no gap) | — | No recommendation |

**Maximum active recommendations**: 10 per student per role (non-dismissed) **(PHA-10: APPROVED)**. Rules are evaluated in precedence order, sorted by `priority_score = gap * weight`, and capped at the top 10 non-dismissed recommendations.

### Storage & Refresh

- Stored in `recommendations` table. Upserted via two partial UNIQUE indexes.
- Triggered after: assessment completion (post-transaction), role change, student-initiated refresh (rate-limited to once per hour).
- Dismissed recommendations (`is_dismissed = true`) are not regenerated unless the underlying gap changes by > 10 points.
- Old dismissed recommendations with `gap = 0` are permanently suppressed.

---

## 10. API Architecture

### Conventions
- All responses: `{ "success": boolean, "data": object|null, "error": object|null }`
- Authentication: `Authorization: Bearer <access_token>` header
- Pagination: `?page=1&limit=20` on list endpoints
- `/me` convention replaces `/my` for self-referential resources
- Soft deletes: use `PATCH /:id/deactivate`, not `DELETE`

---

### /api/auth
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| POST | `/api/auth/register` | Register as student (role hard-coded to 'student') | No | — |
| POST | `/api/auth/login` | Login, receive access token + set refresh cookie | No | — |
| POST | `/api/auth/refresh` | Exchange refresh cookie for new access token | No | — |
| POST | `/api/auth/logout` | Revoke refresh token | Yes | Any |
| GET | `/api/auth/me` | Get current user (id, email, role) | Yes | Any |

---

### /api/students
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/students/profile` | Get own profile | Yes | student |
| PUT | `/api/students/profile` | Update own profile | Yes | student |
| PUT | `/api/students/target-role` | Set/change target career role | Yes | student |
| GET | `/api/students` | List students (scoped to faculty's batch/branch) | Yes | faculty |
| GET | `/api/students/:id` | Get a specific student's profile | Yes | faculty |

**IDOR protection**: `GET /api/students/:id` — the repository enforces that the requesting faculty's scope includes the student's `(batch_year, branch)`.

---

### /api/roles
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/roles` | List active career roles | Yes | Any |
| GET | `/api/roles/:id` | Get role details | Yes | Any |
| POST | `/api/roles` | Create new role | Yes | faculty |
| PUT | `/api/roles/:id` | Update role metadata | Yes | faculty |
| PATCH | `/api/roles/:id/deactivate` | Soft-deactivate a role | Yes | faculty |

---

### /api/roles/:roleId/skills
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/roles/:roleId/skills` | Get skills + requirements for a role | Yes | Any |
| POST | `/api/roles/:roleId/skills` | Add skill requirement to role | Yes | faculty |
| PUT | `/api/roles/:roleId/skills/:skillId` | Update required_level / weight | Yes | faculty |
| DELETE | `/api/roles/:roleId/skills/:skillId` | Remove skill from role | Yes | faculty |

---

### /api/skills
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/skills` | List all active skills | Yes | Any |
| GET | `/api/skills/:id` | Get skill details | Yes | Any |
| GET | `/api/skills/:id/question-count` | Count of active questions per difficulty | Yes | faculty |
| POST | `/api/skills` | Create new skill | Yes | faculty |
| PUT | `/api/skills/:id` | Update skill | Yes | faculty |
| PATCH | `/api/skills/:id/deactivate` | Soft-deactivate skill | Yes | faculty |

---

### /api/questions
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/questions` | List questions (filter: skill_id, difficulty) | Yes | faculty |
| GET | `/api/questions/:id` | Get question with options (including is_correct) | Yes | faculty |
| POST | `/api/questions` | Create question with options | Yes | faculty |
| PUT | `/api/questions/:id` | Update question and options | Yes | faculty |
| PATCH | `/api/questions/:id/deactivate` | Soft-deactivate question | Yes | faculty |

**Note**: `is_correct` is returned ONLY to faculty. Never exposed to students.

---

### /api/assessments
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/assessments/config/:skillId` | Get assessment config for a skill | Yes | Any |
| POST | `/api/assessments/config` | Create assessment config for a skill | Yes | faculty |
| PUT | `/api/assessments/config/:skillId` | Update assessment config | Yes | faculty |
| GET | `/api/assessments/cooldown/:skillId` | Get remaining cooldown time for student | Yes | student |
| POST | `/api/assessments/start/:skillId` | Start new assessment session | Yes | student |
| GET | `/api/assessments/session/:attemptId` | Get current session questions (no is_correct) | Yes | student |
| POST | `/api/assessments/submit/:attemptId` | Submit answers, trigger scoring | Yes | student |
| GET | `/api/assessments/history` | Get own attempt history | Yes | student |
| GET | `/api/assessments/result/:attemptId` | Get result of a completed attempt | Yes | student |

**IDOR protection**: `GET /session/:attemptId` and `GET /result/:attemptId` — repository checks `attempt.student_id = req.user.student_profile_id`. Returns 404 if mismatch.

**Timer enforcement**: `POST /submit/:attemptId` — backend checks `NOW() > attempt.started_at + config.time_limit_minutes * INTERVAL '1 minute'`. If overdue, sets `status = 'timed_out'` and returns 422.

---

### /api/skill-gaps
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/skill-gaps/me` | Own skill gaps for target role | Yes | student |
| POST | `/api/skill-gaps/recompute` | Manually trigger recomputation | Yes | student |
| GET | `/api/skill-gaps/students/:studentId` | Student's gaps (scoped) | Yes | faculty |

---

### /api/readiness
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/readiness/me` | Own current readiness score | Yes | student |
| GET | `/api/readiness/me/history` | Own readiness score history | Yes | student |
| GET | `/api/readiness/students/:studentId` | Student readiness score (scoped) | Yes | faculty |

---

### /api/preparation
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/preparation/me` | Own preparation activity log | Yes | student |
| POST | `/api/preparation` | Log new prep activity | Yes | student |
| PUT | `/api/preparation/:id` | Edit a prep activity | Yes | student |
| DELETE | `/api/preparation/:id` | Delete a prep activity | Yes | student |

**IDOR protection**: PUT and DELETE — repository checks `activity.student_id = req.user.student_profile_id`. Returns 404 if mismatch.

---

### /api/recommendations
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/recommendations/me` | Own active (non-dismissed) recommendations | Yes | student |
| POST | `/api/recommendations/refresh` | Trigger recommendation regeneration (rate-limited 1/hr) | Yes | student |
| PATCH | `/api/recommendations/:id/dismiss` | Dismiss a recommendation | Yes | student |

**IDOR protection**: PATCH dismiss — repository checks `recommendation.student_id = req.user.student_profile_id`.

---

### /api/analytics (student-facing)
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/analytics/me/overview` | Summary: readiness, gap count, prep hours | Yes | student |
| GET | `/api/analytics/me/skill-progress` | Skill score history per skill (from attempts) | Yes | student |
| GET | `/api/analytics/me/assessment-history` | All attempts chronologically | Yes | student |
| GET | `/api/analytics/me/preparation-summary` | Hours by skill, by week | Yes | student |

---

### /api/faculty
| Method | Endpoint | Purpose | Auth | Role |
|---|---|---|---|---|
| GET | `/api/faculty/analytics/batch-overview` | Readiness distribution for faculty's batch | Yes | faculty |
| GET | `/api/faculty/analytics/skill-gaps` | Skill gap summary across cohort | Yes | faculty |
| GET | `/api/faculty/analytics/intervention-list` | Students with ≥ 3 critical gaps | Yes | faculty |
| GET | `/api/faculty/analytics/students/:studentId` | Full analytics view for one student | Yes | faculty |

---

## 11. API Contract Standard

### Success Response (single resource)
```json
{
  "success": true,
  "data": { "id": "...", "name": "..." }
}
```

### Success Response (list)
```json
{
  "success": true,
  "data": [ { "id": "..." }, { "id": "..." } ],
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### HTTP Status Codes

| Situation | Code |
|---|---|
| Success read | 200 |
| Resource created | 201 |
| Action completed, no body | 204 |
| Validation failed | 400 |
| Not authenticated | 401 |
| Insufficient role / out of scope | 403 |
| Resource not found / IDOR | 404 |
| Business rule conflict (duplicate, cooldown) | 409 |
| Assessment submission late / timer expired | 422 |
| Rate limited | 429 |
| Server error | 500 |

### Error Codes Enum
```
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INSUFFICIENT_ROLE
RESOURCE_NOT_FOUND
DUPLICATE_ENTRY
COOLDOWN_ACTIVE
ASSESSMENT_IN_PROGRESS
ASSESSMENT_ALREADY_SUBMITTED
ASSESSMENT_TIMED_OUT
OUT_OF_SCOPE
RATE_LIMIT_EXCEEDED
ROLE_HAS_NO_SKILLS
INTERNAL_ERROR
```

---

## 12. Frontend Architecture

### Directory Structure
```
frontend/
└── src/
    ├── main.jsx                      # Vite entry
    ├── App.jsx                       # Root: QueryClientProvider, Providers, Router
    │
    ├── assets/                       # Static assets (icons, images)
    │
    ├── components/
    │   ├── ui/                       # Button, Input, Badge, Card, Modal, Spinner, Alert
    │   │                             # OWNED BY MEMBER 5 — delivered in Phase 1
    │   ├── charts/                   # Recharts wrappers (RadarChart, LineChart, BarChart, GaugeChart)
    │   └── layout/                   # Navbar, Sidebar, PageWrapper
    │
    ├── layouts/
    │   ├── AuthLayout.jsx            # Centered, minimal (login/register)
    │   ├── StudentLayout.jsx         # Sidebar + topbar for student pages
    │   └── FacultyLayout.jsx         # Sidebar + topbar for faculty pages
    │
    ├── pages/
    │   ├── auth/
    │   │   ├── LoginPage.jsx
    │   │   └── RegisterPage.jsx
    │   ├── student/
    │   │   ├── DashboardPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── AssessmentListPage.jsx    # List of skills to assess
    │   │   ├── AssessmentSessionPage.jsx # Active assessment with timer
    │   │   ├── AssessmentResultPage.jsx  # Post-submission result
    │   │   ├── SkillGapPage.jsx
    │   │   ├── ReadinessPage.jsx
    │   │   ├── PreparationPage.jsx
    │   │   └── RecommendationsPage.jsx
    │   └── faculty/
    │       ├── FacultyDashboardPage.jsx
    │       ├── BatchOverviewPage.jsx
    │       ├── StudentDetailPage.jsx
    │       ├── RoleManagementPage.jsx
    │       ├── SkillManagementPage.jsx
    │       └── QuestionBankPage.jsx
    │
    ├── features/                     # Feature modules (owner-aligned)
    │   ├── auth/                     # OWNER: Member 1
    │   │   ├── components/           # LoginForm, RegisterForm
    │   │   └── hooks/                # useLogin, useRegister, useLogout
    │   ├── profile/                  # OWNER: Member 1
    │   │   ├── components/           # ProfileForm, ProfileCard, RoleSelectorDropdown
    │   │   └── hooks/                # useProfile, useTargetRole
    │   ├── assessment/               # OWNER: Member 2
    │   │   ├── components/           # AssessmentCard, QuestionCard, Timer, ProgressBar
    │   │   ├── hooks/                # useAssessmentSession, useSubmitAttempt, useCooldown
    │   │   └── store/                # assessmentStore.js (Zustand — active session state)
    │   ├── skillGap/                 # OWNER: Member 3
    │   │   ├── components/           # GapBadge, SkillGapTable, ReadinessGauge, RadarChart
    │   │   └── hooks/                # useSkillGaps, useReadinessScore
    │   ├── preparation/              # OWNER: Member 4
    │   │   ├── components/           # ActivityLogForm, ActivityList
    │   │   └── hooks/                # usePreparation
    │   ├── recommendations/          # OWNER: Member 4
    │   │   ├── components/           # RecommendationCard, PriorityBadge
    │   │   └── hooks/                # useRecommendations
    │   ├── studentAnalytics/         # OWNER: Member 5
    │   │   ├── components/           # ScoreHistoryChart, PrepSummaryChart, AssessmentHistoryTable
    │   │   └── hooks/                # useStudentAnalytics
    │   └── facultyAnalytics/         # OWNER: Member 5
    │       ├── components/           # BatchDistributionChart, SkillGapHeatmap, InterventionTable
    │       └── hooks/                # useFacultyAnalytics, useBatchOverview, useInterventionList
    │
    ├── hooks/                        # SHARED — any member can use
    │   ├── useAuth.js                # Read auth store
    │   ├── useDebounce.js
    │   └── usePagination.js
    │
    ├── services/                     # Axios API modules — ONE per API group
    │   ├── api.js                    # OWNER: Member 1. Axios instance + token interceptor
    │   ├── authService.js            # OWNER: Member 1
    │   ├── studentService.js         # OWNER: Member 1
    │   ├── roleService.js            # OWNER: Member 3
    │   ├── skillService.js           # OWNER: Member 3
    │   ├── assessmentService.js      # OWNER: Member 2
    │   ├── skillGapService.js        # OWNER: Member 3
    │   ├── readinessService.js       # OWNER: Member 3
    │   ├── preparationService.js     # OWNER: Member 4
    │   ├── recommendationService.js  # OWNER: Member 4
    │   ├── analyticsService.js       # OWNER: Member 5
    │   └── facultyService.js         # OWNER: Member 5
    │
    ├── store/                        # Zustand stores
    │   ├── authStore.js              # OWNER: Member 1. User session, role, access token
    │   └── uiStore.js                # OWNER: Member 5. Sidebar, modal state
    │
    ├── routes/
    │   ├── index.jsx                 # OWNER: Member 1. All routes assembled. Frozen after Phase 2.
    │   ├── ProtectedRoute.jsx        # OWNER: Member 1. Redirect unauthenticated.
    │   └── RoleRoute.jsx             # OWNER: Member 1. Redirect wrong role.
    │
    ├── context/
    │   └── ThemeContext.jsx          # OWNER: Member 5. Light/dark toggle.
    │
    └── utils/
        ├── formatters.js             # Score formatting, date formatting
        ├── gapClassifier.js          # Gap value → label/color/badge
        └── constants.js             # GAP_THRESHOLDS, RS_LABELS, API_CODES
```

### Assessment Timer Implementation
The timer on `AssessmentSessionPage` is calculated from server data, not a client-started countdown:
```js
// On component mount:
const remaining = (config.time_limit_minutes * 60) - (Date.now()/1000 - Date.parse(attempt.started_at)/1000);
if (remaining <= 0) { submitImmediately(); }
// Start countdown from `remaining` seconds.

// Store attemptId in sessionStorage (survives page refresh, not tab close):
sessionStorage.setItem('current_attempt_id', attemptId);
```

### State Management Summary

| State | Tool | Justified? |
|---|---|---|
| Auth session (user, role, token) | Zustand | ✅ |
| UI state (sidebar, modals) | Zustand | ✅ |
| Server data (students, roles, skills, gaps) | React Query | ✅ |
| Active assessment session | Zustand (assessmentStore) | ✅ transient |
| Theme | React Context | ✅ simple global |

---

## 13. Backend Architecture

### Directory Structure
```
backend/
├── .env
├── .env.example
├── package.json
└── src/
    ├── index.js                      # Start server
    ├── app.js                        # Express app factory: middleware, routes
    │
    ├── config/
    │   ├── db.js                     # pg pool configuration
    │   ├── env.js                    # Zod-validated env exports (app refuses to start if invalid)
    │   └── constants.js              # GAP_THRESHOLDS, RS_PRIORITY_THRESHOLDS, COOLDOWN_DEFAULT
    │
    ├── db/
    │   ├── migrations/               # node-pg-migrate files: NNN_description.sql
    │   ├── seeds/                    # Dev seed data (roles, skills, questions)
    │   └── migrate.js                # Migration runner (runs on startup)
    │
    ├── middleware/
    │   ├── authenticate.js           # Verify JWT, attach req.user = {id, role, studentProfileId}
    │   ├── authorize.js              # authorize(['faculty']) — role guard factory
    │   ├── validateRequest.js        # Zod schema validation factory
    │   ├── rateLimiter.js            # Global + per-route limiters
    │   ├── errorHandler.js           # Centralized error handler (last middleware)
    │   └── requestLogger.js          # Morgan HTTP logging
    │
    ├── routes/
    │   ├── index.js                  # Mount all sub-routers on /api
    │   ├── auth.routes.js
    │   ├── student.routes.js
    │   ├── role.routes.js
    │   ├── skill.routes.js
    │   ├── question.routes.js
    │   ├── assessment.routes.js
    │   ├── skillGap.routes.js
    │   ├── readiness.routes.js
    │   ├── preparation.routes.js
    │   ├── recommendation.routes.js
    │   ├── analytics.routes.js
    │   └── faculty.routes.js
    │
    ├── controllers/                  # HTTP boundary only — parse req, call service, send res
    │   ├── auth.controller.js
    │   ├── student.controller.js
    │   ├── role.controller.js
    │   ├── skill.controller.js
    │   ├── question.controller.js
    │   ├── assessment.controller.js
    │   ├── skillGap.controller.js
    │   ├── readiness.controller.js
    │   ├── preparation.controller.js
    │   ├── recommendation.controller.js
    │   ├── analytics.controller.js
    │   └── faculty.controller.js
    │
    ├── services/                     # Business logic — no req/res, no SQL
    │   ├── auth.service.js
    │   ├── student.service.js
    │   ├── role.service.js
    │   ├── skill.service.js
    │   ├── question.service.js
    │   ├── assessment.service.js     # Session generation, cooldown check, timer validation
    │   ├── scoring.service.js        # Score computation, IDOR check, transaction orchestration
    │   ├── skillGap.service.js       # Gap computation, classification, upsert
    │   ├── readiness.service.js      # RS formula, upsert + history append
    │   ├── preparation.service.js
    │   ├── recommendation.service.js # Rule engine with precedence
    │   ├── analytics.service.js
    │   └── facultyAnalytics.service.js
    │
    ├── repositories/                 # Parameterized SQL only — no business logic
    │   ├── user.repository.js
    │   ├── student.repository.js
    │   ├── faculty.repository.js
    │   ├── role.repository.js
    │   ├── roleSkill.repository.js
    │   ├── skill.repository.js
    │   ├── question.repository.js
    │   ├── questionOption.repository.js
    │   ├── assessmentConfig.repository.js
    │   ├── attempt.repository.js
    │   ├── attemptQuestion.repository.js
    │   ├── attemptAnswer.repository.js
    │   ├── skillScore.repository.js
    │   ├── skillGap.repository.js
    │   ├── readiness.repository.js
    │   ├── preparation.repository.js
    │   └── recommendation.repository.js
    │
    ├── validators/                   # Zod schemas
    │   ├── auth.validators.js
    │   ├── student.validators.js
    │   ├── role.validators.js
    │   ├── question.validators.js
    │   ├── assessment.validators.js
    │   └── preparation.validators.js
    │
    └── utils/
        ├── jwt.utils.js              # signAccessToken, signRefreshToken, verifyToken
        ├── hash.utils.js             # bcrypt hash/compare wrappers
        ├── response.utils.js         # success(res, data), error(res, code, msg)
        ├── scoring.utils.js          # Raw score → skill_score conversion helpers
        └── logger.js                 # Winston setup
```

### Layering Rules (mandatory code-review check)

| Layer | May call | Must NOT call |
|---|---|---|
| Routes | Controllers, Middleware | Services, Repositories, DB |
| Controllers | Services | Repositories, DB directly, req/res in services |
| Services | Repositories, other Services (one direction) | DB directly, req/res |
| Repositories | DB (pg pool) | Services |
| Middleware | UserRepository (auth only), no others | |

### Service Dependency Graph (no cycles)
```
AuthService → UserRepository, RefreshTokenRepository
StudentService → StudentRepository
AssessmentService → QuestionRepository, AssessmentConfigRepository, AttemptRepository
ScoringService → AttemptAnswerRepository, QuestionOptionRepository,
                 SkillScoreRepository, → calls SkillGapService
SkillGapService → SkillGapRepository, SkillScoreRepository(read),
                  RoleSkillRepository(read), → calls ReadinessService
ReadinessService → ReadinessRepository, ReadinessHistoryRepository,
                   SkillGapRepository(read), RoleSkillRepository(read)
RecommendationService → RecommendationRepository, SkillGapRepository(read),
                        AttemptRepository(read), PreparationRepository(read),
                        RoleSkillRepository(read)
FacultyAnalyticsService → StudentRepository(read), ReadinessRepository(read),
                           SkillGapRepository(read), AttemptRepository(read)
```

---

## 14. Team Architecture (Corrected)

### Parallel Development Strategy

From Phase 1 Day 1, Member 1 delivers three stubs that unblock all other members:
1. `middleware/authenticate.stub.js` — injects hardcoded `req.user = { id: 'test-user-id', role: 'student', studentProfileId: 'test-sp-id' }`. Replaced in Phase 2 with real JWT verification.
2. `src/services/api.js` (minimal) — Axios instance with `baseURL`, no interceptors yet.
3. Migration `001_create_users_and_profiles.sql` — creates `users`, `student_profiles` (empty tables).

With these stubs, Members 2, 3, 4, and 5 can develop against the stub middleware from Day 1.

---

### Member 1 — Authentication + Profile

| Area | Responsibility |
|---|---|
| Backend modules | M01 (Auth), M02 (Student + Faculty Profile) |
| Backend files | auth.*, student.*, user.repository, student.repository, faculty.repository, jwt.utils, hash.utils, authenticate.js, authorize.js |
| Frontend files | features/auth/, features/profile/, authStore.js, ProtectedRoute, RoleRoute, routes/index.jsx, api.js, AuthLayout, StudentLayout, FacultyLayout |
| Database tables | users, refresh_tokens, student_profiles, faculty_profiles, faculty_batch_scope |
| APIs | /api/auth/*, /api/students/* |
| Day 1 deliverable | authenticate.stub.js + api.js stub + migration 001 |
| Integration contracts published | `req.user` shape, `student_profiles` schema, `authenticate` middleware signature |
| Depends on | Nobody |
| Blocks | All other members' authenticated routes |

---

### Member 2 — Assessment Engine

| Area | Responsibility |
|---|---|
| Backend modules | M06 (Question Bank), M07 (Assessment Engine), M08 (Scoring) |
| Backend files | question.*, assessment.*, scoring.service.js, question.repository, questionOption.repository, assessmentConfig.repository, attempt.repository, attemptQuestion.repository, attemptAnswer.repository, skillScore.repository |
| Frontend files | features/assessment/, AssessmentListPage, AssessmentSessionPage, AssessmentResultPage, QuestionBankPage |
| Database tables | questions, question_options, assessment_configs, assessment_attempts, attempt_questions, attempt_answers, student_skill_scores |
| APIs | /api/questions/*, /api/assessments/* |
| Integration contracts published | `student_skill_scores` schema; `ScoringService` calls `SkillGapService.recompute()` after transaction |
| Depends on | Member 1 (auth stub, student_profiles schema), Member 3 (SkillGapService.recompute interface) |
| Blocks | Member 3's gap computation (needs student_skill_scores data) |

---

### Member 3 — Skill Intelligence + Readiness Engine

| Area | Responsibility |
|---|---|
| Backend modules | M03 (Roles), M04 (Skills), M05 (Role-Skill Mapping), M09 (Gap Engine), M10 (Readiness) |
| Backend files | role.*, skill.*, skillGap.*, readiness.*, role.repository, roleSkill.repository, skill.repository, skillGap.repository, readiness.repository |
| Frontend files | features/skillGap/, SkillGapPage, ReadinessPage, RoleManagementPage, SkillManagementPage |
| Database tables | career_roles, skills, role_skill_requirements, skill_gaps, readiness_scores, readiness_score_history |
| APIs | /api/roles/*, /api/skills/*, /api/skill-gaps/*, /api/readiness/* |
| Integration contracts published | `SkillGapService.recompute(studentId, roleId)` — callable by Member 2; `skill_gaps` schema; `readiness_scores` schema |
| Depends on | Member 1 (auth, student_profiles), Member 2 (student_skill_scores) |
| Blocks | Member 4 (gap data for recommendations), Member 5 (gap/readiness data for analytics) |

---

### Member 4 — Preparation Tracker + Recommendation Engine

| Area | Responsibility |
|---|---|
| Backend modules | M11 (Preparation), M12 (Recommendations) |
| Backend files | preparation.*, recommendation.*, preparation.repository, recommendation.repository |
| Frontend files | features/preparation/, features/recommendations/, PreparationPage, RecommendationsPage |
| Database tables | preparation_activities, recommendations |
| APIs | /api/preparation/*, /api/recommendations/* |
| Integration contracts published | `RecommendationService.generate(studentId)` — callable after assessment completion or role change |
| Depends on | Member 1 (auth), Member 2 (assessment_attempts for R07), Member 3 (skill_gaps and role_skill_requirements for rules) |
| Blocks | Member 5 (preparation data for analytics) |

---

### Member 5 — Analytics + Faculty Dashboard + UI Library

| Area | Responsibility |
|---|---|
| Backend modules | M13 (Student Analytics), M14 (Faculty Analytics) |
| Backend files | analytics.*, faculty.*, analytics.service.js, facultyAnalytics.service.js |
| Frontend files | features/studentAnalytics/, features/facultyAnalytics/, DashboardPage, FacultyDashboardPage, BatchOverviewPage, StudentDetailPage, **components/ui/** (shared UI library), context/ThemeContext, uiStore.js |
| Database tables | SQL VIEWs (read-only, coordinated migrations) |
| APIs | /api/analytics/me/*, /api/faculty/* |
| Phase 1 deliverable | Shared UI component library (Button, Card, Badge, Modal, Spinner, Input) |
| Depends on | All members' tables (read-only) |
| Blocks | Nobody (reads only) |

---

### Integration Checkpoints

| Checkpoint | When | Between |
|---|---|---|
| IC-01: Auth stub live | Phase 1 end | M1 → all |
| IC-02: student_profiles schema | Phase 1 end | M1 → M2, M3, M4 |
| IC-03: skills + roles seed data | Phase 3 end | M3 → M2 |
| IC-04: student_skill_scores populated | Phase 4 end | M2 → M3 |
| IC-05: skill_gaps + readiness scores populated | Phase 5 end | M3 → M4, M5 |
| IC-06: preparation_activities populated | Phase 6 end | M4 → M5 |
| IC-07: recommendations populated | Phase 7 end | M4 → M5 |

---

## 15. Development Phases (Corrected — Parallel)

### Phase 0 — Architecture (COMPLETE)
- **Objective**: Sign off v1.1 architecture and resolve all PHA items (COMPLETED).
- **Completion criteria**: All 5 members have read v1.1. All 6 PHA items resolved and approved in `DECISIONS.md`. No open schema questions. Phase 0 is complete.

### Phase 1 — Project Foundation (all members in parallel)
- **Objective**: Monorepo setup, tooling, CI, Docker, stubs.
- **Deliverables**:
  - M1: repo init, Docker, GitHub Actions, authenticate.stub, api.js stub, migration 001
  - M5: `components/ui/` primitive library (Button, Card, Badge, Input, Modal, Spinner)
  - All: feature branch structure, ESLint, Prettier, Husky
- **Completion criteria**: `docker-compose up` starts Postgres + Express. UI components render in Storybook or a simple test page.

### Phase 2 — Authentication + Core Data (M1 + M3 in parallel)
- **M1 deliverables**: Real JWT auth (register/login/refresh/logout), `authenticate` + `authorize` middleware, student profile CRUD.
- **M3 deliverables**: Career roles and skills CRUD, role-skill mapping, seed data (5+ roles, 20+ skills).
- **Completion criteria**: Student can register, login, complete profile, select target role. Faculty can manage roles and skills (via API).

### Phase 3 — Assessment Engine (M2) + Preparation Tracker start (M4)
- **M2 deliverables**: Question bank CRUD, assessment config, session generation, submission, scoring, cooldown enforcement.
- **M4 start**: Preparation activity CRUD (does not depend on gaps yet).
- **Completion criteria**: Student can take an MCQ assessment and see their score. Cooldown enforced. student_skill_scores updated.

### Phase 4 — Gap + Readiness Intelligence (M3) + Analytics stub (M5)
- **M3 deliverables**: SkillGapService, ReadinessService with corrected formula, skill_gaps and readiness_scores populated after assessment.
- **M5 start**: Student analytics API (reads from attempt + readiness tables).
- **Completion criteria**: After assessment, student's gap table and readiness score update. Dashboard shows readiness number.

### Phase 5 — Recommendations (M4) + Faculty Analytics (M5) in parallel
- **M4 deliverables**: RecommendationService with full rule set and precedence. Recommendations page.
- **M5 deliverables**: Faculty batch overview, intervention list, individual student analytics.
- **Completion criteria**: After assessment, recommendations appear. Faculty can see batch readiness.

### Phase 6 — Student Dashboard Integration
- **Owner**: All members (M3, M4, M5 widgets assembled by M5).
- **Deliverable**: Dashboard page with readiness gauge, skill gap radar, recommendations widget, recent assessments.
- **Completion criteria**: Dashboard loads all data in < 2s.

### Phase 7 — Testing
- **Owner**: All members own tests for their modules.
- **Deliverable**: Jest unit tests (services), Supertest integration tests (routes), Playwright E2E (core flows).
- **Completion criteria**: > 70% backend service coverage. All IDOR scenarios tested.

### Phase 8 — Deployment
- **Owner**: M1 leads. All members verify their APIs in production.
- **Completion criteria**: App live on public URL. Real user can register, take assessment, view dashboard.

### Phase 9 — Advanced Features (future, post-deployment)
- Deferred: coding assessments, ML, resume analysis, admin panel.

---

## 16. Git/GitHub Collaboration Strategy

### Branch Structure
```
main          ← production. Protected. Auto-deploys to Vercel + Render.
│
└── develop   ← integration. Always deployable. Protected.
    │
    ├── feat/auth-jwt           (M1)
    ├── feat/student-profile    (M1)
    ├── feat/role-management    (M3)
    ├── feat/skill-management   (M3)
    ├── feat/skill-gap-engine   (M3)
    ├── feat/readiness-engine   (M3)
    ├── feat/question-bank      (M2)
    ├── feat/assessment-engine  (M2)
    ├── feat/prep-tracker       (M4)
    ├── feat/recommendations    (M4)
    ├── feat/ui-library         (M5)
    ├── feat/student-analytics  (M5)
    ├── feat/faculty-analytics  (M5)
    │
    ├── fix/<module>-<description>
    ├── chore/<description>
    └── db/<NNN>-<description>  ← schema changes (24-hour review rule)
```

### Commit Conventions (Conventional Commits)
```
feat(scope): add readiness formula
fix(scope): clamp gap to zero for over-achievers
chore(db): add updated_at to role_skill_requirements
test(scope): unit tests for recommendation rule precedence
refactor(scope): extract scoring utils
docs(scope): update API contract for /me endpoints
```

Scopes: `auth | profile | assessment | scoring | skillgap | readiness | prep | recommendation | analytics | faculty | ui | deploy`

### Pull Request Rules
1. No direct push to `main` or `develop`.
2. PRs to `develop`: minimum 1 approval from a member who does NOT own the module.
3. PRs touching `db/migrations/`: minimum 2 approvals. 24-hour review wait (unless all approve early).
4. CI must pass (lint + unit tests + integration tests).
5. PR description must state: what changed, which table/API affected, migration required (yes/no).

### Merge Strategy
- Feature → develop: **Squash merge** (clean history).
- develop → main: **Regular merge commit** (preserves integration events).
- Never rebase `develop` or `main`.

### Migration Coordination
1. Member needing schema change creates `db/migrations/NNN_description.sql`.
2. Opens a PR with only the migration file (no dependent code yet).
3. Reviews from all members, 24-hour window.
4. After merge: all members `npm run migrate` before pulling further changes.
5. `SCHEMA_CHANGES.md` in repo root documents each migration in human-readable form.

---

## 17. Security Architecture

| Measure | Implementation | Priority |
|---|---|---|
| Password hashing | bcrypt, cost factor 12. Hashed in service layer. | MANDATORY |
| Access token | JWT HS256, 15min TTL, stored in memory (Zustand). Never localStorage. | MANDATORY |
| Refresh token | JWT, 7d TTL, stored in httpOnly + Secure + SameSite=Strict cookie. SHA-256 hash stored in DB. | MANDATORY |
| Token rotation | Each refresh generates new refresh token, revokes old. | MANDATORY |
| Role field in registration | Never accepted from client. Hard-coded `role='student'`. | MANDATORY |
| IDOR protection | All single-resource queries include ownership check (`AND student_id = $auth_id`). | MANDATORY |
| Backend timer enforcement | `/submit` checks `NOW() > started_at + time_limit`. Reject late submissions. | MANDATORY |
| Parameterized SQL | All DB queries use `$1, $2, ...`. No string interpolation. | MANDATORY |
| Input validation | Zod schema on every endpoint. Validated before controller executes. | MANDATORY |
| Faculty scope enforcement | Repository-level JOIN with faculty_batch_scope. Never frontend-only. | MANDATORY |
| `is_correct` exclusion | Never returned to student in session response. SELECT list explicitly excludes it. | MANDATORY |
| `password_hash` exclusion | Never returned in any API response. Excluded at repository level. | MANDATORY |
| CORS | Restricted to frontend URL from env variable. | MANDATORY |
| Helmet | All HTTP security headers. | MANDATORY |
| Rate limiting (global) | 100 req/15min per IP. | MANDATORY |
| Rate limiting (login) | 10 req/15min per IP. | MANDATORY |
| Rate limiting (assessment start) | 5 starts/hr per user. | MANDATORY |
| Rate limiting (recommendation refresh) | 1/hr per user. | MANDATORY |
| Env vars validated at startup | Zod schema in config/env.js. App refuses to start if missing. | MANDATORY |
| Error responses | Production responses never expose stack traces or SQL. | MANDATORY |
| Refresh token raw value | Never logged. | MANDATORY |
| CSRF | SameSite=Strict cookie partially mitigates. No additional CSRF token needed for REST JSON APIs. | ACCEPTABLE |

---

## 18. Testing Strategy

### Backend Unit Tests (Jest)
Target: All service functions and utility functions. DB mocked via `jest.mock()`.

Key test cases:
- `ScoringService`: correct skill_score for various answer combinations and difficulties.
- `SkillGapService`: gap=0 for score≥required; gap classification at each threshold boundary; `is_assessed=false` for unassessed.
- `ReadinessService`: corrected formula produces 100 when all requirements met; 0 when nothing assessed; correct partial scores.
- `RecommendationService`: each rule fires under correct conditions; rule precedence (R06 suppressed when R03 fired).
- `AssessmentService`: cooldown correctly rejected; timer correctly rejected; IDOR check on attempt ownership.

### API/Integration Tests (Supertest)
- 401 on all protected routes without token.
- 403 when wrong role accesses faculty endpoint.
- 403 when student accesses another student's attempt.
- 404 when faculty accesses out-of-scope student.
- 400 on malformed request body.
- 409 on duplicate assessment submission.
- 422 on late assessment submission.
- Full flows: register → login → profile → select role → start assessment → submit → view gaps → view readiness.

### Frontend Tests (Vitest + React Testing Library)
- LoginForm: correct submission, error display.
- AssessmentSession: renders questions, timer decrements, timer calculates remaining from server timestamps.
- GapBadge: correct color/label for each gap_category.
- RecommendationCard: dismiss interaction.

### End-to-End Tests (Playwright)

**Flow 1: Onboarding**
Student registers → logs in → completes profile → selects target role → sees "No assessments taken yet" dashboard.

**Flow 2: Assessment → Gap → Readiness**
Student starts assessment for a skill → answers all questions → submits → sees result → navigates to Skill Gap page → sees gap updated → sees readiness score updated.

**Flow 3: Recommendation → Preparation → Improvement**
Student sees HIGH priority recommendation → logs preparation activity → retakes assessment after cooldown → sees score improvement → readiness increases → recommendation priority reduces.

**Flow 4: Faculty Analytics**
Faculty logs in → sees batch overview → filters by branch → views intervention list → clicks a flagged student → sees their skill gap detail.

### Authorization Tests
- Student cannot access faculty routes.
- Faculty A cannot access students from Faculty B's scope.
- TPO can access all students.
- Revoked refresh token returns 401 on refresh attempt.
- Tampered JWT returns 401.

---

## 19. Deployment Architecture

```
┌──────────────┐     ┌───────────────────┐     ┌────────────────────┐
│   FRONTEND   │     │     BACKEND        │     │     DATABASE       │
│   Vercel     │────▶│   Render.com       │────▶│   Supabase         │
│   React/Vite │     │   Express/Node     │     │   (PostgreSQL 15)  │
│   Auto-deploy│     │   Auto-deploy from │     │   Free tier 500MB  │
│   from main  │     │   main             │     │   Daily backups    │
│   HTTPS auto │     │   HTTPS auto       │     │                    │
│   CDN global │     │   512MB RAM free   │     │                    │
└──────────────┘     └───────────────────┘     └────────────────────┘
```

### Environments

| Env | Frontend | Backend | DB |
|---|---|---|---|
| Development | localhost:5173 | localhost:3000 | Docker Postgres |
| Production | Vercel | Render | Supabase |

Note: "Staging" on free tiers is impractical (Render free tier does not offer preview deployments reliably). Use development environment for testing before merging to main.

### Docker (Local Development)
`docker-compose.yml` provides:
- `postgres:15` with named volume.
- `pgadmin4` (optional) for GUI DB inspection.
- Backend in Node container with `nodemon` for hot reload.
- Frontend runs natively (`npm run dev`) — Vite HMR is faster outside Docker.

### CI/CD
- GitHub Actions on every PR: `eslint` → `jest` (unit + integration against test DB).
- Merge to `main`: auto-deploy to Vercel (frontend) and Render (backend).
- Backend startup runs `npm run migrate` before server starts.

### Health Check
`GET /api/health` — returns `{ status: 'ok', timestamp: '...' }`. No auth required. Used by Render health checks.

---

## 20. Risks & Mitigations

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| R01 | Double assessment submission | High | SQL atomic UPDATE returning no rows → 409 |
| R02 | Race condition on cooldown check | High | Partial unique index on `(student_id, skill_id) WHERE status='in_progress'` |
| R03 | Student timer bypass (submit late from browser) | High | Backend validates submission timing server-side |
| R04 | Faculty self-registration security hole | High | Role hard-coded to 'student' on registration |
| R05 | IDOR on attempts/answers/prep/recommendations | High | Repository ownership check on every single-resource query |
| R06 | Member 1 blocking all others | High | Stub strategy with authenticate.stub.js deployed Day 1 |
| R07 | Inconsistent gap snapshot after crash | Medium | Full post-assessment pipeline in one DB transaction |
| R08 | Recommendation spam (conflicting rules) | Medium | Rule precedence order documented and enforced |
| R09 | Correct answer exposed to students | High | SELECT list explicitly excludes `is_correct` in session query |
| R10 | Faculty scope not enforced (sees all students) | High | Repository-level scope JOIN — no scope = empty result |
| R11 | Stale gap/readiness after role requirement change | Medium | Detect staleness via `updated_at` vs `computed_at`; lazy recompute on load |
| R12 | React Query cache stale after assessment | Medium | Explicitly invalidate `['skill-gaps', userId]` and `['readiness', userId]` after submit |
| R13 | Question bank too small for randomization | Medium | Minimum 30 questions per skill (10/15/5 by difficulty) as Phase 3 definition-of-done |
| R14 | five-member shared file conflicts | Medium | Clear file ownership table; `routes/index.jsx` frozen after Phase 2 |
| R15 | Scope creep (team adds ML/coding platform) | Medium | Architecture explicitly defers to Phase 9. Team lead has veto power. |
| R16 | Docker not working on some Windows setups | Low | Non-Docker local setup guide also provided |

---

## 21. Scope Definitions

### MANDATORY MVP (must complete to pass viva)
Authentication · Student Profile · Faculty Profile · Career Roles · Skills · Role-Skill Mapping · MCQ Question Bank · Assessment Engine (session + scoring + cooldown) · Skill Gap Engine (with `is_assessed`) · Readiness Score Engine (corrected formula) · Rule-based Recommendation Engine · Preparation Activity Tracker · Student Dashboard · Faculty Batch Dashboard · Faculty Intervention List

### OPTIONAL (build if time allows, no dependency)
Assessment config management UI · Readiness history chart · Role management UI (can seed-only for MVP) · Preparation calendar view · Light/dark theme toggle · Faculty student detail drill-down (table format is sufficient for MVP)

### FUTURE (explicitly out of scope for MVP)
Coding assessments · SQL assessments · Mock interview tracking · Resume analysis · AI mock interviewer · Job description analysis · ML-based placement prediction · Company-specific readiness · Admin panel · Placement outcomes table

---

## 22. Technology Stack (Final)

| Technology | Version | Purpose | Decision |
|---|---|---|---|
| React | 18 | Frontend framework | KEEP |
| Vite | Latest | Build tool | KEEP |
| Tailwind CSS | Latest | Styling | KEEP |
| React Router | v6 | Client routing | KEEP |
| Axios | Latest | HTTP client | KEEP |
| TanStack React Query | v5 | Server-state cache | KEEP |
| Zustand | v4 | Client state | KEEP |
| Recharts | Latest | Charts | KEEP |
| Chart.js | — | Charts | REMOVED (redundant) |
| Express.js | 4 | Backend framework | KEEP |
| node-postgres (`pg`) | Latest | DB driver | KEEP |
| Zod | v3 | Validation | KEEP |
| Joi | — | Validation | REMOVED (use Zod only) |
| Helmet | Latest | Security headers | KEEP |
| Morgan | Latest | HTTP logging | KEEP |
| Winston | Latest | Application logging | KEEP |
| bcrypt | Latest | Password hashing | KEEP |
| express-rate-limit | Latest | Rate limiting | KEEP |
| node-pg-migrate | Latest | DB migrations | KEEP |
| db-migrate | — | DB migrations | REMOVED (use node-pg-migrate) |
| Docker | Latest | Local dev | KEEP |
| GitHub Actions | — | CI/CD | KEEP |
| Husky | Latest | Pre-commit hooks | KEEP |
| PostgreSQL | 15 | Database | KEEP |
| Vercel | — | Frontend hosting | KEEP |
| Render | — | Backend hosting | KEEP |
| Supabase | — | Managed Postgres | KEEP |

---

## 23. Edge-Case Behavior Reference

| Edge Case | System Behavior |
|---|---|
| Student has no target role | All gap/readiness APIs return `{ data: null, message: "No target role selected" }`. Dashboard shows role selector prompt. |
| Role has no skills | RS = NULL with code `ROLE_HAS_NO_SKILLS` and message "This role has no defined skill requirements yet." (PHA-07: APPROVED) |
| Role has skills but no questions for a skill | Assessment start returns 422 with `INSUFFICIENT_QUESTIONS`. Faculty notified in management UI. |
| Student never takes any assessment | Readiness = 0. All `skill_gaps.is_assessed = false`. Recommendations: R01/R02 fire for all skills. |
| Student scores exactly 0 on completed attempt | `is_assessed = true`, `current_score = 0`, gap = required_level. NOT same display as unassessed. |
| Student scores above required level | `gap = 0`, `gap_category = 'none'`, `r_i = 1.0` (capped). No recommendation. |
| Assessment expires during attempt | Backend rejects submission with 422 ASSESSMENT_TIMED_OUT. Attempt set to `timed_out`. No skill score update. |
| Browser refresh during assessment | `attemptId` retrieved from `sessionStorage`. Remaining time recalculated from server's `started_at`. |
| Double submission | Second POST returns 409 ASSESSMENT_ALREADY_SUBMITTED. Result from first submission returned. |
| Duplicate email registration | 409 DUPLICATE_ENTRY. |
| Faculty deactivates a role students are targeting | Service nulls out `target_role_id` for affected students. They see "Your target role was deactivated — please select a new one." |
| Faculty changes required_level | Gaps become stale. Staleness detected on next dashboard load. Lazy recompute triggered. |
| Invalid resource URL in prep activity | Zod rejects with 400 VALIDATION_ERROR. |
| Student requests another student's attempt | 404 NOT_FOUND (IDOR protection — do not reveal existence). |
| Faculty requests out-of-scope student | 404 NOT_FOUND. |

---

## 24. Performance & Index Design

### Mandatory Indexes (beyond implicit PK/UNIQUE indexes)

```sql
-- Cooldown check + attempt history
CREATE INDEX idx_attempts_student_skill_status
ON assessment_attempts (student_id, skill_id, status);

-- Readiness progress chart
CREATE INDEX idx_rs_history_student_role_time
ON readiness_score_history (student_id, role_id, recorded_at);

-- Preparation summary by skill
CREATE INDEX idx_prep_student_date
ON preparation_activities (student_id, activity_date);

-- Active recommendations
CREATE INDEX idx_recommendations_student_role_active
ON recommendations (student_id, role_id) WHERE is_dismissed = false;

-- Faculty batch filter
CREATE INDEX idx_student_profiles_batch_branch
ON student_profiles (batch_year, branch);

-- Skill gap dashboard query
CREATE INDEX idx_skill_gaps_student_role
ON skill_gaps (student_id, role_id);
```

### N+1 Query Prevention Rules
- Faculty student list + readiness: single JOIN query, not loop.
- Assessment session questions: `WHERE id = ANY($question_ids)` not individual queries.
- Recommendation list with skill names: JOIN recommendations to skills in one query.

### Caching Verdict
No Redis for MVP. React Query provides sufficient frontend caching. Server-side caching would only be needed if response times become unacceptable with 100+ concurrent users — improbable for a student project.

---

## 25. Future ML Integration Scope

### What MVP Data Supports

| Data | ML Use Case | Quality |
|---|---|---|
| `assessment_attempts.skill_score` over time | Feature: score trajectory | ✅ Good |
| `readiness_score_history` | Target: readiness trend | ✅ Good |
| `skill_gaps` trajectory | Feature: gap reduction rate | ✅ Good |
| `preparation_activities.hours_spent` | Feature: effort | ⚠️ Self-reported, unreliable |
| `student_profiles.cgpa`, `branch`, `batch_year` | Features: academic background | ✅ Good static features |
| **Placement outcome** | Target: was placed? | ❌ Not collected in MVP |

### The Missing Label Problem
A placement prediction model needs "was the student placed?" as a label. The MVP collects no such data. Without it, ML is not possible regardless of how rich the feature set is.

**Phase 12 prerequisite**: Add a `placement_outcomes` table with at minimum:
- `student_id`, `was_placed BOOLEAN`, `company_name`, `offer_role`, `offer_date`, `placement_drive_id`

Until 2–3 batches of outcome data are collected (typically 1–2 years), ML remains impractical.

**Do not claim "ML-ready" in the project presentation.** Claim: "The database schema is designed to support future ML once placement outcome data is collected."

---

## 26. Final Blueprint

### A. System Architecture
Three-tier: React SPA → Express REST API → PostgreSQL. Strict layering. Stateless backend.

### B. User Roles
Student (self-register, one target role), Faculty/TPO (seed-created, batch-scoped), Admin (no MVP UI).

### C. Functional Modules (14)
M01 Auth, M02 Profile, M03 Roles, M04 Skills, M05 Role-Skill Mapping, M06 Question Bank, M07 Assessment Engine, M08 Scoring, M09 Gap Engine, M10 Readiness Engine, M11 Preparation Tracker, M12 Recommendation Engine, M13 Student Analytics, M14 Faculty Analytics.

### D. Database Tables (20, corrected)
users, refresh_tokens, student_profiles, faculty_profiles, faculty_batch_scope, career_roles, skills, role_skill_requirements, questions, question_options, assessment_configs, assessment_attempts, attempt_questions, attempt_answers, student_skill_scores, skill_gaps (+ is_assessed), readiness_scores, readiness_score_history, preparation_activities, recommendations (+ dismissed_at, partial unique indexes).

### E. Readiness Formula
`RS = 100 × Σ(min(score_i, req_i)/req_i × weight_i) / Σ(weight_i)`
RS = 100 when all requirements met. RS = 0 when nothing assessed.

### F. Skill Gap Formula
`gap_i = max(0, required_level_i − current_score_i)`
Categories: none (0), small (1–15), medium (16–35), critical (36–100). `is_assessed` flag distinguishes "never assessed" from "scored zero."

### G. Recommendation Logic
Deterministic rule-based engine. 8 rules with defined precedence. Priority = gap × weight. Maximum 10 active recommendations per student per role (PHA-10: APPROVED).

### H. REST API
13 route groups. `/me` convention for self-referential routes. Soft deletes via PATCH. All IDOR-protected.

### I. Frontend Structure
Feature-based (`features/<module>/components/ + hooks/`). React Query for server state. Zustand for auth + UI state. 5 member-aligned feature folders.

### J. Backend Structure
Route → Controller → Service → Repository → PostgreSQL. Service dependency graph is acyclic. Zod validation. Parameterized SQL only.

### K. Five-Member Ownership
M1: Auth + Profile. M2: Assessment Engine. M3: Roles + Skills + Gap + Readiness. M4: Prep + Recommendations. M5: Analytics + UI Library + Deployment.

### L. Git Workflow
`main` ← `develop` ← feature branches. Squash merge. Conventional commits. Migration PRs need 2 reviews + 24h wait.

### M. Development Phases
8 MVP phases. Parallel from Phase 1 via stub strategy. No phase is strictly blocked except M2 needing M3's seed data (Phase 2 end).

### N. Testing Strategy
Jest unit tests, Supertest integration tests, Vitest+RTL frontend tests, Playwright E2E for 4 core flows.

### O. Deployment
Vercel (frontend) + Render (backend) + Supabase (PostgreSQL). Docker for local dev.

### P. Future ML
Requires `placement_outcomes` table (Phase 12+). Do not claim ML capability before outcome data is collected.

---

## 27. Approved Decisions Register

All six architectural decisions flagged during the v1.0 review have been formally approved and recorded in [`DECISIONS.md`](file:///C:/Users/deepa/OneDrive/Desktop/capston/DECISIONS.md) at the repository root.

| ID | Decision Question | Approved Decision | Status | Impact / Enforcement |
|---|---|---|---|---|
| **PHA-07** | What is RS when a role has 0 skills? | `readiness_score = NULL` with clear warning/status `ROLE_HAS_NO_SKILLS` indicating no defined skill requirements. Never 100 or 0. | **APPROVED** | Readiness formula zero-division guard; UI displays prompt to configure role requirements. |
| **PHA-10** | What is the maximum active recommendations cap? | Maximum 10 active (non-dismissed) recommendations per student per role. | **APPROVED** | `RecommendationService` applies rule precedence and caps output at top 10 ranked by priority and `priority_score = gap * weight`. |
| **PHA-11** | Can faculty see student preparation activity details? | Aggregate preparation metrics only (total hours, hours per skill). No access to student URLs, descriptions, or individual private log rows. | **APPROVED** | Faculty endpoints and queries omit raw preparation rows; student activity logs remain private. |
| **PHA-15** | How are faculty accounts created in MVP? | Created exclusively through protected database seed scripts (`db/seeds/`) and admin setup. No public faculty self-registration; no admin UI in MVP. | **APPROVED** | Public registration hard-codes `role = 'student'`; client-supplied `role` is strictly ignored/rejected. |
| **PHA-D06** | Should readiness/gap use `current_score` or `best_score`? | `current_score` (latest valid completed attempt) is used for gap and readiness calculations. `best_score` and full history retained for analytics and ML. | **APPROVED** | Gap = `max(0, required_level - current_score)`; readiness ratio uses `current_score`; Rule R07 detects score drops (`current_score < best_score - 15`). |
| **PHA-D13** | When to add the `placement_outcomes` table? | Do not create `placement_outcomes` in MVP. Reserve for Phase 12+ when actual placement drives yield historical placement outcome labels. | **APPROVED** | MVP database locked at 20 operational tables; future ML scope documented without premature schema clutter. |

---

*End of Architecture Specification v1.1 — Approved Final*  
*All 6 PHA items are resolved and recorded in `DECISIONS.md`.*  
*Architecture is FROZEN and APPROVED FOR PHASE 1 FOUNDATION WORK.*
