import { AddMemberRequest, ApiResponse, CreateTeamRequest, GetTeamResponse, GetTeamsResponse, Team, UpdateMemberRequest, UpdateTeamRequest } from '@/types';
import { apiClient } from '@/services';

function handleError(error: any): Error {
  if (error.response?.data?.error) {
    return new Error(
      error.response.data.error.message || 'Team operation failed'
    );
  }
  return new Error(error.message || 'An unexpected error occurred');
}

export const teamService = {
  // Get user's teams
  async getTeams(): Promise<ApiResponse<GetTeamsResponse>> {
    try {
      const response = await apiClient.get('/teams');
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Get team details with members
  async getTeam(teamId: string): Promise<ApiResponse<GetTeamResponse>> {
    try {
      const response = await apiClient.get(`/teams/${teamId}`);
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Create new team
  async createTeam(data: CreateTeamRequest): Promise<ApiResponse<Team>> {
    try {
      const response = await apiClient.post('/teams', data);
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Update team
  async updateTeam(
    teamId: string,
    data: UpdateTeamRequest
  ): Promise<ApiResponse<Team>> {
    try {
      const response = await apiClient.patch(`/teams/${teamId}`, data);
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Delete team
  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/teams/${teamId}`);
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Add team member
  async addMember(
    teamId: string,
    data: AddMemberRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/teams/${teamId}/members`, data);
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Update member role
  async updateMember(
    teamId: string,
    userId: string,
    data: UpdateMemberRequest
  ): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.patch(
        `/teams/${teamId}/members/${userId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Remove team member
  async removeMember(
    teamId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(
        `/teams/${teamId}/members/${userId}`
      );
      return response.data;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  // Error handling helper
};