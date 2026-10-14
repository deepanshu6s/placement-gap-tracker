import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  Target,
  Brain,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
  Award,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#FF6A2A]/20 selection:text-[#FF6A2A]"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section
          className="relative w-full border-b pt-8 sm:pt-14 pb-14 sm:pb-20"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 space-y-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium"
                  style={{
                    background: 'var(--surface-card)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF6A2A]" />
                  <span className="text-[var(--color-orange)] font-semibold">Career Diagnostic Platform</span>
                  <span style={{ color: 'var(--border-primary)' }}>|</span>
                  <span>Placement Analytics</span>
                </div>

                <div className="space-y-3">
                  <h1
                    className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Understand Your Skills.{' '}
                    <span className="text-[var(--color-orange)]">Improve Your Placement Readiness.</span>
                  </h1>
                  <p className="text-base sm:text-lg font-semibold text-[var(--color-amber)] tracking-wide">
                    Know Your Gaps. Build Your Skills. Get Placement-Ready.
                  </p>
                </div>

                <p
                  className="text-sm sm:text-base leading-relaxed max-w-2xl"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Benchmark your technical competencies against role-specific industry standards.
                  Identify critical skill gaps with server-evaluated tests, track self-directed study,
                  and walk into recruitment interviews with confidence.
                </p>

                {/* Clear Actions */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <Link to="/register">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={Sparkles}>
                      Create Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" icon={ArrowRight}>
                      Sign In
                    </Button>
                  </Link>
                </div>

                {/* Key Value Points */}
                <div
                  className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t text-xs"
                  style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[var(--color-orange)] flex-shrink-0" />
                    <span>Objective MCQ Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[var(--color-amber)] flex-shrink-0" />
                    <span>Weighted Readiness Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[var(--color-orange)] flex-shrink-0" />
                    <span>Actionable Next Steps</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Product Preview Composition */}
              <div className="lg:col-span-5 w-full">
                <div
                  className="rounded-xl p-4 sm:p-5 border shadow-card-elevated space-y-4"
                  style={{
                    background: 'var(--surface-elevated)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  {/* Preview Header */}
                  <div
                    className="flex items-center justify-between pb-3 border-b"
                    style={{ borderColor: 'var(--border-primary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF526F]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFC857]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A2A]" />
                      <span className="ml-1 text-xs font-semibold text-[var(--text-secondary)]">
                        Target: Full-Stack Engineer
                      </span>
                    </div>
                    <Badge variant="orange" size="sm">
                      Dashboard Preview
                    </Badge>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className="p-3 rounded-lg border text-center"
                      style={{
                        background: 'var(--surface-card)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Placement Readiness
                      </span>
                      <div className="text-2xl font-black text-[var(--color-orange)]">
                        78%
                      </div>
                      <span className="text-[10px] text-[var(--color-amber)] font-medium">
                        High Readiness
                      </span>
                    </div>

                    <div
                      className="p-3 rounded-lg border text-center"
                      style={{
                        background: 'var(--surface-card)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                        Critical Skill Gaps
                      </span>
                      <div className="text-2xl font-black text-[#FF526F]">
                        1
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Requires Practice
                      </span>
                    </div>
                  </div>

                  {/* Competency Gap List */}
                  <div
                    className="p-3.5 rounded-lg border space-y-2.5 text-xs"
                    style={{
                      background: 'var(--surface-card)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider block">
                      Core Competency Gaps
                    </span>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-primary)]">Data Structures &amp; Algorithms</span>
                        <span className="text-[var(--color-orange)] font-semibold">85 / 90</span>
                      </div>
                      <div className="w-full bg-[var(--surface-hover)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[var(--color-orange)] h-full w-[94%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-primary)]">Database &amp; SQL Querying</span>
                        <span className="text-[var(--color-amber)] font-semibold">65 / 80</span>
                      </div>
                      <div className="w-full bg-[var(--surface-hover)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[var(--color-amber)] h-full w-[81%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-primary)]">System Architecture</span>
                        <span className="text-[#FF526F] font-semibold">45 / 75</span>
                      </div>
                      <div className="w-full bg-[var(--surface-hover)] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF526F] h-full w-[60%]" />
                      </div>
                    </div>
                  </div>

                  {/* Sample Prescriptive Action */}
                  <div
                    className="p-3 rounded-lg border flex items-center justify-between gap-2.5"
                    style={{
                      background: 'var(--surface-card)',
                      borderColor: 'var(--border-primary)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-[var(--surface-hover)] text-[var(--color-orange)] border border-[var(--border-primary)]">
                        <Activity size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--text-primary)]">System Architecture</span>
                          <Badge variant="coral" size="sm">High Priority</Badge>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">Recommended: Complete diagnostic test</p>
                      </div>
                    </div>
                    <Link to="/register">
                      <Button variant="outline" size="sm" className="text-xs py-1">
                        Diagnose
                      </Button>
                    </Link>
                  </div>

                  <p className="text-[11px] text-center text-[#786D65]">
                    * Illustrative demonstration values. Create an account to track your verified scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS SECTION */}
        {/* ========================================================================= */}
        <section
          id="workflow"
          className="w-full py-12 sm:py-16 border-b transition-colors"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-primary)' }}
        >
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <Badge variant="orange">Continuous Diagnostic Loop</Badge>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                How The Closed-Loop Workflow Works
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                A deterministic, four-step continuous improvement workflow from baseline assessment to verified placement readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Step 1 */}
              <div
                className="border rounded-xl p-5 transition-colors"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm mb-4"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--color-orange)',
                  }}
                >
                  01
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Assess Competencies</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Participate in timed, topic-specific assessments with server-validated timer enforcement and difficulty bands.
                </p>
              </div>

              {/* Step 2 */}
              <div
                className="border rounded-xl p-5 transition-colors"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm mb-4"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--color-amber)',
                  }}
                >
                  02
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Diagnose Skill Gaps</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Automatically compare your scores against benchmark requirements of your chosen industry career role.
                </p>
              </div>

              {/* Step 3 */}
              <div
                className="border rounded-xl p-5 transition-colors"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm mb-4"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--color-coral)',
                  }}
                >
                  03
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Targeted Improvement</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Receive rule-based recommendations prioritized by impact. Focus your practice where gaps are most critical.
                </p>
              </div>

              {/* Step 4 */}
              <div
                className="border rounded-xl p-5 transition-colors"
                style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg border flex items-center justify-center font-bold text-sm mb-4"
                  style={{
                    background: 'var(--surface-hover)',
                    borderColor: 'var(--border-primary)',
                    color: 'var(--color-orange)',
                  }}
                >
                  04
                </div>
                <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Track &amp; Validate</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Log your study hours, monitor your readiness score growth over time, and build verified placement confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* KEY CAPABILITIES */}
        {/* ========================================================================= */}
        <section
          id="features"
          className="w-full py-12 sm:py-16 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <Badge variant="amber">Core Capabilities</Badge>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Designed for Engineering Excellence
              </h2>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                Systematic tools for engineering undergraduates to bridge the gap between coursework and industry recruitment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1 */}
              <Card
                title="Skill Assessments"
                badge={<Badge variant="orange" size="sm">Evaluate</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--color-orange)] border border-[var(--border-primary)] flex-shrink-0">
                    <Brain size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Objective MCQ evaluations with varied difficulty tiers, timer enforcement, and immediate score calculation.
                  </p>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card
                title="Skill-Gap Analysis"
                badge={<Badge variant="coral" size="sm">Diagnose</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--color-coral)] border border-[var(--border-primary)] flex-shrink-0">
                    <Target size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Directly maps current scores against role specifications, categorizing deficiencies into none, small, medium, and critical levels.
                  </p>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card
                title="Readiness Scoring"
                badge={<Badge variant="amber" size="sm">Quantify</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--color-amber)] border border-[var(--border-primary)] flex-shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Calculates a weighted readiness percentage relative to required skill weights, providing a transparent readiness indicator.
                  </p>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card
                title="Actionable Guidance"
                badge={<Badge variant="orange" size="sm">Prescribe</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--color-orange)] border border-[var(--border-primary)] flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Automated rule-based prioritization delivers clear, actionable next steps—suggesting assessments and focal practice topics.
                  </p>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card
                title="Preparation Tracking"
                badge={<Badge variant="amber" size="sm">Practice</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--color-amber)] border border-[var(--border-primary)] flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    A private study activity logger to record practice hours, learning resources, and dates, building personal accountability.
                  </p>
                </div>
              </Card>

              {/* Feature 6 */}
              <Card
                title="Cohort Oversight"
                badge={<Badge variant="neutral" size="sm">Faculty</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border-primary)] flex-shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Department mentors and placement officers monitor aggregate batch metrics, common deficiencies, and intervention candidates.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CLOSING CALL TO ACTION */}
        {/* ========================================================================= */}
        <section
          className="w-full py-12 sm:py-16 transition-colors"
          style={{ background: 'var(--surface-elevated)' }}
        >
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <Badge variant="orange">Ready to Benchmark?</Badge>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Take The Guesswork Out of Campus Placement Preparation
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Join engineering candidates using PlacementTracker to identify deficiencies, structure preparation, and succeed in technical interviews.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={Sparkles}>
                    Create Student Account
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer
        className="border-t py-8 transition-colors"
        style={{
          background: 'var(--bg-app)',
          borderColor: 'var(--border-primary)',
          color: 'var(--text-muted)',
        }}
      >
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg border flex items-center justify-center text-[var(--color-orange)]"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--border-primary)',
                }}
              >
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Placement<span className="text-[var(--color-orange)]">Tracker</span>
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-6 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <Link to="/login" className="hover:text-[var(--color-orange)] transition-colors">
                Student Sign In
              </Link>
              <Link to="/register" className="hover:text-[var(--color-orange)] transition-colors">
                Student Registration
              </Link>
              <Link to="/login" className="hover:text-[var(--color-orange)] transition-colors">
                Faculty Portal
              </Link>
            </nav>
          </div>

          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2"
            style={{ color: 'var(--text-disabled)' }}
          >
            <p>
              &copy; {new Date().getFullYear()} Smart Placement Readiness &amp; Skill Gap Tracker.
            </p>
            <p>
              Engineered with Precision Diagnostic Design System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
