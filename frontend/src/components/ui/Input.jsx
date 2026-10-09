import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  id,
  className = '',
  type = 'text',
  icon: Icon,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#F3F7FC] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#77869B]">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full bg-[#0D1320] border ${
            error
              ? 'border-[#FB7185] focus:border-[#FB7185] focus:ring-[#FB7185]/20'
              : 'border-[#243249] hover:border-[#364A6B] focus:border-[#42F5E8] focus:ring-[#42F5E8]/20'
          } rounded-lg ${Icon ? 'pl-10 pr-4' : 'px-4'} py-2.5 text-[#F3F7FC] placeholder-[#77869B] text-sm md:text-base focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:bg-[#080B12] ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-[#FB7185]">{error}</p>}
      {!error && helperText && <p className="mt-1.5 text-xs text-[#77869B]">{helperText}</p>}
    </div>
  );
};

export default Input;
