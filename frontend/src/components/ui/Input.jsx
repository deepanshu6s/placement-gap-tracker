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
        <label htmlFor={id} className="block text-xs sm:text-sm font-medium text-[#F5F0EB] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A3978D]">
            <Icon size={17} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full bg-[#14110F] border ${
            error
              ? 'border-[#FF526F] focus:border-[#FF526F] focus:ring-[#FF526F]/20'
              : 'border-[#34271F] hover:border-[#65402C] focus:border-[#FF6A2A] focus:ring-[#FF6A2A]/20'
          } rounded-lg ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} py-2 text-[#F5F0EB] placeholder-[#A3978D] text-sm focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 disabled:bg-[#0A0908] ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs font-medium text-[#FF526F]">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#A3978D]">{helperText}</p>}
    </div>
  );
};

export default Input;
