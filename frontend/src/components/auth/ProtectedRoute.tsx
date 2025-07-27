import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary-200 border-b-primary-600 dark:border-primary-800 dark:border-b-primary-400"></div>
          <div className="mt-4 space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Loading...
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Verifying your session
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
