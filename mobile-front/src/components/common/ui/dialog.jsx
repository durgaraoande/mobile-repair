import React, { createContext, useContext, useState } from 'react';

const DialogContext = createContext({
  open: false,
  setOpen: () => {}
});

export const Dialog = ({ 
  children, 
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  ...props 
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  
  // Handle both controlled and uncontrolled modes
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = (state) => {
    if (controlledOpen !== undefined) {
      onOpenChange?.(state);
    } else {
      setUncontrolledOpen(state);
    }
  };

  if (!open) return null;
  
  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        <div
          className="z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 relative"
          role="dialog"
          aria-modal="true"
          {...props}
        >
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

export const DialogContent = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogHeader = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`mb-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogTitle = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <h2 
      className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h2>
  );
};

export const DialogFooter = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <div 
      className={`mt-6 flex justify-end space-x-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};