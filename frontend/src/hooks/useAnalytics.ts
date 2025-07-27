import { useState, useEffect, useCallback, useRef } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { DashboardMetrics, CredentialStatistics, TeamActivityMetrics, SecurityMetrics, AnalyticsFilters, RecentActivity } from '@/types';
import { useAlertActions } from './useAlerts';

interface UseAnalyticsResult {
  // Data
  dashboardMetrics: DashboardMetrics | null;
  credentialStats: CredentialStatistics | null;
  teamActivity: TeamActivityMetrics | null;
  securityMetrics: SecurityMetrics | null;
  recentActivity: RecentActivity[];
  
  // Loading states
  isDashboardLoading: boolean;
  isCredentialsLoading: boolean;
  isTeamActivityLoading: boolean;
  isSecurityLoading: boolean;
  isRecentActivityLoading: boolean;
  
  // Actions
  refreshDashboard: () => Promise<void>;
  refreshCredentials: () => Promise<void>;
  refreshTeamActivity: () => Promise<void>;
  refreshSecurity: () => Promise<void>;
  refreshRecentActivity: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Filters
  filters: AnalyticsFilters;
  setFilters: (filters: AnalyticsFilters) => void;
}

export const useAnalytics = (initialFilters: AnalyticsFilters = {}): UseAnalyticsResult => {
  const { showError } = useAlertActions();
  
  // Data state
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [credentialStats, setCredentialStats] = useState<CredentialStatistics | null>(null);
  const [teamActivity, setTeamActivity] = useState<TeamActivityMetrics | null>(null);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  
  // Loading states
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  const [isCredentialsLoading, setIsCredentialsLoading] = useState(false);
  const [isTeamActivityLoading, setIsTeamActivityLoading] = useState(false);
  const [isSecurityLoading, setIsSecurityLoading] = useState(false);
  const [isRecentActivityLoading, setIsRecentActivityLoading] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState<AnalyticsFilters>(initialFilters);
  
  // Prevent concurrent refreshAll calls
  const refreshingRef = useRef(false);

  // Refresh functions - without filters in dependencies to avoid loops
  const refreshDashboard = useCallback(async (currentFilters?: AnalyticsFilters) => {
    setIsDashboardLoading(true);
    try {
      const data = await analyticsService.getDashboardMetrics(currentFilters || filters);
      setDashboardMetrics(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard metrics:', error);
      showError('Failed to load dashboard metrics');
    } finally {
      setIsDashboardLoading(false);
    }
  }, [showError]);

  const refreshCredentials = useCallback(async (currentFilters?: AnalyticsFilters) => {
    setIsCredentialsLoading(true);
    try {
      const data = await analyticsService.getCredentialStatistics(currentFilters || filters);
      setCredentialStats(data);
    } catch (error: any) {
      console.error('Failed to fetch credential statistics:', error);
      showError('Failed to load credential statistics');
    } finally {
      setIsCredentialsLoading(false);
    }
  }, [showError]);

  const refreshTeamActivity = useCallback(async (currentFilters?: AnalyticsFilters) => {
    setIsTeamActivityLoading(true);
    try {
      const data = await analyticsService.getTeamActivityMetrics(currentFilters || filters);
      setTeamActivity(data);
      setRecentActivity(data.recentActivity || []);
    } catch (error: any) {
      console.error('Failed to fetch team activity:', error);
      showError('Failed to load team activity');
    } finally {
      setIsTeamActivityLoading(false);
    }
  }, [showError]);

  const refreshSecurity = useCallback(async (currentFilters?: AnalyticsFilters) => {
    setIsSecurityLoading(true);
    try {
      const data = await analyticsService.getSecurityMetrics(currentFilters || filters);
      setSecurityMetrics(data);
    } catch (error: any) {
      console.error('Failed to fetch security metrics:', error);
      showError('Failed to load security metrics');
    } finally {
      setIsSecurityLoading(false);
    }
  }, [showError]);

  const refreshRecentActivity = useCallback(async (currentFilters?: AnalyticsFilters) => {
    setIsRecentActivityLoading(true);
    try {
      const data = await analyticsService.getAuditLogs({ ...(currentFilters || filters), limit: 20 });
      // Transform audit logs to recent activity format if needed
      setRecentActivity(data || []);
    } catch (error: any) {
      console.error('Failed to fetch recent activity:', error);
      showError('Failed to load recent activity');
    } finally {
      setIsRecentActivityLoading(false);
    }
  }, [showError]);

  const refreshAll = useCallback(async () => {
    // Prevent concurrent calls
    if (refreshingRef.current) {
      return;
    }
    
    try {
      refreshingRef.current = true;
      // Pass current filters directly to avoid dependency issues
      const currentFilters = filtersRef.current;
      await Promise.all([
        refreshDashboard(currentFilters),
        refreshCredentials(currentFilters),
        refreshTeamActivity(currentFilters),
        refreshSecurity(currentFilters)
      ]);
    } finally {
      refreshingRef.current = false;
    }
  }, []); // Remove dependencies to break the cycle

  // Load data when filters change - use a ref to prevent unnecessary re-renders
  const filtersRef = useRef(filters);
  const hasMountedRef = useRef(false);
  
  useEffect(() => {
    filtersRef.current = filters;
    
    // Only refresh if component has mounted (prevent initial double call)
    if (hasMountedRef.current) {
      refreshAll();
    } else {
      hasMountedRef.current = true;
      // Initial load
      refreshAll();
    }
  }, [filters.timeRange, filters.teamId, filters.startDate, filters.endDate]); // Remove refreshAll from dependencies

  // Custom setFilters that triggers refresh
  const updateFilters = useCallback((newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
    // Note: refreshAll will be triggered by the useEffect above
  }, []);

  return {
    // Data
    dashboardMetrics,
    credentialStats,
    teamActivity,
    securityMetrics,
    recentActivity,
    
    // Loading states
    isDashboardLoading,
    isCredentialsLoading,
    isTeamActivityLoading,
    isSecurityLoading,
    isRecentActivityLoading,
    
    // Actions
    refreshDashboard: () => refreshDashboard(filters),
    refreshCredentials: () => refreshCredentials(filters),
    refreshTeamActivity: () => refreshTeamActivity(filters),
    refreshSecurity: () => refreshSecurity(filters),
    refreshRecentActivity: () => refreshRecentActivity(filters),
    refreshAll,
    
    // Filters
    filters,
    setFilters: updateFilters
  };
};
