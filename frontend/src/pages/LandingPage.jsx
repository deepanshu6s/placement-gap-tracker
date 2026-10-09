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
    <div className="min-h-screen bg-[#0A0908] text-[#F5F0EB] flex flex-col selection:bg-[#FF6A2A]/20 selection:text-[#FF6A2A]">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative w-full border-b border-[#34271F] pt-8 sm:pt-14 pb-14 sm:pb-20">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#191512] border border-[#34271F] text-xs font-medium text-[#C3B7AD]">
                  <span className="w-2 h-2 rounded-full bg-[#FF6A2A]" />
                  <span className="text-[#FF6A2A] font-semibold">Career Diagnostic Platform</span>
                  <span className="text-[#34271F]">|</span>
                  <span>Placement Analytics</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F5F0EB] leading-tight">
                    Understand Your Skills.{' '}
                    <span className="text-[#FF6A2A]">Improve Your Placement Readiness.</span>
                  </h1>
                  <p className="text-base sm:text-lg font-semibold text-[#FFC857] tracking-wide">
                    Know Your Gaps. Build Your Skills. Get Placement-Ready.
                  </p>
                </div>

                <p className="text-sm sm:text-base text-[#C3B7AD] leading-relaxed max-w-2xl">
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
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#34271F] text-xs text-[#C3B7AD]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#FF6A2A] flex-shrink-0" />
                    <span>Objective MCQ Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#FFC857] flex-shrink-0" />
                    <span>Weighted Readiness Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-[#FF6A2A] flex-shrink-0" />
                    <span>Actionable Next Steps</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Clean Product Preview Composition */}
              <div className="lg:col-span-5 w-full">
                <div className="rounded-xl bg-[#12100E] p-4 sm:p-5 border border-[#34271F] shadow-card-elevated space-y-4">
                  {/* Preview Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#34271F]">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF526F]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FFC857]" />
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A2A]" />
                      <span className="ml-1 text-xs font-semibold text-[#C3B7AD]">
                        Target: Full-Stack Engineer
                      </span>
                    </div>
                    <Badge variant="orange" size="sm">
                      Dashboard Preview
                    </Badge>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#191512] p-3 rounded-lg border border-[#34271F] text-center">
                      <span className="text-[11px] font-medium text-[#A3978D] uppercase tracking-wider block mb-1">
                        Placement Readiness
                      </span>
                      <div className="text-2xl font-black text-[#FF6A2A]">
                        78%
                      </div>
                      <span className="text-[10px] text-[#FFC857] font-medium">
                        High Readiness
                      </span>
                    </div>

                    <div className="bg-[#191512] p-3 rounded-lg border border-[#34271F] text-center">
                      <span className="text-[11px] font-medium text-[#A3978D] uppercase tracking-wider block mb-1">
                        Critical Skill Gaps
                      </span>
                      <div className="text-2xl font-black text-[#FF526F]">
                        1
                      </div>
                      <span className="text-[10px] text-[#A3978D]">
                        Requires Practice
                      </span>
                    </div>
                  </div>

                  {/* Competency Gap List */}
                  <div className="bg-[#191512] p-3.5 rounded-lg border border-[#34271F] space-y-2.5 text-xs">
                    <span className="text-[11px] font-semibold text-[#A3978D] uppercase tracking-wider block">
                      Core Competency Gaps
                    </span>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#F5F0EB]">Data Structures &amp; Algorithms</span>
                        <span className="text-[#FF6A2A] font-semibold">85 / 90</span>
                      </div>
                      <div className="w-full bg-[#241B16] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF6A2A] h-full w-[94%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#F5F0EB]">Database &amp; SQL Querying</span>
                        <span className="text-[#FFC857] font-semibold">65 / 80</span>
                      </div>
                      <div className="w-full bg-[#241B16] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FFC857] h-full w-[81%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#F5F0EB]">System Architecture</span>
                        <span className="text-[#FF526F] font-semibold">45 / 75</span>
                      </div>
                      <div className="w-full bg-[#241B16] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FF526F] h-full w-[60%]" />
                      </div>
                    </div>
                  </div>

                  {/* Sample Prescriptive Action */}
                  <div className="bg-[#191512] p-3 rounded-lg border border-[#34271F] flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-[#241B16] text-[#FF6A2A]">
                        <Activity size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#F5F0EB]">System Architecture</span>
                          <Badge variant="coral" size="sm">High Priority</Badge>
                        </div>
                        <p className="text-[11px] text-[#A3978D]">Recommended: Complete diagnostic test</p>
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
        <section id="workflow" className="w-full py-12 sm:py-16 border-b border-[#34271F] bg-[#12100E]">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <Badge variant="orange">Continuous Diagnostic Loop</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F0EB] tracking-tight">
                How The Closed-Loop Workflow Works
              </h2>
              <p className="text-xs sm:text-sm text-[#C3B7AD]">
                A deterministic, four-step continuous improvement workflow from baseline assessment to verified placement readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Step 1 */}
              <div className="bg-[#191512] border border-[#34271F] rounded-xl p-5 hover:border-[#65402C] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241B16] text-[#FF6A2A] border border-[#65402C] flex items-center justify-center font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-[#F5F0EB] mb-1.5">Assess Competencies</h3>
                <p className="text-xs text-[#C3B7AD] leading-relaxed">
                  Participate in timed, topic-specific assessments with server-validated timer enforcement and difficulty bands.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#191512] border border-[#34271F] rounded-xl p-5 hover:border-[#65402C] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241B16] text-[#FFC857] border border-[#65402C] flex items-center justify-center font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-[#F5F0EB] mb-1.5">Diagnose Skill Gaps</h3>
                <p className="text-xs text-[#C3B7AD] leading-relaxed">
                  Automatically compare your scores against benchmark requirements of your chosen industry career role.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#191512] border border-[#34271F] rounded-xl p-5 hover:border-[#65402C] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241B16] text-[#FF526F] border border-[#65402C] flex items-center justify-center font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-[#F5F0EB] mb-1.5">Targeted Improvement</h3>
                <p className="text-xs text-[#C3B7AD] leading-relaxed">
                  Receive rule-based recommendations prioritized by impact. Focus your practice where gaps are most critical.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-[#191512] border border-[#34271F] rounded-xl p-5 hover:border-[#65402C] transition-colors">
                <div className="w-9 h-9 rounded-lg bg-[#241B16] text-[#FF6A2A] border border-[#65402C] flex items-center justify-center font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="text-base font-bold text-[#F5F0EB] mb-1.5">Track &amp; Validate</h3>
                <p className="text-xs text-[#C3B7AD] leading-relaxed">
                  Log your study hours, monitor your readiness score growth over time, and build verified placement confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* KEY CAPABILITIES */}
        {/* ========================================================================= */}
        <section id="features" className="w-full py-12 sm:py-16 border-b border-[#34271F]">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12 space-y-2">
              <Badge variant="amber">Core Capabilities</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F0EB] tracking-tight">
                Designed for Engineering Excellence
              </h2>
              <p className="text-xs sm:text-sm text-[#C3B7AD]">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#FF6A2A] flex-shrink-0">
                    <Brain size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#FF526F] flex-shrink-0">
                    <Target size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#FFC857] flex-shrink-0">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#FF6A2A] flex-shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#FFC857] flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
                  <div className="p-2.5 rounded-lg bg-[#241B16] text-[#C3B7AD] flex-shrink-0">
                    <BarChart3 size={20} />
                  </div>
                  <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
        <section className="w-full py-12 sm:py-16 bg-[#12100E]">
          <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full text-center">
            <div className="max-w-xl mx-auto space-y-4">
              <Badge variant="orange">Ready to Benchmark?</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F0EB] tracking-tight">
                Take The Guesswork Out of Campus Placement Preparation
              </h2>
              <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
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
      <footer className="border-t border-[#34271F] bg-[#0A0908] py-8 text-[#A3978D]">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-[#34271F]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#241B16] border border-[#65402C] flex items-center justify-center text-[#FF6A2A]">
                <Sparkles size={14} />
              </div>
              <span className="font-bold text-base text-[#F5F0EB] tracking-tight">
                Placement<span className="text-[#FF6A2A]">Tracker</span>
              </span>
            </div>

            <nav className="flex flex-wrap items-center gap-6 text-xs text-[#C3B7AD]">
              <Link to="/login" className="hover:text-[#FF6A2A] transition-colors">
                Student Sign In
              </Link>
              <Link to="/register" className="hover:text-[#FF6A2A] transition-colors">
                Student Registration
              </Link>
              <Link to="/login" className="hover:text-[#FF6A2A] transition-colors">
                Faculty Portal
              </Link>
            </nav>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#786D65] gap-2">
            <p>
              &copy; {new Date().getFullYear()} Smart Placement Readiness &amp; Skill Gap Tracker.
            </p>
            <p>
              Engineered with Warm Charcoal &amp; Neon Orange Design System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
