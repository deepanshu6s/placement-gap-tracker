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
      className={`bg-[#111B2D] border border-[#243249] rounded-xl p-6 shadow-card-subtle transition-all duration-200 ${
        hover ? 'hover:border-[#364A6B] hover:shadow-card-elevated' : ''
      } ${glow ? 'hover:border-[#42F5E8]/60 hover:shadow-glow-cyan' : ''} ${className}`}
      {...props}
    >
      {(title || subtitle || badge || action) && (
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-[#243249]/60">
          <div>
            <div className="flex items-center gap-3">
              {title && <h3 className="text-lg md:text-xl font-bold text-[#F3F7FC] tracking-tight">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-sm text-[#A6B4C8] mt-1 leading-relaxed">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
