import React, { useState, useEffect } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  CalendarCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Target,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'welcome',
    icon: Sparkles,
    iconColor: '#FF6A2A',
    iconBg: 'rgba(255,106,42,0.12)',
    title: 'Welcome to PlacementTracker',
    subtitle: 'Your AI-powered readiness companion',
    description:
      'Understand where you stand, identify skill gaps, and follow a personalised roadmap to land your dream placement — all in one platform.',
    highlights: [
      { icon: Target,    text: 'Real-time readiness score' },
      { icon: TrendingUp, text: 'Skill gap diagnostics' },
      { icon: BookOpen,  text: 'Personalised preparation plans' },
    ],
  },
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    iconColor: '#FF6A2A',
    iconBg: 'rgba(255,106,42,0.12)',
    title: 'Your Dashboard & Readiness Score',
    subtitle: 'Your north star at a glance',
    description:
      'The Dashboard shows your overall placement readiness score, tracks how it changes over time, and surfaces your top skill gaps so you always know what to focus on.',
    highlights: [
      { icon: CheckCircle2, text: 'Live readiness percentage' },
      { icon: TrendingUp,   text: 'Score trend over assessments' },
      { icon: Target,       text: 'Top gaps highlighted automatically' },
    ],
  },
  {
    id: 'roles',
    icon: Compass,
    iconColor: '#FFC857',
    iconBg: 'rgba(255,200,87,0.12)',
    title: 'Career Roles & Skills',
    subtitle: 'Explore what roles need',
    description:
      'Browse every placement role, inspect the exact skills each requires, and see how your current profile stacks up. Use this to pick your target role before taking assessments.',
    highlights: [
      { icon: Compass,       text: 'Curated role catalogue' },
      { icon: CheckCircle2,  text: 'Skill-by-skill fit analysis' },
      { icon: Target,        text: 'Set a target role for focused prep' },
    ],
  },
  {
    id: 'preparation',
    icon: CalendarCheck,
    iconColor: '#FF526F',
    iconBg: 'rgba(255,82,111,0.12)',
    title: 'Preparation Tracker',
    subtitle: 'Turn gaps into checked boxes',
    description:
      'Log study sessions, track progress on individual skills, and watch your overall readiness tick upward. Every session you log is reflected on your dashboard in real time.',
    highlights: [
      { icon: CalendarCheck, text: 'Daily study logging' },
      { icon: TrendingUp,    text: 'Progress bars per skill' },
      { icon: CheckCircle2,  text: 'Completion milestones' },
    ],
  },
  {
    id: 'profile',
    icon: UserCheck,
    iconColor: '#FF6A2A',
    iconBg: 'rgba(255,106,42,0.12)',
    title: 'Set Up Your Profile First',
    subtitle: 'The engine needs fuel',
    description:
      'Before your readiness score can be calculated, complete your Academic Profile. Add your CGPA, skills, batch, and target role so the platform can give you accurate, personalised results.',
    highlights: [
      { icon: UserCheck,     text: 'Academic & background details' },
      { icon: Target,        text: 'Target role selection' },
      { icon: CheckCircle2,  text: 'Enables your readiness score' },
    ],
    cta: 'Complete My Profile',
    ctaLink: '/student/profile-setup',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const OnboardingOverlay = () => {
  const { onboardingVisible, hideOnboarding } = useUiStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Reset to first step each time the overlay is opened
  useEffect(() => {
    if (onboardingVisible) setStep(0);
  }, [onboardingVisible]);

  if (!onboardingVisible) return null;

  const slide = SLIDES[step];
  const Icon  = slide.icon;
  const total = SLIDES.length;
  const isLast = step === total - 1;

  const goNext = () => {
    setLeaving(true);
    setTimeout(() => { setStep((s) => s + 1); setLeaving(false); }, 140);
  };
  const goPrev = () => {
    setLeaving(true);
    setTimeout(() => { setStep((s) => s - 1); setLeaving(false); }, 140);
  };
  const dismiss = () => hideOnboarding(user?.id);

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to PlacementTracker"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'var(--overlay-bg)', backdropFilter: 'blur(6px)' }}
    >
      {/* Card */}
      <div
        className={`relative w-full max-w-lg rounded-2xl border overflow-hidden shadow-2xl ${
          leaving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-primary)',
          transition: 'opacity 140ms ease, transform 140ms ease',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${slide.iconColor}, ${slide.iconColor}88)`,
          }}
        />

        {/* Header with close */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          {/* Step indicator pills */}
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => { setLeaving(true); setTimeout(() => { setStep(i); setLeaving(false); }, 140); }}
                aria-label={`Go to step ${i + 1}`}
                className="h-1.5 rounded-full transition-all duration-200"
                style={{
                  width: i === step ? '22px' : '7px',
                  background: i === step ? slide.iconColor : 'var(--border-primary)',
                }}
              />
            ))}
          </div>

          <button
            onClick={dismiss}
            aria-label="Close onboarding"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-6 pb-5">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: slide.iconBg }}
          >
            <Icon size={28} style={{ color: slide.iconColor }} />
          </div>

          {/* Greeting on first slide */}
          {step === 0 && user?.email && (
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: slide.iconColor }}>
              Hello, {user.email.split('@')[0]} 👋
            </p>
          )}

          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {slide.title}
          </h2>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            {slide.subtitle}
          </p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
            {slide.description}
          </p>

          {/* Highlights */}
          <ul className="space-y-2 mb-6">
            {slide.highlights.map(({ icon: HIcon, text }, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: slide.iconBg }}
                >
                  <HIcon size={14} style={{ color: slide.iconColor }} />
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</span>
              </li>
            ))}
          </ul>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)', background: 'var(--surface-hover)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                <ArrowLeft size={15} /> Back
              </button>
            ) : (
              <button
                onClick={dismiss}
                className="text-sm px-4 py-2 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
              >
                Skip
              </button>
            )}

            {isLast ? (
              <button
                onClick={dismiss}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: slide.iconColor,
                  color: '#fff',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {slide.cta || "Let's Go!"} <CheckCircle2 size={15} />
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: slide.iconColor, color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Next <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Step counter footer */}
        <div
          className="px-6 py-3 text-xs flex justify-between items-center border-t"
          style={{ borderColor: 'var(--border-primary)', color: 'var(--text-disabled)' }}
        >
          <span>Step {step + 1} of {total}</span>
          <span style={{ color: slide.iconColor }}>PlacementTracker Guide</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingOverlay;
