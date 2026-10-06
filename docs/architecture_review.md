# Architecture Review — v1.0
## Smart Placement Readiness & Skill Gap Tracker
**Reviewer**: Antigravity (Lead Architect Audit)
**Source document**: `architecture_spec.md` v1.0
**Review date**: 2026-10-06
**Status**: REVIEW COMPLETE — all 6 pending human approval items APPROVED (see DECISIONS.md); v1.1 adopted

---

## 1. Executive Summary

The v1.0 architecture is a **solid foundation** for a five-member final-year PERN project. The technology choices, layered backend structure, feature-based frontend layout, and security thinking are all appropriate. Most of the database tables are correct.

However, there are **seven problems serious enough to cause incorrect behavior or impossible-to-implement features** if not fixed before development begins, and **eleven medium problems** that would cause bugs, security holes, or team conflicts.

**The single most critical problem is the readiness formula.** The current formula (`Σ(score × weight) / Σ(weight)`) does not measure readiness against the role's requirements. It measures the absolute weighted average of raw skill scores. A student scoring 60/100 on a skill that only requires 60 is "100% ready" for that skill, but the current formula gives them only a 60% contribution — making them look less ready than they actually are. This fundamentally breaks the meaning of "Placement Readiness Score."

---

## 2. Critical Problems (must fix before Phase 1)

### CP-01 — Readiness Formula is Conceptually Wrong
**Location**: Section 7, Table 17

**Current formula**:
```
ReadinessScore = Σ(skill_score × weight) / Σ(weight)
```

**Why it is wrong**:
- The formula measures the weighted average of raw scores, not readiness relative to role requirements.
- A student who scores exactly at the required level for every skill should have a readiness of 100. The current formula does NOT produce 100 unless every skill score is 100.
- A role requiring only 40/100 for every skill can never give the student a readiness of 100 even if they meet all requirements perfectly.

**Mathematical proof** (five examples — see Section 6 for full analysis):

| Example | Req | Weight | Student Score | Current Formula result | Expected result |
|---|---|---|---|---|---|
| E1: meets all exactly | 60 | 3 | 60 | 60/100 (wrong) | 100/100 |
| E2: perfect student | 80 | 5 | 100 | 100/100 (right but for wrong reason) | 100/100 |
| E3: above requirement | 70 | 4 | 90 | 90 (not capped at required level) | capped at requirement |
| E4: below requirement | 80 | 5 | 60 | weighted 60 (wrong scale) | proportional gap score |
| E5: mixed | see Section 6 | various | various | wrong | correct |

**Fix**: Use a per-skill readiness ratio capped at 1.0. See Section 6 for the complete corrected formula.

---

### CP-02 — Unassessed Skill State is Not Representable in the Database
**Location**: Section 8 / `student_skill_scores` (Table 15) / `skill_gaps` (Table 16)

**Problem**:
The architecture says: "If `current_score = 0` AND the student has never taken the assessment, the gap equals `required_level` but is flagged separately." However, the `student_skill_scores` table only has a record for a student-skill pair if the student has completed at least one attempt. **There is no row if the student has never attempted the skill.**

The distinction "never assessed" vs "assessed and scored 0" therefore only exists at runtime by checking whether a row exists in `student_skill_scores`. This is fragile:
- The gap engine has to outer-join `role_skill_requirements` against `student_skill_scores`, treating NULL as "never assessed."
- The gap classification in `skill_gaps` has only four categories: `none | small | medium | critical`. There is no `unassessed` category, even though the architecture text describes it.
- If `skill_gaps` stores `current_score = 0` with `gap_category = 'critical'`, you cannot distinguish "assessed and bad" from "never assessed" later.

**Fix**: 
Add `is_assessed BOOLEAN NOT NULL DEFAULT false` to `skill_gaps`. Set it `true` after any completed attempt, regardless of score.

---

### CP-03 — `recommendations` Table Has No Composite Unique Constraint for Upsert
**Location**: Section 9 / Table 20

**Problem**:
The architecture says: "Old recommendations for the same `(student_id, role_id, skill_id, recommendation_type)` tuple are replaced (upsert by composite key)." But the `recommendations` table has **no UNIQUE constraint** on this tuple. Without this constraint, PostgreSQL `INSERT ... ON CONFLICT` cannot work, and the application will accumulate duplicate recommendations over multiple regenerations.

