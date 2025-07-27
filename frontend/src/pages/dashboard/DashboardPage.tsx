import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDemo } from '@/components/common/AlertDemo';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300">Welcome back, {user?.name}! Overview of your team's credentials and activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Credentials</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Secure credentials stored</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Expiring Soon</h3>
            <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">0</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Credentials expiring in 30 days</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Team Members</h3>
            <p className="text-3xl font-bold text-success-600 dark:text-success-400">1</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active team members</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Activity</h2>
        </div>
        <div className="card-body">
          <p className="text-gray-500 dark:text-gray-400">No recent activity to display.</p>
        </div>
      </div>

      {/* Alert System Demo */}
      <AlertDemo />
    </div>
  );
};
