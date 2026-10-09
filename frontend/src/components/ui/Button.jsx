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
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0908] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    primary:
      'bg-[#FF6A2A] hover:bg-[#FF7B43] text-[#0A0908] focus:ring-[#FF6A2A]',
    accent:
      'bg-[#FFC857] hover:bg-[#FFD273] text-[#0A0908] focus:ring-[#FFC857]',
    secondary:
      'bg-[#191512] hover:bg-[#241B16] text-[#F5F0EB] border border-[#34271F] hover:border-[#65402C] focus:ring-[#65402C]',
    outline:
      'bg-transparent hover:bg-[#FF6A2A]/10 text-[#FF6A2A] border border-[#FF6A2A]/50 hover:border-[#FF6A2A] focus:ring-[#FF6A2A]',
    ghost:
      'bg-transparent hover:bg-[#241B16] text-[#C3B7AD] hover:text-[#F5F0EB] focus:ring-[#34271F]',
    danger:
      'bg-[#FF526F]/15 hover:bg-[#FF526F]/25 text-[#FF526F] border border-[#FF526F]/40 hover:border-[#FF526F] focus:ring-[#FF526F]',
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
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className="flex-shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