**Fix**: Add to `recommendations` table:
```sql
-- For skill-specific recommendations (skill_id NOT NULL):
CREATE UNIQUE INDEX uq_recommendation_with_skill
ON recommendations (student_id, role_id, skill_id, recommendation_type)
WHERE skill_id IS NOT NULL;

-- For role-level recommendations (skill_id IS NULL):
CREATE UNIQUE INDEX uq_recommendation_no_skill
ON recommendations (student_id, role_id, recommendation_type)
WHERE skill_id IS NULL;
```

---

### CP-04 — `attempt_answers` Has No Validation That Option Belongs to the Question
**Location**: Table 14 (`attempt_answers`)

**Problem**:
`attempt_answers.selected_option_id` is a FK to `question_options.id`. However, there is no constraint ensuring the selected option actually belongs to the question referenced in `attempt_answers.question_id`. A tampered request could reference an option from a different question and the database would accept it silently.

**Fix**: The scoring service must validate that `selected_option_id` belongs to `question_id` before writing the answer. This must happen in the backend `ScoringService`, not the frontend. It is a mandatory code-review check.

---

### CP-05 — Cooldown Enforcement Has a Race Condition
**Location**: Table 12, Section 9

**Problem**:
The cooldown check ("check `last_attempted_at` before allowing a new attempt") in the service layer has a TOCTOU race condition. Two concurrent `POST /api/assessments/start/:skillId` requests can both read the cooldown timestamp simultaneously, both pass the check, and two sessions get created.

**Fix**: Add a partial unique index at the database level:
```sql
CREATE UNIQUE INDEX one_active_attempt_per_student_skill
ON assessment_attempts (student_id, skill_id)
WHERE status = 'in_progress';
```
This prevents two concurrent `in_progress` attempts for the same student+skill regardless of race conditions. The service-layer cooldown check also remains for the time-based enforcement.

---

### CP-06 — Member 1 is a Blocking Bottleneck for All Other Members
**Location**: Section 13 (Team Architecture)

**Problem**:
Member 1 owns: `authenticate` middleware, `StudentLayout.jsx`, `FacultyLayout.jsx`, `api.js`, `authStore.js`, `ProtectedRoute`, `RoleRoute`, and the `student_profiles` table schema. All of these are dependencies for Members 2, 3, 4, and 5. In a 5-person team, this creates serialization that wastes weeks.

**Fix**: Stub strategy — Member 1 delivers on Day 1 of Phase 2:
1. `middleware/authenticate.stub.js` — injects hardcoded test user. Replaced in Phase 2.
2. `src/services/api.js` (minimal) — bare Axios instance with no interceptor yet.
3. `student_profiles` migration — just the schema, no data.

With these three stubs, all other members can begin building their feature branches immediately.

---

### CP-07 — Faculty Can Self-Register and Assign Themselves the Faculty Role
**Location**: Section 10 (`/api/auth/register`)

**Problem**:
If the registration endpoint accepts `role` in the request body, any user can register as `faculty` and gain access to all faculty endpoints. The architecture does not explicitly state this field must be rejected.

**Fix**: The `role` field must NEVER be accepted from the client during registration. The backend must hard-code `role = 'student'` for all self-registrations. Faculty accounts must be created by seed script or a separate admin/invite mechanism.

**[RESOLVED — APPROVED (PHA-15)]**: Faculty accounts are created through protected database seed/admin setup in MVP (`db/seeds/`). No public faculty self-registration; no admin UI in MVP.

---

## 3. Medium Problems

