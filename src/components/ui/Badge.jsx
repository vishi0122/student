import React from 'react';

const Badge = ({ children, variant = 'success' }) => {
  const variants = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-yellow-100 text-yellow-700',
    neutral: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700'
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;
