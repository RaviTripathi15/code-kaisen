import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-[3px]',
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-slate-950 border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
