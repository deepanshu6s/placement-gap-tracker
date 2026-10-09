import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variants = {
    neutral: 'bg-[#241B16] text-[#C3B7AD] border-[#34271F]',
    orange: 'bg-[#FF6A2A]/15 text-[#FF6A2A] border-[#FF6A2A]/35',
    amber: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/35',
    coral: 'bg-[#FF526F]/15 text-[#FF526F] border-[#FF526F]/35',

    // Backward-compatible mappings into warm palette
    cyan: 'bg-[#FF6A2A]/15 text-[#FF6A2A] border-[#FF6A2A]/35',
    lime: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/35',
    success: 'bg-[#FF6A2A]/15 text-[#FF6A2A] border-[#FF6A2A]/35',
    warning: 'bg-[#FFC857]/15 text-[#FFC857] border-[#FFC857]/35',
    danger: 'bg-[#FF526F]/15 text-[#FF526F] border-[#FF526F]/35',
    error: 'bg-[#FF526F]/15 text-[#FF526F] border-[#FF526F]/35',
    info: 'bg-[#241B16] text-[#C3B7AD] border-[#34271F]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
    md: 'px-2.5 py-0.5 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variants[variant] || variants.neutral} ${sizes[size] || sizes.md} uppercase transition-colors ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
