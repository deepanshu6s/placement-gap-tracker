import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Alert } from '../../components/ui/Alert';
import { facultyService } from '../../services/facultyService';
import {
  Users,
  CheckCircle2,
  BarChart3,
  AlertTriangle,
  ClipboardList,
  Lightbulb,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  BookOpen,
  Target,
  Info,
} from 'lucide-react';

// ── Utility ────────────────────────────────────────────────────────────────────
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

const readinessColor = (score) => {
  if (score === null || score === undefined) return 'var(--text-muted)';
  if (score >= 70) return 'var(--color-orange)';
  if (score >= 50) return 'var(--color-amber)';
  return 'var(--color-coral)';
};

// ── Mini metric card ───────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, icon: Icon, accent = 'orange', tooltip }) => {
  const colorMap = {
    orange: 'var(--color-orange)',
    amber:  'var(--color-amber)',
    coral:  'var(--color-coral)',
    muted:  'var(--text-secondary)',
  };
  const color = colorMap[accent] || colorMap.orange;

  return (
    <Card hover>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            {label}
            {tooltip && (
              <span
                title={tooltip}
                className="ml-1 cursor-help"
                style={{ color: 'var(--text-muted)' }}
              >
                <Info size={11} className="inline" />
              </span>
            )}
          </span>
          <div className="mt-2 text-3xl font-extrabold leading-none" style={{ color }}>
            {value ?? '—'}
          </div>
          {sub && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2 rounded-md border flex-shrink-0" style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-primary)', color }}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </Card>
  );
};

// ── Section heading ────────────────────────────────────────────────────────────
const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 mb-4">
    {Icon && (
      <div className="p-2 rounded-lg" style={{ background: 'var(--surface-elevated)', color: 'var(--color-orange)' }}>
        <Icon size={18} />
      </div>
    )}
    <div>
      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
    </div>
  </div>
);

