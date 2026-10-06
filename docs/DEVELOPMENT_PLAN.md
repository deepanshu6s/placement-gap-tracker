# Master Development Plan

## Smart Placement Readiness & Skill Gap Tracker

**Baseline Reference**: [`docs/architecture_spec_v1_1.md`](architecture_spec_v1_1.md) (Section 15)  
**Architecture Decisions**: [`DECISIONS.md`](../DECISIONS.md)  
**Current Phase**: **Phase 1 — Project Foundation**

---

## 1. Development Phases Roadmap

| Phase         | Phase Name                               | Primary Owners           | Status          | Description                                                                              |
| ------------- | ---------------------------------------- | ------------------------ | --------------- | ---------------------------------------------------------------------------------------- |
| **Phase 0**   | Architecture Specification & Review      | Lead Architect & All     | **IMPLEMENTED** | v1.1 finalized, all 6 PHA items resolved and approved in `DECISIONS.md`.                 |
| **Phase 1**   | Project Foundation & Repository Scaffold | All Members              | **IN PROGRESS** | Monorepo structure, tooling, Docker PostgreSQL, health endpoint, base clients.           |
| **Phase 2**   | Authentication & Core Catalog            | Member 1 + Member 3      | **PLANNED**     | JWT auth, student profiles, career roles, skills catalogue, role-skill mappings.         |
| **Phase 3**   | Assessment Engine & Preparation Start    | Member 2 + Member 4      | **PLANNED**     | Question bank, assessment session generation, timer & scoring, prep activity logs.       |
| **Phase 4**   | Gap & Readiness Intelligence             | Member 3 + Member 5      | **PLANNED**     | Skill gap computation (`is_assessed`), role-relative readiness formula, analytics stubs. |
| **Phase 5**   | Recommendations & Faculty Analytics      | Member 4 + Member 5      | **PLANNED**     | Deterministic rule engine (max 10 cap), faculty cohort metrics, intervention lists.      |
| **Phase 6**   | Student Dashboard Integration            | Member 5 (All integrate) | **PLANNED**     | Complete student dashboard with readiness gauge, radar charts, recommendation cards.     |
| **Phase 7**   | Comprehensive Testing & Verification     | All Members              | **PLANNED**     | Jest unit tests (>70% coverage), Supertest API tests, Playwright E2E 4 core flows.       |
| **Phase 8**   | Production Deployment                    | Member 1 + Lead          | **PLANNED**     | Vercel (frontend), Render (backend), Supabase (PostgreSQL 15), health monitoring.        |
| **Phase 9+**  | Advanced Post-MVP Enhancements           | Future                   | **FUTURE**      | Coding assessments, resume parser, mock interviews, admin UI panel.                      |
| **Phase 12+** | Machine Learning & Placement Prediction  | Future                   | **FUTURE**      | Historical placement outcome labels (`placement_outcomes` table), predictive ML models.  |

---

## 2. Phase 1 Deliverables & Status Breakdown

### IMPLEMENTED in Phase 1

- **Monorepo Structure**: Root `package.json`, `.gitignore`, `.editorconfig`, `.gitattributes`, `.dockerignore`.
- **Docker Compose Setup**: PostgreSQL 15 configuration with persistent volume and health check.
- **Backend Infrastructure Foundation**:
  - Express.js application setup with Helmet, CORS, Morgan logger, JSON body parsing, and rate limiting.
  - PostgreSQL connection pool (`pg.Pool`) in `backend/src/config/db.js`.
  - Environment variable schema validation via Zod in `backend/src/config/env.js`.
  - Standard JSON response utilities (`{ success, data, error }`).
  - Centralized error handler and 404 handler.
  - Health endpoint `GET /api/health` with database ping.
  - Day 1 authentication middleware stub (`middleware/authenticate.stub.js`).
  - Migration runner stub (`node-pg-migrate` directory and configuration).
- **Frontend Infrastructure Foundation**:
  - React 18 + Vite SPA application in `frontend/`.
  - Tailwind CSS configured and loaded via `src/index.css`.
  - React Router DOM v6 structure with placeholder routes (`/`, `/login`, `/register`, `/student`, `/faculty`).
  - TanStack React Query `QueryClientProvider` root wrapper.
  - Base Axios API client placeholder (`src/services/api.js`).
  - Zustand auth store (`authStore.js`) and UI store (`uiStore.js`) placeholders.
  - Shared UI primitive component library foundation (`components/ui/`: Button, Card, Badge, Input, Modal, Spinner, Alert).
- **Core Documentation**:
  - `README.md`, `CONTRIBUTING.md`, `API_CONTRACTS.md`, `DECISIONS.md`.
  - `docs/TEAM_OWNERSHIP.md`, `docs/GIT_WORKFLOW.md`, `docs/DEVELOPMENT_PLAN.md`, `docs/DATABASE_GUIDE.md`, `docs/API_GUIDE.md`.

---

### PLANNED (To be built in Phase 2 through Phase 8)

- Real user registration and login (`/api/auth/*`).
- Password hashing with bcrypt (cost 12) and JWT token rotation.
- Student profile CRUD and target career role selection.
- Database migrations creating the 20 operational tables.
- Faculty seed provisioning (`db/seeds/`).
- Question bank management and assessment session generator.
- Backend timer enforcement and atomic scoring service.
- Skill gap calculation engine with `is_assessed` distinction.
- Role-relative composite readiness score formula.
- Deterministic 8-rule recommendation engine with 10-item cap.
- Student preparation activity log.
- Student and faculty analytics dashboards with Recharts.
- End-to-end integration and automated test suites.

---

### FUTURE (Explicitly out of MVP scope)

- Placement outcomes table (`placement_outcomes`) and tracking.
- Machine learning models for placement prediction (Python/FastAPI microservice).
- Online coding environment and sandbox compiler.
- AI mock interview simulator.
- Resume parsing and automated job description matching.
- Admin dashboard UI.