| ID | Problem | Fix |
|---|---|---|
| MP-01 | `profile_completed` boolean will drift out of sync | Service must recompute on every profile update |
| MP-02 | `skill_gaps` snapshot can be inconsistent with `student_skill_scores` on crash | Wrap post-assessment update in a PostgreSQL transaction |
| MP-03 | Rule R03 fires twice (study_resource + practice_skill) for one critical skill; R06 also fires for same skill | Add rule precedence: if R03 fires for a skill, suppress R06 for same skill |
| MP-04 | `assessment_configs` sum constraint (`easy+medium+hard=total`) is application-only | Add PostgreSQL CHECK constraint |
| MP-05 | "Exactly one correct answer per question" not DB-enforced | Add partial UNIQUE INDEX on `question_options (question_id) WHERE is_correct = true` |
| MP-06 | `readiness_score_history` missing ON DELETE rules for FKs | Add ON DELETE CASCADE for student_id, ON DELETE RESTRICT for role_id |
| MP-07 | Faculty can self-register (security hole) | Role must not be in request body (also in CP-07) |
| MP-08 | `/api/users` appears in architecture diagram but has no endpoint definition | Define or remove |
| MP-09 | Deactivating a role orphans students who had it as target role | On role deactivation, set `target_role_id = NULL` for affected students |
| MP-10 | Missing timestamps on `questions`, `question_options`, `skills`, `role_skill_requirements` | Add `updated_at` to these tables; add `dismissed_at` to `recommendations` |
| MP-11 | Backend timer is never enforced — only frontend timer exists | Backend must check `started_at + time_limit > NOW()` on submit |

---

## 4. Minor Problems

| ID | Problem |
|---|---|
| Min-01 | "Joi/Zod" ambiguity in architecture diagram — pick Zod only |
| Min-02 | "node-pg-migrate or db-migrate" ambiguity — pick node-pg-migrate |
| Min-03 | "Chart.js" mentioned alongside Recharts — remove Chart.js |
| Min-04 | `assessment_configs.passing_level` defined but never used in any business rule |
| Min-05 | `preparation_activities.resource_url` has no format validation specified |
| Min-06 | Commit type `db` is not standard Conventional Commits — use `chore(db)` |
| Min-07 | Profile completion described as "percentage" in module description but schema has BOOLEAN |
| Min-08 | `readiness_score_history` ON DELETE rules unspecified |
| Min-09 | `questions` table has no `updated_at` — cannot detect question edits vs question served |

---

## 5. Recommended Corrections Summary

| ID | Problem | Severity | Status |
|---|---|---|---|
| CP-01 | Readiness formula wrong | CRITICAL | RECOMMENDED CHANGE |
| CP-02 | Unassessed skill not representable | CRITICAL | RECOMMENDED CHANGE |
| CP-03 | No UNIQUE on recommendations | CRITICAL | RECOMMENDED CHANGE |
| CP-04 | Option-question validation missing | CRITICAL | RECOMMENDED CHANGE |
| CP-05 | Cooldown race condition | CRITICAL | RECOMMENDED CHANGE |
| CP-06 | Member 1 bottleneck | CRITICAL | RECOMMENDED CHANGE |
| CP-07 | Faculty self-registration | CRITICAL | RECOMMENDED CHANGE |
| MP-01 through MP-11 | Medium problems | MEDIUM | RECOMMENDED CHANGE |

---

## 6. Readiness Formula — Deep Mathematical Analysis

### Why the Current Formula Fails

Current formula:
```
RS = Σ(score_i × weight_i) / Σ(weight_i)
```

**Test: Student meets every requirement exactly — expected RS = 100**

Role: Software Engineer
| Skill | Required | Weight | Student Score |
|---|---|---|---|
| Data Structures | 80 | 5 | 80 |
| SQL | 60 | 3 | 60 |
| Communication | 50 | 2 | 50 |

```
Current result = (80×5 + 60×3 + 50×2) / (5+3+2) = 680/10 = 68
```

The student is perfectly placement-ready for this role and scores **68 out of 100. This is wrong.**

---

### The Correct Formula: Role-Relative Readiness

```
Per-skill readiness ratio:
  r_i = min(score_i, required_level_i) / required_level_i
  Special case: if required_level_i = 0, then r_i = 1.0
  If skill is unassessed (score_i = 0, is_assessed = false), then r_i = 0.0

Readiness Score:
  RS = 100 × Σ(r_i × weight_i) / Σ(weight_i)
```

**Properties**:
- RS = 100 when student meets all requirements.
- RS = 0 when no skill is assessed.
- Exceeding a requirement is capped at 1.0 (meeting 150% is no more useful than 100%).
- Role-specific: different roles with the same skills but different required levels give different RS values.
- Deterministic, explainable, viva-defensible.

