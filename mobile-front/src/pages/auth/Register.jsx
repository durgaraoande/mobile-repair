import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RegisterUserForm } from '../../components/auth/RegisterUserForm';
import { authApi } from '../../api/auth';
import { logger } from '../../utils/logger';
import { ROLES } from '../../utils/constants';

export const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.registerUser(values);
      logger.info('Registration successful');
      navigate('/login');
    } catch (error) {
      logger.error('Registration failed:', error);
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm sm:text-base text-blue-600">
          Join us to manage your repair services
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 
          animate-fadeIn transition-all">
          <p className="text-sm text-red-800 font-medium">{error}</p>
        </div>
      )}

      <RegisterUserForm onSubmit={handleSubmit} isLoading={isLoading} />

      <div className="mt-6 text-center">
        <p className="text-sm text-blue-600">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-blue-700 hover:text-blue-800 
              transition-colors duration-150"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </>
  );
};