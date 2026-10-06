import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-2xl font-bold tracking-tight text-slate-100 hover:text-emerald-400 transition-colors"
          >
            PlacementTracker
          </Link>
          <p className="text-sm text-slate-400 mt-2">
            Campus Placement Readiness & Skill Gap Platform
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
