import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  style = {},
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  // Using CSS var-based inline styles for theme-awareness; Tailwind classes for non-color properties
  const variantClasses = {
    primary:   'text-white focus:ring-[var(--color-orange)]',
    accent:    'text-[#0A0908] focus:ring-[var(--color-amber)]',
    secondary: 'border focus:ring-[var(--border-active)]',
    outline:   'border bg-transparent focus:ring-[var(--color-orange)]',
    ghost:     'bg-transparent focus:ring-[var(--border-primary)]',
    danger:    'border focus:ring-[var(--color-coral)]',
  };

  const variantStyles = {
    primary:   { background: 'var(--color-orange)', color: '#fff' },
    accent:    { background: 'var(--color-amber)',  color: '#0A0908' },
    secondary: { background: 'var(--surface-card)', color: 'var(--text-primary)', borderColor: 'var(--border-primary)' },
    outline:   { color: 'var(--color-orange)', borderColor: 'var(--color-orange)', background: 'transparent' },
    ghost:     { background: 'transparent', color: 'var(--text-secondary)' },
    danger:    { background: 'rgba(255,82,111,0.1)', color: 'var(--color-coral)', borderColor: 'rgba(255,82,111,0.4)' },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2 text-sm gap-2 min-h-[40px]',
    lg: 'px-5 py-2.5 text-base gap-2.5 min-h-[46px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variantClasses[variant] || variantClasses.primary} ${sizes[size] || sizes.md} ${className}`}
      style={{ ...(variantStyles[variant] || variantStyles.primary), ...style }}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
