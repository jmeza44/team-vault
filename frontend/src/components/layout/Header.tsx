import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/contexts/MobileContext';
import { ThemeSwitch } from '@/components/common/ThemeSwitch';
import { Bell, Menu, X } from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile();

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-700"
                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              >
                {isSidebarOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            )}

            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Welcome back, {user?.name}
              </h2>
              <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
                Manage your team's credentials securely
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <ThemeSwitch />
            <button className="flex min-h-[44px] min-w-[44px] items-center justify-center p-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
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
