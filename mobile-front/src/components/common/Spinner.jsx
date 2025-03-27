export const Spinner = ({ 
    size = 'medium',
    color = 'primary',
    className = '', 
    ...props 
  }) => {
    const sizes = {
      small: 'h-4 w-4',
      medium: 'h-6 w-6',
      large: 'h-8 w-8'
    };
  
    const colors = {
      primary: 'text-indigo-600 dark:text-indigo-500',
      secondary: 'text-gray-600 dark:text-gray-400',
      white: 'text-white'
    };
  
    return (
      <svg 
        className={`animate-spin ${sizes[size]} ${colors[color]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
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
    );
  };