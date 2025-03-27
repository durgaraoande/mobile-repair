import React from 'react';

export const Textarea = ({
  className = '',
  placeholder = '',
  disabled = false,
  rows = 3,
  value,
  onChange,
  ...props
}) => {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-vertical
        placeholder:text-gray-500
        disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100
        dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400 dark:focus:ring-indigo-500 dark:focus:border-indigo-500 dark:disabled:bg-gray-800 
        ${className}`}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};