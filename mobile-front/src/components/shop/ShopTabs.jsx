import React from 'react';

export const ShopTabs = ({ currentTab, onTabChange }) => {
  return (
    <nav className="flex flex-wrap sm:flex-nowrap gap-2 sm:gap-4 bg-white shadow rounded-lg p-2 mb-6 overflow-x-auto">
      <button
        className={`px-3 py-2 text-sm sm:text-base rounded-md transition-all duration-200 flex-grow sm:flex-grow-0 whitespace-nowrap ${
          currentTab === 'pending' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
        }`}
        onClick={() => onTabChange('pending')}
        aria-current={currentTab === 'pending' ? 'page' : undefined}
      >
        Pending Requests
      </button>
      <button
        className={`px-3 py-2 text-sm sm:text-base rounded-md transition-all duration-200 flex-grow sm:flex-grow-0 whitespace-nowrap ${
          currentTab === 'repairs' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
        }`}
        onClick={() => onTabChange('repairs')}
        aria-current={currentTab === 'repairs' ? 'page' : undefined}
      >
        Active Repairs
      </button>
      <button
        className={`px-3 py-2 text-sm sm:text-base rounded-md transition-all duration-200 flex-grow sm:flex-grow-0 whitespace-nowrap ${
          currentTab === 'completed' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
        }`}
        onClick={() => onTabChange('completed')}
        aria-current={currentTab === 'completed' ? 'page' : undefined}
      >
        Completed Repairs
      </button>
      <button
        className={`px-3 py-2 text-sm sm:text-base rounded-md transition-all duration-200 flex-grow sm:flex-grow-0 whitespace-nowrap ${
          currentTab === 'profile' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
        }`}
        onClick={() => onTabChange('profile')}
        aria-current={currentTab === 'profile' ? 'page' : undefined}
      >
        Shop Profile
      </button>
    </nav>
  );
};