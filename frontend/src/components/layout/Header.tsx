import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/contexts/MobileContext';
import { ThemeSwitch } from '@/components/common/ThemeSwitch';
import { Bell, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}
            
            <div className='hidden sm:block'>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Welcome back, {user?.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Manage your team's credentials securely
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeSwitch />
            <button className="p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
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
