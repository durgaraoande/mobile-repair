import React, { createContext, useContext, useCallback } from 'react';
import { X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = React.useState([]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(({ id, message, type }) => (
          <div
            key={id}
            className={`flex items-center p-4 rounded-lg shadow-lg max-w-sm transform transition-all duration-300 ease-in-out
              ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                'bg-blue-50 text-blue-800 border border-blue-200'}`}
          >
            <p className="flex-1 text-sm font-medium">{message}</p>
            <button
              onClick={() => removeNotification(id)}
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};