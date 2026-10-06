# Architecture Decision Records (ADR)

## Smart Placement Readiness & Skill Gap Tracker

**Project Stack**: PERN (PostgreSQL 15 · Express.js · React 18 · Node.js)  
**Architecture Spec Baseline**: `docs/architecture_spec_v1_1.md`  
**Review Document Reference**: `docs/architecture_review.md`  
**Date**: 2026-10-06  
**Status**: APPROVED — All 6 Pending Human Approval (PHA) items resolved.

---

## Executive Summary

Prior to initiating Phase 1 development, six architectural review decisions were flagged as requiring formal human approval. All six decisions have been reviewed, aligned with pedagogical objectives and security requirements, and formally approved.

This document records the approved decisions, rationale, architectural impacts, and system-wide invariants.

---

## Decision Summary Table

| Decision ID | Area                    | Final Decision                                                                                                                                                  | Status       |
| ----------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **PHA-07**  | Readiness Engine        | If a role has zero required skills, `readiness_score = NULL`. UI/API indicates no defined skill requirements.                                                   | **APPROVED** |
| **PHA-10**  | Recommendation Engine   | Maximum 10 active (non-dismissed) recommendations per student per target role.                                                                                  | **APPROVED** |
| **PHA-11**  | Privacy & Faculty Scope | Faculty/TPO can view aggregate preparation metrics only; strictly no access to student resource URLs, descriptions, or individual private log rows.             | **APPROVED** |
| **PHA-15**  | Auth & Provisioning     | Faculty accounts are created through protected database seed/admin setup in MVP. No public faculty self-registration; no admin UI in MVP.                       | **APPROVED** |
| **PHA-D06** | Scoring & Gap Engine    | Use `current_score` (latest valid completed assessment) for skill gap and readiness calculations. Maintain `best_score` and full attempt history for analytics. | **APPROVED** |
| **PHA-D13** | Future ML & Database    | Do not create `placement_outcomes` table in MVP schema. Reserve for Phase 12+ when placement tracking begins.                                                   | **APPROVED** |

---

## Detailed Decision Records

### 1. PHA-07: Readiness Score Behavior for Roles with Zero Skills

- **Decision ID**: `PHA-07`
- **Topic**: Composite Readiness Score calculation when a target career role has zero associated skill requirements.
- **Status**: **APPROVED**
- **Final Decision**:
  - If a career role has no entries in `role_skill_requirements`, the Readiness Score Engine must return `readiness_score = NULL`.
  - The API and UI must clearly return and display a descriptive warning/status: `"This role has no defined skill requirements yet"` with error/status code `ROLE_HAS_NO_SKILLS`.
  - The system must **never** return `100` (vacuously ready) or `0` (false failure) in this scenario.
- **Rationale**:
  - In the corrected role-relative formula:
    $$\text{Readiness Score} = 100 \times \frac{\sum_{i} (r_i \times w_i)}{\sum_{i} w_i}$$
    When zero skills are mapped to a role, $\sum w_i = 0$, causing a mathematical division-by-zero anomaly ($0 / 0$).
  - Assigning `100` is dangerous and misleading because a student is not placement-ready for an undefined role.
  - Assigning `0` is punitive and misleading because it implies the student failed assessments.
  - Returning `NULL` alongside explicit UI messaging provides transparency, avoids silent data corruption in analytics averages, and prompts faculty to configure the role.
- **Architectural Impact**:
  - **Database**: `readiness_scores.score` remains `NUMERIC(5,2)`, but when no skills exist, the engine does not insert a misleading score; or the API layer maps empty requirement sets to `{ score: null, status: "ROLE_HAS_NO_SKILLS" }`.
  - **ReadinessService**: Added zero-division guard in `ReadinessService.recompute(studentId, roleId)`:
    ```js
    if (requirements.length === 0 || totalWeight === 0) {
      return {
        score: null,
        code: 'ROLE_HAS_NO_SKILLS',
        message: 'Selected role has no defined skill requirements.',
      };
    }
    ```
  - **API Contract**: `GET /api/readiness/me` returns:
    ```json
    {
      "success": true,
      "data": {
        "score": null,
        "status": "ROLE_HAS_NO_SKILLS",
        "message": "Selected role has no defined skill requirements."
      }
    }
    ```
  - **Frontend UI**: `ReadinessGauge` renders an empty/prompt state ("Role Configuration Pending") rather than a 0% or 100% dial.

---

### 2. PHA-10: Recommendation Cap Per Student Per Role

- **Decision ID**: `PHA-10`
- **Topic**: Active recommendation cardinality and cognitive load control.
- **Status**: **APPROVED**
- **Final Decision**:
  - The Recommendation Engine enforces a hard limit of **maximum 10 active (non-dismissed) recommendations per student per target career role**.
  - Active recommendations are prioritized using the deterministic rule set, ranked by priority band (`HIGH` > `MEDIUM` > `LOW`) and internally sorted by `priority_score = gap * weight`. Only the top 10 ranked items are retained.
