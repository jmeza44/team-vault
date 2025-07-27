import React, { useState } from 'react';
import {
  KeyRound,
  Clock,
  AlertTriangle,
  Users,
  Share2,
  Shield,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  TimeRangeSelector,
  MetricCard,
  RecentActivityList,
} from '@/components/common';
import { useAuth } from '@/contexts';
import { useAnalytics } from '@/hooks';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  const {
    dashboardMetrics,
    teamActivity,
    securityMetrics,
    recentActivity,
    isDashboardLoading,
    isTeamActivityLoading,
    filters,
    setFilters,
    refreshAll,
  } = useAnalytics({
    timeRange: 'last24h',
  });

  const handleRefresh = () => {
    refreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Welcome back, {user?.name}! Overview of your team's credentials and
            activity
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex min-h-[44px] items-center justify-center space-x-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {showFilters ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
          <button
            onClick={handleRefresh}
            className="flex min-h-[44px] items-center justify-center space-x-2 rounded-md bg-primary-600 px-4 py-3 text-sm text-white transition-colors hover:bg-primary-700"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Filters
            </h3>
          </div>
          <div className="card-body">
            <TimeRangeSelector filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Credentials"
          value={dashboardMetrics?.totalCredentials ?? 0}
          description="Secure credentials stored"
          variant="default"
          isLoading={isDashboardLoading}
          icon={<KeyRound size={20} />}
        />

        <MetricCard
          title="Expiring Soon"
          value={dashboardMetrics?.expiringSoon ?? 0}
          description="Credentials expiring in 30 days"
          variant="warning"
          isLoading={isDashboardLoading}
          icon={<Clock size={20} />}
        />

        <MetricCard
          title="Expired"
          value={dashboardMetrics?.expired ?? 0}
          description="Credentials that have expired"
          variant="danger"
          isLoading={isDashboardLoading}
          icon={<AlertTriangle size={20} />}
        />

        <MetricCard
          title="Team Members"
          value={dashboardMetrics?.teamMembers ?? 0}
          description="Active team members"
          variant="success"
          isLoading={isDashboardLoading}
          icon={<Users size={20} />}
        />

        <MetricCard
          title="Shared Credentials"
          value={dashboardMetrics?.sharedCredentials ?? 0}
          description="Credentials shared with teams"
          variant="info"
          isLoading={isDashboardLoading}
          icon={<Share2 size={20} />}
        />

        <MetricCard
          title="Security Alerts"
          value={dashboardMetrics?.securityAlerts ?? 0}
          description="Recent security events"
          variant={
            dashboardMetrics?.securityAlerts &&
            dashboardMetrics.securityAlerts > 0
              ? 'danger'
              : 'success'
          }
          isLoading={isDashboardLoading}
          icon={<Shield size={20} />}
        />
      </div>

      {securityMetrics && securityMetrics.riskScore > 50 && (
        <div className="card border-l-4 border-l-warning-500 bg-warning-50 dark:bg-warning-900/20">
          <div className="card-body">
            <div className="flex items-center space-x-3">
              <AlertTriangle
                size={24}
                className="text-warning-600 dark:text-warning-400"
              />
              <div>
                <h3 className="font-medium text-warning-800 dark:text-warning-200">
                  Elevated Security Risk Score: {securityMetrics.riskScore}
                </h3>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  Consider reviewing your security settings and recent activity.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Recent Activity
            </h2>
          </div>
          <div className="card-body">
            <RecentActivityList
              activities={recentActivity || []}
              isLoading={isTeamActivityLoading}
              maxItems={8}
            />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Team Overview
            </h2>
          </div>
          <div className="card-body">
            {isTeamActivityLoading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                ))}
              </div>
            ) : teamActivity ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Teams
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {teamActivity.totalTeams}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Active Teams
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {teamActivity.activeTeams}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200 py-2 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Team Credentials
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {teamActivity.teamCredentials}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Members
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {teamActivity.totalMembers}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No team data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Alert System Demo */}
      {/* <AlertDemo /> */}
    </div>
  );
};
