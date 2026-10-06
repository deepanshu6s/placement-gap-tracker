# Contributing Guidelines

## Smart Placement Readiness & Skill Gap Tracker

Thank you for contributing to the Smart Placement Readiness & Skill Gap Tracker project. This repository follows strict software engineering practices and the architectural standards approved in [`docs/architecture_spec_v1_1.md`](docs/architecture_spec_v1_1.md) and [`DECISIONS.md`](DECISIONS.md).

---

## 1. Monorepo & Branching Strategy

Our collaboration model is Git Flow adapted for a 5-member team:

- **`main`**: Production-ready branch. Direct pushes and feature branches into `main` are strictly forbidden. Protected.
- **`develop`**: Integration branch. All features are integrated here. Must always remain buildable and pass test suites. Protected.
- **Feature Branches**: Cut from `develop` and merged back into `develop` via Pull Requests.

### Feature Branch Naming Convention

Branches must reflect the module owner or feature scope:

- `feature/member1-auth` or `feat/auth-jwt`
- `feature/member1-profile` or `feat/student-profile`
- `feature/member2-assessment` or `feat/assessment-engine`
- `feature/member2-questions` or `feat/question-bank`
- `feature/member3-roles` or `feat/role-management`
- `feature/member3-skill-gap` or `feat/skill-gap-engine`
- `feature/member3-readiness` or `feat/readiness-engine`
- `feature/member4-preparation` or `feat/prep-tracker`
- `feature/member4-recommendations` or `feat/recommendations`
- `feature/member5-ui-library` or `feat/ui-library`
- `feature/member5-analytics` or `feat/analytics`
- `fix/<module>-<description>`
- `chore/<description>`
- `db/<NNN>-<description>` (database migrations)

---

## 2. Commit Message Standards (Conventional Commits)

Every commit message must follow the Conventional Commits format:

```text
<type>(<scope>): <short description>
```

### Approved Types

- `feat`: A new user-facing or architectural feature
- `fix`: A bug fix
- `docs`: Documentation updates only
- `style`: Formatting, missing semi-colons, whitespace (no code change)
- `refactor`: Refactoring code without altering external behavior
- `test`: Adding or correcting tests
- `chore`: Build tasks, package updates, repository maintenance
- `chore(db)`: Schema migrations or database seeds

### Approved Scopes

`auth | profile | assessment | scoring | skillgap | readiness | prep | recommendation | analytics | faculty | ui | db | deploy`

### Examples

- `feat(readiness): implement role-relative readiness ratio formula`
- `fix(skillgap): distinguish unassessed skills from zero scores via is_assessed flag`
- `chore(db): create migration 001 for users and profiles`
- `test(assessment): add backend test for timer validation on submit`

---

## 3. Pull Request & Review Process

1. **Keep Branches Updated**: Before opening or merging a PR, rebase or merge the latest `develop` into your feature branch and run tests:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout <your-feature-branch>
   git merge develop
   npm test
   ```
2. **Review Requirements**:
   - Standard feature PRs require **at least 1 review and approval** from a team member who does not own the module.
   - Database migrations (`db/migrations/`): Require **at least 2 approvals** and a mandatory **24-hour review period** before merging.
3. **Automated Checks**:
   - GitHub Actions CI must pass completely (linting, tests, build).
4. **Merge Strategy**:
   - Merge to `develop`: **Squash and Merge** to maintain a clean, linear integration history.
   - Merge `develop` to `main`: **Merge Commit** (releases and milestones).

---

## 4. Shared Files & Team Coordination

Certain files are shared across members and require explicit coordination:

- `backend/src/routes/index.js` (Root Router): Modifying requires notification in the team channel.
- `backend/src/config/db.js` & `env.js`: Core infrastructure owned by Member 1; do not alter without discussion.
- `frontend/src/routes/index.jsx`: Frozen after Phase 2; route additions require consensus.
- `frontend/src/components/ui/`: Coordinated by Member 5. Do not modify existing primitives without checking downstream impacts.
- `API_CONTRACTS.md`: Any payload, param, or status code adjustment requires updating this file first.

---

## 5. Architectural Guardrails (Non-Negotiable)

- **Layering Integrity**: Route → Controller → Service → Repository → PostgreSQL. Never call the database directly from routes, controllers, or services.
- **SQL Security**: Only parameterized queries (`$1, $2, ...`) via `pg` pool. Zero string interpolation in SQL.
- **Role Elevation Guard**: The client must never dictate user role during registration; `role = 'student'` is strictly enforced server-side.
- **Timer & Cooldown Enforcement**: Must execute at the database and backend service layer, never trusted to client-side code alone.
- **IDOR Protection**: Every single-resource endpoint must verify data ownership against the authenticated token user.
