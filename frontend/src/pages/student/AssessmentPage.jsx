import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { assessmentService } from '../../services/assessmentService';
import {
  Clock,
  Award,
  ArrowRight,
  ShieldAlert,
  Brain,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Code2,
  RotateCcw,
  ExternalLink,
  Target,
  Filter,
} from 'lucide-react';

export const AssessmentPage = () => {
  const { skillId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewData, setReviewData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [questionFilter, setQuestionFilter] = useState('all'); // 'all' | 'missed' | 'correct'

  const startAssessment = async () => {
    setLoading(true);
    setError('');
    setReviewData(null);
    setAnswers({});
    setCurrentIdx(0);

    try {
      const activeAttempt = await assessmentService.startAttempt(skillId);
      setAttempt(activeAttempt);
      const qs = await assessmentService.getQuestions(activeAttempt.id);
      setQuestions(Array.isArray(qs) ? qs : []);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to initialize assessment. Questions may not yet be configured for this skill.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (submitLoading) return;
    setSubmitLoading(true);
    setError('');

    try {
      const payload = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: answers[q.id] || null,
      }));

      await assessmentService.submitAttempt(attempt.id, payload);
      // Fetch the comprehensive review with explanations & concepts tested
      const rev = await assessmentService.getAttemptReview(attempt.id);
      setReviewData(rev);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit assessment answers.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // =========================================================================
  // REVIEW & REMEDIATION SCREEN (COMPREHENSIVE MISTAKE LEARNING WORKSPACE)
  // =========================================================================
  if (reviewData) {
    const { attempt: att, questions: reviewQuestions = [] } = reviewData;
    const scoreVal = Math.round(att.score || 0);
    const passed = scoreVal >= 70;
    const totalQ = reviewQuestions.length;
    const correctQ = reviewQuestions.filter((q) => q.is_correct).length;
    const missedQ = totalQ - correctQ;

    const filteredQuestions = reviewQuestions.filter((q) => {
      if (questionFilter === 'missed') return !q.is_correct;
      if (questionFilter === 'correct') return q.is_correct;
      return true;
    });

    return (
      <PageWrapper
        title="Assessment Results &amp; Remediation Review"
        subtitle={`Diagnostic Evaluation for ${att.skill_name || 'Skill'}`}
        badge={
          <Badge variant={passed ? 'orange' : 'coral'} size="sm">
            {passed ? 'Benchmark Met' : 'Remediation Recommended'}
          </Badge>
        }
      >
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Top Score Summary Banner */}
          <div
            className="p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-6"
            style={{
              background: 'var(--surface-card)',
              borderColor: passed ? 'var(--color-orange)' : 'var(--color-coral)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center gap-5">
              <div
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center border flex-shrink-0"
                style={{
                  background: 'var(--surface-hover)',
                  borderColor: 'var(--border-active)',
                  color: passed ? 'var(--color-orange)' : 'var(--color-coral)',
                }}
              >
                <Award size={40} />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={passed ? 'orange' : 'coral'} size="md">
                    {passed ? 'Proficient' : 'Needs Practice'}
                  </Badge>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Recorded in PostgreSQL
                  </span>
                </div>

                <div className="text-3xl sm:text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                  {scoreVal}% Score
                </div>

                <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Accuracy: <strong>{correctQ} of {totalQ}</strong> questions answered correctly ({missedQ} missed).
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <Link to={`/student/skills/${skillId}?tab=tasks`} className="w-full">
                <Button variant="primary" size="md" icon={Code2} className="w-full justify-center">
                  Practice Tasks in Workspace
                </Button>
              </Link>

              <Link to="/student/roadmap" className="w-full">
                <Button variant="secondary" size="md" icon={Target} className="w-full justify-center">
                  View Role Roadmap
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="sm"
                icon={RotateCcw}
                onClick={startAssessment}
                className="w-full justify-center"
              >
                Retake Diagnostic
              </Button>
            </div>
          </div>

          {/* Remediation Guidance Alert */}
          {missedQ > 0 ? (
            <div
              className="p-4 rounded-xl border flex items-start gap-3"
              style={{
                background: 'var(--surface-hover)',
                borderColor: 'var(--color-coral)',
              }}
            >
              <Lightbulb size={20} style={{ color: 'var(--color-coral)', flexShrink: 0, marginTop: '2px' }} />
              <div className="space-y-1 text-xs sm:text-sm">
                <strong style={{ color: 'var(--text-primary)' }}>
                  Remediation Pathway: Learn from Mistakes
                </strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Review each question below to understand why specific choices are correct or incorrect. For any concept you missed, use the direct link below each question to practice related exercises in the learning workspace.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="p-4 rounded-xl border flex items-start gap-3"
              style={{
                background: 'var(--surface-hover)',
                borderColor: 'var(--color-orange)',
              }}
            >
              <CheckCircle2 size={20} style={{ color: 'var(--color-orange)', flexShrink: 0, marginTop: '2px' }} />
              <div className="space-y-1 text-xs sm:text-sm">
                <strong style={{ color: 'var(--text-primary)' }}>
                  Flawless Performance on Tested Concepts!
                </strong>
                <p style={{ color: 'var(--text-secondary)' }}>
                  You answered all questions correctly. Solidify this diagnostic score by building a mini-project and submitting it in your Evidence Portfolio.
                </p>
              </div>
            </div>
          )}

          {/* Filter Pills */}
          <div
            className="p-3.5 rounded-xl border flex items-center justify-between gap-3"
            style={{
              background: 'var(--surface-card)',
              borderColor: 'var(--border-primary)',
            }}
          >
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold mr-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Filter size={13} /> Filter:
              </span>
              {[
                { id: 'all', label: `All Questions (${totalQ})` },
                { id: 'missed', label: `Missed Questions (${missedQ})` },
                { id: 'correct', label: `Correct Answers (${correctQ})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setQuestionFilter(f.id)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold border transition-all"
                  style={{
                    background: questionFilter === f.id ? 'var(--surface-hover)' : 'transparent',
                    borderColor:
                      questionFilter === f.id ? 'var(--color-orange)' : 'var(--border-primary)',
                    color:
                      questionFilter === f.id ? 'var(--color-orange)' : 'var(--text-secondary)',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Link
              to={`/student/skills/${skillId}`}
              className="text-xs font-semibold hover:underline hidden sm:inline-flex items-center gap-1"
              style={{ color: 'var(--color-orange)' }}
            >
              <BookOpen size={13} /> Return to Skill Workspace
            </Link>
          </div>

          {/* Detailed Question Remediation List */}
          <div className="space-y-5">
            {filteredQuestions.map((q, idx) => {
              const isCorrect = q.is_correct;

              return (
                <div
                  key={q.question_id}
                  className="p-5 rounded-xl border transition-all space-y-4"
                  style={{
                    background: 'var(--surface-card)',
                    borderColor: isCorrect ? 'var(--border-primary)' : 'var(--color-coral)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{
                          background: isCorrect ? 'var(--surface-hover)' : 'var(--color-coral)',
                          color: isCorrect ? 'var(--color-orange)' : '#ffffff',
                          border: '1px solid var(--border-primary)',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <Badge variant={isCorrect ? 'orange' : 'coral'} size="sm">
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                      {q.concept_tested && (
                        <Badge variant="neutral" size="sm">
                          Concept: {q.concept_tested}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <h4 className="font-bold text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {q.question_text}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-2">
                    {q.options?.map((opt) => {
                      const wasSelected = opt.id === q.selected_option_id;
                      const isOptionCorrect = opt.id === q.correct_option_id;

                      let optBorder = 'var(--border-primary)';
                      let optBg = 'var(--surface-input)';
                      let optText = 'var(--text-secondary)';

                      if (isOptionCorrect) {
                        optBorder = 'var(--color-orange)';
                        optBg = 'var(--surface-hover)';
                        optText = 'var(--text-primary)';
                      } else if (wasSelected && !isCorrect) {
                        optBorder = 'var(--color-coral)';
                        optBg = 'var(--surface-input)';
                        optText = 'var(--color-coral)';
                      }

                      return (
                        <div
                          key={opt.id}
                          className="p-3 rounded-lg border flex items-center justify-between text-xs transition-colors"
                          style={{
                            background: optBg,
                            borderColor: optBorder,
                            color: optText,
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            {isOptionCorrect ? (
                              <CheckCircle2 size={16} style={{ color: 'var(--color-orange)', flexShrink: 0 }} />
                            ) : wasSelected ? (
                              <XCircle size={16} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
                            ) : (
                              <div
                                className="w-4 h-4 rounded-full border flex-shrink-0"
                                style={{ borderColor: 'var(--border-primary)' }}
                              />
                            )}
                            <span className="font-medium leading-relaxed">{opt.option_text}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 text-[11px] font-semibold">
                            {wasSelected && (
                              <span style={{ color: isCorrect ? 'var(--color-orange)' : 'var(--color-coral)' }}>
                                (Your Answer)
                              </span>
                            )}
                            {isOptionCorrect && (
                              <Badge variant="orange" size="sm">
                                Correct Answer
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Deep In-Depth Explanation Box */}
                  {q.explanation && (
                    <div
                      className="p-4 rounded-xl border space-y-1.5 text-xs"
                      style={{
                        background: 'var(--surface-hover)',
                        borderColor: 'var(--border-active)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--color-orange)' }}>
                        <Lightbulb size={14} />
                        <span>Educational Explanation &amp; Key Concept:</span>
                      </div>
                      <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  )}

                  {/* Remediation Action Link */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t" style={{ borderColor: 'var(--border-primary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Need to strengthen {q.concept_tested || 'this concept'}?
                    </span>
                    <Link
                      to={`/student/skills/${skillId}?tab=tasks`}
                      className="font-semibold hover:underline inline-flex items-center gap-1"
                      style={{ color: 'var(--color-orange)' }}
                    >
                      <span>Practice in Learning Workspace</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PageWrapper>
    );
  }

  // =========================================================================
  // ACTIVE ASSESSMENT QUESTIONS FLOW
  // =========================================================================
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const currentQ = questions[currentIdx];

  return (
    <PageWrapper
      title="Skill Competency Assessment"
      subtitle="Standardized MCQ diagnostic with comprehensive explanation feedback"
    >
      <div className="max-w-2xl mx-auto w-full space-y-5">
        {error && (
          <Alert variant="error" title="Assessment Notice">
            {error}
          </Alert>
        )}

        {/* Start Assessment Prompt */}
        {!attempt && !loading && (
          <Card className="p-6 sm:p-8 text-center space-y-5">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto border"
              style={{
                background: 'var(--surface-hover)',
                borderColor: 'var(--border-active)',
                color: 'var(--color-orange)',
              }}
            >
              <Brain size={28} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Ready to Begin Diagnostic Assessment?
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-secondary)' }}>
                This standardized evaluation measures your baseline understanding. After submission, you will receive in-depth explanations and guided remediation tasks for any missed concepts.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={startAssessment}
                icon={ArrowRight}
                className="w-full sm:w-auto"
              >
                Begin Assessment
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto"
              >
                Return to Skill
              </Button>
            </div>
          </Card>
        )}

        {/* Assessment In-Progress */}
        {attempt && currentQ && (
          <div className="space-y-5">
            {/* Progress Bar & Header */}
            <div
              className="p-4 rounded-xl border flex items-center justify-between"
              style={{
                background: 'var(--surface-card)',
                borderColor: 'var(--border-primary)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div>
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
                  Question {currentIdx + 1} of {totalCount}
                </span>
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {answeredCount} of {totalCount} answered
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-28 sm:w-36 h-2 rounded-full overflow-hidden"
                  style={{ background: 'var(--surface-input)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(answeredCount / totalCount) * 100}%`,
                      background: 'var(--color-orange)',
                    }}
                  />
                </div>
                <span className="text-xs font-bold" style={{ color: 'var(--color-orange)' }}>
                  {Math.round((answeredCount / totalCount) * 100)}%
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="p-5 sm:p-7 space-y-5">
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                  Select the best answer:
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {currentQ.question_text}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options?.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                      className="w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between text-xs sm:text-sm"
                      style={{
                        background: isSelected ? 'var(--surface-hover)' : 'var(--surface-input)',
                        borderColor: isSelected ? 'var(--color-orange)' : 'var(--border-primary)',
                        color: isSelected ? 'var(--color-orange)' : 'var(--text-primary)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: isSelected ? 'var(--color-orange)' : 'var(--border-primary)',
                            background: isSelected ? 'var(--color-orange)' : 'transparent',
                          }}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span className="font-medium leading-relaxed">{opt.option_text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Nav Buttons */}
              <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-primary)' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => i - 1)}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {currentIdx < totalCount - 1 ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentIdx((i) => i + 1)}
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={submitLoading}
                      onClick={handleSubmit}
                    >
                      {submitLoading ? 'Scoring Assessment...' : 'Submit & Review'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AssessmentPage;
