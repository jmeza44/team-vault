import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useMobile } from '@/contexts/MobileContext';

export const Layout: React.FC = () => {
  const { isMobile, isSidebarOpen, closeSidebar } = useMobile();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden relative">
      {/* Mobile backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9997]"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'z-[9998]' : 'z-auto'}
        transition-transform duration-300 ease-in-out
      `}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
