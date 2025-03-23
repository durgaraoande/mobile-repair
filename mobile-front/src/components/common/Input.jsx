import React, { forwardRef } from 'react';

export const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  required = false,
  className = '',
  helpText,
  helperText, // Add this line
  ...props 
}, ref) => {
  // Use helpText or fallback to helperText if provided
  const textHelp = helpText || helperText;
  
  return (
    <div className="mb-4 w-full">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300
          leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400
          transition-all duration-200
          ${error ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
          ${className}
          dark:bg-gray-800
        `}
        {...props}
      />
      {textHelp && !error && (
        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{textHelp}</p>
      )}
      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs italic mt-1">{error}</p>
      )}
    </div>
  );
});