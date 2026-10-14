import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { evidenceService } from '../../services/evidenceService';
import { skillService } from '../../services/skillService';
import {
  FolderGit2,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  X,
  Send,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const EVIDENCE_TYPES = [
  { value: 'github_repo', label: 'GitHub Repository' },
  { value: 'live_demo', label: 'Live Deployed Project' },
  { value: 'mini_project', label: 'Completed Mini-Project' },
  { value: 'course_cert', label: 'Course / Certification' },
  { value: 'practical_assignment', label: 'Practical Assignment' },
  { value: 'portfolio_item', label: 'Portfolio Item' },
  { value: 'written_summary', label: 'Written Summary / Report' },
];

export const EvidencePortfolioPage = () => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    skill_id: '',
    title: '',
    evidence_type: 'github_repo',
    url: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [items, allSkills] = await Promise.all([
        evidenceService.getStudentEvidence(),
        skillService.getAllSkills().catch(() => []),
      ]);
      setEvidenceList(Array.isArray(items) ? items : []);
      setSkills(Array.isArray(allSkills) ? allSkills : []);
    } catch (err) {
      console.error('Failed to load student evidence portfolio', err);
      setError('Could not load your evidence submissions. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openSubmitModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        skill_id: item.skill_id,
        title: item.title,
        evidence_type: item.evidence_type,
        url: item.url || '',
        description: item.description,
      });
    } else {
      setEditingItem(null);
      setFormData({
        skill_id: skills[0]?.id || '',
        title: '',
        evidence_type: 'github_repo',
        url: '',
        description: '',
      });
    }
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setModalError('');

    try {
      if (editingItem) {
        await evidenceService.updateEvidence(editingItem.id, {
          title: formData.title,
          evidence_type: formData.evidence_type,
          url: formData.url,
          description: formData.description,
        });
      } else {
        await evidenceService.submitEvidence(formData);
      }
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      setModalError(
        err.response?.data?.error?.message || 'Failed to submit evidence. Please check your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this evidence submission?')) return;
    try {
      await evidenceService.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to delete submission.');
    }
  };

  // Filter items
  const filteredList = evidenceList.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (selectedSkillFilter !== 'all' && item.skill_id !== selectedSkillFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title?.toLowerCase().includes(q);
      const skillMatch = item.skill_name?.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      return titleMatch || skillMatch || descMatch;
    }
    return true;
  });

  const totalSubmitted = evidenceList.length;
  const acceptedCount = evidenceList.filter((e) => e.status === 'accepted').length;
  const underReviewCount = evidenceList.filter((e) => e.status === 'under_review' || e.status === 'submitted').length;
  const needsImprovementCount = evidenceList.filter((e) => e.status === 'needs_improvement').length;

  if (loading) {
    return (
      <PageWrapper title="Evidence Portfolio">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading your verified submissions and faculty feedback...
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Evidence Portfolio"
      subtitle="Substantiate your self-reported skills with live projects, GitHub code, and course certificates reviewed by faculty mentors"
      badge={
        <Badge variant="orange" size="sm">
          {acceptedCount} Verified Artifacts
        </Badge>
      }
      action={
        <Button
          variant="primary"
          size="md"
          icon={PlusCircle}
          onClick={() => openSubmitModal()}
        >
          Submit New Evidence
        </Button>
      }
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" title="Error">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Total Submitted" subtitle="All portfolio items">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
              {totalSubmitted}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Across {new Set(evidenceList.map((e) => e.skill_id)).size} skill categories
            </p>
          </Card>

          <Card title="Accepted by Faculty" subtitle="Verified proof-of-work">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-orange)' }}>
              {acceptedCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Endorsed by faculty reviewers
            </p>
          </Card>

          <Card title="Under Review" subtitle="Awaiting mentor review">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-amber)' }}>
              {underReviewCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Queued for faculty assessment
            </p>
          </Card>

          <Card title="Needs Improvement" subtitle="Actionable revisions requested">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-coral)' }}>
              {needsImprovementCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {needsImprovementCount > 0 ? 'Requires student resubmission' : 'Zero pending revisions'}
            </p>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* FILTERS & SEARCH BAR */}
        {/* ========================================================================= */}
        <div
          className="p-4 rounded-xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5"
          style={{
            background: 'var(--surface-card)',
            borderColor: 'var(--border-primary)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold mr-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <Filter size={13} /> Status:
            </span>
            {[
              { id: 'all', label: 'All' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'under_review', label: 'Under Review' },
              { id: 'submitted', label: 'Submitted' },
              { id: 'needs_improvement', label: 'Needs Improvement' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all"
                style={{
                  background: statusFilter === f.id ? 'var(--surface-hover)' : 'transparent',
                  borderColor:
                    statusFilter === f.id ? 'var(--color-orange)' : 'var(--border-primary)',
                  color:
                    statusFilter === f.id ? 'var(--color-orange)' : 'var(--text-secondary)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {/* Skill Selector */}
            <select
              value={selectedSkillFilter}
              onChange={(e) => setSelectedSkillFilter(e.target.value)}
              className="w-full sm:w-auto rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none border transition-colors"
              style={{
                background: 'var(--surface-input)',
                borderColor: 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="all">All Skills</option>
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search portfolio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs focus:outline-none border transition-colors"
                style={{
                  background: 'var(--surface-input)',
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBMISSIONS LIST */}
        {/* ========================================================================= */}
        {filteredList.length > 0 ? (
          <div className="space-y-4">
            {filteredList.map((item) => {
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
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link
                          to={`/student/skills/${item.skill_id}?tab=evidence`}
                          className="font-bold text-base sm:text-lg hover:underline transition-colors flex items-center gap-1.5"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <BookOpen size={16} style={{ color: 'var(--color-orange)' }} />
                          {item.skill_name || 'Associated Skill'}
                        </Link>

                        <span style={{ color: 'var(--text-muted)' }}>•</span>

                        <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>

                        <Badge variant="neutral" size="sm">
                          {EVIDENCE_TYPES.find((t) => t.value === item.evidence_type)?.label ||
                            item.evidence_type}
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

                      <div className="flex items-center gap-4 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                        <span>
                          Submitted on {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.updated_at && item.updated_at !== item.created_at && (
                          <span>
                            Updated: {new Date(item.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Faculty Feedback Box */}
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
                            <span
                              className="font-semibold flex items-center gap-1.5"
                              style={{
                                color: isAccepted ? 'var(--color-orange)' : 'var(--color-coral)',
                              }}
                            >
                              <MessageSquare size={13} />
                              Faculty Feedback ({item.reviewer_name || 'Faculty Reviewer'}):
                            </span>
                            {item.reviewed_at && (
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                {new Date(item.reviewed_at).toLocaleDateString()}
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
                    <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
                      <Button
                        variant={isNeedsImprovement ? 'primary' : 'secondary'}
                        size="sm"
                        icon={Edit3}
                        onClick={() => openSubmitModal(item)}
                      >
                        {isNeedsImprovement ? 'Revise Submission' : 'Edit Details'}
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDelete(item.id)}
                        style={{ color: 'var(--color-coral)' }}
                      >
                        Remove
                      </Button>

                      <Link to={`/student/skills/${item.skill_id}?tab=tasks`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Skill Workspace
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
            <FolderGit2 size={36} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              No Evidence Found in this View
            </h4>
            <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
              {searchQuery || statusFilter !== 'all' || selectedSkillFilter !== 'all'
                ? 'Try resetting your filter or search query.'
                : 'Start substantiating your skills by submitting your first proof-of-work link or repository.'}
            </p>
            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={() => openSubmitModal()}>
                Submit First Artifact
              </Button>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* SUBMIT / REVISE EVIDENCE MODAL */}
        {/* ========================================================================= */}
        {isModalOpen && (
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
                    {editingItem ? 'Revise Evidence Submission' : 'Submit Practical Evidence'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <Alert variant="error" title="Submission Error">
                  {modalError}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Skill selector (only if not editing) */}
                {!editingItem ? (
                  <div>
                    <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                      Associated Skill *
                    </label>
                    <select
                      required
                      value={formData.skill_id}
                      onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                      className="w-full rounded-lg px-3 py-2 text-xs focus:outline-none border transition-colors"
                      style={{
                        background: 'var(--surface-input)',
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {skills.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.category.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div
                    className="p-2.5 rounded-lg border text-xs"
                    style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Skill: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>{editingItem.skill_name}</strong>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Artifact Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                      value={formData.evidence_type}
                      onChange={(e) => setFormData({ ...formData, evidence_type: e.target.value })}
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
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Explain what you built, architecture choices, and how it proves your competence..."
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
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submitting}
                    icon={Send}
                  >
                    {submitting
                      ? 'Submitting...'
                      : editingItem
                      ? 'Update Submission'
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

export default EvidencePortfolioPage;
