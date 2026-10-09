import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#0A0908] text-[#F5F0EB] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-[#FF6A2A]/20 selection:text-[#FF6A2A]">
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#F5F0EB] hover:text-[#FF6A2A] transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#241B16] border border-[#65402C] flex items-center justify-center text-[#FF6A2A] group-hover:border-[#FF6A2A] transition-colors">
              <Sparkles size={18} className="text-[#FF6A2A]" />
            </div>
            <span>
              Placement<span className="text-[#FF6A2A]">Tracker</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-[#C3B7AD] mt-1.5">
            Smart Placement Readiness &amp; Skill Gap Platform
          </p>
        </div>

        <Outlet />

        <div className="text-center mt-6 text-xs text-[#A3978D]">
          &copy; {new Date().getFullYear()} PlacementTracker. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
