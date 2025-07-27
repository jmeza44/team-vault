import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, useMobile } from '@/contexts';
import { Logo } from '@/components/common';
import { NAVIGATION } from '@/constants';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isMobile, closeSidebar } = useMobile();

  const handleNavLinkClick = () => {
    // Close sidebar on mobile when navigating
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="p-6">
        <Logo size={64} textSize='2xl' />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {NAVIGATION.map(item => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavLinkClick}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                }`
              }
            >
              <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.name}
          </p>
          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
          <button
            onClick={logout}
            className="btn btn-outline mt-3 min-h-[36px] w-full rounded-md border px-3 py-2 text-xs transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};
