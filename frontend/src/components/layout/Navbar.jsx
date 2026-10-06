import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export const Navbar = () => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-lg text-slate-100 tracking-tight">PlacementTracker</span>
        </Link>
        <Badge variant="success">Phase 1 Foundation</Badge>
      </div>
      <div className="flex items-center space-x-3 text-sm">
        <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
          Login (Placeholder)
        </Link>
        <Link
          to="/register"
          className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
        >
          Register (Placeholder)
        </Link>
      </div>
    </header>
  );
};
