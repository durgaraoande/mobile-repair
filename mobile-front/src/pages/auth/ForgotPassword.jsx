import React, { useState } from 'react';
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm';
import { authApi } from '../../api/auth';
import { logger } from '../../utils/logger';

export const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async ({ email }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(email);
    } catch (error) {
      logger.error('Forgot password request failed:', error);
      setError(error.response?.data?.message || 'Failed to process request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        <ForgotPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};