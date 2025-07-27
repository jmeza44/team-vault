import { ApiResponse, Credential } from '@/types';
import { apiClient } from './apiClient';

export interface CreateCredentialRequest {
  name: string;
  username?: string;
  secret: string;
  description?: string;
  category?: string;
  url?: string;
  tags?: string[];
  expirationDate?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface UpdateCredentialRequest
  extends Partial<CreateCredentialRequest> {}

export interface GetCredentialsParams {
  category?: string;
  search?: string;
  teamId?: string;
  limit?: number;
  offset?: number;
}

export interface ShareCredentialRequest {
  userIds?: string[];
  teamIds?: string[];
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}

export interface CreateOneTimeLinkRequest {
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}

export const credentialService = {
  // Get all credentials
  async getCredentials(
    params?: GetCredentialsParams
  ): Promise<ApiResponse<{ credentials: Credential[]; pagination: any }>> {
    const response = await apiClient.get('/credentials', { params });
    return response.data;
  },

  // Get credential by ID
  async getCredentialById(
    id: string
  ): Promise<ApiResponse<{ credential: Credential & { secret: string } }>> {
    const response = await apiClient.get(`/credentials/${id}`);
    return response.data;
  },

  // Create new credential
  async createCredential(
    data: CreateCredentialRequest
  ): Promise<ApiResponse<{ credential: Credential; message: string }>> {
    const response = await apiClient.post('/credentials', data);
    return response.data;
  },

  // Update credential
  async updateCredential(
    id: string,
    data: UpdateCredentialRequest
  ): Promise<ApiResponse<{ credential: Credential; message: string }>> {
    const response = await apiClient.patch(`/credentials/${id}`, data);
    return response.data;
  },

  // Delete credential
  async deleteCredential(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(`/credentials/${id}`);
    return response.data;
  },

  // Share credential
  async shareCredential(
    id: string,
    data: ShareCredentialRequest
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.post(`/credentials/${id}/share`, data);
    return response.data;
  },

  // Get credential shares
  async getCredentialShares(
    id: string
  ): Promise<ApiResponse<{ shares: any[] }>> {
    const response = await apiClient.get(`/credentials/${id}/shares`);
    return response.data;
  },

  // Remove credential share
  async removeCredentialShare(
    id: string,
    shareId: string
  ): Promise<ApiResponse<{ message: string }>> {
    const response = await apiClient.delete(
      `/credentials/${id}/shares/${shareId}`
    );
    return response.data;
  },

  // Create one-time link
  async createOneTimeLink(
    id: string,
    data: CreateOneTimeLinkRequest
  ): Promise<ApiResponse<{ link: any; message: string }>> {
    const response = await apiClient.post(
      `/credentials/${id}/one-time-link`,
      data
    );
    return response.data;
  },
};
