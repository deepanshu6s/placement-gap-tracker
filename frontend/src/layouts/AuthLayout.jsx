import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#F3F7FC] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-[#42F5E8]/20 selection:text-[#42F5E8]">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-[#42F5E8]/10 via-[#C4FF58]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[#F3F7FC] hover:text-[#42F5E8] transition-colors group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#111B2D] border border-[#42F5E8]/40 flex items-center justify-center text-[#42F5E8] shadow-[0_0_20px_-4px_rgba(66,245,232,0.35)] group-hover:scale-105 transition-transform">
              <Sparkles size={20} className="text-[#42F5E8]" />
            </div>
            <span>
              Placement<span className="text-[#42F5E8]">Tracker</span>
            </span>
          </Link>
          <p className="text-sm text-[#A6B4C8] mt-2">
            Smart Placement Readiness &amp; Skill Gap Analytics
          </p>
        </div>

        <Outlet />

        <div className="text-center mt-8 text-xs text-[#77869B]">
          &copy; {new Date().getFullYear()} PlacementTracker. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
