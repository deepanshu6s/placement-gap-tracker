import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { roadmapService } from '../../services/roadmapService';
import { studentService, roleService } from '../../services/studentService';
import {
  Target,
  ArrowRight,
  Compass,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Filter,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export const RoadmapPage = () => {
  const [roadmapData, setRoadmapData] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [filterPriority, setFilterPriority] = useState('all'); // 'all' | 'critical' | 'high' | 'medium' | 'low'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);
        const [profile, rolesData] = await Promise.all([
          studentService.getProfile().catch(() => null),
          roleService.getRoles().catch(() => []),
        ]);

        if (!isMounted) return;

        setRoles(Array.isArray(rolesData) ? rolesData : []);
        const roleId = profile?.target_role_id || (rolesData[0]?.id || '');
        setSelectedRoleId(roleId);

        if (roleId) {
          const data = await roadmapService.getRoadmap(roleId);
          if (isMounted) setRoadmapData(data);
        }
      } catch (err) {
        console.error('Failed to load roadmap data', err);
        if (isMounted) setError('Could not generate preparation roadmap. Please refresh.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleChange = async (newRoleId) => {
    setSelectedRoleId(newRoleId);
    setLoading(true);
    setError('');
    try {
      const data = await roadmapService.getRoadmap(newRoleId);
      setRoadmapData(data);
    } catch (err) {
      console.error('Failed to update roadmap role', err);
      setError('Could not update roadmap for the selected role.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Personalized Preparation Roadmap">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Synthesizing role benchmarks, baseline ratings, and diagnostic scores...
          </p>
        </div>
      </PageWrapper>
    );
  }

  const { target_role, items = [], metrics = {} } = roadmapData || {};

  const filteredItems = items.filter((item) => {
    if (filterPriority === 'all') return true;
    return item.priority === filterPriority;
  });

  return (
    <PageWrapper
      title="Personalized Preparation Roadmap"
      subtitle={`Prioritized step-by-step guidance tailored to your target role: ${
        target_role?.name || 'Target Role'
      }`}
      badge={
        <Badge variant="orange" size="sm">
          {items.length} Target Objectives
        </Badge>
      }
      action={
        <div className="flex items-center gap-2">
          <Link to="/student/skill-baseline">
            <Button variant="secondary" size="sm" icon={Sparkles}>
              Update Skill Baseline
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
      <div className="space-y-6">
        {error && (
          <Alert variant="warning" title="Notice">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* SUMMARY METRICS BAR (REAL SIGNALS ONLY - NO FABRICATIONS) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5">
          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>ROLE SKILLS</span>
              <Target size={14} style={{ color: 'var(--color-orange)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {metrics.total_skills || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              {metrics.skills_with_baseline} in baseline
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>NEEDS ATTENTION</span>
              <AlertTriangle size={14} style={{ color: 'var(--color-coral)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--color-coral)' }}>
              {metrics.skills_needing_attention || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              High priority gaps
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>IN PROGRESS</span>
              <Activity size={14} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--color-amber)' }}>
              {metrics.skills_in_progress || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Active objectives
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>BENCHMARKS MET</span>
              <CheckCircle2 size={14} style={{ color: 'var(--color-orange)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--color-orange)' }}>
              {metrics.skills_meeting_target || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Target reached
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>TASKS DONE</span>
              <BookOpen size={14} style={{ color: 'var(--color-orange)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--color-orange)' }}>
              {metrics.tasks_completed || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Practical exercises
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span>EVIDENCE ACCEPTED</span>
              <Sparkles size={14} style={{ color: 'var(--color-amber)' }} />
            </div>
            <div className="mt-2 text-2xl font-extrabold" style={{ color: 'var(--color-amber)' }}>
              {metrics.evidence_accepted || 0}
            </div>
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Faculty verified
            </p>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROADMAP FILTER & ROLE SELECTOR TOOLBAR */}
        {/* ========================================================================= */}
        <div
          className="p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
        >
          {/* Priority filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold mr-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Filter size={13} /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'critical', label: 'Critical Gap' },
              { id: 'high', label: 'High Priority' },
              { id: 'medium', label: 'Medium' },
              { id: 'low', label: 'Low / Met' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterPriority(f.id)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all"
                style={{
                  background: filterPriority === f.id ? 'var(--surface-hover)' : 'transparent',
                  borderColor:
                    filterPriority === f.id ? 'var(--color-orange)' : 'var(--border-primary)',
                  color:
                    filterPriority === f.id ? 'var(--color-orange)' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Role switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              Role Pathway:
            </span>
            <select
              value={selectedRoleId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none border transition-colors"
              style={{
                background: 'var(--surface-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROADMAP ACTIONABLE ITEMS */}
        {/* ========================================================================= */}
        {filteredItems.length > 0 ? (
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const isCritical = item.priority === 'critical';
              const isHigh = item.priority === 'high';
              const isMedium = item.priority === 'medium';
              const badgeVariant = isCritical ? 'coral' : isHigh ? 'coral' : isMedium ? 'amber' : 'orange';

              return (
                <div
                  key={item.skill_id}
                  className="p-5 rounded-xl border transition-all"
                  style={{
                    background: 'var(--surface-card)',
                    borderColor: isCritical
                      ? 'var(--color-coral)'
                      : isHigh
                      ? 'var(--color-orange)'
                      : 'var(--border-primary)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left: Skill title and status */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                          style={{
                            background: 'var(--surface-hover)',
                            border: '1px solid var(--border-primary)',
                            color: 'var(--color-orange)',
                          }}
                        >
                          {index + 1}
                        </span>

                        <Link
                          to={`/student/skills/${item.skill_id}`}
                          className="font-bold text-base sm:text-lg hover:underline transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {item.skill_name}
                        </Link>

                        <Badge variant={badgeVariant} size="sm">
                          {item.status_label}
                        </Badge>

                        {item.task_metrics?.total_tasks > 0 && (
                          <Badge variant="neutral" size="sm">
                            {item.task_metrics.completed_tasks}/{item.task_metrics.total_tasks} Tasks
                          </Badge>
                        )}

                        {item.evidence_metrics?.accepted_evidence > 0 && (
                          <Badge variant="orange" size="sm">
                            {item.evidence_metrics.accepted_evidence} Verified
                          </Badge>
                        )}

                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Requirement: <strong>{item.required_level}%</strong> • Weight: {item.weight}/5
                        </span>
                      </div>

                      {/* Faculty Revision Alert if applicable */}
                      {item.evidence_metrics?.has_needs_improvement && (
                        <div
                          className="p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          style={{
                            background: 'var(--surface-input)',
                            borderColor: 'var(--color-coral)',
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={15} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
                            <div>
                              <strong style={{ color: 'var(--color-coral)' }}>Faculty Revision Requested: </strong>
                              <span style={{ color: 'var(--text-primary)' }}>
                                "{item.evidence_metrics.latest_feedback}"
                              </span>
                            </div>
                          </div>
                          <Link to="/student/evidence">
                            <Button variant="primary" size="sm">
                              Revise in Portfolio
                            </Button>
                          </Link>
                        </div>
                      )}

                      {/* Reason */}
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {item.reason}
                      </p>

                      {/* Recommended action & outcome block */}
                      <div
                        className="p-3.5 rounded-lg border space-y-1.5 text-xs"
                        style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                      >
                        <div className="flex items-start gap-2">
                          <strong style={{ color: 'var(--color-orange)' }}>Next Action:</strong>
                          <span style={{ color: 'var(--text-primary)' }}>{item.recommended_action}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <strong style={{ color: 'var(--color-amber)' }}>Target Outcome:</strong>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.expected_outcome}</span>
                        </div>
                      </div>

                      {/* Prerequisites or top resource */}
                      <div className="flex items-center gap-4 text-xs pt-1 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                        {item.prerequisites?.length > 0 && (
                          <span>
                            Prerequisites: <strong style={{ color: 'var(--text-secondary)' }}>{item.prerequisites.join(', ')}</strong>
                          </span>
                        )}
                        <span>
                          Study Hours Logged: <strong style={{ color: 'var(--text-secondary)' }}>{item.prep_hours || 0}h</strong>
                        </span>
                        {item.top_resource && (
                          <a
                            href={item.top_resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline font-medium"
                            style={{ color: 'var(--color-orange)' }}
                          >
                            <span>Official Docs ({item.top_resource.title})</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right: Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-2 flex-shrink-0">
                      <Link to={item.action_url || `/student/skills/${item.skill_id}?tab=tasks`}>
                        <Button variant="primary" size="sm" className="w-full justify-center text-xs" icon={ArrowRight}>
                          {item.recommended_action?.length > 25
                            ? 'Open Objective'
                            : item.recommended_action || 'Open Workspace'}
                        </Button>
                      </Link>

                      <Link to={`/student/skills/${item.skill_id}`}>
                        <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                          Skill Workspace
                        </Button>
                      </Link>

                      <Link to={`/student/assessments/${item.skill_id}`}>
                        <Button variant="ghost" size="sm" className="w-full justify-center text-xs" icon={Activity}>
                          Diagnostic
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CheckCircle2 size={36} className="mx-auto mb-2" style={{ color: 'var(--color-orange)' }} />
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              No Objectives in This Filter
            </h3>
            <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
              Try selecting "All Items" to view all skills configured for this role pathway.
            </p>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default RoadmapPage;