---

### Five Worked Examples

**Example 1: Student meets every requirement exactly → RS must be 100**

| Skill | Required | Weight | Score | r_i = min(s,r)/r | r_i × weight |
|---|---|---|---|---|---|
| Data Structures | 80 | 5 | 80 | 80/80 = 1.000 | 5.000 |
| SQL | 60 | 3 | 60 | 60/60 = 1.000 | 3.000 |
| Communication | 50 | 2 | 50 | 50/50 = 1.000 | 2.000 |
| **Total** | | **10** | | | **10.000** |

```
RS = 100 × 10.000 / 10 = 100.0  ✅ Correct
Current v1.0 = 68.0  ❌ Wrong
```

---

**Example 2: Student exceeds requirement on some skills, below on others**

| Skill | Required | Weight | Score | r_i | r_i × weight |
|---|---|---|---|---|---|
| Data Structures | 80 | 5 | 95 | min(95,80)/80 = 1.000 | 5.000 |
| SQL | 60 | 3 | 80 | min(80,60)/60 = 1.000 | 3.000 |
| Communication | 50 | 2 | 30 | 30/50 = 0.600 | 1.200 |
| **Total** | | **10** | | | **9.200** |

```
RS = 100 × 9.200 / 10 = 92.0  ✅ Correct — almost ready, one gap
Current v1.0 = (95×5+80×3+30×2)/10 = 77.5  ❌ Underestimates by 14.5 points
```

---

**Example 3: One unassessed skill (score treated as 0, is_assessed = false)**

| Skill | Required | Weight | Score | r_i | r_i × weight |
|---|---|---|---|---|---|
| Data Structures | 80 | 5 | 70 | 70/80 = 0.875 | 4.375 |
| Algorithms | 75 | 5 | 0 (unassessed) | 0/75 = 0.000 | 0.000 |
| SQL | 60 | 3 | 80 | min(80,60)/60 = 1.000 | 3.000 |
| Communication | 50 | 2 | 60 | min(60,50)/50 = 1.000 | 2.000 |
| **Total** | | **15** | | | **9.375** |

```
RS = 100 × 9.375 / 15 = 62.5
Current v1.0 = (70×5+0×5+80×3+60×2)/15 = 47.3
```

Both penalize the unassessed skill. The new formula is more generous on the skills that ARE met, which is correct.

---

**Example 4: Low-requirement role — student barely passes all requirements → RS must be 100**

| Skill | Required | Weight | Score | r_i | r_i × weight |
|---|---|---|---|---|---|
| Basic Communication | 40 | 2 | 40 | 40/40 = 1.000 | 2.000 |
| Office Tools | 30 | 1 | 30 | 30/30 = 1.000 | 1.000 |
| **Total** | | **3** | | | **3.000** |

```
RS = 100 × 3.000 / 3 = 100.0  ✅ Correct
Current v1.0 = (40×2+30×1)/3 = 110/3 = 36.7  ❌ Completely wrong
```

This example is the clearest proof that v1.0 formula is broken.

---

**Example 5: Fully realistic mixed case — Data Analyst role**

| Skill | Required | Weight | Score | r_i | r_i × weight |
|---|---|---|---|---|---|
| SQL | 75 | 5 | 60 | 60/75 = 0.800 | 4.000 |
| Python | 70 | 4 | 55 | 55/70 = 0.786 | 3.143 |
| Statistics | 65 | 4 | 80 | min(80,65)/65 = 1.000 | 4.000 |
| Data Visualization | 60 | 3 | 40 | 40/60 = 0.667 | 2.000 |
| Communication | 50 | 2 | 70 | min(70,50)/50 = 1.000 | 2.000 |
| Excel | 55 | 2 | 0 (unassessed) | 0/55 = 0.000 | 0.000 |
| **Total** | | **20** | | | **15.143** |

```
RS (new) = 100 × 15.143 / 20 = 75.7
RS (v1.0) = (60×5+55×4+80×4+40×3+70×2+0×2)/20 = 1100/20 = 55.0
Difference: 20.7 percentage points
```

