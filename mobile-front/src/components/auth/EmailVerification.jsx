import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { logger } from '../../utils/logger';
import { Button } from '../common/Button';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setError('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (token) => {
    try {
      await authApi.verifyEmail(token);
      setStatus('success');
    } catch (error) {
      logger.error('Email verification failed:', error);
      setStatus('error');
      setError(error.response?.data?.message || 'Email verification failed');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"/>
            <p className="text-gray-300">Verifying your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-100">Email Verified Successfully!</h2>
            <p className="text-gray-300">Your email has been verified. You can now log in to your account.</p>
            <Button
              onClick={() => navigate('/login')}
              className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Proceed to Login
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <div className="text-red-500 text-6xl mb-4">×</div>
            <h2 className="text-2xl font-bold text-gray-100">Verification Failed</h2>
            <p className="text-red-400">{error}</p>
            <div className="mt-4 space-y-2">
              <p className="text-gray-300">If you're having trouble, you can:</p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Login
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-xl">
        {renderContent()}
      </div>
    </div>
  );
};