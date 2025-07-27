import axios, { AxiosResponse } from 'axios';
import { ApiResponse, DashboardMetrics, CredentialStatistics, TeamActivityMetrics, SecurityMetrics, AnalyticsFilters, AnalyticsSummary } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          if (response.data.success) {
            const newAccessToken = response.data.data.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

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
  async getDashboardMetrics(filters?: AnalyticsFilters): Promise<DashboardMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<{dashboard: DashboardMetrics}>> = await api.get(
        `/analytics/dashboard${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data?.dashboard) {
        return response.data.data.dashboard;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch dashboard metrics');
    } catch (error: any) {
      console.error('Analytics Service - Get Dashboard Metrics Error:', error);
      throw error;
    }
  },

  // Get credential statistics
  async getCredentialStatistics(filters?: AnalyticsFilters): Promise<CredentialStatistics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<{credentials: CredentialStatistics}>> = await api.get(
        `/analytics/credentials/usage${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data?.credentials) {
        return response.data.data.credentials;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch credential statistics');
    } catch (error: any) {
      console.error('Analytics Service - Get Credential Statistics Error:', error);
      throw error;
    }
  },

  // Get team activity metrics
  async getTeamActivityMetrics(filters?: AnalyticsFilters): Promise<TeamActivityMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<{teams: TeamActivityMetrics}>> = await api.get(
        `/analytics/teams/activity${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data?.teams) {
        // Process the recent activity to fix the mapping and extract resource names
        const teams = response.data.data.teams;
        teams.recentActivity = teams.recentActivity.map(activity => ({
          ...activity,
          type: analyticsService.mapActionToActivityType(activity.description) as any,
          resourceName: activity.metadata?.credentialName || activity.resourceName,
        }));
        return teams;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch team activity metrics');
    } catch (error: any) {
      console.error('Analytics Service - Get Team Activity Metrics Error:', error);
      throw error;
    }
  },

  // Get security metrics
  async getSecurityMetrics(filters?: AnalyticsFilters): Promise<SecurityMetrics> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<{security: SecurityMetrics}>> = await api.get(
        `/analytics/security/events${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data?.security) {
        return response.data.data.security;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch security metrics');
    } catch (error: any) {
      console.error('Analytics Service - Get Security Metrics Error:', error);
      throw error;
    }
  },

  // Get comprehensive analytics summary
  async getAnalyticsSummary(filters?: AnalyticsFilters): Promise<AnalyticsSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<AnalyticsSummary>> = await api.get(
        `/analytics/summary${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch analytics summary');
    } catch (error: any) {
      console.error('Analytics Service - Get Analytics Summary Error:', error);
      throw error;
    }
  },

  // Get audit logs (for recent activity)
  async getAuditLogs(filters?: AnalyticsFilters & { limit?: number }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.timeRange) params.append('timeRange', filters.timeRange);
      if (filters?.teamId) params.append('teamId', filters.teamId);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const response: AxiosResponse<ApiResponse<any[]>> = await api.get(
        `/analytics/audit/logs${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.error?.message || 'Failed to fetch audit logs');
    } catch (error: any) {
      console.error('Analytics Service - Get Audit Logs Error:', error);
      throw error;
    }
  }
};
