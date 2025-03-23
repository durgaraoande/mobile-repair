import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const AuthLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (user) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold text-gray-100">
          Welcome to Repair Hub
        </h2>
        <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
          Your trusted platform for repair management
        </p>
      </div>
      
      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-6 px-4 sm:py-8 sm:px-10 rounded-xl shadow-md ring-1 ring-gray-700">
          <Outlet />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Repair Hub. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};