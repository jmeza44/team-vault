import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeSwitch } from '@/components/common/ThemeSwitch';
import { Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your team's credentials securely
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            <button className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
              <Bell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
