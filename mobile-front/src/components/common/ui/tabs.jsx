import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({
  selectedTab: '',
  setSelectedTab: () => {}
});

export const Tabs = ({ 
  children, 
  defaultValue,
  className = '', 
  ...props 
}) => {
  const [selectedTab, setSelectedTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div 
        className={`w-full ${className}`}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`flex space-x-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({ 
  children, 
  value,
  className = '', 
  ...props 
}) => {
  const { selectedTab, setSelectedTab } = useContext(TabsContext);
  const isSelected = selectedTab === value;

  return (
    <button 
      role="tab"
      type="button"
      aria-selected={isSelected}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200
        ${isSelected 
          ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
        } ${className}`}
      onClick={() => setSelectedTab(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  children, 
  value,
  className = '', 
  ...props 
}) => {
  const { selectedTab } = useContext(TabsContext);
  const isSelected = selectedTab === value;

  if (!isSelected) return null;
  
  return (
    <div 
      role="tabpanel"
      className={`mt-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};