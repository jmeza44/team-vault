import { AxiosResponse } from 'axios';
import {
  ApiResponse,
  DashboardMetrics,
  CredentialStatistics,
  TeamActivityMetrics,
  SecurityMetrics,
  AnalyticsFilters,
  AnalyticsSummary,
} from '@/types';
import { apiClient } from '@/services';

export const analyticsService = {
  // Helper function to map action strings to activity types
  mapActionToActivityType(action: string): string {
    switch (action) {
      case 'CREATE_CREDENTIAL':
        return 'CREDENTIAL_CREATED';
      case 'UPDATE_CREDENTIAL':
        return 'CREDENTIAL_UPDATED';
      case 'DELETE_CREDENTIAL':
        return 'CREDENTIAL_DELETED';
      case 'ACCESS_CREDENTIAL':
        return 'CREDENTIAL_ACCESSED';
      case 'SHARE_CREDENTIAL':
        return 'CREDENTIAL_SHARED';
      case 'CREATE_TEAM':
        return 'TEAM_CREATED';
      case 'ADD_TEAM_MEMBER':
        return 'TEAM_MEMBER_ADDED';
      case 'REMOVE_TEAM_MEMBER':
        return 'TEAM_MEMBER_REMOVED';
      case 'USER_LOGIN':
        return 'USER_LOGIN';
      default:
        return 'SECURITY_ALERT';
    }
  },

  // Get dashboard metrics
  async getDashboardMetrics(
    filters?: AnalyticsFilters
  ): Promise<DashboardMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<
        ApiResponse<{ dashboard: DashboardMetrics }>
      > = await apiClient.get(
        `/analytics/dashboard${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.data.success && response.data.data?.dashboard) {
        return response.data.data.dashboard;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch dashboard metrics'
      );
    } catch (error: any) {
      console.error('Analytics Service - Get Dashboard Metrics Error:', error);
      throw error;
    }
  },

  // Get credential statistics
  async getCredentialStatistics(
    filters?: AnalyticsFilters
  ): Promise<CredentialStatistics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<
        ApiResponse<{ credentials: CredentialStatistics }>
      > = await apiClient.get(
        `/analytics/credentials/usage${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.data.success && response.data.data?.credentials) {
        return response.data.data.credentials;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch credential statistics'
      );
    } catch (error: any) {
      console.error(
        'Analytics Service - Get Credential Statistics Error:',
        error
      );
      throw error;
    }
  },

  // Get team activity metrics
  async getTeamActivityMetrics(
    filters?: AnalyticsFilters
  ): Promise<TeamActivityMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<
        ApiResponse<{ teams: TeamActivityMetrics }>
      > = await apiClient.get(
        `/analytics/teams/activity${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.data.success && response.data.data?.teams) {
        // Process the recent activity to fix the mapping and extract resource names
        const teams = response.data.data.teams;
        teams.recentActivity = teams.recentActivity.map(activity => ({
          ...activity,
          type: analyticsService.mapActionToActivityType(
            activity.description
          ) as any,
          resourceName:
            activity.metadata?.credentialName || activity.resourceName,
        }));
        return teams;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch team activity metrics'
      );
    } catch (error: any) {
      console.error(
        'Analytics Service - Get Team Activity Metrics Error:',
        error
      );
      throw error;
    }
  },

  // Get security metrics
  async getSecurityMetrics(
    filters?: AnalyticsFilters
  ): Promise<SecurityMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<
        ApiResponse<{ security: SecurityMetrics }>
      > = await apiClient.get(
        `/analytics/security/events${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.data.success && response.data.data?.security) {
        return response.data.data.security;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch security metrics'
      );
    } catch (error: any) {
      console.error('Analytics Service - Get Security Metrics Error:', error);
      throw error;
    }
  },

  // Get comprehensive analytics summary
  async getAnalyticsSummary(
    filters?: AnalyticsFilters
  ): Promise<AnalyticsSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<AnalyticsSummary>> =
        await apiClient.get(
          `/analytics/summary${params.toString() ? `?${params.toString()}` : ''}`
        );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch analytics summary'
      );
    } catch (error: any) {
      console.error('Analytics Service - Get Analytics Summary Error:', error);
      throw error;
    }
  },

  // Get audit logs (for recent activity)
  async getAuditLogs(
    filters?: AnalyticsFilters & { limit?: number }
  ): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get(
        `/analytics/audit/logs${params.toString() ? `?${params.toString()}` : ''}`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error(
        response.data.error?.message || 'Failed to fetch audit logs'
      );
    } catch (error: any) {
      console.error('Analytics Service - Get Audit Logs Error:', error);
      throw error;
    }
  },
};
