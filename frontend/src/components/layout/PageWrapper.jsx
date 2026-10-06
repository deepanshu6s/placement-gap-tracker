import React from 'react';

export const PageWrapper = ({ title, subtitle, badge, children }) => {
  return (
    <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
      </div>
      {children}
    </main>
  );
};
