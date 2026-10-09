import React, { useEffect, useState } from 'react';
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
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  ShieldAlert,
  Brain,
  RotateCcw,
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

  // If result is available, show clear completion screen
  if (result) {
    const passed = (result.skill_score || 0) >= 70;
    return (
      <PageWrapper
        title="Assessment Results"
        subtitle="Your evaluation has been scored and your placement readiness recalculated"
      >
        <div className="max-w-2xl mx-auto w-full">
          <Card className="bg-[#111B2D] border-[#243249] text-center p-8 sm:p-10 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-[#17243A] border border-[#243249]">
              <Award
                size={40}
                className={passed ? 'text-[#42F5E8]' : 'text-[#FBBF24]'}
              />
            </div>

            <div className="space-y-2">
              <Badge variant={passed ? 'lime' : 'warning'} size="lg">
                {passed ? 'Proficient Score' : 'Needs Practice'}
              </Badge>
              <div className="text-5xl sm:text-6xl font-black text-[#F3F7FC] tracking-tight">
                {Math.round(result.skill_score || 0)}%
              </div>
              <p className="text-sm text-[#A6B4C8]">
                Raw Accuracy: {result.raw_score || 0} of {result.questions_served || questions.length} questions answered correctly
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1320] border border-[#243249] text-xs text-[#A6B4C8] text-left space-y-1.5">
              <div className="flex justify-between">
                <span>Attempt ID:</span>
                <span className="font-mono text-[#F3F7FC]">{attempt?.id?.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-[#4ADE80] font-semibold uppercase">Completed &amp; Recorded</span>
              </div>
              <div className="flex justify-between">
                <span>Readiness Recalculation:</span>
                <span className="text-[#42F5E8]">Applied to Dashboard</span>
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
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {error && (
          <Alert variant="error" title="Assessment Alert">
            {error}
          </Alert>
        )}

        {/* Start Assessment Prompt */}
        {!attempt && !loading && (
          <Card className="bg-[#111B2D] border-[#243249] p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#42F5E8]/10 text-[#42F5E8] flex items-center justify-center mx-auto border border-[#42F5E8]/30">
              <Brain size={32} />
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-xl font-bold text-[#F3F7FC]">
                Ready to Begin Diagnostic Evaluation?
              </h3>
              <p className="text-sm text-[#A6B4C8] leading-relaxed">
                This assessment presents timed multiple-choice questions designed to test theoretical
                and practical understanding. Your score will update your role-specific readiness gauge.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#A6B4C8]">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1320] border border-[#243249]">
                <Clock size={15} className="text-[#42F5E8]" />
                <span>Timer Enforced</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1320] border border-[#243249]">
                <ShieldAlert size={15} className="text-[#C4FF58]" />
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
            <p className="text-sm text-[#77869B]">Preparing question bank...</p>
          </div>
        )}

        {/* Active Test Taking View */}
        {attempt && questions.length > 0 && currentQ && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#111B2D] border border-[#243249]">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#77869B]">
                  Progress
                </span>
                <Badge variant="cyan" size="sm">
                  Question {currentIdx + 1} of {totalCount}
                </Badge>
              </div>

              <div className="text-xs text-[#A6B4C8]">
                Answered:{' '}
                <span className="font-bold text-[#42F5E8]">
                  {answeredCount} / {totalCount}
                </span>
              </div>
            </div>

            {/* Question Card */}
            <Card className="bg-[#111B2D] border-[#243249]">
              <div className="mb-6">
                <span className="text-xs font-semibold text-[#42F5E8] uppercase tracking-wider block mb-2">
                  Question {currentIdx + 1}
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#F3F7FC] leading-relaxed">
                  {currentQ.question_text}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options?.map((opt, optIdx) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleOptionSelect(currentQ.id, opt.id)}
                      className={`flex items-center gap-3.5 p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#17243A] border-[#42F5E8] text-[#F3F7FC] shadow-[0_0_15px_-3px_rgba(66,245,232,0.25)]'
                          : 'bg-[#0D1320] border-[#243249] text-[#A6B4C8] hover:border-[#364A6B] hover:text-[#F3F7FC]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#42F5E8] bg-[#42F5E8]'
                            : 'border-[#77869B] bg-transparent'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#080B12]" />}
                      </div>

                      <span className="text-sm sm:text-base leading-snug flex-1">
                        {opt.option_text}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Question Navigation Footbar */}
              <div className="mt-8 pt-5 border-t border-[#243249] flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                >
                  Previous
                </Button>

                <div className="flex gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                        idx === currentIdx
                          ? 'bg-[#42F5E8] text-[#080B12]'
                          : answers[q.id]
                          ? 'bg-[#17243A] text-[#4ADE80] border border-[#4ADE80]/30'
                          : 'bg-[#0D1320] text-[#77869B] border border-[#243249]'
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
                    {submitLoading ? 'Scoring...' : 'Submit Final'}
                  </Button>
                )}
              </div>
            </Card>

            {/* Quick Final Submit Card when all questions are answered */}
            {answeredCount === totalCount && (
              <div className="p-4 rounded-xl bg-[#0D1320] border border-[#42F5E8]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#A6B4C8]">
                  <CheckCircle2 size={16} className="text-[#4ADE80]" />
                  <span>All {totalCount} questions answered. Ready to score attempt.</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                >
                  {submitLoading ? 'Evaluating Attempt...' : 'Submit Assessment'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AssessmentPage;
