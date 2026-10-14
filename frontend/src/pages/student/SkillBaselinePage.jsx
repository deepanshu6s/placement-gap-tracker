import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { baselineService } from '../../services/baselineService';
import { roleService, studentService } from '../../services/studentService';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Brain,
  ShieldCheck,
  Target,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';

const PROFICIENCY_OPTIONS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'I am just starting or know very little.',
    badgeVariant: 'coral',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'I understand the basics and can complete some tasks with limited help.',
    badgeVariant: 'amber',
  },
  {
    value: 'proficient',
    label: 'Proficient',
    description: 'I can use this skill independently and have practical experience.',
    badgeVariant: 'orange',
  },
  {
    value: 'not_sure',
    label: 'Not sure yet',
    description: 'I do not know how to evaluate my current level.',
    badgeVariant: 'neutral',
  },
];

export const SkillBaselinePage = () => {
  const navigate = useNavigate();

  // Wizard Steps: 0: Confirm Role, 1: Introduction, 2: Rating Skills, 3: Completed Summary
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [targetRole, setTargetRole] = useState(null);
  const [skills, setSkills] = useState([]);
  const [ratings, setRatings] = useState({}); // { [skill_id]: 'beginner' | 'intermediate' | 'proficient' | 'not_sure' }
  const [activeSkillIdx, setActiveSkillIdx] = useState(0);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const [profile, rolesData] = await Promise.all([
          studentService.getProfile().catch(() => null),
          roleService.getRoles().catch(() => []),
        ]);

        if (!isMounted) return;

        setRoles(Array.isArray(rolesData) ? rolesData : []);

        const initialRoleId = profile?.target_role_id || (rolesData[0]?.id || '');
        setSelectedRoleId(initialRoleId);

        if (initialRoleId) {
          const baselineData = await baselineService.getBaseline(initialRoleId);
          if (isMounted && baselineData) {
            setTargetRole(baselineData.target_role);
            setSkills(baselineData.skills || []);

            // Populate existing ratings if any
            const existing = {};
            (baselineData.skills || []).forEach((s) => {
              if (s.proficiency_level) {
                existing[s.skill_id] = s.proficiency_level;
              }
            });
            setRatings(existing);

            // If user already has a complete baseline, start on step 0 so they can review or proceed
            if (baselineData.summary?.is_complete) {
              setSummaryData(baselineData.summary);
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize skill baseline flow', err);
        if (isMounted) setError('Unable to load role requirements. Please refresh.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, []);

  // When student changes selected role in Step A
  const handleRoleChange = async (roleId) => {
    setSelectedRoleId(roleId);
    setLoading(true);
    setError('');
    try {
      const data = await baselineService.getBaseline(roleId);
      setTargetRole(data.target_role);
      setSkills(data.skills || []);

      const existing = {};
      (data.skills || []).forEach((s) => {
        if (s.proficiency_level) existing[s.skill_id] = s.proficiency_level;
      });
      setRatings(existing);
      setActiveSkillIdx(0);
    } catch (err) {
      console.error('Failed to change role', err);
      setError('Could not load skills for selected role.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProficiency = (skillId, level) => {
    setRatings((prev) => ({
      ...prev,
      [skillId]: level,
    }));
  };

  const handleSaveAndComplete = async () => {
    setSaving(true);
    setError('');
    try {
      const ratingsPayload = skills.map((s) => ({
        skill_id: s.skill_id,
        proficiency_level: ratings[s.skill_id] || 'not_sure',
      }));

      const res = await baselineService.saveBaseline(selectedRoleId, ratingsPayload);
      setSummaryData(res.summary);
      setSkills(res.skills || []);
      setCurrentStep(3); // Go to summary step
    } catch (err) {
      console.error('Failed to save skill baseline', err);
      setError(err.response?.data?.error?.message || 'Failed to save baseline ratings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title="Personalized Skill Baseline">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading role skill requirements...
          </p>
        </div>
      </PageWrapper>
    );
  }

  const currentSkill = skills[activeSkillIdx];
  const ratedCount = Object.keys(ratings).length;
  const totalSkills = skills.length;

  return (
    <PageWrapper
      title="Personalized Skill Baseline"
      subtitle="Establish an initial self-evaluation against target industry benchmarks without mandatory quizzes"
      badge={
        <Badge variant="orange" size="sm">
          Self-Reported Baseline
        </Badge>
      }
    >
      <div className="max-w-3xl mx-auto w-full space-y-6">
        {error && (
          <Alert variant="warning" title="Notice">
            {error}
          </Alert>
        )}

        {/* Step Indicator Header */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between transition-colors"
          style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-2">
            {['1. Target Role', '2. Introduction', '3. Skill Ratings', '4. Baseline Summary'].map(
              (label, idx) => (
                <div key={label} className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors ${
                      currentStep === idx
                        ? 'font-bold'
                        : currentStep > idx
                        ? 'opacity-80'
                        : 'opacity-50'
                    }`}
                    style={{
                      background: currentStep === idx ? 'var(--surface-hover)' : 'transparent',
                      color: currentStep === idx ? 'var(--color-orange)' : 'var(--text-secondary)',
                      border: currentStep === idx ? '1px solid var(--border-active)' : '1px solid transparent',
                    }}
                  >
                    {label}
                  </span>
                  {idx < 3 && (
                    <ChevronRight size={14} style={{ color: 'var(--border-primary)' }} />
                  )}
                </div>
              )
            )}
          </div>

          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Step {currentStep + 1} of 4
          </span>
        </div>

        {/* ========================================================================= */}
        {/* STEP 0: CONFIRM TARGET ROLE */}
        {/* ========================================================================= */}
        {currentStep === 0 && (
          <Card
            title="Step 1: Confirm Your Target Career Role"
            subtitle="Skill requirements and benchmark levels are derived directly from your target role"
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="role-select"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Select Your Placement Pathway
                </label>
                <select
                  id="role-select"
                  value={selectedRoleId}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-all duration-150 border"
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
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {targetRole && (
                <div
                  className="p-4 rounded-xl border space-y-2"
                  style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-primary)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {targetRole.name}
                    </span>
                    <Badge variant="orange" size="sm">
                      {skills.length} Required Skills
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {targetRole.description}
                  </p>
                </div>
              )}

              <div
                className="pt-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <Link to="/student">
                  <Button variant="ghost" size="sm">
                    Back to Dashboard
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setCurrentStep(1)}
                  disabled={!selectedRoleId || skills.length === 0}
                  icon={ArrowRight}
                >
                  Confirm &amp; Continue
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: INTRODUCTION TO SKILL BASELINE */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <Card
            title="Step 2: Understanding Your Skill Baseline"
            subtitle="Honest self-ratings empower accurate preparation roadmaps without stress"
          >
            <div className="space-y-5">
              <div
                className="p-4 rounded-xl border flex items-start gap-3"
                style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
              >
                <ShieldCheck size={24} style={{ color: 'var(--color-orange)', flexShrink: 0 }} />
                <div className="text-xs sm:text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Self-Ratings are Preparation Baselines, Not Exam Scores
                  </p>
                  <p className="leading-relaxed">
                    This guided flow asks you to evaluate your familiarity with the {skills.length} core skills
                    required for <strong style={{ color: 'var(--text-primary)' }}>{targetRole?.name}</strong>.
                    Self-reported levels are distinctly labeled and never fabricated into diagnostic scores.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {PROFICIENCY_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    className="p-3.5 rounded-xl border space-y-1"
                    style={{ background: 'var(--surface-card)', borderColor: 'var(--border-primary)' }}
                  >
                    <Badge variant={opt.badgeVariant} size="sm">
                      {opt.label}
                    </Badge>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {opt.description}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="pt-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <Button variant="ghost" size="sm" onClick={() => setCurrentStep(0)} icon={ArrowLeft}>
                  Previous
                </Button>

                <Button variant="primary" size="md" onClick={() => setCurrentStep(2)} icon={ArrowRight}>
                  Begin Skill Ratings ({skills.length} Skills)
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: RATE EACH REQUIRED SKILL (PAGINATED & GUIDED) */}
        {/* ========================================================================= */}
        {currentStep === 2 && currentSkill && (
          <Card
            title={`Rate Skill ${activeSkillIdx + 1} of ${totalSkills}: ${currentSkill.skill_name}`}
            subtitle={`Target Requirement: ${currentSkill.required_level}% • Weight: ${currentSkill.weight}/5`}
            badge={
              <Badge variant="orange" size="sm">
                {ratedCount} of {totalSkills} Reviewed
              </Badge>
            }
          >
            <div className="space-y-6">
              {/* Progress bar */}
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--surface-hover)' }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    background: 'var(--color-orange)',
                    width: `${Math.round(((activeSkillIdx + 1) / totalSkills) * 100)}%`,
                  }}
                />
              </div>

              {/* Current Skill Card */}
              <div
                className="p-5 rounded-xl border space-y-3"
                style={{ background: 'var(--surface-hover)', borderColor: 'var(--border-primary)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--color-amber)' }}>
                    Domain Category: {currentSkill.skill_category}
                  </span>
                  <Link
                    to={`/student/skills/${currentSkill.skill_id}`}
                    target="_blank"
                    className="text-xs font-semibold hover:underline"
                    style={{ color: 'var(--color-orange)' }}
                  >
                    View Skill Details &rarr;
                  </Link>
                </div>

                <h3 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {currentSkill.skill_name}
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Evaluate your current ability to write, design, or discuss practical problems in{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{currentSkill.skill_name}</strong>.
                </p>
              </div>

              {/* Choice Radio Buttons */}
              <div className="space-y-2.5">
                <span className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Choose Your Current Proficiency Level:
                </span>

                {PROFICIENCY_OPTIONS.map((opt) => {
                  const isSelected = ratings[currentSkill.skill_id] === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => handleSelectProficiency(currentSkill.skill_id, opt.value)}
                      className="p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3"
                      style={{
                        background: isSelected ? 'var(--surface-hover)' : 'var(--surface-card)',
                        borderColor: isSelected ? 'var(--color-orange)' : 'var(--border-primary)',
                        boxShadow: isSelected ? '0 0 0 1px var(--color-orange)' : 'none',
                      }}
                    >
                      <input
                        type="radio"
                        id={`opt-${opt.value}`}
                        name={`skill-${currentSkill.skill_id}`}
                        checked={isSelected}
                        onChange={() => handleSelectProficiency(currentSkill.skill_id, opt.value)}
                        className="mt-1 accent-[var(--color-orange)]"
                      />
                      <label htmlFor={`opt-${opt.value}`} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {opt.label}
                          </span>
                          <Badge variant={opt.badgeVariant} size="sm">
                            {opt.label}
                          </Badge>
                        </div>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {opt.description}
                        </p>
                      </label>
                    </div>
                  );
                })}
              </div>

              {/* Skills Quick Navigation Dots */}
              <div className="pt-2 flex flex-wrap items-center gap-1.5 justify-center">
                {skills.map((s, idx) => {
                  const isDone = Boolean(ratings[s.skill_id]);
                  const isCurrent = idx === activeSkillIdx;
                  return (
                    <button
                      key={s.skill_id}
                      onClick={() => setActiveSkillIdx(idx)}
                      title={`${idx + 1}. ${s.skill_name} (${ratings[s.skill_id] || 'unrated'})`}
                      className="w-7 h-7 rounded-md text-xs font-bold transition-all border flex items-center justify-center"
                      style={{
                        background: isCurrent
                          ? 'var(--color-orange)'
                          : isDone
                          ? 'var(--surface-hover)'
                          : 'transparent',
                        borderColor: isCurrent
                          ? 'var(--color-orange)'
                          : isDone
                          ? 'var(--border-active)'
                          : 'var(--border-primary)',
                        color: isCurrent
                          ? '#FFFFFF'
                          : isDone
                          ? 'var(--text-primary)'
                          : 'var(--text-muted)',
                      }}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div
                className="pt-4 border-t flex items-center justify-between"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (activeSkillIdx > 0) setActiveSkillIdx(activeSkillIdx - 1);
                    else setCurrentStep(1);
                  }}
                  icon={ArrowLeft}
                >
                  {activeSkillIdx > 0 ? 'Previous Skill' : 'Back to Intro'}
                </Button>

                {activeSkillIdx < totalSkills - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setActiveSkillIdx(activeSkillIdx + 1)}
                    icon={ArrowRight}
                  >
                    Next Skill ({activeSkillIdx + 2} of {totalSkills})
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveAndComplete}
                    disabled={saving}
                    icon={saving ? undefined : CheckCircle2}
                  >
                    {saving ? 'Saving Baseline...' : 'Complete & Save Baseline'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: BASELINE SUMMARY & NEXT STEPS */}
        {/* ========================================================================= */}
        {currentStep === 3 && summaryData && (
          <Card
            title="Skill Baseline Summary"
            subtitle={`Your self-reported profile baseline for ${targetRole?.name || 'Target Role'}`}
            badge={
              <Badge variant="orange" size="sm">
                Persisted in Profile
              </Badge>
            }
          >
            <div className="space-y-6">
              {/* Notice Banner */}
              <Alert variant="info" title="Baseline Established">
                Your initial self-ratings have been saved securely. These responses establish your
                starting baseline and personalize your roadmap. They remain clearly identified as
                self-reported until verified by optional diagnostic tests.
              </Alert>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  className="p-3.5 rounded-xl border text-center"
                  style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                >
                  <span className="block text-2xl font-black" style={{ color: 'var(--color-orange)' }}>
                    {summaryData.proficient_count || 0}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Proficient
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border text-center"
                  style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                >
                  <span className="block text-2xl font-black" style={{ color: 'var(--color-amber)' }}>
                    {summaryData.intermediate_count || 0}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Intermediate
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border text-center"
                  style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                >
                  <span className="block text-2xl font-black" style={{ color: 'var(--color-coral)' }}>
                    {summaryData.beginner_count || 0}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Beginner
                  </span>
                </div>

                <div
                  className="p-3.5 rounded-xl border text-center"
                  style={{ background: 'var(--surface-input)', borderColor: 'var(--border-primary)' }}
                >
                  <span className="block text-2xl font-black" style={{ color: 'var(--text-muted)' }}>
                    {summaryData.not_sure_count || 0}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    Uncertain
                  </span>
                </div>
              </div>

              {/* Rated Skills Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
                  Breakdown by Required Skill:
                </h4>
                <div
                  className="rounded-xl border divide-y overflow-hidden text-xs"
                  style={{ borderColor: 'var(--border-primary)' }}
                >
                  {skills.map((s) => {
                    const level = ratings[s.skill_id] || s.proficiency_level || 'unrated';
                    const opt = PROFICIENCY_OPTIONS.find((o) => o.value === level);
                    return (
                      <div
                        key={s.skill_id}
                        className="p-3 flex items-center justify-between transition-colors"
                        style={{ background: 'var(--surface-input)' }}
                      >
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/student/skills/${s.skill_id}`}
                            className="font-semibold hover:underline transition-colors"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {s.skill_name}
                          </Link>
                          <span style={{ color: 'var(--text-muted)' }}>({s.skill_category})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span style={{ color: 'var(--color-amber)', fontWeight: 600 }}>
                            Target: {s.required_level}%
                          </span>
                          <Badge variant={opt?.badgeVariant || 'neutral'} size="sm">
                            {opt?.label || 'Unrated'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
                style={{ borderColor: 'var(--border-primary)' }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStep(2);
                    setActiveSkillIdx(0);
                  }}
                  icon={ArrowLeft}
                >
                  Edit Ratings
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link to="/student" className="w-full sm:w-auto">
                    <Button variant="secondary" size="md" className="w-full">
                      Go to Dashboard
                    </Button>
                  </Link>

                  <Link to="/student/roadmap" className="w-full sm:w-auto">
                    <Button variant="primary" size="md" icon={ArrowRight} className="w-full">
                      View Preparation Roadmap
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

export default SkillBaselinePage;