The v1.0 formula systematically underestimates by ~20 points for typical students. This is a structural defect in the formula itself.

---

### Formula Comparison Summary

| Property | v1.0 Formula | Proposed Formula |
|---|---|---|
| RS = 100 when all requirements met | ❌ No | ✅ Yes |
| RS = 0 when nothing assessed | ✅ Yes | ✅ Yes |
| Uses required_level in computation | ❌ No | ✅ Yes |
| Correctly caps over-achievers | ❌ No | ✅ Yes |
| Explainable to a student | ❌ No | ✅ Yes |
| Viva-defensible | ❌ Weak | ✅ Strong |
| Easy to implement in SQL/Node | ✅ Yes | ✅ Yes (same complexity) |

---

## 7. Unassessed Skills — Correct Schema

| State | `student_skill_scores` row | `assessment_attempts` | `skill_gaps.is_assessed` |
|---|---|---|---|
| A. Never assessed | NULL (no row) | None | false |
| B. Assessed, scored 0 | Row: current_score=0 | 1+ completed | true |
| C. Assessed, scored 50 | Row: current_score=50 | 1+ completed | true |
| D. Multiple attempts | Row: updated with latest | Multiple completed | true |
| E. Abandoned | NULL (no row) | 1 abandoned | false |
| F. Timed out | NULL (no row) | 1 timed_out | false |

**Required change**: Add `is_assessed BOOLEAN NOT NULL DEFAULT false` to `skill_gaps` table.

Gap computation pseudo-code:
```
for each skill in role_skill_requirements:
    score_row = LEFT JOIN student_skill_scores WHERE student_id=X AND skill_id=Y
    if score_row IS NULL:
        current_score = 0
        is_assessed = false
    else:
        current_score = score_row.current_score
        is_assessed = true
    gap = max(0, required_level - current_score)
    gap_category = classify_gap(gap)
    UPSERT skill_gaps (..., is_assessed, ...)
```

---

## 8. Current vs Best vs Historical Score — Policy

| Use Case | Score to Use | Rationale |
|---|---|---|
| Skill gap computation | current_score | Most honest |
| Readiness score | current_score | Consistent with gaps |
| Student dashboard display | Show BOTH current and best | Motivation + honesty |
| Faculty intervention | current_score | Current ability matters most |
| Recommendations | current_score | React to current state |
| Progress chart | assessment_attempts.skill_score over time | Full history |
| ML training | All columns + timestamps | Need full picture |

**Score drop policy**: If `current_score < best_score` by >15 points, generate Rule R07 recommendation ("score dropped — review this skill") but do NOT escalate gap_category beyond what current_score indicates.

**[RESOLVED — APPROVED (PHA-D06)]**: Use `current_score` (latest valid completed assessment attempt) for skill-gap, readiness calculations, recommendations, and faculty interventions. Retain `best_score` and full attempt history for analytics, progress tracking, and ML.

---

## 9. Assessment Engine — Security and Edge-Case Handling

### Double Submission Prevention
Use SQL atomic update:
```sql
UPDATE assessment_attempts 
SET status='completed', submitted_at=NOW(), skill_score=$score
WHERE id=$attemptId AND status='in_progress'
RETURNING id;
```
If RETURNING returns no rows → attempt was already submitted → return 409 Conflict.

### Browser Refresh Handling
- Store `current_attemptId` in `sessionStorage` (survives refresh, cleared on tab close).
- On mount, session endpoint returns `started_at` + `time_limit_minutes`.
- Frontend calculates `remaining = time_limit_minutes*60 - (NOW() - started_at)`.
- If remaining ≤ 0, auto-submit immediately.

### Backend Timer Enforcement (MISSING in v1.0)
The backend MUST reject late submissions:
```
if (NOW() > attempt.started_at + config.time_limit_minutes * INTERVAL '1 minute'):
    mark attempt as 'timed_out'
    return 422 Unprocessable Entity
```
Timer enforcement must NEVER be frontend-only.

### Correct Answer Exposure Prevention
`GET /api/assessments/session/:attemptId` repository query must explicitly SELECT only:
`id, question_text, difficulty, options(id, option_text, display_order)` — never `is_correct`.

