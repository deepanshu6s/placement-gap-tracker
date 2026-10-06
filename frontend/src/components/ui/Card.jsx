import React from 'react';

export const Card = ({ children, className = '', title, subtitle, ...props }) => {
  return (
    <div
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm ${className}`}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-100">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
