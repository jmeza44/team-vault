import axios from 'axios';
import { ApiResponse, Team, TeamMembership, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with auth
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
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {}

export interface AddMemberRequest {
  email: string;
  role?: 'MEMBER' | 'ADMIN';
}

export interface UpdateMemberRequest {
  role: 'MEMBER' | 'ADMIN';
}

export interface GetTeamsResponse {
  teams: Team[];
  count: number;
}

export interface TeamWithMembers extends Team {
  memberships: (TeamMembership & { user: User })[];
  memberCount?: number;
}

export interface GetTeamResponse {
  team: TeamWithMembers;
}

class TeamService {
  // Get user's teams
  async getTeams(): Promise<ApiResponse<GetTeamsResponse>> {
    try {
      const response = await api.get('/teams');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Get team details with members
  async getTeam(teamId: string): Promise<ApiResponse<GetTeamResponse>> {
    try {
      const response = await api.get(`/teams/${teamId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Create new team
  async createTeam(data: CreateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      const response = await api.post('/teams', data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update team
  async updateTeam(teamId: string, data: UpdateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      const response = await api.patch(`/teams/${teamId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Delete team
  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/teams/${teamId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Add team member
  async addMember(teamId: string, data: AddMemberRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.post(`/teams/${teamId}/members`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Update member role
  async updateMember(teamId: string, userId: string, data: UpdateMemberRequest): Promise<ApiResponse<any>> {
    try {
      const response = await api.patch(`/teams/${teamId}/members/${userId}`, data);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Remove team member
  async removeMember(teamId: string, userId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/teams/${teamId}/members/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Error handling helper
  private handleError(error: any): Error {
    if (error.response?.data?.error) {
      return new Error(error.response.data.error.message || 'Team operation failed');
    }
    return new Error(error.message || 'An unexpected error occurred');
  }
}

export default new TeamService();