---

## 10. Transaction Requirements

### Operation 1: Assessment Submission (atomic)
```sql
BEGIN;
  -- Step 1: Mark attempt completed (atomic check)
  UPDATE assessment_attempts SET status='completed', submitted_at=NOW(), raw_score=$r, skill_score=$s
  WHERE id=$attemptId AND status='in_progress';
  -- If 0 rows updated: ROLLBACK, return 409

  -- Step 2: Upsert skill score
  INSERT INTO student_skill_scores (student_id, skill_id, current_score, best_score, attempt_count, last_attempted_at)
  VALUES (...)
  ON CONFLICT (student_id, skill_id) DO UPDATE
  SET current_score = EXCLUDED.current_score,
      best_score = GREATEST(student_skill_scores.best_score, EXCLUDED.current_score),
      attempt_count = student_skill_scores.attempt_count + 1,
      last_attempted_at = NOW();

  -- Step 3: Recompute skill gaps (for current target role)
  -- [loop over role_skill_requirements and upsert skill_gaps]

  -- Step 4: Recompute readiness score
  -- [compute and upsert readiness_scores]

  -- Step 5: Append to readiness history
  INSERT INTO readiness_score_history (student_id, role_id, score, recorded_at) VALUES (...);
COMMIT;
-- AFTER COMMIT: trigger recommendation regeneration (async, not in transaction)
```

### Operation 2: Role Change (atomic)
```sql
BEGIN;
  UPDATE student_profiles SET target_role_id=$new_role WHERE id=$studentId;
  -- Recompute gaps for new role
  -- Upsert readiness_scores for new role
  -- Append to readiness_score_history
COMMIT;
```

### Operation 3: Faculty Changes Role Requirements (batch, lazy)
Do NOT recompute all students synchronously. Detect staleness via `role_skill_requirements.updated_at > skill_gaps.computed_at` on next dashboard load. Add `updated_at` to `role_skill_requirements`.

---

## 11. Business Rule Enforcement Classification

| Rule | Enforcement | Notes |
|---|---|---|
| Only students take assessments | DB (role check via authorize) | ✅ |
| Only faculty manage questions/roles/skills | DB (role check) | ✅ |
| One target role per student | DB (single FK column) | ✅ |
| Cooldown between attempts | DB (partial unique index on in_progress) + Backend (timestamp check) | Fix needed |
| Gap ≥ 0 | DB (CHECK constraint) | ✅ |
| Score 0–100 | DB (CHECK constraint) | ✅ |
| One correct option per question | DB (partial unique index) | Fix needed |
| Faculty sees only scoped batches | Backend + Repository query filter | ✅ |
| Timer enforcement | Backend (must validate submitted_at timing) | Fix needed — currently missing |
| Faculty cannot self-register as faculty | Backend (hard-code role = 'student') | Fix needed |
| Option belongs to question | Backend ScoringService | Fix needed |
| No duplicate active attempts | DB (partial unique index) | Fix needed |

---

## 12. Recommendation Engine — Rule Precedence Fix

### Rule Conflict: R03 + R06 Fire for Same Skill

If a skill has `gap_category = 'critical'` AND no prep in 7 days:
- R03 fires: generates `study_resource` + `practice_skill` recommendations
- R06 fires: generates another `practice_skill` recommendation

Result: 3 rows for one skill, two of them identical in intent.

### Proposed Rule Precedence Order

Process rules in order. Once a rule fires for a (skill, recommendation_type) pair, skip lower-priority rules for the same pair:

```
Priority 1 (highest): R01 (unassessed, high-weight) → take_assessment HIGH
Priority 2: R02 (unassessed, low-weight) → take_assessment MEDIUM
Priority 3: R03 (critical gap) → study_resource HIGH + practice_skill HIGH
Priority 4: R06 (no prep for critical) → SKIP if R03 already fired for same skill
Priority 5: R04 (medium gap) → practice_skill MEDIUM
Priority 6: R07 (score dropped) → review_weak_area MEDIUM
Priority 7: R05 (small gap) → review_weak_area LOW
Priority 8: R08 (no gap) → no recommendation
```

