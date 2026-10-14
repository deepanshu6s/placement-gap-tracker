import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/ui/ThemeToggle';

export const AuthLayout = () => {
  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#FF6A2A]/20"
      style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}
    >
      {/* Theme toggle — top-right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight hover:text-[var(--color-orange)] transition-colors group"
            style={{ color: 'var(--text-primary)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'var(--surface-hover)',
                border: '1px solid var(--border-active)',
                color: 'var(--color-orange)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <span>
              Placement<span style={{ color: 'var(--color-orange)' }}>Tracker</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            Smart Placement Readiness &amp; Skill Gap Platform
          </p>
        </div>

        <Outlet />

        <div className="text-center mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} PlacementTracker. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
