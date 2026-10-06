# API Developer Guide

## Smart Placement Readiness & Skill Gap Tracker

**Baseline Reference**: [`docs/architecture_spec_v1_1.md`](architecture_spec_v1_1.md) (Section 10 & 11)  
**Contract Registry**: [`API_CONTRACTS.md`](../API_CONTRACTS.md)  
**Current Phase**: Phase 1 — Project Foundation

---

## 1. API Architecture Overview

The backend uses a strict 4-tier layered architecture:

```text
HTTP Request
     │
     ▼
Route Middleware (authenticate, authorize, validateRequest, rateLimiter)
     │
     ▼
Controller (Parses request, calls service, formats standard response)
     │
     ▼
Service (Implements pure business logic, orchestration, validation)
     │
     ▼
Repository (Executes parameterized SQL queries using pg pool)
     │
     ▼
PostgreSQL Database
```

### Layering Rules

- **Controllers** must never write SQL queries or handle business calculations.
- **Services** must never accept `req` or `res` Express objects.
- **Repositories** must only execute SQL via node-postgres parameterized queries (`$1, $2, ...`). Zero string interpolation.
- **Service Dependency Graph**: Must remain strictly acyclic (one-directional calls).

---

## 2. Status of API Endpoints

### IMPLEMENTED (Phase 1 Foundation)

- `GET /api/health` — Service liveness and PostgreSQL connection pool status check.
  - Authentication: None (Public)
  - Success Response:
    ```json
    {
      "success": true,
      "data": {
        "status": "ok",
        "timestamp": "2026-10-06T18:40:00.000Z",
        "database": "connected"
      },
      "error": null
    }
    ```

### PLANNED (Phase 2+)

- `/api/auth/*` (Login, Register, Refresh, Logout, Current User)
- `/api/students/*` (Profile Management, Target Role Selection)
- `/api/roles/*` (Career Role Catalogue and Requirements)
- `/api/skills/*` (Skills Catalogue)
- `/api/questions/*` (Question Bank CRUD)
- `/api/assessments/*` (Session Generation, Timer Enforcement, Scoring)
- `/api/skill-gaps/*` (Skill Gap Analysis)
- `/api/readiness/*` (Role-Relative Composite Readiness Score)
- `/api/preparation/*` (Preparation Activity Logging)
- `/api/recommendations/*` (Deterministic Rule-Based Recommendations)
- `/api/analytics/*` (Student Progress Charts & Histograms)
- `/api/faculty/*` (Cohort Analytics & Student Intervention Lists)

### FUTURE (Phase 9+ / Post-MVP)

- `/api/coding/*` (Code submission sandbox)
- `/api/ml/*` (FastAPI predictive model inference)
- `/api/admin/*` (Administrative user and system management)

---

## 3. Standard Error Envelope & Codes

All errors return the standard error envelope with consistent status codes:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation of error",
    "details": []
  }
}
```

### Standard Error Codes

| Code                           | HTTP Status | Description                                                          |
| ------------------------------ | ----------- | -------------------------------------------------------------------- |
| `VALIDATION_ERROR`             | 400         | Request body, query, or params failed Zod schema validation          |
| `AUTHENTICATION_REQUIRED`      | 401         | Missing, expired, or invalid JWT access token                        |
| `INSUFFICIENT_ROLE`            | 403         | User role not authorized to access endpoint                          |
| `OUT_OF_SCOPE`                 | 403         | Faculty member attempted access outside assigned batch/branch scope  |
| `RESOURCE_NOT_FOUND`           | 404         | Resource does not exist or user fails IDOR ownership check           |
| `DUPLICATE_ENTRY`              | 409         | Unique constraint violation (e.g. duplicate email, unique index hit) |
| `COOLDOWN_ACTIVE`              | 409         | Cooldown period has not elapsed for skill assessment                 |
| `ASSESSMENT_ALREADY_SUBMITTED` | 409         | Attempt already marked completed                                     |
| `ASSESSMENT_TIMED_OUT`         | 422         | Submission timestamp exceeds allocated time limit                    |
| `RATE_LIMIT_EXCEEDED`          | 429         | Too many requests within time window                                 |
| `INTERNAL_ERROR`               | 500         | Unhandled server exception                                           |
