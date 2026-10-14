import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { preparationService } from '../../services/preparationService';
import { studentService, roleService } from '../../services/studentService';
import { skillService } from '../../services/skillService';
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Plus,
  Lock,
  BookOpen,
  Target,
  ArrowRight,
} from 'lucide-react';

export const PreparationPage = () => {
  const [searchParams] = useSearchParams();
  const prefilledSkillId = searchParams.get('skillId') || '';

  const [logs, setLogs] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    skill_id: prefilledSkillId,
    activity_type: 'practice',
    description: '',
    resource_url: '',
    hours_spent: '1.5',
    activity_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [logsData, profile] = await Promise.all([
          preparationService.getLogs().catch(() => []),
          studentService.getProfile().catch(() => null),
        ]);

        if (!isMounted) return;
        setLogs(Array.isArray(logsData) ? logsData : []);

        // Load skills for student's target role or all skills
        if (profile?.target_role_id) {
          const roleDetails = await roleService.getRoleDetails(profile.target_role_id).catch(() => null);
          if (roleDetails?.requirements) {
            setAvailableSkills(roleDetails.requirements.map((r) => ({ id: r.skill_id, name: r.skill_name })));
          }
        }

        // If no role skills, fallback to all skills
        if (availableSkills.length === 0) {
          const allSkills = await skillService.getAllSkills().catch(() => []);
          if (isMounted && Array.isArray(allSkills) && allSkills.length > 0) {
            setAvailableSkills(allSkills);
          }
        }
      } catch (err) {
        console.error('Failed to load preparation data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If query param skillId changes
  useEffect(() => {
    if (prefilledSkillId) {
      setFormData((prev) => ({ ...prev, skill_id: prefilledSkillId }));
    }
  }, [prefilledSkillId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLoading) return;

    if (!formData.hours_spent || parseFloat(formData.hours_spent) <= 0) {
      setError('Please specify a positive duration for hours spent.');
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        activity_type: formData.activity_type,
        hours_spent: parseFloat(formData.hours_spent),
        activity_date: formData.activity_date,
        description: formData.description.trim() || null,
        resource_url: formData.resource_url.trim() || null,
        skill_id: formData.skill_id || null,
      };

      const newLog = await preparationService.logActivity(payload);
      if (newLog) {
        setLogs([newLog, ...logs]);
      }

      setSuccessMsg('Preparation activity recorded successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reset form
      setFormData({
        skill_id: prefilledSkillId,
        activity_type: 'practice',
        description: '',
        resource_url: '',
        hours_spent: '1.0',
        activity_date: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save preparation entry.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalHours = logs.reduce((acc, log) => acc + (parseFloat(log.hours_spent) || 0), 0);

  if (loading) {
    return (
      <PageWrapper title="Preparation Tracker">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading activity history...
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Student Preparation Tracker"
      subtitle="Log your self-study routines, mock tests, and practice hours connected to target skills"
      badge={
        <Badge variant="orange" size="md">
          {totalHours.toFixed(1)} Total Hours Recorded
        </Badge>
      }
      action={
        <Link to="/student/roadmap">
          <Button variant="secondary" size="sm" icon={Target}>
            View Preparation Roadmap
          </Button>
        </Link>
      }
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Quick Top Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span className="uppercase tracking-wider">Total Hours</span>
              <div className="p-2 rounded-md" style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Logged study commitment
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span className="uppercase tracking-wider">Total Entries</span>
              <div className="p-2 rounded-md" style={{ background: 'var(--surface-hover)', color: 'var(--color-amber)' }}>
                <CalendarCheck size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {logs.length}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Activities recorded
            </p>
          </Card>

          <Card hover>
            <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              <span className="uppercase tracking-wider">Data Privacy</span>
              <div className="p-2 rounded-md" style={{ background: 'var(--surface-hover)', color: 'var(--color-orange)' }}>
                <Lock size={16} />
              </div>
            </div>
            <div className="mt-2.5 text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              100% Private Notes
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Faculty views aggregates only
            </p>
          </Card>
        </div>

        {/* Form and Activity List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <div className="lg:col-span-5">
            <Card
              title="Log Study Activity"
              subtitle="Record personal problem solving and learning resource reviews"
            >
              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}
              {successMsg && (
                <Alert variant="success" className="mb-4">
                  {successMsg}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Target Skill selector */}
                <div>
                  <label
                    htmlFor="skill_id"
                    className="block text-xs sm:text-sm font-medium mb-1.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Target Skill (Optional)
                  </label>
                  <select
                    id="skill_id"
                    value={formData.skill_id}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all duration-150 border"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-orange)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 90, 24, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">-- General / Untargeted Study --</option>
                    {availableSkills.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="activity_type"
                    className="block text-xs sm:text-sm font-medium mb-1.5"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Activity Type
                  </label>
                  <select
                    id="activity_type"
                    className="w-full rounded-lg px-3.5 py-2 text-sm focus:outline-none transition-all duration-150 border"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-orange)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(196, 90, 24, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    value={formData.activity_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="practice">Hands-on Coding / Practice</option>
                    <option value="study">Conceptual Study</option>
                    <option value="mock_test">Mock Test / Assessment</option>
                    <option value="video">Video Lecture / Course</option>
                    <option value="reading">Documentation / Reading</option>
                    <option value="other">Other Practice</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Input
                    id="activity_date"
                    label="Date"
                    type="date"
                    value={formData.activity_date}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    id="hours_spent"
                    label="Hours Spent"
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={formData.hours_spent}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Input
                  id="description"
                  label="Private Session Notes"
                  placeholder="e.g. Solved LeetCode tree traversal problems"
                  value={formData.description}
                  onChange={handleChange}
                  helperText="These notes are confidential to your student account."
                />

                <Input
                  id="resource_url"
                  label="Resource Reference Link (Optional)"
                  type="url"
                  placeholder="https://..."
                  value={formData.resource_url}
                  onChange={handleChange}
                />

                <Button
                  variant="primary"
                  className="w-full mt-2"
                  size="lg"
                  type="submit"
                  disabled={submitLoading}
                  icon={submitLoading ? undefined : Plus}
                >
                  {submitLoading ? 'Saving...' : 'Record Activity'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Activity Timeline Column */}
          <div className="lg:col-span-7">
            <Card
              title="Activity History"
              subtitle="Chronological list of all logged preparation sessions"
            >
              {logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-lg border transition-colors"
                      style={{
                        background: 'var(--surface-input)',
                        borderColor: 'var(--border-primary)',
                      }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Badge variant="orange" size="sm">
                            {log.activity_type?.replace('_', ' ')}
                          </Badge>

                          {log.skill_id && (
                            <Link
                              to={`/student/skills/${log.skill_id}`}
                              className="text-xs font-semibold hover:underline transition-colors"
                              style={{ color: 'var(--color-orange)' }}
                            >
                              {log.skill_name || 'View Skill'} &rarr;
                            </Link>
                          )}

                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(log.activity_date).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <span
                          className="text-xs font-semibold px-2.5 py-0.5 rounded border"
                          style={{
                            background: 'var(--surface-hover)',
                            borderColor: 'var(--border-primary)',
                            color: 'var(--color-orange)',
                          }}
                        >
                          {log.hours_spent} Hours
                        </span>
                      </div>

                      {log.description ? (
                        <p className="text-xs sm:text-sm mb-2 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {log.description}
                        </p>
                      ) : (
                        <p className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>
                          No private notes recorded.
                        </p>
                      )}

                      {log.resource_url && (
                        <div
                          className="pt-2 border-t flex items-center justify-between text-xs"
                          style={{ borderColor: 'var(--border-primary)' }}
                        >
                          <a
                            href={log.resource_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:underline font-medium"
                            style={{ color: 'var(--color-orange)' }}
                          >
                            <span>Study Material Link</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="py-12 text-center border border-dashed rounded-lg"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  <CalendarCheck size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    No Preparation Logged Yet
                  </p>
                  <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-muted)' }}>
                    Track your technical practice to build placement readiness momentum and keep an accurate record.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PreparationPage;