// ── Proficiency bar ────────────────────────────────────────────────────────────
const ProfBar = ({ count, total, color, label }) => {
  const w = pct(count, total);
  return (
    <div className="flex items-center gap-2 text-xs" title={`${label}: ${count} student(s) (${w}%)`}>
      <span className="w-20 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${w}%`, background: color }} />
      </div>
      <span className="w-6 text-right font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>{count}</span>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
export const FacultyAnalyticsPage = () => {
  const [profile, setProfile] = useState(null);

  // Filter state
  const [batchYear, setBatchYear] = useState('2024');
  const [branch,    setBranch]    = useState('CS');
  const [roleFilter, setRoleFilter] = useState('');

  // Data state
  const [overview,      setOverview]      = useState(null);
  const [roleDistrib,   setRoleDistrib]   = useState([]);
  const [skillGaps,     setSkillGaps]     = useState([]);
  const [supportList,   setSupportList]   = useState([]);
  const [insights,      setInsights]      = useState([]);

  // UI state
  const [loading,    setLoading]    = useState(true);
  const [exporting,  setExporting]  = useState(false);
  const [error,      setError]      = useState('');

  // ── Fetch all analytics data ─────────────────────────────────────────────────
  const fetchData = useCallback(async (year, br) => {
    setLoading(true);
    setError('');
    try {
      const [prof, ov, rd, sg, sl, ins] = await Promise.all([
        facultyService.getProfile(),
        facultyService.getAnalyticsOverview(parseInt(year, 10) || null, br || null).catch(() => null),
        facultyService.getAnalyticsRoleDistribution(parseInt(year, 10) || null, br || null).catch(() => []),
        facultyService.getAnalyticsSkillGaps(parseInt(year, 10) || null, br || null, null).catch(() => []),
        facultyService.getStudentSupportList(parseInt(year, 10) || null, br || null).catch(() => []),
        facultyService.getAnalyticsInsights(parseInt(year, 10) || null, br || null).catch(() => []),
      ]);

      setProfile(prof);
      setOverview(ov);
      setRoleDistrib(Array.isArray(rd) ? rd : []);
      setSkillGaps(Array.isArray(sg) ? sg : []);
      setSupportList(Array.isArray(sl) ? sl : []);
      setInsights(Array.isArray(ins) ? ins : []);
    } catch (err) {
      console.error('Analytics load error:', err);
      setError('Unable to load analytics. Check your faculty authorization and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(batchYear, branch); }, []);

  const handleApply = (e) => {
    e.preventDefault();
    setRoleFilter('');
    fetchData(batchYear, branch);
  };

  const handleReset = () => {
    setBatchYear('2024');
    setBranch('CS');
    setRoleFilter('');
    fetchData('2024', 'CS');
  };

  // ── Export analytics CSV ──────────────────────────────────────────────────────
  const handleExportAnalytics = async () => {
    try {
      setExporting(true);
      const blob = await facultyService.exportAnalyticsCSV(parseInt(batchYear, 10), branch);
      const url  = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv' }));
      const a    = document.createElement('a');
      a.href     = url;
      a.setAttribute('download', `analytics_report_${branch}_${batchYear}.csv`);
      document.body.appendChild(a);
      a.click();
      a.parentNode.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Export failed. Please retry or check your permissions.');
    } finally {
      setExporting(false);
    }
  };

  // ── Filtered skill-gap rows ───────────────────────────────────────────────────
  const filteredSkillGaps = roleFilter
    ? skillGaps.filter(sg => sg.role_id === roleFilter)
    : skillGaps;

  // ── Role max for relative bar widths ─────────────────────────────────────────
  const maxRoleCount = Math.max(...roleDistrib.map(r => r.student_count), 1);

  // ════════════════════════════════════════════════════════════════════════════════
  return (
    <PageWrapper
      title={`Placement Analytics${profile ? ` • ${profile.full_name || ''}` : ''}`}
      subtitle={
        profile?.is_tpo
          ? 'Campus-wide diagnostic intelligence for Training & Placement'
          : `Cohort analytics — ${profile?.department || 'Department'}`
      }
      badge={
        <Badge variant={profile?.is_tpo ? 'amber' : 'orange'} size="sm">
          {profile?.is_tpo ? 'TPO Administrator' : 'Department Faculty'}
        </Badge>
      }
    >
      <div className="space-y-6 w-full">
        {error && <Alert variant="error" title="Analytics Error">{error}</Alert>}

        {/* ── Filter toolbar ────────────────────────────────────────────────────── */}
        <Card className="p-4">
          <form onSubmit={handleApply} className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider shrink-0"
                 style={{ color: 'var(--text-muted)' }}>
              <Filter size={13} style={{ color: 'var(--color-orange)' }} />
              <span>Scope Filter:</span>
            </div>

            {/* Batch year */}
            <select
              id="analytics-batch-year"
              value={batchYear}
              onChange={e => setBatchYear(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-sm border focus:outline-none transition-colors"
              style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              {['2023','2024','2025','2026'].map(y => (
                <option key={y} value={y}>Batch {y}</option>
              ))}
            </select>

            {/* Branch */}
            <select
              id="analytics-branch"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-sm border focus:outline-none transition-colors"
              style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            >
              <option value="CS">Computer Science (CS)</option>
              <option value="IT">Information Tech (IT)</option>
              <option value="ECE">Electronics (ECE)</option>
              <option value="EE">Electrical (EE)</option>
            </select>

            <Button id="analytics-apply-btn" variant="secondary" size="sm" type="submit">Apply</Button>
            <Button id="analytics-reset-btn" variant="outline" size="sm" type="button" onClick={handleReset} icon={RefreshCw}>Reset</Button>

            <div className="flex-1" />

            <Button
              id="analytics-export-btn"
              variant="outline"
              size="sm"
              type="button"
              onClick={handleExportAnalytics}
              disabled={exporting || loading}
              icon={Download}
            >
              {exporting ? 'Exporting…' : 'Export Analytics CSV'}
            </Button>
          </form>
        </Card>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Spinner size="lg" />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading cohort analytics…</p>
          </div>
        ) : (
          <>
            {/* ── SECTION 1: Overview Cards ───────────────────────────────────────── */}
            <div>
              <SectionHeader icon={BarChart3} title="Cohort Overview" subtitle="Summary metrics for the selected scope" />
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Students"
                  value={overview?.total_students ?? 0}
                  sub={`${overview?.students_with_role ?? 0} have a target role`}
                  icon={Users}
                  accent="orange"
                  tooltip="Students enrolled in the selected batch and branch"
                />
                <MetricCard
                  label="Baseline Submitted"
                  value={overview?.students_with_baseline ?? 0}
                  sub={`${pct(overview?.students_with_baseline ?? 0, overview?.total_students ?? 0)}% coverage`}
                  icon={CheckCircle2}
                  accent="orange"
                  tooltip="Students who have self-reported at least one skill proficiency level"
                />
                <MetricCard
                  label="Diagnostic Assessed"
                  value={overview?.students_with_assessment ?? 0}
                  sub="Have at least one skill score"
                  icon={Target}
                  accent="amber"
                  tooltip="Students who have completed at least one diagnostic assessment (separate from self-reported baseline)"
                />
                <MetricCard
                  label="Tasks Completed"
                  value={overview?.total_tasks_completed ?? 0}
                  sub="Across all skills"
                  icon={ClipboardList}
                  accent="amber"
                  tooltip="Total learning task completions across the cohort"
                />
                <MetricCard
                  label="Avg Readiness"
                  value={overview?.avg_readiness_score !== null && overview?.avg_readiness_score !== undefined
                    ? `${Math.round(overview.avg_readiness_score)}%`
                    : 'N/A'}
                  sub="Placement readiness index"
                  icon={TrendingUp}
                  accent={overview?.avg_readiness_score >= 60 ? 'orange' : overview?.avg_readiness_score >= 40 ? 'amber' : 'coral'}
                  tooltip="Average readiness score across students who have completed baseline + assessment"
                />
                <MetricCard
                  label="Evidence Pending"
                  value={overview?.evidence_pending_review ?? 0}
                  sub="Awaiting faculty review"
                  icon={BookOpen}
                  accent="muted"
                  tooltip="Evidence submissions currently in 'submitted' or 'under_review' status"
                />
                <MetricCard
                  label="Needs Revision"
                  value={overview?.evidence_needs_revision ?? 0}
                  sub="Student revision pending"
                  icon={AlertTriangle}
                  accent="coral"
                  tooltip="Evidence submissions marked 'needs_improvement' — students must resubmit"
                />
                <MetricCard
                  label="No Target Role"
                  value={overview?.students_without_role ?? 0}
                  sub="Profile action needed"
                  icon={Target}
                  accent="coral"
                  tooltip="Students who have not yet selected a target career role — cannot compute readiness"
                />
              </div>
            </div>

            {/* ── SECTION 2: Role Distribution ────────────────────────────────────── */}
            <Card>
              <SectionHeader
                icon={Target}
                title="Target Role Distribution"
                subtitle="How many students are targeting each career role (each student counted once)"
              />
              {roleDistrib.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No role distribution data for this scope.
                </p>
              ) : (
                <div className="space-y-3">
                  {roleDistrib.map(r => (
                    <div key={r.role_id ?? 'none'} className="flex items-center gap-3">
                      <span
                        className="text-sm font-medium w-44 truncate shrink-0"
                        style={{ color: 'var(--text-primary)' }}
                        title={r.role_name}
                      >
                        {r.role_name}
                      </span>

                      {/* Relative bar */}
                      <div className="flex-1 rounded-full h-3 overflow-hidden" style={{ background: 'var(--surface-elevated)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct(r.student_count, maxRoleCount)}%`,
                            background: r.role_id ? 'var(--color-orange)' : 'var(--border-primary)',
                          }}
                        />
                      </div>

                      <span className="text-sm font-bold w-10 text-right shrink-0" style={{ color: 'var(--text-primary)' }}>
                        {r.student_count}
                      </span>

                      {r.avg_readiness !== null ? (
                        <span className="text-xs w-16 text-right shrink-0 font-semibold" style={{ color: readinessColor(r.avg_readiness) }}>
                          {Math.round(r.avg_readiness)}% avg
                        </span>
                      ) : (
                        <span className="text-xs w-16 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}

                      {r.role_id ? (
                        <button
                          className="text-xs px-2 py-0.5 rounded transition-colors"
                          style={{ color: 'var(--color-orange)', background: 'var(--surface-hover)' }}
                          onClick={() => setRoleFilter(roleFilter === r.role_id ? '' : r.role_id)}
                        >
                          {roleFilter === r.role_id ? 'Clear' : 'Filter'}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* ── SECTION 3: Skill Gap Heatmap ──────────────────────────────────────── */}
            <Card>
              <SectionHeader
                icon={BarChart3}
                title="Skill Gap Heatmap"
                subtitle="Self-reported baseline distribution and diagnostic evidence per required skill. Missing data is shown separately — absence of a rating is NOT treated as a gap."
              />

              {roleDistrib.length > 1 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                    style={{
                      background: roleFilter === '' ? 'var(--color-orange)' : 'var(--surface-input)',
                      borderColor: roleFilter === '' ? 'var(--color-orange)' : 'var(--border-primary)',
                      color: roleFilter === '' ? '#fff' : 'var(--text-secondary)',
                    }}
                    onClick={() => setRoleFilter('')}
                  >
                    All Roles
                  </button>
                  {roleDistrib.filter(r => r.role_id).map(r => (
                    <button
                      key={r.role_id}
                      className="text-xs px-2.5 py-1 rounded-lg border transition-colors"
                      style={{
                        background: roleFilter === r.role_id ? 'var(--color-orange)' : 'var(--surface-input)',
                        borderColor: roleFilter === r.role_id ? 'var(--color-orange)' : 'var(--border-primary)',
                        color: roleFilter === r.role_id ? '#fff' : 'var(--text-secondary)',
                      }}
                      onClick={() => setRoleFilter(roleFilter === r.role_id ? '' : r.role_id)}
                    >
                      {r.role_name}
                    </button>
                  ))}
                </div>
              )}

              {filteredSkillGaps.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No skill data for this scope. Students may not have completed baselines yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                        <th className="px-3 py-2 font-semibold rounded-tl-lg">Skill</th>
                        <th className="px-3 py-2 font-semibold">Role</th>
                        <th className="px-3 py-2 font-semibold">Required Level</th>
                        <th className="px-3 py-2 font-semibold" title="Self-reported baseline distribution">Self-Report Distribution</th>
                        <th className="px-3 py-2 font-semibold" title="No baseline entry recorded">No Baseline</th>
                        <th className="px-3 py-2 font-semibold" title="Students with a diagnostic assessment score">Diagnostic</th>
                        <th className="px-3 py-2 font-semibold rounded-tr-lg" title="Critical gaps from placement gap calculation">Critical Gaps</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                      {filteredSkillGaps.map((sg, i) => (
                        <tr key={`${sg.skill_id}-${sg.role_id}-${i}`} className="hover:opacity-90 transition-opacity">
                          <td className="px-3 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {sg.skill_name}
                            <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              {sg.skill_category}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant="neutral" size="sm">{sg.role_name}</Badge>
                          </td>
                          <td className="px-3 py-3">
                            <span className="capitalize font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {sg.required_level}
                            </span>
                          </td>
                          <td className="px-3 py-3 min-w-[180px]">
                            <div className="space-y-1">
                              <ProfBar count={sg.baseline_beginner}     total={sg.cohort_size} color="var(--color-coral)"   label="Beginner" />
                              <ProfBar count={sg.baseline_intermediate}  total={sg.cohort_size} color="var(--color-amber)"   label="Intermediate" />
                              <ProfBar count={sg.baseline_proficient}    total={sg.cohort_size} color="var(--color-orange)"  label="Proficient" />
                              <ProfBar count={sg.baseline_not_sure}      total={sg.cohort_size} color="var(--text-muted)"    label="Not sure" />
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center">
                            {sg.baseline_missing > 0 ? (
                              <span className="font-bold" style={{ color: 'var(--text-muted)' }}>
                                {sg.baseline_missing}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--color-orange)' }}>✓</span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div style={{ color: 'var(--text-secondary)' }}>{sg.has_assessment}</div>
                            {sg.avg_diagnostic_score !== null && (
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                avg {Math.round(sg.avg_diagnostic_score)}%
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {sg.gap_critical > 0 ? (
                              <span className="font-bold" style={{ color: 'var(--color-coral)' }}>
                                {sg.gap_critical}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* ── SECTION 4: Actionable Insights ───────────────────────────────────── */}
            {insights.length > 0 && (
              <Card>
                <SectionHeader
                  icon={Lightbulb}
                  title="Cohort Insights & Suggested Actions"
                  subtitle="Auto-generated from actual data. Only shown when thresholds are met with ≥3 students."
                />
                <div className="space-y-3">
                  {insights.map((ins, i) => {
                    const tagColor = ins.type === 'beginner_concentration' ? 'var(--color-amber)'
                                   : ins.type === 'low_baseline_coverage'  ? 'var(--color-orange)'
                                   : 'var(--color-coral)';
                    const tagLabel = ins.type === 'beginner_concentration' ? 'Self-reported gap'
                                   : ins.type === 'low_baseline_coverage'  ? 'Low baseline coverage'
                                   : 'Assessment evidence indicates difficulty';
                    return (
                      <div
                        key={`${ins.type}-${ins.skill_id}-${i}`}
                        className="rounded-xl p-4 border"
                        style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border-primary)' }}
                      >
                        <div className="flex items-start gap-3">
                          <Lightbulb size={16} className="mt-0.5 shrink-0" style={{ color: tagColor }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${tagColor}22`, color: tagColor }}>
                                {tagLabel}
                              </span>
                              <Badge variant="neutral" size="sm">{ins.skill_name}</Badge>
                            </div>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ins.message}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                              <strong style={{ color: 'var(--text-secondary)' }}>Suggested action:</strong> {ins.suggestion}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* ── SECTION 5: Student Support List ──────────────────────────────────── */}
            <Card>
              <SectionHeader
                icon={Users}
                title="Student Support View"
                subtitle="Students within your authorized scope with one or more support indicators. Labels use neutral language — missing data does not imply low ability."
              />
              {supportList.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  No students found for this scope.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr style={{ background: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
                        <th className="px-3 py-2 font-semibold rounded-tl-lg">Student</th>
                        <th className="px-3 py-2 font-semibold">Target Role</th>
                        <th className="px-3 py-2 font-semibold">Readiness</th>
                        <th className="px-3 py-2 font-semibold">Baseline Skills</th>
                        <th className="px-3 py-2 font-semibold">Tasks</th>
                        <th className="px-3 py-2 font-semibold">Evidence</th>
                        <th className="px-3 py-2 font-semibold rounded-tr-lg">Support Indicators</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                      {supportList.map(s => (
                        <tr
                          key={s.id}
                          className="hover:opacity-90 transition-opacity"
                        >
                          <td className="px-3 py-3">
                            <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>{s.full_name}</div>
                            <div className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                              {s.roll_number || '—'}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            {s.target_role_name
                              ? <Badge variant="neutral" size="sm">{s.target_role_name}</Badge>
                              : <span style={{ color: 'var(--text-muted)' }}>No role</span>
                            }
                          </td>
                          <td className="px-3 py-3 font-bold" style={{ color: readinessColor(s.readiness_score) }}>
                            {s.readiness_score !== null ? `${Math.round(s.readiness_score)}%` : <span style={{ color: 'var(--text-muted)' }}>N/A</span>}
                          </td>
                          <td className="px-3 py-3 text-center" style={{ color: s.baseline_skills_count === 0 ? 'var(--color-coral)' : 'var(--text-secondary)' }}>
                            {s.baseline_skills_count}
                          </td>
                          <td className="px-3 py-3">
                            <div style={{ color: 'var(--color-orange)' }}>{s.tasks_completed} done</div>
                            {s.tasks_in_progress > 0 && (
                              <div style={{ color: 'var(--text-muted)' }}>{s.tasks_in_progress} in progress</div>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {s.evidence_awaiting_review > 0 && (
                              <div style={{ color: 'var(--color-amber)' }}>{s.evidence_awaiting_review} pending</div>
                            )}
                            {s.evidence_revision_pending > 0 && (
                              <div style={{ color: 'var(--color-coral)' }}>{s.evidence_revision_pending} revision</div>
                            )}
                            {s.evidence_awaiting_review === 0 && s.evidence_revision_pending === 0 && (
                              <span style={{ color: 'var(--text-muted)' }}>—</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1">
                              {s.support_indicators.length === 0 ? (
                                <Badge variant="orange" size="sm">On track</Badge>
                              ) : (
                                s.support_indicators.map((ind, j) => (
                                  <Badge key={j} variant="coral" size="sm">{ind}</Badge>
                                ))
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </PageWrapper>
  );
};

export default FacultyAnalyticsPage;
