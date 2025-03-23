import { useState, useEffect, createContext } from 'react';
import { authApi } from '../api/auth';
import { logger } from '../utils/logger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from stored token
    const storedToken = authApi.getToken(); // Use your existing getToken method
    
    if (storedToken) {
      try {
        // Get user data if available
        const userData = authApi.getUser(); // Use your existing getUser method
        if (userData) {
          setUser(userData);
          setToken(storedToken);
        }
      } catch (error) {
        logger.error('Error initializing auth state:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, authToken, rememberMe) => {
    setUser(userData);
    setToken(authToken);
    
    // The authApi.login function already handles token storage,
    // so we don't need to duplicate that logic here
    
    logger.info('Auth context updated after login');
  };

  const logout = async () => {
    try {
      await authApi.logout(); // This will clear storage and redirect
    } catch (error) {
      logger.error('Error during logout:', error);
      // Fall back to manual logout if API call fails
      setUser(null);
      setToken(null);
    }
  };

  const isAuthenticated = () => {
    return !!token || authApi.isAuthenticated();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};