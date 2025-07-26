import axios from 'axios';
import { ApiResponse, Credential } from '@/types';

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

export interface UpdateCredentialRequest extends Partial<CreateCredentialRequest> {}

export interface GetCredentialsParams {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ShareCredentialRequest {
  sharedWithUserId?: string;
  sharedWithTeamId?: string;
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}

export interface CreateOneTimeLinkRequest {
  accessLevel?: 'READ' | 'WRITE';
  expiresAt?: string;
}

export const credentialService = {
  // Get all credentials
  async getCredentials(params?: GetCredentialsParams): Promise<ApiResponse<{ credentials: Credential[]; pagination: any }>> {
    const response = await api.get('/credentials', { params });
    return response.data;
  },

  // Get credential by ID
  async getCredentialById(id: string): Promise<ApiResponse<{ credential: Credential & { secret: string } }>> {
    const response = await api.get(`/credentials/${id}`);
    return response.data;
  },

  // Create new credential
  async createCredential(data: CreateCredentialRequest): Promise<ApiResponse<{ credential: Credential; message: string }>> {
    const response = await api.post('/credentials', data);
    return response.data;
  },

  // Update credential
  async updateCredential(id: string, data: UpdateCredentialRequest): Promise<ApiResponse<{ credential: Credential; message: string }>> {
    const response = await api.patch(`/credentials/${id}`, data);
    return response.data;
  },

  // Delete credential
  async deleteCredential(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete(`/credentials/${id}`);
    return response.data;
  },

  // Share credential
  async shareCredential(id: string, data: ShareCredentialRequest): Promise<ApiResponse<{ share: any; message: string }>> {
    const response = await api.post(`/credentials/${id}/share`, data);
    return response.data;
  },

  // Create one-time link
  async createOneTimeLink(id: string, data: CreateOneTimeLinkRequest): Promise<ApiResponse<{ link: any; message: string }>> {
    const response = await api.post(`/credentials/${id}/one-time-link`, data);
    return response.data;
  },
};
