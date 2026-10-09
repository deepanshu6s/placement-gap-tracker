import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const [result, setResult] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const startAssessment = async () => {
    setLoading(true);
    setError('');
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
      const res = await assessmentService.getResult(attempt.id);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit assessment answers.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Assessment results screen
  if (result) {
    const passed = (result.skill_score || 0) >= 70;
    return (
      <PageWrapper
        title="Assessment Results"
        subtitle="Your evaluation has been scored and your placement readiness recalculated"
      >
        <div className="max-w-xl mx-auto w-full">
          <Card className="bg-[#191512] border-[#34271F] text-center p-6 sm:p-8 space-y-5">
            <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-[#241B16] border border-[#65402C]">
              <Award
                size={32}
                className={passed ? 'text-[#FF6A2A]' : 'text-[#FFC857]'}
              />
            </div>

            <div className="space-y-1.5">
              <Badge variant={passed ? 'orange' : 'amber'} size="lg">
                {passed ? 'Proficient Score' : 'Needs Practice'}
              </Badge>
              <div className="text-4xl sm:text-5xl font-black text-[#F5F0EB] tracking-tight">
                {Math.round(result.skill_score || 0)}%
              </div>
              <p className="text-xs sm:text-sm text-[#C3B7AD]">
                Accuracy: {result.raw_score || 0} of {result.questions_served || questions.length} questions answered correctly
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-[#14110F] border border-[#34271F] text-xs text-[#C3B7AD] text-left space-y-1.5">
              <div className="flex justify-between">
                <span>Attempt ID:</span>
                <span className="font-mono text-[#F5F0EB]">{attempt?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Evaluation Status:</span>
                <span className="text-[#FF6A2A] font-semibold uppercase">Scored &amp; Recorded</span>
              </div>
              <div className="flex justify-between">
                <span>Readiness Recalculation:</span>
                <span className="text-[#FFC857]">Updated in Dashboard</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/student')}
                icon={ArrowRight}
                className="w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/student/roles')}
                className="w-full sm:w-auto"
              >
                Browse Other Skills
              </Button>
            </div>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const currentQ = questions[currentIdx];

  return (
    <PageWrapper
      title="Skill Competency Assessment"
      subtitle="Standardized MCQ diagnostic with atomic scoring"
    >
      <div className="max-w-2xl mx-auto w-full space-y-5">
        {error && (
          <Alert variant="error" title="Assessment Notice">
            {error}
          </Alert>
        )}

        {/* Start Assessment Prompt */}
        {!attempt && !loading && (
          <Card className="bg-[#191512] border-[#34271F] p-6 sm:p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-xl bg-[#241B16] text-[#FF6A2A] flex items-center justify-center mx-auto border border-[#65402C]">
              <Brain size={28} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-lg sm:text-xl font-bold text-[#F5F0EB]">
                Ready to Begin Evaluation?
              </h3>
              <p className="text-xs sm:text-sm text-[#C3B7AD] leading-relaxed">
                This assessment presents timed multiple-choice questions to evaluate your competency.
                Your score will directly update your role-specific readiness score.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#C3B7AD]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14110F] border border-[#34271F]">
                <Clock size={14} className="text-[#FF6A2A]" />
                <span>Timer Enforced</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#14110F] border border-[#34271F]">
                <ShieldAlert size={14} className="text-[#FFC857]" />
                <span>Single Submission</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={startAssessment}
              icon={Brain}
              className="mt-2"
            >
              Start Timed Assessment
            </Button>
          </Card>
        )}

        {/* Loading state */}
        {loading && !attempt && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Spinner size="lg" />
            <p className="text-sm text-[#A3978D]">Preparing questions...</p>
          </div>
        )}

        {/* Active Test Taking View */}
        {attempt && questions.length > 0 && currentQ && (
          <div className="space-y-5 animate-fade-in">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#191512] border border-[#34271F]">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#A3978D]">
                  Progress
                </span>
                <Badge variant="orange" size="sm">
                  Question {currentIdx + 1} of {totalCount}
                </Badge>
              </div>

              <div className="text-xs text-[#C3B7AD]">
                Answered:{' '}
                <span className="font-bold text-[#FF6A2A]">
                  {answeredCount} / {totalCount}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="bg-[#191512] border-[#34271F]">
              <div className="mb-5">
                <span className="text-xs font-semibold text-[#FF6A2A] uppercase tracking-wider block mb-1">
                  Question {currentIdx + 1}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#F5F0EB] leading-relaxed">
                  {currentQ.question_text}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options?.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-lg border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#241B16] border-[#FF6A2A] text-[#F5F0EB]'
                          : 'bg-[#14110F] border-[#34271F] text-[#C3B7AD] hover:border-[#65402C] hover:text-[#F5F0EB]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                          isSelected
                            ? 'border-[#FF6A2A] bg-[#FF6A2A]'
                            : 'border-[#786D65] bg-transparent'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#0A0908]" />}
                      </div>

                      <span className="text-xs sm:text-sm leading-snug flex-1">
                        {opt.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Question Navigation Footbar */}
              <div className="mt-6 pt-4 border-t border-[#34271F] flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                >
                  Previous
                </Button>

                <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-6 h-6 rounded text-xs font-bold transition-colors ${
                        idx === currentIdx
                          ? 'bg-[#FF6A2A] text-[#0A0908]'
                          : answers[q.id]
                          ? 'bg-[#241B16] text-[#FFC857] border border-[#FFC857]/40'
                          : 'bg-[#14110F] text-[#A3978D] border border-[#34271F]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                {currentIdx < totalCount - 1 ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentIdx((i) => Math.min(totalCount - 1, i + 1))}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Assessment'}
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AssessmentPage;
