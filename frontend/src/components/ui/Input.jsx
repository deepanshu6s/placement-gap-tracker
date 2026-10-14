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
        <label
          htmlFor={id}
          className="block text-xs sm:text-sm font-medium mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div
            className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          >
            <Icon size={17} />
          </div>
        )}
        <input
          id={id}
          type={type}
          className={`w-full rounded-lg ${Icon ? 'pl-10 pr-3.5' : 'px-3.5'} py-2 text-sm border focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 ${className}`}
          style={{
            background: 'var(--surface-input)',
            borderColor: error ? 'var(--color-coral)' : 'var(--border-primary)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-coral)' : 'var(--color-orange)';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 2px rgba(255,82,111,0.15)'
              : '0 0 0 2px rgba(255,106,42,0.15)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'var(--color-coral)' : 'var(--border-primary)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onMouseEnter={(e) => {
            if (!e.currentTarget.matches(':focus')) {
              e.currentTarget.style.borderColor = error ? 'var(--color-coral)' : 'var(--border-active)';
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.matches(':focus')) {
              e.currentTarget.style.borderColor = error ? 'var(--color-coral)' : 'var(--border-primary)';
            }
          }}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs font-medium" style={{ color: 'var(--color-coral)' }}>
          {error}
        </p>
      )}
      {!error && helperText && (
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;