- **Rationale**:
  - Without an active cap, a student targeting a comprehensive role with multiple unassessed or critical skills could receive 20+ recommendations at once, leading to cognitive fatigue, analysis paralysis, and UI clutter.
  - Capping active recommendations at 10 focuses student attention on the highest-leverage actions (unassessed high-weight foundational skills and critical gaps) before moving to lower-priority refinements.
  - Once a student completes a recommended assessment or logs sufficient practice, the gap decreases or is resolved, freeing slots for subsequent recommendations on the next regeneration cycle.
- **Architectural Impact**:
  - **RecommendationService**: The recommendation generation pipeline evaluates all applicable rules (R01–R07), calculates `priority_score = gap * weight`, sorts descending, and applies `.slice(0, 10)` before writing or upserting to the database.
  - **Database Indexing**: The existing partial unique index `(student_id, role_id, skill_id, recommendation_type)` and partial index `(student_id, role_id) WHERE is_dismissed = false` efficiently back this limit and query pattern.
  - **Frontend UI**: The Recommendations dashboard renders a clean, focused list of up to 10 actionable cards, preventing unbounded scroll and visual noise.

---

### 3. PHA-11: Faculty Privacy Boundary on Student Preparation Data

- **Decision ID**: `PHA-11`
- **Topic**: Access boundaries and privacy controls for student preparation activity logs.
- **Status**: **APPROVED**
- **Final Decision**:
  - Faculty and TPO members are granted access to **aggregate preparation metrics only** (e.g., total preparation hours, hours grouped by skill category, prep streaks, weekly time distributions).
  - Faculty/TPO **must NOT** have access to student preparation resource URLs (`resource_url`), personal reflection descriptions (`description`), or detailed individual activity logs.
  - Individual activity rows and personal notes remain strictly private to the student who authored them.
- **Rationale**:
  - Ethical & Psychological: Preparation logs serve as a personal study journal. If students know faculty inspect their specific browsing links, personal video URLs, or self-evaluative notes, they will either self-censor or avoid using the tracking feature altogether.
  - Role Responsibility: Faculty and TPO need diagnostic visibility into effort and engagement trends (e.g., "Has Batch 2026 put 20+ hours into DSA?") rather than micro-surveillance of individual links.
  - Security & Compliance: Minimizes privacy liability, prevents institutional overreach, and protects student data privacy.
- **Architectural Impact**:
  - **Repository Layer**: No faculty endpoint queries `SELECT * FROM preparation_activities` for student-specific rows. The repository exposes only aggregate functions:
    ```sql
    -- Allowed faculty query:
    SELECT skill_id, SUM(hours_spent) as total_hours, COUNT(*) as activity_count
    FROM preparation_activities pa
    JOIN student_profiles sp ON pa.student_id = sp.id
    WHERE sp.batch_year = $1 AND sp.branch = $2
    GROUP BY skill_id;
    ```
  - **API Contract**:
    - `GET /api/preparation/me` (student only): returns full activity rows with `description` and `resource_url`.
    - `GET /api/faculty/analytics/students/:studentId` (faculty): returns `{ totalPrepHours, hoursBySkill, weeklyTrend }`, omitting raw items.
    - No `/api/faculty/students/:studentId/preparation` raw list endpoint exists.
  - **IDOR Protection**: Any direct attempt by faculty to invoke `/api/preparation/:id` returns `403 INSUFFICIENT_ROLE` or `404 NOT_FOUND`.

---

### 4. PHA-15: Faculty Account Provisioning & Registration Security

- **Decision ID**: `PHA-15`
- **Topic**: Provisioning mechanism for faculty/TPO user accounts and prevention of privilege escalation.
- **Status**: **APPROVED**
- **Final Decision**:
  - In the MVP, faculty accounts are created exclusively through **protected database seed scripts (`db/seeds/`) and authorized database administration**.
  - There is **no public faculty self-registration**.
  - There is **no admin UI** in MVP.
  - The public registration endpoint (`POST /api/auth/register`) strictly hardcodes `role = 'student'` and completely ignores or rejects any client-supplied `role` attribute.
- **Rationale**:
  - Security Invariant: Permitting public self-registration with elevated permissions (faculty/TPO) creates an immediate privilege escalation vulnerability (CWE-269).
  - Scope of MVP: Academic deployment at MVP scale typically involves a small, defined cohort of 5–15 faculty members and TPO coordinators. Building a full admin invite system, domain-verification email flow, and role-management UI consumes development bandwidth without adding core pedagogical value.
  - Controlled Onboarding: Seed scripts and direct DB setup provide an immutable, version-controlled audit trail of privileged users for demonstration and viva defense.
- **Architectural Impact**:
  - **AuthService / Controller**:
    ```js
    // In auth.controller.js / auth.service.js:
    const newUser = await userRepository.create({
      email: validatedData.email,
      password_hash: hashedPassword,
      role: 'student', // HARDCODED: client input cannot override
    });
    ```
  - **Database Seeds**: `db/seeds/001_faculty_seed.sql` pre-populates verified faculty profiles, password hashes, and scopes for testing and grading.
  - **Scope Enforcement**: Faculty accounts provisioned in seeds are explicitly linked to `faculty_profiles` and assigned valid `(batch_year, branch)` scopes in `faculty_batch_scope`.

