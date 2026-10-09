import React from 'react';

export const PageWrapper = ({ title, subtitle, badge, action, children }) => {
  return (
    <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 transition-all">
      {(title || subtitle || badge || action) && (
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#243249]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F7FC] tracking-tight">
                  {title}
                </h1>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-sm sm:text-base text-[#A6B4C8] mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex items-center gap-3 self-start md:self-auto">{action}</div>}
        </div>
      )}
      <div className="w-full">{children}</div>
    </main>
  );
};

export default PageWrapper;
