import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { OnboardingOverlay } from '../components/ui/OnboardingOverlay';
import { useUiStore } from '../store/uiStore';

export const StudentLayout = () => {
  const { checkAndShowOnboarding } = useUiStore();

  // Check on mount — shows onboarding if user has never seen it
  useEffect(() => {
    checkAndShowOnboarding();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#FF6A2A]/20 selection:text-[var(--color-orange)]"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="student" />
        <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-app)' }}>
          <Outlet />
        </div>
      </div>

      {/* First-time onboarding overlay */}
      <OnboardingOverlay />
    </div>
  );
};

export default StudentLayout;
