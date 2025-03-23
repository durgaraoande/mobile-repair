import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Loading } from '../components/common/Loading';
import { Outlet, Navigate, useLocation } from 'react-router-dom';

export const MainLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loading size="large" />
          <p className="mt-4 text-indigo-400 animate-pulse font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      
      
      <main className="flex-grow py-6 px-4 sm:py-8 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      <footer className="bg-gray-800 border-t border-gray-700 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Repair Hub. All rights reserved.
            </p>
            <nav className="flex space-x-6">
              <a href="/help" className="text-sm text-gray-400 hover:text-gray-300">
                Help
              </a>
              <a href="/privacy" className="text-sm text-gray-400 hover:text-gray-300">
                Privacy
              </a>
              <a href="/terms" className="text-sm text-gray-400 hover:text-gray-300">
                Terms
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};