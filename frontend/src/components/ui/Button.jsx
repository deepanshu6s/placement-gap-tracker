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
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080B12] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-[#42F5E8] hover:bg-[#24e8da] text-[#080B12] shadow-sm hover:shadow-[0_0_20px_-3px_rgba(66,245,232,0.4)] focus:ring-[#42F5E8]',
    accent:
      'bg-[#C4FF58] hover:bg-[#b5f540] text-[#080B12] shadow-sm hover:shadow-[0_0_20px_-3px_rgba(196,255,88,0.4)] focus:ring-[#C4FF58]',
    secondary:
      'bg-[#17243A] hover:bg-[#1f2f4c] text-[#F3F7FC] border border-[#243249] hover:border-[#364A6B] focus:ring-[#364A6B]',
    outline:
      'bg-transparent hover:bg-[#42F5E8]/10 text-[#42F5E8] border border-[#42F5E8]/60 hover:border-[#42F5E8] focus:ring-[#42F5E8]',
    ghost:
      'bg-transparent hover:bg-[#17243A] text-[#A6B4C8] hover:text-[#F3F7FC] focus:ring-[#243249]',
    danger:
      'bg-[#FB7185]/15 hover:bg-[#FB7185]/25 text-[#FB7185] border border-[#FB7185]/40 hover:border-[#FB7185] focus:ring-[#FB7185]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[34px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[42px]',
    lg: 'px-6 py-3 text-base gap-2.5 min-h-[48px]',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};

export default Button;
