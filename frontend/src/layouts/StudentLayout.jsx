import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { OnboardingOverlay } from '../components/ui/OnboardingOverlay';
import { useUiStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

export const StudentLayout = () => {
  const { checkAndShowOnboarding } = useUiStore();
  const user = useAuthStore((state) => state.user);

  // Check on mount — shows onboarding if user has never seen it
  useEffect(() => {
    checkAndShowOnboarding(user?.id);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#FF6A2A]/20 selection:text-[var(--color-orange)]"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar role="student" />
        <div className="flex-1 overflow-y-auto min-w-0" style={{ background: 'var(--bg-app)' }}>
          <Outlet />
        </div>
      </div>

      {/* First-time onboarding overlay */}
      <OnboardingOverlay />
    </div>
  );
};

export default StudentLayout;
