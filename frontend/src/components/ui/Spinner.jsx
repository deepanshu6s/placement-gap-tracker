import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-[3px]',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-[#34271F] border-t-[#FF6A2A] ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
