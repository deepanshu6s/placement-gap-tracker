import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variants = {
    neutral: 'bg-[#17243A] text-[#A6B4C8] border-[#243249]',
    cyan: 'bg-[#42F5E8]/10 text-[#42F5E8] border-[#42F5E8]/30',
    lime: 'bg-[#C4FF58]/10 text-[#C4FF58] border-[#C4FF58]/30',
    success: 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30',
    warning: 'bg-[#FBBF24]/10 text-[#FBBF24] border-[#FBBF24]/30',
    danger: 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30',
    error: 'bg-[#FB7185]/10 text-[#FB7185] border-[#FB7185]/30',
    info: 'bg-[#60A5FA]/10 text-[#60A5FA] border-[#60A5FA]/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-medium tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold tracking-wide',
    lg: 'px-3 py-1.5 text-sm font-semibold',
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
