import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
    xl: 'w-14 h-14 border-4',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-[#243249] border-t-[#42F5E8] shadow-[0_0_15px_-2px_rgba(66,245,232,0.5)] ${sizes[size] || sizes.md} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
