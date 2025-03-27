export const Card = ({ 
    children, 
    className = '', 
    ...props 
  }) => {
    return (
      <div 
        className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  export const CardHeader = ({ 
    children, 
    className = '', 
    ...props 
  }) => {
    return (
      <div 
        className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };
  
  export const CardTitle = ({ 
    children, 
    className = '', 
    ...props 
  }) => {
    return (
      <h3 
        className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}
        {...props}
      >
        {children}
      </h3>
    );
  };
  
  export const CardContent = ({ 
    children, 
    className = '', 
    ...props 
  }) => {
    return (
      <div 
        className={`px-6 py-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  };