**Maximum recommendations cap**: 10 active (non-dismissed) recommendations per student per target role.
**[RESOLVED — APPROVED (PHA-10)]**: Capped at 10 active recommendations per student per target role. Sorted by priority and `priority_score = gap * weight`.

---

## 13. IDOR Vulnerabilities — All Must Be Fixed

| Endpoint | IDOR Risk | Fix |
|---|---|---|
| `GET /api/assessments/session/:attemptId` | Another student's session | Repository: `AND student_id = $authenticated_id` |
| `GET /api/assessments/attempts/:attemptId/result` | Another student's result | Same |
| `PUT /api/preparation/:id` | Edit another student's activity | Repository: `AND student_id = $authenticated_id` |
| `DELETE /api/preparation/:id` | Delete another student's activity | Same |
| `PATCH /api/recommendations/:id/dismiss` | Dismiss another student's recommendation | Same |

Every single-resource-by-ID endpoint must include the ownership check. This must be a mandatory code-review checklist item.

---

## 14. Missing API Endpoints

| Missing Endpoint | Method | Purpose | Owner |
|---|---|---|---|
| `/api/assessments/config` | POST | Faculty creates assessment config for a skill | M2 |
| `/api/assessments/config/:skillId` | PUT | Faculty updates assessment config | M2 |
| `/api/assessments/cooldown/:skillId` | GET | Student checks remaining cooldown time | M2 |
| `/api/skills/:skillId/question-count` | GET | Faculty checks question count before configuring | M2 |
| `/api/faculty/students/:studentId` | GET | Faculty views a specific student's full profile | M5 |

---

## 15. API Naming Standardization

| Current | Proposed | Reason |
|---|---|---|
| `/api/skill-gaps/my` | `/api/skill-gaps/me` | REST convention: `/me` over `/my` |
| `/api/readiness/my` | `/api/readiness/me` | Same |
| `/api/preparation/my` | `/api/preparation/me` | Same |
| `/api/recommendations/my` | `/api/recommendations/me` | Same |
| `/api/analytics/my/*` | `/api/analytics/me/*` | Same |
| `DELETE /api/roles/:id` | `PATCH /api/roles/:id/deactivate` | Soft delete via PATCH, not DELETE |

---

## 16. Technology Decisions

| Technology | Decision | Reason |
|---|---|---|
| React 18 + Vite | KEEP | Required |
| Tailwind CSS | KEEP | Required |
| React Router v6 | KEEP | Correct |
| Axios | KEEP | Needed for interceptors |
| React Query | KEEP | Justified — server-state cache |
| Zustand | KEEP | Justified — auth + UI state |
| Recharts | KEEP | Good React integration |
| Chart.js | REMOVE | Redundant with Recharts |
| Express.js | KEEP | Required |
| `pg` (node-postgres) | KEEP | Parameterized queries |
| Zod | KEEP | Validation — pick ONE |
| Joi | REMOVE | Redundant — use Zod only |
| Helmet | KEEP | Security headers |
| Morgan | KEEP | HTTP logging |
| Winston | KEEP | App logging |
| bcrypt | KEEP | Password hashing |
| `express-rate-limit` | KEEP | Mandatory |
| `node-pg-migrate` | KEEP — pick this one | Remove ambiguity |
| `db-migrate` | REMOVE | Redundant |
| Docker (local dev) | KEEP | Consistency |
| GitHub Actions | KEEP | Free CI/CD |
| Husky | KEEP | Pre-commit lint |
| PostgreSQL 15 | KEEP | Required |

---

## 17. Scope Classification

### MANDATORY MVP
Auth · Student Profile · Faculty Profile · Career Roles · Skills · Role-Skill Mapping · Question Bank · Assessment Engine (MCQ) · Skill Gap Engine · Readiness Score Engine · Rule-based Recommendations · Preparation Tracker · Student Dashboard · Faculty Batch Dashboard · Faculty Intervention List

### OPTIONAL (build only if time allows)
Assessment config management UI · Readiness history chart · Prep calendar view · Role management UI (can seed-only initially) · Light/dark theme toggle

### FUTURE (do not touch in MVP)
Coding assessments · SQL assessments · Mock interview tracking · Resume analysis · AI mock interviewer · Job description analysis · ML-based prediction · Admin panel · Company-specific readiness · Placement outcomes tracking

