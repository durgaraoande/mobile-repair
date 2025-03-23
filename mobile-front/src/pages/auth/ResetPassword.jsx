import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm';
import { authApi } from '../../api/auth';
import { logger } from '../../utils/logger';

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = searchParams.get('token');

  const handleSubmit = async ({ newPassword }) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, newPassword);
    } catch (error) {
      logger.error('Password reset failed:', error);
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl">
          <div className="text-center text-red-500">
            Invalid or missing reset token. Please request a new password reset.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}
        <ResetPasswordForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          token={token}
        />
      </div>
    </div>
  );
};