import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variants = {
    neutral: 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border-primary)]',
    orange: 'bg-[var(--color-orange)]/15 text-[var(--color-orange)] border-[var(--color-orange)]/35',
    amber: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/35',
    coral: 'bg-[var(--color-coral)]/15 text-[var(--color-coral)] border-[var(--color-coral)]/35',

    // Backward-compatible mappings into warm palette
    cyan: 'bg-[var(--color-orange)]/15 text-[var(--color-orange)] border-[var(--color-orange)]/35',
    lime: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/35',
    success: 'bg-[var(--color-orange)]/15 text-[var(--color-orange)] border-[var(--color-orange)]/35',
    warning: 'bg-[var(--color-amber)]/15 text-[var(--color-amber)] border-[var(--color-amber)]/35',
    danger: 'bg-[var(--color-coral)]/15 text-[var(--color-coral)] border-[var(--color-coral)]/35',
    error: 'bg-[var(--color-coral)]/15 text-[var(--color-coral)] border-[var(--color-coral)]/35',
    info: 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border-[var(--border-primary)]',
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
