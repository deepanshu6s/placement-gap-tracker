# Database Architecture & Development Guide

## Smart Placement Readiness & Skill Gap Tracker

**Baseline Reference**: [`docs/architecture_spec_v1_1.md`](architecture_spec_v1_1.md) (Section 5, 6, 24)  
**Approved Decisions**: [`DECISIONS.md`](../DECISIONS.md)  
**Current Phase**: Phase 1 — Project Foundation

---

## 1. Database Foundation Status

- **Status in Phase 1**: **FOUNDATION ONLY (PLANNED SCHEMA)**
- **Active Tables in Phase 1**: None. The 20 application tables will be created via versioned migrations in Phase 2+.
- **Database Engine**: PostgreSQL 15 (Docker Alpine container in local dev; Supabase in production).
- **Migration Tool**: `node-pg-migrate` (SQL-based migrations in `backend/src/db/migrations/`).
- **Connection Driver**: `pg` (node-postgres) with connection pooling (`pg.Pool`).
- **Total Operational Tables in MVP**: **20 tables** (Normalized to 3NF).

---

## 2. Table Inventory (20 Operational MVP Tables — PLANNED)

| Table # | Table Name                | Purpose                                                            | Primary Key | Owner    |
| ------- | ------------------------- | ------------------------------------------------------------------ | ----------- | -------- |
| 1       | `users`                   | Master user credentials, roles (`student`, `faculty`, `admin`)     | UUID        | Member 1 |
| 2       | `refresh_tokens`          | SHA-256 hashed refresh tokens for session rotation                 | UUID        | Member 1 |
| 3       | `student_profiles`        | Academic background (roll, branch, batch, CGPA, target role)       | UUID        | Member 1 |
| 4       | `faculty_profiles`        | Faculty metadata and TPO designation flag                          | UUID        | Member 1 |
| 5       | `faculty_batch_scope`     | Faculty authorization mapping to `(batch_year, branch)`            | UUID        | Member 1 |
| 6       | `career_roles`            | Catalogue of placeable career roles                                | UUID        | Member 3 |
| 7       | `skills`                  | Global skills taxonomy (`technical`, `soft`, `domain`, `aptitude`) | UUID        | Member 3 |
| 8       | `role_skill_requirements` | Mapping of required proficiency and weight (1–5) per role          | UUID        | Member 3 |
| 9       | `questions`               | MCQ question bank per skill with difficulty bands                  | UUID        | Member 2 |
| 10      | `question_options`        | MCQ answer options (enforces 1 correct answer)                     | UUID        | Member 2 |
| 11      | `assessment_configs`      | Assessment parameters per skill (questions, time limit, cooldown)  | UUID        | Member 2 |
| 12      | `assessment_attempts`     | Student assessment attempts, timing, and raw/scaled score          | UUID        | Member 2 |
| 13      | `attempt_questions`       | Snapshot of questions served during an assessment attempt          | UUID        | Member 2 |
| 14      | `attempt_answers`         | Student submitted option per question per attempt                  | UUID        | Member 2 |
| 15      | `student_skill_scores`    | Current and best score per student per skill                       | UUID        | Member 2 |
| 16      | `skill_gaps`              | Computed gap, category, and `is_assessed` flag per role-skill      | UUID        | Member 3 |
| 17      | `readiness_scores`        | Composite readiness score per (student, role) (NULL if 0 skills)   | UUID        | Member 3 |
| 18      | `readiness_score_history` | Append-only audit log of readiness score progression               | UUID        | Member 3 |
| 19      | `preparation_activities`  | Student study and practice activity logs                           | UUID        | Member 4 |
| 20      | `recommendations`         | Active prioritized recommendations (max 10 per role)               | UUID        | Member 4 |

> **Future Table (Phase 12+)**: `placement_outcomes` is deferred to Phase 12+ per decision **PHA-D13 (APPROVED)**.

---

## 3. Database Constraints & Invariants

PostgreSQL serves as the first line of defense for business invariants:

1. **Option Belonging to Question**: Scoring validates that selected option exists in `question_options` for that question.
2. **Exactly One Correct Answer**: Partial unique index on `question_options (question_id) WHERE is_correct = true`.
3. **No Duplicate Concurrent Attempts**: Partial unique index on `assessment_attempts (student_id, skill_id) WHERE status = 'in_progress'`.
4. **Recommendation Uniqueness (Upsert)**:
   - `uq_recommendation_with_skill`: `UNIQUE (student_id, role_id, skill_id, recommendation_type) WHERE skill_id IS NOT NULL`
   - `uq_recommendation_no_skill`: `UNIQUE (student_id, role_id, recommendation_type) WHERE skill_id IS NULL`
5. **Readiness Score Nullability (PHA-07)**: `readiness_scores.score` is `NULLABLE CHECK(score IS NULL OR (score >= 0 AND score <= 100))`.
6. **Unassessed Skill State (CP-02)**: `skill_gaps.is_assessed BOOLEAN NOT NULL DEFAULT false` distinguishes unassessed skills from a score of 0.

---

## 4. Local Development & Migration Workflow

### Starting the Database Container

```bash
docker compose up -d postgres
```

### Running Migrations (Phase 2+)

```bash
cd backend
npm run migrate:up
```

### Rolling Back Migrations

```bash
cd backend
npm run migrate:down
```

### Seeding Initial Data

```bash
cd backend
npm run seed
```
