import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { authApi } from '../../api/auth';
import { logger } from '../../utils/logger';
import { useAuth } from '../../hooks/useAuth'; // Import the useAuth hook

export const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from your auth context

  // Check if already authenticated, redirect to dashboard if so
  useEffect(() => {
    if (authApi.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(values);
      
      logger.info('Login successful');
      
      // Update the auth context with the user data
      if (response.user && response.token) {
        login(response.user, response.token, values.rememberMe);
      }
      
      // Delay navigation slightly to ensure context is updated
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
      
      return response;
    } catch (error) {
      logger.error('Login failed:', error);
      setError({
        message: error.message || 'Authentication failed',
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        method: error.method,
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold text-blue-900">
          Welcome Back
        </h1>
        <p className="mt-1 text-sm text-blue-600">
          Please enter your credentials to continue
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border-l-4 border-red-400 p-3 transition-all">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-red-800">
              {error.message}
            </p>
            {(error.status || error.url || error.method) && (
              <div className="text-xs text-red-600">
                {error.status && (
                  <p>Status: {error.status} {error.statusText}</p>
                )}
                {error.url && (
                  <p className="truncate">API: {error.url.split('/').pop()}</p>
                )}
                {error.method && (
                  <p>Method: {error.method}</p>
                )}
              </div>
            )}
            <p className="text-xs text-red-700 pt-1 border-t border-red-200 mt-1">
              Please check your information and try again
            </p>
          </div>
        </div>
      )}

      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
};