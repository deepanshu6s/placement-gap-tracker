# Smart Placement Readiness & Skill Gap Tracker

> An intelligent, data-driven web platform that helps undergraduate students measure their campus placement readiness, diagnose skill gaps against target career roles, track structured preparation, and receive personalized recommendations.

[![CI Pipeline](https://github.com/capstone-team/placement-tracker/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Stack](https://img.shields.io/badge/Stack-PERN-blue.svg)](docs/architecture_spec_v1_1.md)
[![Phase](<https://img.shields.io/badge/Phase-Phase%201%20(Foundation)-green.svg>)](docs/DEVELOPMENT_PLAN.md)

---

## 1. Project Overview & Core Workflow

The **Smart Placement Readiness & Skill Gap Tracker** empowers students preparing for competitive placement drives through a closed-loop diagnostic and learning cycle:

```text
Assess ──▶ Analyze ──▶ Identify Gap ──▶ Recommend ──▶ Practice ──▶ Reassess ──▶ Measure Improvement
```

1. **Assess**: Students complete timed, difficulty-balanced MCQ assessments per skill.
2. **Analyze & Identify Gap**: Evaluates current proficiency against role-specific requirements, calculating clear gap categories (`none`, `small`, `medium`, `critical`).
3. **Readiness Score**: Generates a deterministic, role-relative composite readiness score (0–100%) normalized to target industry expectations.
4. **Recommend**: A deterministic rule engine prescribes top-priority actionable steps (max 10 active recommendations).
5. **Practice**: Students log study sessions, mock tests, and practice hours.
6. **Reassess & Improve**: Retaking assessments refreshes the gap analysis and reflects measurable growth over time.
7. **Faculty & TPO Analytics**: Grants faculty and placement officers aggregate cohort health diagnostics and targeted intervention lists for students needing academic support.

---

## 2. Technology Stack

Built using the production-grade **PERN** stack:

| Component        | Technology                                     | Rationale                                                                      |
| ---------------- | ---------------------------------------------- | ------------------------------------------------------------------------------ |
| **Frontend**     | React 18, Vite                                 | Fast build times, modular component hierarchy                                  |
| **Styling**      | Tailwind CSS                                   | Utility-first styling with modern, premium dark/light design system            |
| **Routing**      | React Router DOM v6                            | Declarative client-side routing with role-based route guards                   |
| **Server State** | TanStack React Query v5                        | Automatic caching, stale-while-revalidate, query deduplication                 |
| **Client State** | Zustand                                        | Lightweight, unopinionated auth session and UI state                           |
| **Charts**       | Recharts                                       | Composable React SVG charting for gauges, radars, and histograms               |
| **Backend**      | Node.js, Express.js                            | Strict 4-tier layered architecture (Route → Controller → Service → Repository) |
| **Database**     | PostgreSQL 15                                  | Relational ACID guarantees, 3NF schema, partial unique constraints             |
| **Validation**   | Zod                                            | Comprehensive runtime input and environment variable validation                |
| **Security**     | Helmet, CORS, bcrypt, express-rate-limit       | Strict security headers, rate limiting, and salted password hashing            |
| **Migrations**   | node-pg-migrate                                | Version-controlled, reproducible SQL database migrations                       |
| **Testing**      | Jest, Supertest, Vitest, React Testing Library | Unit, integration, and component testing suites                                |
| **DevOps**       | Docker Compose                                 | Reproducible local PostgreSQL containerization                                 |

---

## 3. Monorepo Structure

```text
capston/
├── .github/                   # GitHub Actions CI pipeline and CODEOWNERS
│   ├── workflows/ci.yml
│   └── CODEOWNERS
├── backend/                   # Express.js REST API
│   ├── src/
│   │   ├── config/            # DB pool and Zod env validation
│   │   ├── db/                # Migrations, seeds, and migration runner
│   │   ├── middleware/        # Auth stub, rate limiter, logger, error handler
│   │   ├── routes/            # Route definitions
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── services/          # Pure business logic
│   │   ├── repositories/      # Parameterized SQL data access
│   │   ├── validators/        # Zod validation schemas
│   │   ├── utils/             # Standard response and logging utilities
│   │   ├── app.js             # Express application factory
│   │   └── index.js           # Server entry point
│   ├── tests/                 # Unit and integration test suites
│   ├── Dockerfile             # Container configuration
│   └── package.json
├── frontend/                  # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/        # Shared UI primitives (Button, Card, Badge, etc.)
│   │   ├── features/          # Feature-aligned modules (auth, profile, assessment, etc.)
│   │   ├── layouts/           # AuthLayout, StudentLayout, FacultyLayout
│   │   ├── pages/             # Route page views
│   │   ├── routes/            # Route tree and guards
│   │   ├── services/          # Axios API client modules
│   │   ├── store/             # Zustand global state stores
│   │   ├── App.jsx            # QueryClient and router provider root
│   │   ├── index.css          # Tailwind CSS directives
│   │   └── main.jsx           # Vite application entry
│   └── package.json
├── docs/                      # Architectural specifications and team guides
│   ├── architecture_spec_v1_1.md
│   ├── architecture_review.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── DATABASE_GUIDE.md
│   ├── API_GUIDE.md
│   ├── GIT_WORKFLOW.md
│   └── TEAM_OWNERSHIP.md
├── API_CONTRACTS.md           # Master team API contract registry
├── CONTRIBUTING.md            # Git flow and contribution standards
├── DECISIONS.md               # Architecture Decision Records (ADRs)
├── docker-compose.yml         # Local development PostgreSQL 15 service
├── package.json               # Monorepo workspace runner scripts
└── README.md
```

---

## 4. Current Phase: Phase 1 — Project Foundation

> [!IMPORTANT]
> The project has completed architectural design (**Phase 0**) and established the **Phase 1 Project Foundation**.  
> Core functional features (Authentication, Assessments, Dashboard, Scoring, Recommendations, and Analytics) are **PLANNED** for implementation in Phase 2 through Phase 8.

---

## 5. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose**: For local PostgreSQL 15 database container (or a local PostgreSQL server)
- **Git**: v2.30+

---

## 6. Local Setup & Quickstart

### Step 1: Clone and Configure Environment

```bash
# Clone the repository
git clone https://github.com/capstone-team/placement-tracker.git
cd placement-tracker

# Copy environment variable templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### Step 2: Start Local PostgreSQL (Docker)

```bash
# Start PostgreSQL 15 container in background
docker compose up -d postgres

# Verify PostgreSQL is running and healthy
docker compose ps
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 4: Run Application in Development Mode

In separate terminal windows:

```bash
# Terminal 1: Start Backend API (runs on http://localhost:5000)
npm run dev:backend

# Terminal 2: Start Frontend Client (runs on http://localhost:5173)
npm run dev:frontend
```

---

## 7. Testing & Verification

Run the test suites across both workspace projects:

```bash
# Run backend tests (Health endpoint, app initialization)
npm run test:backend

# Run frontend tests (Component rendering, router provider)
npm run test:frontend

# Run all test suites
npm test
```

---

## 8. Five-Member Team Ownership

| Member       | Focus Modules                                                        | Key Deliverables                                                        |
| ------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Member 1** | M01 (Auth), M02 (Profile)                                            | JWT auth, password security, student & faculty profiles, Day 1 stubs    |
| **Member 2** | M06 (Questions), M07 (Assessment), M08 (Scoring)                     | Question bank, assessment session generation, timer & scoring           |
| **Member 3** | M03 (Roles), M04 (Skills), M05 (Mapping), M09 (Gap), M10 (Readiness) | Roles catalogue, skills taxonomy, gap analysis, readiness ratio formula |
| **Member 4** | M11 (Preparation), M12 (Recommendations)                             | Activity logger, rule-based recommendation engine (max 10 cap)          |
| **Member 5** | M13 (Student Analytics), M14 (Faculty Analytics), Shared UI          | Recharts charts, cohort analytics, intervention list, UI library        |

For full details, review [`docs/TEAM_OWNERSHIP.md`](docs/TEAM_OWNERSHIP.md).

---

## 9. Collaboration & Git Workflow

- **`main`**: Protected production branch.
- **`develop`**: Protected active integration branch.
- **`feature/*`**: Individual feature branches merged into `develop` via PRs with **Squash and Merge**.
- **Commits**: Follow Conventional Commits format (`feat(scope): message`, `fix(scope): message`).
- **Database Migrations**: Require PR titled `db/<NNN>-<desc>` with 2 approvals and a 24-hour review hold.

For guidelines, review [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).
