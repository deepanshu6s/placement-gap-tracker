import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { skillService } from '../../services/skillService';
import { baselineService } from '../../services/baselineService';
import { taskProgressService } from '../../services/taskProgressService';
import { evidenceService } from '../../services/evidenceService';
import {
  Compass,
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Target,
  Sparkles,
  Code2,
  Lightbulb,
  FileText,
  FolderGit2,
  Send,
  Edit3,
  Check,
  Copy,
  PlusCircle,
  MessageSquare,
  AlertCircle,
  X,
} from 'lucide-react';

const PROFICIENCY_CHOICES = [
  { value: 'beginner', label: 'Beginner', badge: 'coral' },
  { value: 'intermediate', label: 'Intermediate', badge: 'amber' },
  { value: 'proficient', label: 'Proficient', badge: 'orange' },
  { value: 'not_sure', label: 'Not sure yet', badge: 'neutral' },
];

const EVIDENCE_TYPES = [
  { value: 'github_repo', label: 'GitHub Repository' },
  { value: 'live_demo', label: 'Live Deployed Project' },
  { value: 'mini_project', label: 'Completed Mini-Project' },
  { value: 'course_cert', label: 'Course / Certification' },
  { value: 'practical_assignment', label: 'Practical Assignment' },
  { value: 'portfolio_item', label: 'Portfolio Item' },
  { value: 'written_summary', label: 'Written Summary / Report' },
];

