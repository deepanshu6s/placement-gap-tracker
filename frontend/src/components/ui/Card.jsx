import React from 'react';

export const Card = ({
  children,
  className = '',
  title,
  subtitle,
  badge,
  action,
  hover = false,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`bg-[#191512] border border-[#34271F] rounded-xl p-5 sm:p-6 shadow-card-subtle transition-colors duration-150 ${
        hover || glow ? 'hover:border-[#65402C]' : ''
      } ${className}`}
      {...props}
    >
      {(title || subtitle || badge || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3.5 border-b border-[#34271F]">
          <div>
            <div className="flex items-center gap-2.5">
              {title && <h3 className="text-base sm:text-lg font-bold text-[#F5F0EB] tracking-tight">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs sm:text-sm text-[#C3B7AD] mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
