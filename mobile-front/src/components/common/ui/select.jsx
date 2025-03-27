import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const SelectContext = createContext({
  value: '',
  setValue: () => {},
  open: false,
  setOpen: () => {}
});

export const Select = ({
  children,
  value: controlledValue,
  defaultValue = '',
  onValueChange,
  ...props
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  
  // Handle both controlled and uncontrolled modes
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const setValue = (newValue) => {
    if (controlledValue !== undefined) {
      onValueChange?.(newValue);
    } else {
      setUncontrolledValue(newValue);
    }
  };

  return (
    <SelectContext.Provider value={{ value, setValue, open, setOpen }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({
  children,
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  const { value, open, setOpen } = useContext(SelectContext);

  return (
    <button
      type="button"
      className={`flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 ${className}`}
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      {...props}
    >
      <span className={value ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
        {children || <SelectValue placeholder={placeholder} />}
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
};

export const SelectValue = ({
  placeholder = 'Select an option',
  ...props
}) => {
  const { value } = useContext(SelectContext);
  return <span {...props}>{value || placeholder}</span>;
};

export const SelectContent = ({
  children,
  className = '',
  ...props
}) => {
  const { open, setOpen } = useContext(SelectContext);
  const ref = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute z-10 mt-1 w-full rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700 max-h-60 overflow-auto ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const SelectItem = ({
  children,
  value,
  className = '',
  ...props
}) => {
  const { value: selectedValue, setValue, setOpen } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      className={`px-3 py-2 text-sm cursor-pointer ${
        isSelected
          ? 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100'
          : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
      } ${className}`}
      onClick={() => {
        setValue(value);
        setOpen(false);
      }}
      aria-selected={isSelected}
      role="option"
      {...props}
    >
      <div className="flex items-center justify-between">
        {children}
        {isSelected && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
};