import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-bold text-xl text-slate-100 tracking-tight">PlacementTracker</span>
          <Badge variant="success">Phase 1: Project Foundation</Badge>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Login Portal
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm">
              Register Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight leading-tight">
            Smart Placement Readiness & <br className="hidden sm:inline" />
            <span className="text-emerald-400">Skill Gap Tracker</span>
          </h1>
          <p className="mt-4 text-lg text-slate-400 leading-relaxed">
            A full-stack PERN platform designed to diagnose skill deficiencies, compute
            role-relative readiness scores, and prescribe personalized recommendations for campus
            recruitments.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/student">
              <Button variant="primary" size="md">
                Explore Student Portal (Placeholder)
              </Button>
            </Link>
            <Link to="/faculty">
              <Button variant="secondary" size="md">
                Explore Faculty Portal (Placeholder)
              </Button>
            </Link>
          </div>
        </div>

        {/* Phase 1 Notice Alert */}
        <div className="mb-10">
          <Alert variant="info">
            <span className="font-semibold">Current Development Status:</span> You are viewing the
            Phase 1 Foundation build. Routing, UI primitives, state containers, and backend API
            connections are operational. Feature implementations (JWT authentication, assessment
            sessions, score engines) are planned for Phase 2+.
          </Alert>
        </div>

        {/* Closed-loop Workflow Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">
            Core Academic Diagnostic Workflow
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card title="1. Assess" className="border-slate-800 bg-slate-900/50">
              <p className="text-sm text-slate-400">
                Timed MCQ assessments with difficulty bands and server timer enforcement.
              </p>
            </Card>
            <Card title="2. Diagnose" className="border-slate-800 bg-slate-900/50">
              <p className="text-sm text-slate-400">
                Skill gaps categorized into none, small, medium, and critical levels.
              </p>
            </Card>
            <Card title="3. Recommend" className="border-slate-800 bg-slate-900/50">
              <p className="text-sm text-slate-400">
                Deterministic rule-based prioritization capped at top 10 actionable items.
              </p>
            </Card>
            <Card title="4. Track Growth" className="border-slate-800 bg-slate-900/50">
              <p className="text-sm text-slate-400">
                Readiness ratio formula measuring honest progress toward industry target roles.
              </p>
            </Card>
          </div>
        </div>

        {/* Five Member Team Ownership Matrix */}
        <div>
          <h2 className="text-xl font-bold text-slate-200 mb-6 text-center">
            Five-Member Team Ownership
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card title="Member 1" subtitle="Auth, Profile & Security">
              <p className="text-xs text-slate-400">
                Owns M01 & M02: JWT auth, bcrypt hashing, student/faculty profiles, and Day 1 stubs.
              </p>
            </Card>
            <Card title="Member 2" subtitle="Assessment & Scoring">
              <p className="text-xs text-slate-400">
                Owns M06, M07, M08: Question bank, assessment session generator, and atomic scoring.
              </p>
            </Card>
            <Card title="Member 3" subtitle="Skill & Readiness Engines">
              <p className="text-xs text-slate-400">
                Owns M03, M04, M05, M09, M10: Roles catalogue, skill gap engine, and readiness
                formula.
              </p>
            </Card>
            <Card title="Member 4" subtitle="Preparation & Recommendations">
              <p className="text-xs text-slate-400">
                Owns M11 & M12: Student preparation activity tracker and 8-rule recommendation
                engine.
              </p>
            </Card>
            <Card title="Member 5" subtitle="Analytics & UI Coordination">
              <p className="text-xs text-slate-400">
                Owns M13 & M14: Recharts analytics, faculty batch overview, and shared UI component
                kit.
              </p>
            </Card>
            <Card title="Database Core" subtitle="PostgreSQL 15 (3NF)">
              <p className="text-xs text-slate-400">
                20 normalized operational tables, node-pg-migrate versioning, zero unparameterized
                SQL.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        PERN Stack Foundation · PostgreSQL · Express.js · React · Node.js · Approved Architecture
        v1.1
      </footer>
    </div>
  );
};
