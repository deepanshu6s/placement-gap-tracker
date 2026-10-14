import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { evidenceService } from '../../services/evidenceService';
import {
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  User,
  BookOpen,
  ArrowRight,
  Send,
} from 'lucide-react';

const EVIDENCE_TYPE_LABELS = {
  github_repo: 'GitHub Repository',
  live_demo: 'Live Deployed Project',
  mini_project: 'Completed Mini-Project',
  course_cert: 'Course / Certification',
  practical_assignment: 'Practical Assignment',
  portfolio_item: 'Portfolio Item',
  written_summary: 'Written Summary / Report',
};

export const FacultyEvidenceReviewPage = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review modal state
  const [activeItem, setActiveItem] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('accepted');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await evidenceService.getFacultyEvidenceQueue();
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load faculty review queue', err);
      setError(
        err.response?.data?.error?.message ||
          'Could not load faculty evidence queue. Check your faculty role permissions.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openReviewModal = (item) => {
    setActiveItem(item);
    setReviewStatus(item.status === 'needs_improvement' ? 'needs_improvement' : 'accepted');
    setFeedbackInput(item.faculty_feedback || '');
    setModalError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewStatus === 'needs_improvement' && !feedbackInput.trim()) {
      setModalError('Feedback comment is required when requesting improvements.');
      return;
    }

    setSubmittingReview(true);
    setModalError('');

    try {
      await evidenceService.reviewEvidence(activeItem.id, {
        status: reviewStatus,
        faculty_feedback: feedbackInput.trim(),
      });

      setSuccessBanner(
        `Successfully reviewed submission for ${activeItem.student_name}: marked as ${reviewStatus.replace(
          '_',
          ' '
        )}.`
      );
      setTimeout(() => setSuccessBanner(''), 4500);

      setActiveItem(null);
      await fetchQueue();
    } catch (err) {
      setModalError(
        err.response?.data?.error?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter items
  const filteredQueue = queue.filter((item) => {
    if (statusFilter === 'pending') {
      if (item.status !== 'submitted' && item.status !== 'under_review') return false;
    } else if (statusFilter !== 'all' && item.status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const studentMatch = item.student_name?.toLowerCase().includes(q);
      const rollMatch = item.roll_number?.toLowerCase().includes(q);
      const skillMatch = item.skill_name?.toLowerCase().includes(q);
      const titleMatch = item.title?.toLowerCase().includes(q);
      return studentMatch || rollMatch || skillMatch || titleMatch;
    }
    return true;
  });

  const totalCount = queue.length;
  const pendingCount = queue.filter((q) => q.status === 'submitted' || q.status === 'under_review').length;
  const acceptedCount = queue.filter((q) => q.status === 'accepted').length;
  const needsImprovementCount = queue.filter((q) => q.status === 'needs_improvement').length;

  if (loading) {
    return (
      <PageWrapper title="Faculty Evidence Review Queue">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading student evidence submissions under your faculty scope...
          </p>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Student Evidence Review Queue"
      subtitle="Evaluate student proof-of-work artifacts, endorse authentic project implementations, and provide actionable technical feedback"
      badge={
        <Badge variant={pendingCount > 0 ? 'orange' : 'neutral'} size="sm">
          {pendingCount} Pending Reviews
        </Badge>
      }
    >
      <div className="space-y-6">
        {successBanner && (
          <Alert variant="success" title="Review Recorded">
            {successBanner}
          </Alert>
        )}

        {error && (
          <Alert variant="error" title="Queue Error">
            {error}
          </Alert>
        )}

        {/* ========================================================================= */}
        {/* STATS OVERVIEW CARDS */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Pending Review" subtitle="Requires faculty attention">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-orange)' }}>
              {pendingCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Awaiting mentor evaluation
            </p>
          </Card>

          <Card title="Accepted Proofs" subtitle="Endorsed student artifacts">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-amber)' }}>
              {acceptedCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Verified submissions
            </p>
          </Card>

          <Card title="Improvement Requested" subtitle="Action required by student">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--color-coral)' }}>
              {needsImprovementCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Returned with feedback
            </p>
          </Card>

          <Card title="Total Submissions" subtitle="Within your batch scope">
            <div className="text-3xl font-black mt-2" style={{ color: 'var(--text-primary)' }}>
              {totalCount}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              All evaluated cohorts
            </p>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* FILTER BAR & SEARCH */}
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
              <Filter size={13} /> View:
            </span>
            {[
              { id: 'all', label: 'All Submissions' },
              { id: 'pending', label: `Pending (${pendingCount})` },
              { id: 'accepted', label: 'Accepted' },
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

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search student, roll #, skill..."
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

        {/* ========================================================================= */}
        {/* REVIEW QUEUE CARDS */}
        {/* ========================================================================= */}
        {filteredQueue.length > 0 ? (
          <div className="space-y-4">
            {filteredQueue.map((item) => {
              const isPending = item.status === 'submitted' || item.status === 'under_review';
              const isAccepted = item.status === 'accepted';
              const isNeedsImprovement = item.status === 'needs_improvement';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border transition-all"
                  style={{
                    background: 'var(--surface-card)',
                    borderColor: isPending
                      ? 'var(--color-orange)'
                      : isAccepted
                      ? 'var(--border-primary)'
                      : 'var(--color-coral)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="space-y-2.5 flex-1">
                      {/* Top Bar: Student Info & Skill */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <div
                          className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border"
                          style={{
                            background: 'var(--surface-hover)',
                            borderColor: 'var(--border-primary)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <User size={13} style={{ color: 'var(--color-orange)' }} />
                          <span>{item.student_name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>
                            ({item.roll_number || 'N/A'} • {item.branch || 'General'} {item.batch_year || ''})
                          </span>
                        </div>

                        <span style={{ color: 'var(--text-muted)' }}>•</span>

                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          {item.skill_name}
                        </span>

                        <Badge variant="neutral" size="sm">
                          {EVIDENCE_TYPE_LABELS[item.evidence_type] || item.evidence_type}
                        </Badge>

                        <Badge
                          variant={
                            isAccepted
                              ? 'orange'
                              : isNeedsImprovement
                              ? 'coral'
                              : 'amber'
                          }
                          size="sm"
                        >
                          {item.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>

                      {/* Evidence Title & Description */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {item.description}
                        </p>
                      </div>

                      {/* URL Link */}
                      {item.url && (
                        <div>
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

                      {/* Timestamps */}
                      <div className="flex items-center gap-4 text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
                        <span>
                          Submitted: {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {item.reviewed_at && (
                          <span>
                            Last Reviewed: {new Date(item.reviewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Existing Faculty Feedback */}
                      {item.faculty_feedback && (
                        <div
                          className="p-3 rounded-lg border mt-2 space-y-1 text-xs"
                          style={{
                            background: 'var(--surface-input)',
                            borderColor: 'var(--border-primary)',
                          }}
                        >
                          <span className="font-semibold block" style={{ color: 'var(--text-primary)' }}>
                            Current Review Notes:
                          </span>
                          <p style={{ color: 'var(--text-secondary)' }}>{item.faculty_feedback}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0 pt-1">
                      <Button
                        variant={isPending ? 'primary' : 'secondary'}
                        size="sm"
                        icon={MessageSquare}
                        onClick={() => openReviewModal(item)}
                      >
                        {isPending ? 'Review & Score' : 'Update Review'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CheckCircle2 size={36} className="mx-auto mb-2" style={{ color: 'var(--color-orange)' }} />
            <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              No Submissions Matching this Filter
            </h4>
            <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-secondary)' }}>
              All student evidence artifacts in your cohort scope have been handled or no items matched your search query.
            </p>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* FACULTY REVIEW MODAL */}
        {/* ========================================================================= */}
        {activeItem && (
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
                    Review Evidence: {activeItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveItem(null)}
                  className="p-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {modalError && (
                <Alert variant="error" title="Review Error">
                  {modalError}
                </Alert>
              )}

              {/* Student and Artifact Summary */}
              <div
                className="p-3.5 rounded-lg border space-y-1.5 text-xs"
                style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Student: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{activeItem.student_name}</strong>
                  <span style={{ color: 'var(--text-muted)' }}> ({activeItem.roll_number})</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Skill: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{activeItem.skill_name}</strong>
                </div>
                {activeItem.url && (
                  <div className="pt-1">
                    <a
                      href={activeItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold hover:underline"
                      style={{ color: 'var(--color-orange)' }}
                    >
                      <ExternalLink size={12} /> Inspect Submitted Link
                    </a>
                  </div>
                )}
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Decision */}
                <div>
                  <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-primary)' }}>
                    Review Determination *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReviewStatus('accepted')}
                      className="p-3 rounded-lg border text-left transition-all"
                      style={{
                        background: reviewStatus === 'accepted' ? 'var(--surface-hover)' : 'transparent',
                        borderColor:
                          reviewStatus === 'accepted' ? 'var(--color-orange)' : 'var(--border-primary)',
                      }}
                    >
                      <span className="font-bold text-xs block" style={{ color: 'var(--color-orange)' }}>
                        Accept Evidence
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Endorse practical artifact as verified proof
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReviewStatus('needs_improvement')}
                      className="p-3 rounded-lg border text-left transition-all"
                      style={{
                        background: reviewStatus === 'needs_improvement' ? 'var(--surface-hover)' : 'transparent',
                        borderColor:
                          reviewStatus === 'needs_improvement' ? 'var(--color-coral)' : 'var(--border-primary)',
                      }}
                    >
                      <span className="font-bold text-xs block" style={{ color: 'var(--color-coral)' }}>
                        Needs Improvement
                      </span>
                      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        Request specific revisions before endorsing
                      </span>
                    </button>
                  </div>
                </div>

                {/* Faculty Feedback Textarea */}
                <div>
                  <label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-primary)' }}>
                    Faculty Technical Feedback {reviewStatus === 'needs_improvement' ? '*' : '(Optional)'}
                  </label>
                  <textarea
                    rows={4}
                    required={reviewStatus === 'needs_improvement'}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder={
                      reviewStatus === 'needs_improvement'
                        ? 'Explain specifically what needs improvement (e.g. "Add error handling to the API", "Include database migration scripts", "Write unit tests")...'
                        : 'Provide constructive encouragement or notes regarding code architecture...'
                    }
                    className="w-full rounded-lg p-3 text-xs focus:outline-none border transition-colors"
                    style={{
                      background: 'var(--surface-input)',
                      borderColor: 'var(--border-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {reviewStatus === 'needs_improvement' && (
                    <span className="text-[11px] mt-1 block" style={{ color: 'var(--text-muted)' }}>
                      Students will see this feedback in their portfolio and roadmap with an action to revise.
                    </span>
                  )}
                </div>

                <div className="pt-3 border-t flex items-center justify-end gap-2" style={{ borderColor: 'var(--border-primary)' }}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveItem(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submittingReview}
                    icon={Send}
                  >
                    {submittingReview ? 'Recording...' : 'Submit Evaluation'}
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

export default FacultyEvidenceReviewPage;
