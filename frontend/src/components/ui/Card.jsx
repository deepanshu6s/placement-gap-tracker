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
  style = {},
  ...props
}) => {
  return (
    <div
      className={`rounded-xl p-5 sm:p-6 transition-colors duration-200 border ${className}`}
      style={{
        background: 'var(--surface-card)',
        borderColor: 'var(--border-primary)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      onMouseEnter={
        hover || glow
          ? (e) => { e.currentTarget.style.borderColor = 'var(--border-active)'; }
          : undefined
      }
      onMouseLeave={
        hover || glow
          ? (e) => { e.currentTarget.style.borderColor = 'var(--border-primary)'; }
          : undefined
      }
      {...props}
    >
      {(title || subtitle || badge || action) && (
        <div
          className="flex items-start justify-between gap-4 mb-4 pb-3.5 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <div>
            <div className="flex items-center gap-2.5">
              {title && (
                <h3
                  className="text-base sm:text-lg font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