export const SkillDetailPage = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab: 'overview' | 'learn' | 'tasks' | 'evidence' | 'progress'
  const currentTab = searchParams.get('tab') || 'overview';
  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingRating, setUpdatingRating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Task notes state
  const [editingTaskKey, setEditingTaskKey] = useState(null);
  const [taskNotesInput, setTaskNotesInput] = useState('');
  const [savingTaskKey, setSavingTaskKey] = useState(null);
  const [copiedCodeKey, setCopiedCodeKey] = useState(null);

  // Evidence modal state
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState(null);
  const [evidenceFormData, setEvidenceFormData] = useState({
    title: '',
    evidence_type: 'github_repo',
    url: '',
    description: '',
  });
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false);
  const [evidenceError, setEvidenceError] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await skillService.getSkillDetail(skillId);
      setData(res);
    } catch (err) {
      console.error('Failed to load skill details', err);
      setError(
        err.response?.status === 404
          ? 'Skill not found in catalogue.'
          : 'Could not load skill information. Please verify your connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [skillId]);

  const handleUpdateRating = async (level) => {
    setUpdatingRating(true);
    setUpdateSuccess('');
    try {
      await baselineService.updateSkillRating(skillId, level);
      setData((prev) => ({
        ...prev,
        student_evaluation: {
          ...prev.student_evaluation,
          self_reported_level: level,
          status:
            level === 'proficient'
              ? 'meets_self_reported'
              : level === 'beginner'
              ? 'needs_attention'
              : level === 'intermediate'
              ? 'in_progress'
              : 'needs_evaluation',
          status_label:
            level === 'proficient'
              ? 'Meets Target (Self-Reported)'
              : level === 'beginner'
              ? 'Needs Attention (Self-Reported Beginner)'
              : level === 'intermediate'
              ? 'In Progress (Self-Reported Intermediate)'
              : 'Evaluation Needed',
        },
      }));
      setUpdateSuccess(`Proficiency updated to "${level}".`);
      setTimeout(() => setUpdateSuccess(''), 3500);
    } catch (err) {
      console.error('Failed to update rating', err);
    } finally {
      setUpdatingRating(false);
    }
  };

  const handleTaskStatusChange = async (taskKey, newStatus, currentNotes = '') => {
    setSavingTaskKey(taskKey);
    try {
      await taskProgressService.updateTaskProgress(skillId, taskKey, {
        status: newStatus,
        notes: currentNotes,
      });

      // Update local state
      setData((prev) => {
        const updatedTasks = prev.learning_tasks.tasks.map((t) => {
          if (t.key === taskKey) {
            return {
              ...t,
              status: newStatus,
              completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            };
          }
          return t;
        });

        const completedCount = updatedTasks.filter((t) => t.status === 'completed').length;
        const inProgressCount = updatedTasks.filter((t) => t.status === 'in_progress').length;
        const notStartedCount = updatedTasks.filter((t) => t.status === 'not_started').length;

        return {
          ...prev,
          learning_tasks: {
            ...prev.learning_tasks,
            tasks: updatedTasks,
            completed_tasks: completedCount,
            in_progress_tasks: inProgressCount,
            not_started_tasks: notStartedCount,
          },
        };
      });
    } catch (err) {
      console.error('Failed to update task status', err);
    } finally {
      setSavingTaskKey(null);
    }
  };

  const handleSaveNotes = async (taskKey, currentStatus) => {
    setSavingTaskKey(taskKey);
    try {
      await taskProgressService.updateTaskProgress(skillId, taskKey, {
        status: currentStatus,
        notes: taskNotesInput,
      });

      setData((prev) => ({
        ...prev,
        learning_tasks: {
          ...prev.learning_tasks,
          tasks: prev.learning_tasks.tasks.map((t) =>
            t.key === taskKey ? { ...t, notes: taskNotesInput } : t
          ),
        },
      }));
      setEditingTaskKey(null);
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setSavingTaskKey(null);
    }
  };

  const handleCopyCode = (taskKey, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeKey(taskKey);
    setTimeout(() => setCopiedCodeKey(null), 2000);
  };

  const openEvidenceModal = (existing = null) => {
    if (existing) {
      setEditingEvidence(existing);
      setEvidenceFormData({
        title: existing.title || '',
        evidence_type: existing.evidence_type || 'github_repo',
        url: existing.url || '',
        description: existing.description || '',
      });
    } else {
      setEditingEvidence(null);
      setEvidenceFormData({
        title: '',
        evidence_type: 'github_repo',
        url: '',
        description: '',
      });
    }
    setEvidenceError('');
    setIsEvidenceModalOpen(true);
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    setEvidenceSubmitting(true);
    setEvidenceError('');

    try {
      if (editingEvidence) {
        await evidenceService.updateEvidence(editingEvidence.id, evidenceFormData);
      } else {
        await evidenceService.submitEvidence({
          skill_id: skillId,
          ...evidenceFormData,
        });
      }
      setIsEvidenceModalOpen(false);
      // Refresh detail data to reflect new evidence
      await fetchDetail();
    } catch (err) {
      setEvidenceError(
        err.response?.data?.error?.message || 'Failed to submit evidence. Please check your inputs.'
      );
    } finally {
      setEvidenceSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Skill Learning Workspace">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading skill workspace, tasks, and evidence records...
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !data) {
    return (
      <PageWrapper title="Skill Workspace">
        <div className="max-w-xl mx-auto py-12 text-center space-y-4">
          <Alert variant="warning" title="Skill Unavailable">
            {error || 'The requested skill does not exist.'}
          </Alert>
          <Button variant="secondary" size="md" onClick={() => navigate(-1)} icon={ArrowLeft}>
            Go Back
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const { skill, target_requirement, student_evaluation, content, learning_tasks, evidence = [] } = data;
  const selfLevel = student_evaluation?.self_reported_level;
  const diagScore = student_evaluation?.diagnostic_score;
  const tasksList = learning_tasks?.tasks || [];
  const completedTasksCount = learning_tasks?.completed_tasks || 0;
  const totalTasksCount = learning_tasks?.total_tasks || tasksList.length;
  const taskProgressPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'learn', label: 'Learn Concepts', icon: Lightbulb },
    {
      id: 'tasks',
      label: `Practice Tasks (${completedTasksCount}/${totalTasksCount})`,
      icon: Code2,
    },
    {
      id: 'evidence',
      label: `Evidence Portfolio (${evidence.length})`,
      icon: FolderGit2,
    },
    { id: 'progress', label: 'Progress & Mastery', icon: Activity },
  ];

  return (
    <PageWrapper
      title={skill.name}
      subtitle={`Domain: ${skill.category.toUpperCase()} • Benchmark: ${
        target_requirement?.required_level ? `${target_requirement.required_level}%` : 'N/A'
      } • Weight: ${target_requirement?.weight || 1}/5`}
      badge={
        <Badge variant="orange" size="sm">
          {student_evaluation?.status_label || 'Skill Guide'}
        </Badge>
      }
      action={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>
            Back
          </Button>
          <Link to={`/student/preparation?skillId=${skill.id}`}>
            <Button variant="secondary" size="sm" icon={Clock}>
              Log Study Hours
            </Button>
          </Link>
          <Link to={`/student/assessments/${skill.id}`}>
            <Button variant="primary" size="sm" icon={Activity}>
              Take Diagnostic Test
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {updateSuccess && (
          <Alert variant="success" title="Rating Updated">
            {updateSuccess}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* WORKSPACE NAVIGATION TABS */}
        {/* ========================================================================= */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border"
                style={{
                  background: isActive ? 'var(--surface-hover)' : 'transparent',
                  borderColor: isActive ? 'var(--color-orange)' : 'transparent',
                  color: isActive ? 'var(--color-orange)' : 'var(--text-secondary)',
                }}
              >
                <Icon size={14} style={{ color: isActive ? 'var(--color-orange)' : 'inherit' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {currentTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Skill Context Card */}
              <div className="lg:col-span-7 flex flex-col">
                <Card
                  title="Skill Overview &amp; Industry Role Context"
                  subtitle={content?.whyItMatters || 'Why this skill is evaluated by placement recruiters'}
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {skill.description || content?.summary}
                    </p>

                    {content?.prerequisites?.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>
                          Prerequisites:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {content.prerequisites.map((p) => (
                            <Badge key={p} variant="neutral" size="sm">
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {target_requirement && (
                    <div
                      className="mt-4 pt-3.5 border-t flex items-center justify-between text-xs"
                      style={{ borderColor: 'var(--border-primary)' }}
                    >
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Target Role Benchmark: <strong>{target_requirement.required_level}%</strong>
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Placement Weight: <strong>{target_requirement.weight} of 5</strong>
                      </span>
                    </div>
                  )}
                </Card>
              </div>

              {/* Student Status & Evaluation Cards */}
              <div className="lg:col-span-5 flex flex-col">
                <Card
                  title="My Current Level"
                  subtitle="Separates self-reported baseline from verified diagnostic test scores"
                  className="flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* 1. Self-reported row */}
                    <div
                      className="p-3 rounded-lg border flex items-center justify-between text-xs"
                      style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                    >
                      <div>
                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                          Self-Reported Baseline
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {selfLevel ? 'Personal estimate' : 'Not rated in baseline flow'}
                        </span>
                      </div>
                      <Badge
                        variant={
                          selfLevel === 'proficient'
                            ? 'orange'
                            : selfLevel === 'intermediate'
                            ? 'amber'
                            : selfLevel === 'beginner'
                            ? 'coral'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {selfLevel || 'Not Rated'}
                      </Badge>
                    </div>

                    {/* 2. Diagnostic test score row */}
                    <div
                      className="p-3 rounded-lg border flex items-center justify-between text-xs"
                      style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                    >
                      <div>
                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                          Diagnostic Assessment
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {diagScore
                            ? `${diagScore.attempt_count} attempt(s) recorded`
                            : 'No diagnostic test taken yet'}
                        </span>
                      </div>
                      {diagScore ? (
                        <span className="font-bold text-sm" style={{ color: 'var(--color-orange)' }}>
                          {diagScore.current_score}%
                        </span>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Unassessed
                        </Badge>
                      )}
                    </div>

                    {/* 3. Practical Tasks Progress */}
                    <div
                      className="p-3 rounded-lg border flex items-center justify-between text-xs"
                      style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                    >
                      <div>
                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                          Practical Tasks Done
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {completedTasksCount} of {totalTasksCount} tasks completed
                        </span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--color-orange)' }}>
                        {taskProgressPct}%
                      </span>
                    </div>

                    {/* 4. Logged preparation hours */}
                    <div
                      className="p-3 rounded-lg border flex items-center justify-between text-xs"
                      style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                    >
                      <div>
                        <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                          Logged Study &amp; Practice
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {student_evaluation.prep_sessions_count} logged sessions
                        </span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: 'var(--color-amber)' }}>
                        {student_evaluation.prep_hours}h
                      </span>
                    </div>
                  </div>

                  {/* In-place quick rating updater */}
                  <div className="mt-4 pt-3.5 border-t space-y-2" style={{ borderColor: 'var(--border-primary)' }}>
                    <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                      Update Self-Reported Level:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PROFICIENCY_CHOICES.map((c) => (
                        <button
                          key={c.value}
                          disabled={updatingRating}
                          onClick={() => handleUpdateRating(c.value)}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all"
                          style={{
                            background: selfLevel === c.value ? 'var(--surface-hover)' : 'transparent',
                            borderColor:
                              selfLevel === c.value ? 'var(--color-orange)' : 'var(--border-primary)',
                            color: selfLevel === c.value ? 'var(--color-orange)' : 'var(--text-secondary)',
                          }}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Quick Tab Teasers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setTab('learn')}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--surface-card)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={18} style={{ color: 'var(--color-orange)' }} />
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Core Concepts
                  </h4>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {content?.concepts?.length || 0} fundamental technical topics to master for interview rounds.
                </p>
              </div>

              <div
                onClick={() => setTab('tasks')}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--surface-card)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Code2 size={18} style={{ color: 'var(--color-amber)' }} />
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Practice Tasks ({completedTasksCount}/{totalTasksCount})
                  </h4>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Hands-on assignments with starter code and reflection notes to build tangible proof of work.
                </p>
              </div>

              <div
                onClick={() => setTab('evidence')}
                className="p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: 'var(--surface-card)',
                  borderColor: 'var(--border-primary)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <FolderGit2 size={18} style={{ color: 'var(--color-orange)' }} />
                  <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    Evidence Submissions ({evidence.length})
                  </h4>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Submit repositories, live projects, and certifications for faculty mentor review and feedback.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LEARN CONCEPTS */}
        {/* ========================================================================= */}
        {currentTab === 'learn' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Core Concepts */}
              <div className="lg:col-span-8 space-y-5">
                <Card
                  title="What to Learn: Core Concepts"
                  subtitle="Key technical subtopics and mechanics tested in technical interviews"
                >
                  <div className="space-y-3">
                    {content?.concepts?.map((concept, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border flex items-start gap-3 transition-colors"
                        style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{
                            background: 'var(--surface-hover)',
                            color: 'var(--color-orange)',
                            border: '1px solid var(--border-primary)',
                          }}
                        >
                          {idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {concept}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Practical Exercises */}
                <Card
                  title="Coding &amp; Problem Solving Exercises"
                  subtitle="Hands-on questions that verify functional comprehension"
                >
                  <div className="space-y-2.5">
                    {content?.exercises?.map((exercise, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border flex items-start gap-3 transition-colors"
                        style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                      >
                        <Code2 size={16} style={{ color: 'var(--color-amber)', flexShrink: 0, marginTop: '2px' }} />
                        <span className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {exercise}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Mini Challenge */}
                {content?.miniChallenge && (
                  <Card
                    title="Hands-On Mini Challenge"
                    subtitle="Build this proof-of-work exercise to demonstrate practical mastery"
                  >
                    <div
                      className="p-4 rounded-xl border flex items-start gap-3"
                      style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-active)' }}
                    >
                      <Lightbulb size={20} style={{ color: 'var(--color-orange)', flexShrink: 0 }} />
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {content.miniChallenge}
                      </p>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar: Pitfalls & Curated Resources */}
              <div className="lg:col-span-4 space-y-5">
                {/* Common Mistakes */}
                <Card
                  title="Common Mistakes to Avoid"
                  subtitle="Frequent pitfalls noted by interviewers"
                >
                  <div className="space-y-2.5">
                    {content?.commonMistakes?.map((mistake, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border flex items-start gap-2.5"
                        style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                      >
                        <AlertTriangle size={15} style={{ color: 'var(--color-coral)', flexShrink: 0, marginTop: '2px' }} />
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {mistake}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Curated Resources */}
                <Card
                  title="Reputable Learning Resources"
                  subtitle="Curated documentation and tutorials"
                >
                  <div className="space-y-2">
                    {content?.resources?.map((res, idx) => (
                      <a
                        key={idx}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-lg border flex items-center justify-between text-xs group transition-all"
                        style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-orange)';
                          e.currentTarget.style.background = 'var(--surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-primary)';
                          e.currentTarget.style.background = 'var(--surface-input)';
                        }}
                      >
                        <div>
                          <span className="font-semibold block group-hover:text-[var(--color-orange)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {res.title}
                          </span>
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {res.type}
                          </span>
                        </div>
                        <ExternalLink size={13} style={{ color: 'var(--text-muted)' }} />
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PRACTICE TASKS (PERSISTENT TASK PROGRESS SYSTEM) */}
        {/* ========================================================================= */}
        {currentTab === 'tasks' && (
          <div className="space-y-5">
            {/* Task Progress Summary Bar */}
            <div
              className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  Learning Tasks &amp; Practical Coding Milestones
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Work through these guided activities. Your progress is saved in PostgreSQL and syncs with your roadmap.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                    Progress: {completedTasksCount} / {totalTasksCount} Completed
                  </span>
                  <div
                    className="w-36 h-2 rounded-full overflow-hidden mt-1"
                    style={{ background: 'var(--surface-input)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${taskProgressPct}%`,
                        background: 'var(--color-orange)',
                      }}
                    />
                  </div>
                </div>
                <Badge variant={completedTasksCount === totalTasksCount && totalTasksCount > 0 ? 'orange' : 'neutral'} size="sm">
                  {taskProgressPct}%
                </Badge>
              </div>
            </div>

            {/* List of Tasks */}
            <div className="space-y-4">
              {tasksList.map((task, idx) => {
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in_progress';
                const isSaving = savingTaskKey === task.key;
                const isEditingNotes = editingTaskKey === task.key;

                return (
                  <div
                    key={task.key}
                    className="p-5 rounded-xl border transition-all"
                    style={{
                      background: 'var(--surface-card)',
                      borderColor: isCompleted
                        ? 'var(--color-orange)'
                        : isInProgress
                        ? 'var(--color-amber)'
                        : 'var(--border-primary)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Task Details */}
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span
                            className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                            style={{
                              background: isCompleted ? 'var(--color-orange)' : 'var(--surface-hover)',
                              color: isCompleted ? '#ffffff' : 'var(--color-orange)',
                              border: '1px solid var(--border-primary)',
                            }}
                          >
                            {isCompleted ? <Check size={14} /> : idx + 1}
                          </span>

                          <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                            {task.title}
                          </h4>

                          <Badge
                            variant={isCompleted ? 'orange' : isInProgress ? 'amber' : 'neutral'}
                            size="sm"
                          >
                            {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started'}
                          </Badge>

                          {task.suggested_effort && (
                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                              <Clock size={12} /> {task.suggested_effort}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {task.description}
                        </p>

                        {/* Instructions */}
                        <div
                          className="p-3.5 rounded-lg border space-y-1.5 text-xs"
                          style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                        >
                          <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Instructions:
                          </div>
                          <p className="whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>
                            {task.instructions}
                          </p>

                          {task.expected_outcome && (
                            <div className="pt-2 border-t mt-2 flex items-start gap-1.5" style={{ borderColor: 'var(--border-primary)' }}>
                              <strong style={{ color: 'var(--color-orange)' }}>Expected Outcome:</strong>
                              <span style={{ color: 'var(--text-secondary)' }}>{task.expected_outcome}</span>
                            </div>
                          )}
                        </div>

                        {/* Starter Code Block if available */}
                        {task.starter_code && (
                          <div
                            className="rounded-lg border overflow-hidden text-xs"
                            style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
                          >
                            <div
                              className="px-3 py-1.5 border-b flex items-center justify-between"
                              style={{ borderColor: 'var(--border-primary)', background: 'var(--surface-hover)' }}
                            >
                              <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                Starter Code / Query Template
                              </span>
                              <button
                                onClick={() => handleCopyCode(task.key, task.starter_code)}
                                className="flex items-center gap-1 text-[11px] font-semibold transition-colors"
                                style={{ color: 'var(--color-orange)' }}
                              >
                                {copiedCodeKey === task.key ? (
                                  <>
                                    <Check size={12} /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} /> Copy
                                  </>
                                )}
                              </button>
                            </div>
                            <pre
                              className="p-3 font-mono text-xs overflow-x-auto"
                              style={{ color: 'var(--text-primary)', background: 'transparent' }}
                            >
                              {task.starter_code}
                            </pre>
                          </div>
                        )}

                        {/* Reflection Notes Section */}
                        <div className="pt-2">
                          {isEditingNotes ? (
                            <div className="space-y-2">
                              <label className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                                My Learning Reflection &amp; Solution Notes:
                              </label>
                              <textarea
                                value={taskNotesInput}
                                onChange={(e) => setTaskNotesInput(e.target.value)}
                                rows={3}
                                placeholder="Record key takeaways, commands used, or complexity insights..."
                                className="w-full rounded-lg p-2.5 text-xs focus:outline-none border transition-colors"
                                style={{
                                  background: 'var(--surface-input)',
                                  borderColor: 'var(--border-primary)',
                                  color: 'var(--text-primary)',
                                }}
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  disabled={isSaving}
                                  onClick={() => handleSaveNotes(task.key, task.status)}
                                >
                                  {isSaving ? 'Saving...' : 'Save Notes'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingTaskKey(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs">
                              {task.notes ? (
                                <div
                                  className="p-2.5 rounded-lg border flex-1 mr-3 italic"
                                  style={{
                                    background: 'var(--surface-input)',
                                    borderColor: 'var(--border-primary)',
                                    color: 'var(--text-secondary)',
                                  }}
                                >
                                  <strong>Notes:</strong> "{task.notes}"
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>No reflection notes added yet.</span>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={Edit3}
                                onClick={() => {
                                  setEditingTaskKey(task.key);
                                  setTaskNotesInput(task.notes || '');
                                }}
                              >
                                {task.notes ? 'Edit Notes' : 'Add Notes'}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status Switcher Buttons */}
                      <div
                        className="flex flex-row md:flex-col gap-1.5 flex-shrink-0 pt-1"
                        style={{ minWidth: '130px' }}
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                          Status:
                        </span>
                        {[
                          { id: 'not_started', label: 'Not Started' },
                          { id: 'in_progress', label: 'In Progress' },
                          { id: 'completed', label: 'Completed' },
                        ].map((s) => (
                          <button
                            key={s.id}
                            disabled={isSaving}
                            onClick={() => handleTaskStatusChange(task.key, s.id, task.notes || '')}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-left transition-all flex items-center justify-between"
                            style={{
                              background: task.status === s.id ? 'var(--surface-hover)' : 'transparent',
                              borderColor:
                                task.status === s.id
                                  ? s.id === 'completed'
                                    ? 'var(--color-orange)'
                                    : 'var(--color-amber)'
                                  : 'var(--border-primary)',
                              color:
                                task.status === s.id
                                  ? s.id === 'completed'
                                    ? 'var(--color-orange)'
                                    : 'var(--color-amber)'
                                  : 'var(--text-secondary)',
                            }}
                          >
                            <span>{s.label}</span>
                            {task.status === s.id && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EVIDENCE PORTFOLIO FOR THIS SKILL */}
        {/* ========================================================================= */}
        {currentTab === 'evidence' && (
          <div className="space-y-6">
            <div
              className="p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                  Skill Evidence &amp; Practical Artifacts
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Show real work supporting your claim for <strong>{skill.name}</strong>. Repositories, demos, and certificates are reviewed by faculty.
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                icon={PlusCircle}
                onClick={() => openEvidenceModal()}
              >
                Submit Evidence for this Skill
              </Button>
            </div>

            {/* List of submitted evidence for this skill */}
            {evidence.length > 0 ? (
              <div className="space-y-4">
                {evidence.map((item) => {
                  const isAccepted = item.status === 'accepted';
                  const isNeedsImprovement = item.status === 'needs_improvement';
                  const isUnderReview = item.status === 'under_review';
                  const isSubmitted = item.status === 'submitted';

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-xl border transition-all"
                      style={{
                        background: 'var(--surface-card)',
                        borderColor: isAccepted
                          ? 'var(--color-orange)'
                          : isNeedsImprovement
                          ? 'var(--color-coral)'
                          : 'var(--border-primary)',
                        boxShadow: 'var(--shadow-card)',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                              {item.title}
                            </h4>
                            <Badge variant="neutral" size="sm">
                              {EVIDENCE_TYPES.find((t) => t.value === item.evidence_type)?.label || item.evidence_type}
                            </Badge>
                            <Badge
                              variant={
                                isAccepted
                                  ? 'orange'
                                  : isNeedsImprovement
                                  ? 'coral'
                                  : isUnderReview
                                  ? 'amber'
                                  : 'neutral'
                              }
                              size="sm"
                            >
                              {item.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>

                          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {item.description}
                          </p>

                          {item.url && (
                            <div className="pt-1">
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                                style={{ color: 'var(--color-orange)' }}
                              >
                                <ExternalLink size={13} />
                                <span className="break-all">{item.url}</span>
                              </a>
                            </div>
                          )}

                          {/* Faculty Feedback Section */}
                          {item.faculty_feedback && (
                            <div
                              className="p-3.5 rounded-lg border mt-3 space-y-1 text-xs"
                              style={{
                                background: isAccepted
                                  ? 'var(--surface-hover)'
                                  : 'var(--surface-input)',
                                borderColor: isAccepted
                                  ? 'var(--border-active)'
                                  : 'var(--color-coral)',
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold flex items-center gap-1.5" style={{ color: isAccepted ? 'var(--color-orange)' : 'var(--color-coral)' }}>
                                  <MessageSquare size={13} />
                                  Faculty Reviewer Feedback:
                                </span>
                                {item.reviewed_at && (
                                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    Reviewed on {new Date(item.reviewed_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <p style={{ color: 'var(--text-primary)' }}>
                                {item.faculty_feedback}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Edit3}
                            onClick={() => openEvidenceModal(item)}
                          >
                            {isNeedsImprovement ? 'Revise Submission' : 'Edit'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <FolderGit2 size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                  No Evidence Submitted Yet
                </h4>
                <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Submit a project repo, course link, or deployment to substantiate your proficiency for faculty review.
                </p>
                <div className="mt-4">
                  <Button variant="primary" size="sm" onClick={() => openEvidenceModal()}>
                    Submit First Artifact
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PROGRESS & MASTERY */}
        {/* ========================================================================= */}
        {currentTab === 'progress' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card title="Self-Reported" subtitle="Student claimed level">
                <div className="text-2xl font-black capitalize mt-2" style={{ color: 'var(--color-orange)' }}>
                  {selfLevel || 'Unrated'}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  From onboarding or detail update
                </p>
              </Card>

              <Card title="Practical Tasks" subtitle="Guided implementations">
                <div className="text-2xl font-black mt-2" style={{ color: 'var(--color-orange)' }}>
                  {completedTasksCount} / {totalTasksCount}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {taskProgressPct}% task completion rate
                </p>
              </Card>

              <Card title="Evidence Portfolio" subtitle="Artifacts submitted">
                <div className="text-2xl font-black mt-2" style={{ color: 'var(--color-orange)' }}>
                  {evidence.filter((e) => e.status === 'accepted').length} Accepted
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {evidence.length} total submission(s)
                </p>
              </Card>

              <Card title="Diagnostic MCQ" subtitle="Standardized exam">
                <div className="text-2xl font-black mt-2" style={{ color: 'var(--color-orange)' }}>
                  {diagScore ? `${diagScore.current_score}%` : 'None'}
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {diagScore ? `${diagScore.attempt_count} attempt(s)` : 'Awaiting first test'}
                </p>
              </Card>
            </div>

            <Card
              title="Holistic Placement Readiness Assessment"
              subtitle="How this skill impacts your interview readiness"
            >
              <div className="space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  The placement tracker evaluates skills across 4 distinct streams: self-estimates, code execution, evidence portfolios, and standardized tests. To maximize your role readiness, aim to complete all practical tasks, maintain at least 1 accepted portfolio artifact, and achieve benchmark scores in diagnostic exams.
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Code2}
                    onClick={() => setTab('tasks')}
                  >
                    Continue Practical Tasks
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={FolderGit2}
                    onClick={() => setTab('evidence')}
                  >
                    Manage Evidence
                  </Button>
                  <Link to={`/student/assessments/${skill.id}`}>
                    <Button variant="outline" size="md" icon={Activity}>
                      Retake Diagnostic Test
                    </Button>
                  </Link>
                  <Link to="/student/roadmap">
                    <Button variant="ghost" size="md" icon={Target}>
                      View Role Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBMIT / EDIT EVIDENCE MODAL */}
        {/* ========================================================================= */}
        {isEvidenceModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: 'var(--overlay-bg)' }}
          >
            <div
              className="w-full max-w-lg rounded-2xl border p-6 space-y-4 my-8"
              style={{
                background: 'var(--surface-elevated)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
                <div className="flex items-center gap-2">
                  <FolderGit2 size={18} style={{ color: 'var(--color-orange)' }} />
                  <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                    {editingEvidence ? 'Revise Evidence Submission' : `Submit Evidence: ${skill.name}`}
                  </h3>
                </div>
                <button
                  onClick={() => setIsEvidenceModalOpen(false)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {evidenceError && (
                <Alert variant="error" title="Submission Error">
                  {evidenceError}
                </Alert>
              )}

              <form onSubmit={handleEvidenceSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Artifact Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={evidenceFormData.title}
                    onChange={(e) => setEvidenceFormData({ ...evidenceFormData, title: e.target.value })}
                    placeholder="e.g. Distributed Database Schema & Performance Benchmark"
                    className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none border transition-colors"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                      Evidence Type *
                    </label>
                    <select
                      value={evidenceFormData.evidence_type}
                      onChange={(e) => setEvidenceFormData({ ...evidenceFormData, evidence_type: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none border transition-colors"
                      style={{
                        background: 'var(--surface-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {EVIDENCE_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                      Link / Repository URL
                    </label>
                    <input
                      type="url"
                      value={evidenceFormData.url}
                      onChange={(e) => setEvidenceFormData({ ...evidenceFormData, url: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none border transition-colors"
                      style={{
                        background: 'var(--surface-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Technical Description &amp; Implementation Summary *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={evidenceFormData.description}
                    onChange={(e) => setEvidenceFormData({ ...evidenceFormData, description: e.target.value })}
                    placeholder="Explain what you built, libraries or algorithms used, and how it proves your skill proficiency..."
                    className="w-full rounded-lg p-3 text-xs focus:outline-none border transition-colors"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-primary)' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEvidenceModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={evidenceSubmitting}
                    icon={Send}
                  >
                    {evidenceSubmitting
                      ? 'Submitting...'
                      : editingEvidence
                      ? 'Resubmit Evidence'
                      : 'Submit for Review'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default SkillDetailPage;