---

### 5. PHA-D06: Score Selection Policy for Skill Gap and Readiness Calculations

- **Decision ID**: `PHA-D06`
- **Topic**: Determining whether skill gaps and composite readiness scores are derived from `current_score` (latest completed assessment) or `best_score` (historical maximum).
- **Status**: **APPROVED**
- **Final Decision**:
  - **`current_score`** (the score from the most recent valid, completed assessment attempt) **must be used** as the primary driver for:
    1. Skill gap calculations (`gap = max(0, required_level - current_score)`).
    2. Role readiness score calculation ($r_i = \min(\text{current\_score}_i, \text{required\_level}_i) / \text{required\_level}_i$).
    3. Actionable recommendation generation.
    4. Faculty intervention identification.
  - **`best_score`** (highest historical score) and full attempt records in `assessment_attempts` are permanently preserved for:
    1. Student motivational dashboard display (showing current vs. peak performance).
    2. Longitudinal progress charts.
    3. Detecting skill decay / degradation via Rule R07 (`current_score < best_score - 15`).
    4. Future ML feature engineering.
- **Rationale**:
  - Honest Readiness: Campus recruitment tests technical competence at the present moment. A student who scored 85 in Data Structures six months ago but scores 40 today is not currently placement-ready. Using historical best produces a false sense of security.
  - Sensitivity to Remediation: When a student prepares and reassesses, their `current_score` immediately rises, reflecting fresh gains in readiness score and closing gaps.
  - Decay Accountability: Retaining `best_score` enables the system to detect score regression (`current_score < best_score - 15`) and trigger targeted review recommendations (Rule R07) without distorting the actual current gap.
- **Architectural Impact**:
  - **Table 15 (`student_skill_scores`)**: Tracks both `current_score` and `best_score`. On attempt submission:
    ```sql
    INSERT INTO student_skill_scores (student_id, skill_id, current_score, best_score, attempt_count, last_attempted_at)
    VALUES ($1, $2, $score, $score, 1, NOW())
    ON CONFLICT (student_id, skill_id) DO UPDATE SET
      current_score = EXCLUDED.current_score,
      best_score = GREATEST(student_skill_scores.best_score, EXCLUDED.current_score),
      attempt_count = student_skill_scores.attempt_count + 1,
      last_attempted_at = NOW();
    ```
  - **SkillGapService & ReadinessService**: Read `current_score` from `student_skill_scores`.
  - **Frontend UI**: Displays `current_score` as the active operational metric, alongside a "Personal Best: {best_score}" badge.

---

### 6. PHA-D13: Deferral of `placement_outcomes` Table to Phase 12+

- **Decision ID**: `PHA-D13`
- **Topic**: Inclusion of a `placement_outcomes` table in the MVP database schema.
- **Status**: **APPROVED**
- **Final Decision**:
  - **Do NOT create** the `placement_outcomes` table in the MVP schema.
  - The MVP database schema remains strictly consolidated at **20 operational tables**.
  - Placement outcome tracking is formally classified as a **Phase 12+ enhancement** for future ML model training once institutional placement drives occur and labels become available.
- **Rationale**:
  - The Missing Label Reality: In an MVP deployment, students are actively preparing. Actual placement offers, company placement records, and offer dates occur at the end of the academic year. Any table created during MVP would sit completely empty with zero operational purpose.
  - Schema Hygiene & Scope Control: Avoids speculative database schema design (YAGNI principle). Maintaining empty tables with foreign keys and unutilized migrations complicates testing, seed scripts, and architectural auditing without adding functional capability.
  - Presentation Honesty: The project presentation will accurately state: _"The MVP data architecture is engineered to capture rich feature trajectories (score history, gap closure rates, effort logs), which will feed predictive ML models once historical placement outcome labels are gathered in Phase 12."_
- **Architectural Impact**:
  - **Database**: Total MVP table count is locked at 20 tables. No migration for `placement_outcomes` will be created in Phase 1 or MVP.
  - **Documentation**: Section 5, Section 21, and Section 25 of `docs/architecture_spec_v1_1.md` clearly delineate between MVP tables (20) and Phase 12+ ML schema extensions.
  - **Repositories & Services**: No stub code, routes, or controllers for placement outcomes are included in MVP phases.

---

## Conclusion & Implementation Clearance

With all six decisions formally approved and documented:

1. All conceptual and architectural ambiguities from the v1.0 review are resolved.
2. The core mathematical formulation for readiness is deterministic, sound, and edge-case resilient.
3. Privacy boundaries and security controls are strictly defined.
4. The database schema is locked at 20 normalized, constrained tables.
5. The project architecture is **FROZEN and APPROVED FOR PHASE 1 FOUNDATION WORK**.