---

## 18. Contradictions Found

| ID | Contradiction | Locations |
|---|---|---|
| CONTR-01 | "Profile completion as percentage" vs `profile_completed` is BOOLEAN | Sec 3 vs Table 3 |
| CONTR-02 | `/api/users` in architecture diagram but no endpoint defined | Sec 4 vs Sec 10 |
| CONTR-03 | Table 15 heading says "current best skill score" but body says "latest attempt score" | Table 15 |
| CONTR-04 | "Joi/Zod" in diagram vs "Zod" in security section | Sec 4 vs Sec 16 |
| CONTR-05 | `skill_gaps` text mentions `unassessed` category but enum has no such value | Sec 8 vs Table 16 |
| CONTR-06 | Recommendation upsert assumes UNIQUE constraint that does not exist in schema | Sec 9 vs Table 20 |
| CONTR-07 | "No further normalization needed" for readiness but formula does not normalize to role requirements | Sec 7 |
| CONTR-08 | Migration tool called both "node-pg-migrate" and "db-migrate" | Sec 4 vs Sec 12 |
| CONTR-09 | `assessment_configs.passing_level` defined but never used in any rule | Table 11 |
| CONTR-10 | Soft delete described as `deleted_at` in principles but `is_active` boolean used throughout | Sec 5 preamble vs all tables |
| CONTR-11 | "Staging" environment described but only Render free tier used — free tier has no preview services | Sec 18 |

---

## 19. Final Decision Register

| # | Decision | Current | Recommendation | Impact | Status |
|---|---|---|---|---|---|
| D01 | Readiness formula | Weighted raw average | Role-relative ratio formula | Critical | **APPROVED** (in v1.1) |
| D02 | Unassessed skill in skill_gaps | Implicit (NULL join) | Add `is_assessed` boolean | Medium | **APPROVED** (in v1.1) |
| D03 | Faculty account creation | Self-register | Seed-only in MVP (PHA-15) | High security | **APPROVED** |
| D04 | Old role data on role change | Not specified | Preserve (no delete) | Low | **APPROVED** (in v1.1) |
| D05 | `profile_completed` type | Boolean | Boolean (keep) | Low | **APPROVED** |
| D06 | Score for gap computation | current_score | current_score (PHA-D06) | Medium | **APPROVED** |
| D07 | RS when role has 0 skills | Not specified | Return NULL, not 100 (PHA-07) | Low | **APPROVED** |
| D08 | Backend timer enforcement | Not specified | Must enforce on submit | High | **APPROVED** (in v1.1) |
| D09 | Cooldown period | 24h default | Configurable per skill | Low | **APPROVED** |
| D10 | Max active recommendations | Not specified | Cap at 10 per role (PHA-10) | Medium | **APPROVED** |
| D11 | Faculty visibility of prep activities | Not specified | Aggregate hours only; no URLs/detail (PHA-11) | Medium privacy | **APPROVED** |
| D12 | Max simultaneous target roles | 1 | 1 | Low | **APPROVED** |
| D13 | Placement outcomes table for ML | Not in MVP | Omit in MVP; add in Phase 12+ (PHA-D13) | Future | **APPROVED** |
| D14 | Migration tool | node-pg-migrate OR db-migrate | node-pg-migrate | Low | **APPROVED** (in v1.1) |
| D15 | Validation library | Joi OR Zod | Zod only | Low | **APPROVED** (in v1.1) |
| D16 | Chart library | Recharts OR Chart.js | Recharts only | Low | **APPROVED** (in v1.1) |
| D17 | API path convention | /my | /me | Low | **APPROVED** (in v1.1) |

---

*End of Architecture Review v1.0*

**Status / Resolution**:
All six pending human decisions (PHA-07, PHA-10, PHA-11, PHA-15, PHA-D06, PHA-D13) have been formally approved and recorded in [`DECISIONS.md`](file:///C:/Users/deepa/OneDrive/Desktop/capston/DECISIONS.md). Architecture specification v1.1 has been updated to Approved Final. Phase 0 is complete and the project is ready for Phase 1.
