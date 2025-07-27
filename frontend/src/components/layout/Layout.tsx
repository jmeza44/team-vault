import React from 'react';
import { Outlet } from 'react-router-dom';
import { useMobile, usePatternContext } from '@/contexts';
import { Sidebar, Header } from '@/components/layout';
import { BackgroundPattern } from '@/components/common';

export const Layout: React.FC = () => {
  const { isMobile, isSidebarOpen, closeSidebar } = useMobile();
  const { pattern, settings } = usePatternContext();

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Enhanced background pattern based on user preference */}
      <BackgroundPattern
        pattern={pattern}
        opacity={settings.opacity}
        size={settings.size}
        variant={settings.variant}
      />

      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={` ${isMobile ? 'fixed' : 'relative'} ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'} ${isMobile ? 'z-[9998]' : 'z-10'} transition-transform duration-300 ease-in-out`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="z-10 flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
