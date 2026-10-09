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
  BookOpen,
  Compass,
  Activity,
  Layers,
  ChevronRight,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F3F7FC] flex flex-col selection:bg-[#42F5E8]/20 selection:text-[#42F5E8]">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ========================================================================= */}
        {/* HERO SECTION - WIDE 2-COLUMN RESPONSIVE LAYOUT (1280-1440px) */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden border-b border-[#243249]/60 pt-10 sm:pt-16 pb-16 sm:pb-24">
          {/* Subtle radial illumination behind hero */}
          <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-[#42F5E8]/10 via-[#C4FF58]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-gradient-to-tl from-[#17243A]/80 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-6 xl:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111B2D] border border-[#243249] text-xs font-semibold text-[#A6B4C8]">
                  <span className="w-2 h-2 rounded-full bg-[#42F5E8] animate-pulse" />
                  <span className="text-[#42F5E8]">Intelligent Career Readiness</span>
                  <span className="text-[#77869B]">|</span>
                  <span>Diagnostic Analytics</span>
                </div>

                <h1 className="text-3xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#F3F7FC] leading-[1.12]">
                  Know Your Gaps.{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#42F5E8] to-[#C4FF58]">
                    Build Your Skills.
                  </span>{' '}
                  Get Placement-Ready.
                </h1>

                <p className="text-base sm:text-lg xl:text-xl text-[#A6B4C8] leading-relaxed max-w-2xl font-normal">
                  A comprehensive diagnostics platform that benchmarks your competencies against
                  role-specific industry expectations, quantifies your readiness score, and prescribes
                  targeted preparation steps for campus placements.
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <Link to="/register">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={Sparkles}>
                      Create Student Account
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto" icon={ArrowRight}>
                      Sign In to Dashboard
                    </Button>
                  </Link>
                </div>

                {/* Key Value Points */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-[#243249]/60 text-xs text-[#A6B4C8]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#42F5E8] flex-shrink-0" />
                    <span>Objective MCQ Tests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#C4FF58] flex-shrink-0" />
                    <span>Weighted Readiness Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#4ADE80] flex-shrink-0" />
                    <span>Priority Recommendations</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Interactive Preview Composition (Illustrative Demo) */}
              <div className="lg:col-span-6 xl:col-span-5 w-full">
                <div className="relative rounded-2xl bg-gradient-to-b from-[#17243A]/80 to-[#111B2D]/90 p-1 border border-[#243249] shadow-2xl backdrop-blur-xl">
                  {/* Outer subtle glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#42F5E8]/20 to-[#C4FF58]/10 rounded-2xl blur-lg opacity-40 pointer-events-none" />

                  <div className="relative bg-[#0D1320] rounded-xl p-5 sm:p-6 space-y-5 overflow-hidden">
                    {/* Demo Preview Header */}
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#243249]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-full bg-[#FB7185]/70" />
                        <div className="w-3 h-3 rounded-full bg-[#FBBF24]/70" />
                        <div className="w-3 h-3 rounded-full bg-[#4ADE80]/70" />
                        <span className="ml-2 text-xs font-semibold text-[#A6B4C8]">
                          Target: Full-Stack Engineer
                        </span>
                      </div>
                      <Badge variant="cyan" size="sm">
                        Live Preview Demo
                      </Badge>
                    </div>

                    {/* Gauge & Metrics Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Metric 1: Readiness Score */}
                      <div className="bg-[#111B2D] p-4 rounded-xl border border-[#243249] flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-[#77869B] uppercase tracking-wider mb-2">
                          Placement Readiness
                        </span>
                        <div className="relative w-28 h-28 rounded-full border-4 border-[#17243A] flex items-center justify-center bg-[#080B12]">
                          <div className="absolute inset-0 rounded-full border-4 border-[#42F5E8] border-t-transparent -rotate-45" />
                          <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold text-[#42F5E8] tracking-tight">
                              78%
                            </span>
                            <span className="text-[10px] text-[#A6B4C8] uppercase font-semibold">
                              Ready
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-[#C4FF58] mt-2 font-medium">
                          +12% after last assessment
                        </span>
                      </div>

                      {/* Metric 2: Gap Overview */}
                      <div className="bg-[#111B2D] p-4 rounded-xl border border-[#243249] space-y-3">
                        <span className="text-xs font-medium text-[#77869B] uppercase tracking-wider block">
                          Skill Competency Gaps
                        </span>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-[#F3F7FC]">Data Structures</span>
                              <span className="text-[#4ADE80] font-semibold">85 / 90</span>
                            </div>
                            <div className="w-full bg-[#17243A] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#4ADE80] h-full w-[94%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-[#F3F7FC]">Database & SQL</span>
                              <span className="text-[#FBBF24] font-semibold">60 / 80</span>
                            </div>
                            <div className="w-full bg-[#17243A] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#FBBF24] h-full w-[75%]" />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-[#F3F7FC]">System Design</span>
                              <span className="text-[#FB7185] font-semibold">45 / 75</span>
                            </div>
                            <div className="w-full bg-[#17243A] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#FB7185] h-full w-[60%]" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prescriptive Recommendation Mockup */}
                    <div className="bg-[#111B2D] p-3.5 rounded-xl border border-[#243249] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#42F5E8]/10 text-[#42F5E8]">
                          <Activity size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#F3F7FC]">
                              System Design Gap
                            </span>
                            <Badge variant="error" size="sm">
                              High Priority
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#A6B4C8]">
                            Recommended: Take assessment to update score
                          </p>
                        </div>
                      </div>
                      <Link to="/register">
                        <Button variant="outline" size="sm" className="text-xs">
                          Diagnose
                        </Button>
                      </Link>
                    </div>

                    {/* Disclaimer note */}
                    <p className="text-[11px] text-center text-[#77869B] italic">
                      * Illustrative sample preview. Register to track your verified individual scores.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS SECTION - WORKFLOW TIMELINE */}
        {/* ========================================================================= */}
        <section id="workflow" className="w-full py-16 sm:py-20 border-b border-[#243249]/60 bg-[#0D1320]/40">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge variant="cyan">Diagnostic Methodology</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                How The Closed-Loop Workflow Works
              </h2>
              <p className="text-base sm:text-lg text-[#A6B4C8]">
                A deterministic, four-step continuous improvement cycle engineered to take students
                from baseline evaluation to verified placement readiness.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="relative bg-[#111B2D] border border-[#243249] rounded-2xl p-6 shadow-card-subtle hover:border-[#42F5E8]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#42F5E8]/10 text-[#42F5E8] border border-[#42F5E8]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-105 transition-transform">
                  01
                </div>
                <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">Assess Competencies</h3>
                <p className="text-sm text-[#A6B4C8] leading-relaxed">
                  Participate in timed, topic-specific assessments with server-validated timer enforcement and difficulty bands.
                </p>
                <div className="mt-4 pt-3 border-t border-[#243249] flex items-center text-xs font-semibold text-[#42F5E8] gap-1">
                  <span>Atomic Evaluation</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative bg-[#111B2D] border border-[#243249] rounded-2xl p-6 shadow-card-subtle hover:border-[#42F5E8]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#60A5FA]/10 text-[#60A5FA] border border-[#60A5FA]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-105 transition-transform">
                  02
                </div>
                <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">Diagnose Skill Gaps</h3>
                <p className="text-sm text-[#A6B4C8] leading-relaxed">
                  Automatically compare your scores against benchmark requirements of your target industry career role.
                </p>
                <div className="mt-4 pt-3 border-t border-[#243249] flex items-center text-xs font-semibold text-[#60A5FA] gap-1">
                  <span>Gap Categorization</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative bg-[#111B2D] border border-[#243249] rounded-2xl p-6 shadow-card-subtle hover:border-[#C4FF58]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#C4FF58]/10 text-[#C4FF58] border border-[#C4FF58]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-105 transition-transform">
                  03
                </div>
                <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">Targeted Improvement</h3>
                <p className="text-sm text-[#A6B4C8] leading-relaxed">
                  Receive rule-based recommendations prioritized by impact. Focus your practice where gaps are most critical.
                </p>
                <div className="mt-4 pt-3 border-t border-[#243249] flex items-center text-xs font-semibold text-[#C4FF58] gap-1">
                  <span>Prescriptive Guidance</span>
                  <ChevronRight size={14} />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative bg-[#111B2D] border border-[#243249] rounded-2xl p-6 shadow-card-subtle hover:border-[#4ADE80]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-105 transition-transform">
                  04
                </div>
                <h3 className="text-lg font-bold text-[#F3F7FC] mb-2">Track & Validate</h3>
                <p className="text-sm text-[#A6B4C8] leading-relaxed">
                  Log your study hours, monitor your readiness score growth over time, and demonstrate verified placement preparation.
                </p>
                <div className="mt-4 pt-3 border-t border-[#243249] flex items-center text-xs font-semibold text-[#4ADE80] gap-1">
                  <span>Readiness Ratio</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PLATFORM BENEFITS SECTION */}
        {/* ========================================================================= */}
        <section id="features" className="w-full py-16 sm:py-24 border-b border-[#243249]/60">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge variant="lime">Core Capabilities</Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                Designed for Engineering Excellence
              </h2>
              <p className="text-base sm:text-lg text-[#A6B4C8]">
                Everything undergraduate students and academic mentors need to systematically bridge
                the gap between coursework and industry recruitment.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card
                hover
                title="Skill Assessments"
                className="bg-[#111B2D]"
                badge={<Badge variant="cyan" size="sm">Assess</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#42F5E8]/10 text-[#42F5E8] flex-shrink-0">
                    <Brain size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    Objective MCQ evaluations with varied difficulty tiers, timer enforcement, and instant scoring logic to measure genuine knowledge depth.
                  </p>
                </div>
              </Card>

              {/* Feature 2 */}
              <Card
                hover
                title="Skill-Gap Analysis"
                className="bg-[#111B2D]"
                badge={<Badge variant="warning" size="sm">Diagnose</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#FBBF24]/10 text-[#FBBF24] flex-shrink-0">
                    <Target size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    Directly maps current scores against role specifications, categorizing deficiencies into none, small, medium, and critical severity levels.
                  </p>
                </div>
              </Card>

              {/* Feature 3 */}
              <Card
                hover
                title="Readiness Scoring"
                className="bg-[#111B2D]"
                badge={<Badge variant="lime" size="sm">Quantify</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#C4FF58]/10 text-[#C4FF58] flex-shrink-0">
                    <TrendingUp size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    Calculates a weighted readiness percentage relative to required skill weights, giving you an honest, role-relative placement probability indicator.
                  </p>
                </div>
              </Card>

              {/* Feature 4 */}
              <Card
                hover
                title="Personalized Recommendations"
                className="bg-[#111B2D]"
                badge={<Badge variant="info" size="sm">Prescribe</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#60A5FA]/10 text-[#60A5FA] flex-shrink-0">
                    <Sparkles size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    Automated rule-based prioritization delivers clear, actionable next steps—suggesting assessments, practice tasks, and specific focal areas.
                  </p>
                </div>
              </Card>

              {/* Feature 5 */}
              <Card
                hover
                title="Preparation Tracking"
                className="bg-[#111B2D]"
                badge={<Badge variant="success" size="sm">Practice</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#4ADE80]/10 text-[#4ADE80] flex-shrink-0">
                    <Clock size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    A private study activity logger to record practice hours, learning resources, and dates, building accountability during placement season.
                  </p>
                </div>
              </Card>

              {/* Feature 6 */}
              <Card
                hover
                title="Progress Analytics"
                className="bg-[#111B2D]"
                badge={<Badge variant="cyan" size="sm">Visualize</Badge>}
              >
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-xl bg-[#42F5E8]/10 text-[#42F5E8] flex-shrink-0">
                    <BarChart3 size={22} />
                  </div>
                  <p className="text-sm text-[#A6B4C8] leading-relaxed">
                    Interactive radar charts and score comparisons that visually illuminate strengths and pinpoint exact areas requiring immediate focus.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CLOSING CALL TO ACTION SECTION */}
        {/* ========================================================================= */}
        <section className="w-full py-16 sm:py-20 relative overflow-hidden bg-gradient-to-b from-[#0D1320] to-[#080B12]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="relative rounded-3xl bg-gradient-to-r from-[#111B2D] via-[#17243A] to-[#111B2D] border border-[#243249] p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#42F5E8]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <Badge variant="cyan" size="lg">Ready to Benchmark Your Skills?</Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F3F7FC] tracking-tight">
                  Take The Guesswork Out of Campus Placement Preparation
                </h2>
                <p className="text-base sm:text-lg text-[#A6B4C8] leading-relaxed">
                  Join fellow engineering candidates using PlacementTracker to identify deficiencies,
                  structure their study routine, and walk into recruitment interviews with confidence.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register" className="w-full sm:w-auto">
                    <Button variant="accent" size="lg" className="w-full sm:w-auto" icon={Sparkles}>
                      Create Free Student Account
                    </Button>
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                      Sign In Existing User
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-[#243249] bg-[#080B12] py-12 text-[#A6B4C8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-[#243249]/60">
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#111B2D] border border-[#42F5E8]/30 flex items-center justify-center text-[#42F5E8]">
                  <Sparkles size={16} />
                </div>
                <span className="font-extrabold text-lg text-[#F3F7FC] tracking-tight">
                  Placement<span className="text-[#42F5E8]">Tracker</span>
                </span>
              </div>
              <p className="text-sm text-[#77869B] max-w-md leading-relaxed">
                Smart Placement Readiness &amp; Skill Gap Tracker is a career intelligence platform
                designed to quantify competencies, assess technical skills, and prepare engineering
                undergraduates for competitive placements.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#F3F7FC] uppercase tracking-wider mb-3">
                Platform Portals
              </h4>
              <ul className="space-y-2 text-sm text-[#A6B4C8]">
                <li>
                  <Link to="/login" className="hover:text-[#42F5E8] transition-colors">
                    Student Login Portal
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[#42F5E8] transition-colors">
                    Student Registration
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[#42F5E8] transition-colors">
                    Faculty &amp; TPO Access
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[#F3F7FC] uppercase tracking-wider mb-3">
                Core Methodology
              </h4>
              <ul className="space-y-2 text-sm text-[#77869B]">
                <li>Deterministic Gap Formula</li>
                <li>Weighted Readiness Scoring</li>
                <li>8-Rule Recommendation Engine</li>
                <li>Private Preparation Log</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#77869B] gap-4">
            <p>
              &copy; {new Date().getFullYear()} Smart Placement Readiness &amp; Skill Gap Tracker. Built for academic and career excellence.
            </p>
            <p>
              Dark Premium SaaS Edition &bull; Production Architecture
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
