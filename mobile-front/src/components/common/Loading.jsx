import React from 'react';

export const Loading = ({ 
  size = 'medium',
  color = 'primary',
  className = '' 
}) => {
  const sizes = {
    tiny: 'h-3 w-3',
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const colors = {
    primary: 'text-indigo-600 dark:text-indigo-400',
    secondary: 'text-gray-600 dark:text-gray-400',
    white: 'text-white'
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg 
        className={`animate-spin ${sizes[size]} ${colors[color]}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-label="Loading"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </div>
  );
};