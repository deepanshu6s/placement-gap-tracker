import React from 'react';

export const Input = ({ label, error, id, className = '', type = 'text', ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`w-full bg-slate-900 border ${
          error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:ring-emerald-500'
        } rounded-lg px-3.5 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
};
