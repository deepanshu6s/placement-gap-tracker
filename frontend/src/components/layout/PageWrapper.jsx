import React from 'react';

export const PageWrapper = ({ title, subtitle, badge, action, children }) => {
  return (
    <main className="flex-1 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 transition-colors">
      {(title || subtitle || badge || action) && (
        <div
          className="mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 pb-5 border-b transition-colors"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {title && (
                <h1
                  className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h1>
              )}
              {badge}
            </div>
            {subtitle && (
              <p
                className="text-xs sm:text-sm mt-1 leading-relaxed transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-2.5 self-start md:self-auto">{action}</div>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </main>
  );
};

export default PageWrapper;
