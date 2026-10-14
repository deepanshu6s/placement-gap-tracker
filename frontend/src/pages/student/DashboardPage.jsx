import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { studentService } from '../../services/studentService';
import { dashboardService } from '../../services/dashboardService';
import { preparationService } from '../../services/preparationService';
import { baselineService } from '../../services/baselineService';
import { taskProgressService } from '../../services/taskProgressService';
import { useUiStore } from '../../store/uiStore';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Target,
  BookOpen,
  Brain,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Compass,
  Award,
  ArrowRight,
  Plus,
  Sparkles,
  ExternalLink,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const theme = useUiStore((state) => state.theme);
  const isLight = theme === 'light';

  const [profile, setProfile] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [gaps, setGaps] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [prepLogs, setPrepLogs] = useState([]);
  const [baselineData, setBaselineData] = useState(null);
  const [tasksEvidenceStats, setTasksEvidenceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const prof = await studentService.getProfile();
        if (!prof || !prof.profile_completed) {
          navigate('/student/profile-setup', { replace: true });
          return;
        }
        if (isMounted) setProfile(prof);

        // Fetch dashboard metrics and baseline in parallel
        const [readinessData, gapsData, recsData, logsData, baseData, statsData] = await Promise.all([
          dashboardService.getReadiness().catch(() => ({ data: null })),
          dashboardService.getSkillGaps().catch(() => []),
          dashboardService.getRecommendations().catch(() => []),
          preparationService.getLogs().catch(() => []),
          baselineService.getBaseline(prof.target_role_id).catch(() => null),
          taskProgressService.getStats().catch(() => null),
        ]);

        if (isMounted) {
          setReadiness(readinessData?.data || null);
          setGaps(Array.isArray(gapsData) ? gapsData : []);
          setRecommendations(Array.isArray(recsData) ? recsData : []);
          setPrepLogs(Array.isArray(logsData) ? logsData : []);
          setBaselineData(baseData);
          setTasksEvidenceStats(statsData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        if (isMounted) {
          setError('Could not load all dashboard data. Please try refreshing.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) {
    return (
      <PageWrapper title="Student Dashboard">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Calculating placement readiness metrics...
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Calculate honest real metrics from API responses
  const readinessScore =
    readiness?.score !== null && readiness?.score !== undefined ? Math.round(readiness.score) : null;
  const criticalGapsCount = gaps.filter(
    (g) => g.is_assessed && (g.gap_category === 'critical' || g.gap > 35)
  ).length;
  const assessedSkillsCount =
    readiness?.assessedSkillsCount !== undefined
      ? readiness.assessedSkillsCount
      : gaps.filter((g) => g.is_assessed).length;
  const totalSkillsCount = readiness?.totalSkillsCount || gaps.length;
  const assessmentCoverage =
    readiness?.assessmentCoverage !== undefined
      ? readiness.assessmentCoverage
      : totalSkillsCount > 0
      ? Math.round((assessedSkillsCount / totalSkillsCount) * 100)
      : 0;
  const totalLoggedHours = prepLogs.reduce((sum, l) => sum + (parseFloat(l.hours_spent) || 0), 0);

  const baselineRatedCount = baselineData?.summary?.rated_count || 0;
  const hasCompleteBaseline = Boolean(baselineData?.summary?.is_complete);
  const baselineMap = new Map((baselineData?.skills || []).map((s) => [s.skill_id, s]));

  // Radar data formatting for Recharts
  const radarData = gaps.map((g) => ({
    subject: g.skill_name || 'Skill',
    current: g.is_assessed ? Math.round(g.current_score || 0) : 0,
    required: Math.round(g.required_level || 0),
    fullMark: 100,
  }));

  const isRoleWithoutSkills = readiness?.status === 'ROLE_HAS_NO_SKILLS' || (!loading && gaps.length === 0);
  const isUnassessed = totalSkillsCount > 0 && assessedSkillsCount === 0;

  // Chart theme colors
  const gridStroke = isLight ? '#DDD5BE' : '#34271F';
  const axisTickColor = isLight ? '#5C5347' : '#C3B7AD';
  const radiusTickColor = isLight ? '#7A6F60' : '#A3978D';
  const benchmarkColor = isLight ? '#9E6F05' : '#FFC857';
  const studentScoreColor = isLight ? '#C45A18' : '#FF6A2A';

  return (
    <PageWrapper
      title={`Hello, ${profile?.full_name || 'Student'}`}
      subtitle={`Target Role: ${profile?.target_role_name || 'Not Configured'} • Roll: ${
        profile?.roll_number || 'N/A'
      }`}
      badge={
        <Badge variant="orange" size="sm">
          {profile?.branch} &bull; Batch {profile?.batch_year}
        </Badge>
      }
      action={
        <div className="flex items-center gap-2">
          <Link to="/student/roadmap">
            <Button variant="secondary" size="sm" icon={Target}>
              My Preparation Roadmap
            </Button>
          </Link>
          <Link to="/student/roles">
            <Button variant="ghost" size="sm" icon={Compass}>
              Change Target Role
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6 sm:space-y-8 w-full">
        {error && (
          <Alert variant="warning" title="Notice">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* PRIMARY CALL TO ACTION: BUILD SKILL BASELINE (WHEN UNASSESSED / INCOMPLETE) */}
        {/* ========================================================================= */}
        {(!hasCompleteBaseline || isUnassessed) && !isRoleWithoutSkills && (
          <div
            className="p-5 sm:p-6 rounded-2xl border transition-all"
            style={{
              background: 'var(--surface-card)',
              borderColor: 'var(--color-orange)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="orange" size="sm">
                    Recommended First Step
                  </Badge>
                  {baselineRatedCount > 0 && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {baselineRatedCount} of {totalSkillsCount} skills rated
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Build Your Skill Baseline
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Select the skills you know and rate your current proficiency (Beginner, Intermediate, Proficient)
                  to generate your personalized preparation roadmap — without taking a lengthy MCQ quiz immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-shrink-0">
                <Link to="/student/skill-baseline" className="w-full sm:w-auto">
                  <Button variant="primary" size="md" icon={Sparkles} className="w-full">
                    {baselineRatedCount > 0 ? 'Resume Skill Baseline' : 'Build Your Skill Baseline'}
                  </Button>
                </Link>
                <Link to="/student/roadmap" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full">
                    View Roadmap
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Role has no configured skills warning */}
        {isRoleWithoutSkills && (
          <Alert variant="warning" title="No Skill Requirements Defined">
            Your selected target role ({profile?.target_role_name || 'Current Role'}) has no skill
            criteria configured by faculty administrators yet. Please select an active role from the
            catalogue to begin assessments and track readiness.
            <div className="mt-3">
              <Link to="/student/roles">
                <Button variant="secondary" size="sm" icon={Compass}>
                  Open Career Role Catalogue
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {/* Faculty Revision Alert */}
        {tasksEvidenceStats?.evidence?.needs_improvement > 0 && (
          <Alert variant="warning" title="Action Required: Faculty Revision Requested">
            Faculty reviewers requested improvements on {tasksEvidenceStats.evidence.needs_improvement} of your evidence submission(s). Review mentor notes and resubmit your artifacts to advance toward role readiness.
            <div className="mt-3">
              <Link to="/student/evidence">
                <Button variant="primary" size="sm" icon={FolderGit2}>
                  Open Evidence Portfolio
                </Button>
              </Link>
            </div>
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* FOUR SUMMARY METRIC CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Placement Readiness */}
          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Placement Readiness
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}
              >
                <Award size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {readinessScore !== null ? `${readinessScore}%` : 'Not Assessed'}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {readinessScore !== null
                  ? readiness?.isFullyAssessed
                    ? 'Fully Assessed'
                    : 'Partial Diagnostic'
                  : 'Diagnostic Pending'}
              </span>
            </div>
            <div
              className="mt-3 w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-hover)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  background: 'var(--color-orange)',
                  width: `${Math.min(100, readinessScore || 0)}%`,
                }}
              />
            </div>
          </Card>

          {/* Card 2: Critical Skill Gaps */}
          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Critical Skill Gaps
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-coral)' }}
              >
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span
                className="text-3xl font-extrabold tracking-tight"
                style={{
                  color: criticalGapsCount > 0 ? 'var(--color-coral)' : 'var(--text-primary)',
                }}
              >
                {criticalGapsCount}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {criticalGapsCount === 1 ? 'High Priority Area' : 'High Priority Areas'}
              </span>
            </div>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
              {criticalGapsCount === 0
                ? isUnassessed
                  ? 'Complete assessments to identify gap severity'
                  : 'No critical deficiencies identified'
                : 'Deficiency > 35% against role benchmark'}
            </p>
          </Card>

          {/* Card 3: Skills Assessed & Coverage */}
          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Skills Evaluated
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-amber)' }}
              >
                <Brain size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {assessedSkillsCount}{' '}
                <span className="text-lg font-normal" style={{ color: 'var(--text-muted)' }}>
                  / {totalSkillsCount}
                </span>
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-amber)' }}>
                {assessmentCoverage}% Tested
              </span>
            </div>
            <div
              className="mt-3 w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--surface-hover)' }}
            >
              <div
                className="h-full transition-all duration-300"
                style={{
                  background: 'var(--color-amber)',
                  width: `${Math.min(100, assessmentCoverage || 0)}%`,
                }}
              />
            </div>
          </Card>

          {/* Card 4: Logged Preparation */}
          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Logged Preparation
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}
              >
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {totalLoggedHours.toFixed(1)}h
              </span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {prepLogs.length} sessions
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <Link
                to="/student/preparation"
                className="font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
                style={{ color: 'var(--color-orange)' }}
              >
                <Plus size={13} /> Log Practice Hours
              </Link>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* PRACTICAL TASKS & EVIDENCE PROGRESS (TASK 3 REAL PERSISTENCE) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Practical Coding Tasks
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}
              >
                <BookOpen size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tasksEvidenceStats?.tasks?.total_completed || 0}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-orange)' }}>
                Tasks Completed
              </span>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {tasksEvidenceStats?.tasks?.total_in_progress || 0} in progress across{' '}
              {tasksEvidenceStats?.tasks?.skills_with_activity || 0} active skill workspaces.
            </p>
            <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-primary)' }}>
              <Link
                to="/student/roadmap"
                className="font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
                style={{ color: 'var(--color-orange)' }}
              >
                Continue in Roadmap <ArrowRight size={12} />
              </Link>
            </div>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Evidence Portfolio
              </span>
              <div
                className="p-2 rounded-md"
                style={{ background: 'var(--surface-hover)', color: 'var(--color-amber)' }}
              >
                <FolderGit2 size={16} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tasksEvidenceStats?.evidence?.accepted || 0}
              </span>
              <span className="text-xs font-semibold" style={{ color: 'var(--color-amber)' }}>
                Verified by Faculty
              </span>
            </div>
            <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              {tasksEvidenceStats?.evidence?.under_review || 0} under review,{' '}
              {tasksEvidenceStats?.evidence?.total_submitted || 0} total artifact(s) submitted.
            </p>
            <div className="mt-3 pt-2 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--border-primary)' }}>
              <Link
                to="/student/evidence"
                className="font-semibold inline-flex items-center gap-1 transition-colors hover:underline"
                style={{ color: 'var(--color-orange)' }}
              >
                Manage Evidence Portfolio <ArrowRight size={12} />
              </Link>
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* TWO-COLUMN WORKSPACE: SECTION A (RADAR CHART) & SECTION B (RECOMMENDATIONS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Section A: Role Competency Benchmark Radar */}
          <div className="lg:col-span-7 flex flex-col">
            <Card
              title="Skill Benchmark Comparison"
              subtitle={
                assessedSkillsCount > 0
                  ? `Your evaluated diagnostic scores vs benchmarks for ${profile?.target_role_name || 'Role'}`
                  : `Role benchmark criteria for ${profile?.target_role_name || 'Role'} (Diagnostic test pending)`
              }
              className="flex-1 flex flex-col justify-between"
            >
              {radarData.length > 0 ? (
                <div className="flex-1 flex flex-col justify-between">
                  <div className="h-64 sm:h-72 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke={gridStroke} />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: axisTickColor, fontSize: 11, fontWeight: 500 }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={{ fill: radiusTickColor, fontSize: 10 }}
                          stroke={gridStroke}
                        />

                        {/* Always display Role Benchmark reference */}
                        <Radar
                          name="Role Benchmark"
                          dataKey="required"
                          stroke={benchmarkColor}
                          fill={benchmarkColor}
                          fillOpacity={0.18}
                          strokeWidth={1.5}
                        />

                        {/* ONLY render "Your Score" polygon if student has actually completed diagnostic assessments */}
                        {assessedSkillsCount > 0 && (
                          <Radar
                            name="Your Score"
                            dataKey="current"
                            stroke={studentScoreColor}
                            fill={studentScoreColor}
                            fillOpacity={0.35}
                            strokeWidth={2}
                          />
                        )}
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Honest Legend */}
                  <div
                    className="pt-3 border-t flex flex-wrap items-center justify-center gap-6 text-xs"
                    style={{ borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: benchmarkColor }} />
                      <span>Role Benchmark Requirement</span>
                    </div>

                    {assessedSkillsCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: studentScoreColor }} />
                        <span>Your Assessed Diagnostic Score</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 italic" style={{ color: 'var(--text-muted)' }}>
                        <span>(Your score polygon appears once assessments are completed)</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="flex-1 flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-lg my-2"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <Brain size={32} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    No Skill Criteria Configured
                  </p>
                  <p className="text-xs max-w-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    Select a target role with defined skills to populate your benchmark radar chart.
                  </p>
                  <Link to="/student/roles" className="mt-3">
                    <Button variant="secondary" size="sm">
                      View Role Catalogue
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Section B: What to Improve Next (Priority Action Plan) */}
          <div className="lg:col-span-5 flex flex-col">
            <Card
              title="What to Improve Next"
              subtitle="Actionable steps based on role requirements and your progress"
              action={
                <Link to="/student/roadmap">
                  <Button variant="ghost" size="sm" className="text-xs" icon={ArrowRight}>
                    Full Roadmap
                  </Button>
                </Link>
              }
              className="flex-1 flex flex-col"
            >
              {recommendations.length > 0 ? (
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {recommendations.slice(0, 4).map((rec) => {
                    const isHigh = rec.priority === 'high';
                    const isMedium = rec.priority === 'medium';
                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-lg border transition-colors"
                        style={{
                          background: 'var(--surface-input)',
                          borderColor: 'var(--border-primary)',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            {rec.skill_id ? (
                              <Link
                                to={`/student/skills/${rec.skill_id}`}
                                className="font-semibold text-sm hover:underline transition-colors"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {rec.skill_name || 'Action Item'}
                              </Link>
                            ) : (
                              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                                {rec.skill_name || 'Action Item'}
                              </span>
                            )}

                            <Badge
                              variant={isHigh ? 'coral' : isMedium ? 'amber' : 'neutral'}
                              size="sm"
                            >
                              {rec.priority}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {rec.skill_id && (
                              <Link to={`/student/skills/${rec.skill_id}`}>
                                <Button variant="ghost" size="sm" className="text-xs py-0.5 px-2">
                                  Guide
                                </Button>
                              </Link>
                            )}
                            {rec.skill_id ? (
                              <Link to={`/student/assessments/${rec.skill_id}`}>
                                <Button variant="outline" size="sm" className="text-xs py-0.5 px-2">
                                  Assess
                                </Button>
                              </Link>
                            ) : (
                              <Link to="/student/preparation">
                                <Button variant="secondary" size="sm" className="text-xs py-0.5 px-2">
                                  Practice
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {rec.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle2 size={32} style={{ color: 'var(--color-orange)' }} className="mb-2" />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    No Pending Actions
                  </p>
                  <p className="text-xs max-w-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {gaps.length === 0
                      ? 'Select an active role with skills to generate targeted recommendations.'
                      : 'You are on track! Log study hours to maintain consistency.'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DETAILED COMPETENCY BREAKDOWN TABLE */}
        {/* ========================================================================= */}
        <Card
          title="Role Competency Breakdown"
          subtitle="Detailed mapping of target requirements vs your self-reported baseline & diagnostic scores"
          action={
            <Link to="/student/skill-baseline">
              <Button variant="outline" size="sm" icon={Sparkles}>
                Review Baseline Ratings
              </Button>
            </Link>
          }
        >
          {gaps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead
                  className="text-xs uppercase tracking-wider"
                  style={{ background: 'var(--surface-input)', color: 'var(--text-muted)' }}
                >
                  <tr>
                    <th className="px-3.5 py-2.5 rounded-l-lg font-semibold">Skill Objective</th>
                    <th className="px-3.5 py-2.5 font-semibold">Self-Reported Level</th>
                    <th className="px-3.5 py-2.5 font-semibold">Diagnostic Score</th>
                    <th className="px-3.5 py-2.5 font-semibold">Target Benchmark</th>
                    <th className="px-3.5 py-2.5 font-semibold">Status</th>
                    <th className="px-3.5 py-2.5 rounded-r-lg font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                  {gaps.map((gap) => {
                    const isCritical =
                      gap.is_assessed &&
                      (gap.gap_category === 'critical' || gap.gap > 35 || gap.gap_value > 35);
                    const isMedium =
                      gap.is_assessed &&
                      (gap.gap_category === 'medium' || (gap.gap > 15 && gap.gap <= 35));
                    const isMet =
                      gap.is_assessed &&
                      (gap.gap <= 0 || gap.current_score >= gap.required_level);

                    const baselineItem = baselineMap.get(gap.skill_id);
                    const selfReportLevel = baselineItem?.proficiency_level || null;

                    return (
                      <tr
                        key={gap.skill_id}
                        className="transition-colors hover:bg-[var(--surface-hover)]"
                      >
                        <td className="px-3.5 py-3 font-semibold">
                          <Link
                            to={`/student/skills/${gap.skill_id}`}
                            className="hover:underline transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {gap.skill_name}
                          </Link>
                        </td>

                        {/* Self-reported level column */}
                        <td className="px-3.5 py-3 text-xs">
                          {selfReportLevel ? (
                            <Badge
                              variant={
                                selfReportLevel === 'proficient'
                                  ? 'orange'
                                  : selfReportLevel === 'intermediate'
                                  ? 'amber'
                                  : selfReportLevel === 'beginner'
                                  ? 'coral'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {selfReportLevel}
                            </Badge>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Unrated</span>
                          )}
                        </td>

                        {/* Verified diagnostic score column */}
                        <td className="px-3.5 py-3">
                          {gap.is_assessed ? (
                            <span className="font-bold" style={{ color: 'var(--color-orange)' }}>
                              {Math.round(gap.current_score)}%
                            </span>
                          ) : (
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Not Assessed
                            </span>
                          )}
                        </td>

                        {/* Benchmark requirement */}
                        <td className="px-3.5 py-3" style={{ color: 'var(--text-secondary)' }}>
                          {Math.round(gap.required_level)}%
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-3">
                          <Badge
                            variant={
                              !gap.is_assessed
                                ? selfReportLevel === 'proficient'
                                  ? 'orange'
                                  : selfReportLevel === 'intermediate'
                                  ? 'amber'
                                  : selfReportLevel === 'beginner'
                                  ? 'coral'
                                  : 'neutral'
                                : isMet
                                ? 'orange'
                                : isCritical
                                ? 'coral'
                                : isMedium
                                ? 'amber'
                                : 'neutral'
                            }
                            size="sm"
                          >
                            {!gap.is_assessed
                              ? selfReportLevel
                                ? `Self: ${selfReportLevel}`
                                : 'Not Evaluated'
                              : isMet
                              ? 'Benchmark Met'
                              : isCritical
                              ? 'Critical Gap'
                              : isMedium
                              ? 'Moderate Gap'
                              : 'Minor Gap'}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/student/skills/${gap.skill_id}`}>
                              <Button variant="ghost" size="sm" className="text-xs py-1 px-2">
                                Guide
                              </Button>
                            </Link>
                            <Link to={`/student/assessments/${gap.skill_id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                icon={Activity}
                                className="text-xs py-1 px-2"
                              >
                                {gap.is_assessed ? 'Retest' : 'Assess'}
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              No skill criteria configured for your selected target role yet.
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
  );
};

export default DashboardPage;
