import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    warning: 'bg-amber-950 text-amber-400 border-amber-800',
    danger: 'bg-rose-950 text-rose-400 border-rose-800',
    info: 'bg-blue-950 text-blue-400 border-blue-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.neutral} ${className}`}
    >
      {children}
    </span>
  );
};
