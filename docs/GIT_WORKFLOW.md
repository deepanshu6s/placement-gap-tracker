# Git & GitHub Collaboration Workflow

## Smart Placement Readiness & Skill Gap Tracker

**Baseline Reference**: [`docs/architecture_spec_v1_1.md`](architecture_spec_v1_1.md) (Section 16)  
**Current Phase**: Phase 1 — Project Foundation

---

## 1. Branch Hierarchy

```text
main          (Production branch: protected, auto-deploys to Vercel + Render)
  ▲
  │ (Release / Integration merge)
develop       (Active integration branch: protected, always deployable)
  ▲
  │ (PR with squash merge)
feature/*     (Individual developer branches for each module/feature)
fix/*         (Bug fixes)
db/*          (Schema migration PRs: 24h review rule)
```

---

## 2. Core Operational Rules

1. **No Direct Pushes to `main` or `develop`**:
   - Every change enters `develop` through a GitHub Pull Request.
   - Direct commits and branch pushes to `main` and `develop` are blocked by branch protection rules.
2. **Feature Branch Origin**:
   - Feature branches must always branch off the latest `develop`:
     ```bash
     git checkout develop
     git pull origin develop
     git checkout -b feature/member1-auth
     ```
3. **Pull Request Review Policy**:
   - Standard code PRs require at least **one approving review** from a team member who does not own the module.
   - Database migration PRs (`db/migrations/`) require at least **two approvals** and a mandatory **24-hour review hold**.
4. **Merge Strategies**:
   - Feature Branch → `develop`: **Squash and Merge** (produces a single, clean commit on develop).
   - `develop` → `main`: **Merge Commit** (preserves milestone history and release tags).
   - Never rebase `develop` or `main`.

---

## 3. Approved Branch Naming

| Category                 | Format                                                  | Example                                                                      |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Member 1 Auth & Profile  | `feature/member1-<feature>` or `feat/auth-<name>`       | `feature/member1-auth`, `feat/auth-jwt`, `feat/student-profile`              |
| Member 2 Assessment      | `feature/member2-<feature>` or `feat/assessment-<name>` | `feature/member2-assessment`, `feat/question-bank`, `feat/scoring-engine`    |
| Member 3 Skills & Gaps   | `feature/member3-<feature>` or `feat/skillgap-<name>`   | `feature/member3-skill-gap`, `feat/readiness-engine`, `feat/role-management` |
| Member 4 Recommendations | `feature/member4-<feature>` or `feat/prep-<name>`       | `feature/member4-recommendations`, `feat/prep-tracker`                       |
| Member 5 Analytics & UI  | `feature/member5-<feature>` or `feat/analytics-<name>`  | `feature/member5-analytics`, `feat/ui-library`, `feat/faculty-dashboard`     |
| Bug Fixes                | `fix/<module>-<description>`                            | `fix/cooldown-race-condition`, `fix/timer-validation`                        |
| Schema Migrations        | `db/<NNN>-<description>`                                | `db/001-create-users-and-profiles`, `db/002-assessment-tables`               |

---

## 4. Conventional Commits Standard

Every commit on feature branches must adhere to the Conventional Commits specification:

```text
<type>(<scope>): <concise description in imperative mood>
```

### Approved Types

- `feat`: New feature or user capability
- `fix`: Bug fix
- `docs`: Documentation updates only
- `refactor`: Code reorganization with zero behavior change
- `test`: Adding or adjusting unit, integration, or E2E tests
- `chore`: Tooling, dependency updates, configuration
- `chore(db)`: Schema migrations and database seeds

### Approved Scopes

`auth | profile | assessment | scoring | skillgap | readiness | prep | recommendation | analytics | faculty | ui | db | deploy`

---

## 5. Synchronizing Feature Branches Before PR

Before opening a Pull Request or requesting reviews, integrate recent changes from `develop`:

```bash
# 1. Fetch latest integration branch
git fetch origin

# 2. Update your local develop
git checkout develop
git pull origin develop

# 3. Merge develop into your feature branch
git checkout feature/your-branch-name
git merge develop

# 4. Resolve any merge conflicts locally, run tests
npm test

# 5. Push your updated feature branch to GitHub
git push origin feature/your-branch-name
```

---

## 6. Migration Coordination Protocol

Database migrations alter shared state and must be coordinated carefully:

1. The developer requiring a database schema modification creates the next numbered migration file in `backend/src/db/migrations/NNN_description.sql`.
2. Open an isolated PR titled `db(migration): NNN_description` with **only the migration file** (no application code yet).
3. The PR triggers team notification and enters a **24-hour review hold** requiring **two approvals**.
4. Once merged into `develop`, all team members execute:
   ```bash
   git pull origin develop
   npm --prefix backend run migrate:up
   ```
5. Dependent application code can then be merged safely without migration race conditions.
