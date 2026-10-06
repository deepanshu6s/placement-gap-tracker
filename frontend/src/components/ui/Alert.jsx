import React from 'react';

export const Alert = ({ children, variant = 'info', className = '' }) => {
  const variants = {
    info: 'bg-blue-950/50 text-blue-300 border-blue-900',
    warning: 'bg-amber-950/50 text-amber-300 border-amber-900',
    danger: 'bg-rose-950/50 text-rose-300 border-rose-900',
    success: 'bg-emerald-950/50 text-emerald-300 border-emerald-900',
  };

  return (
    <div
      className={`p-3.5 rounded-lg border text-sm flex items-start space-x-2.5 ${variants[variant] || variants.info} ${className}`}
      role="alert"
    >
      <div>{children}</div>
    </div>
  );
};
