import { AxiosResponse } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types';
import { apiClient } from '@/services';

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> =
        await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Login failed',
          statusCode: error.response?.status,
        },
      };
    }
  },

  async register(data: RegisterRequest): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.post(
        '/auth/register',
        data
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || 'Registration failed',
          statusCode: error.response?.status,
        },
      };
    }
  },

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ accessToken: string }>> =
        await apiClient.post('/auth/refresh', {
          refreshToken,
        });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || 'Token refresh failed',
          statusCode: error.response?.status,
        },
      };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> =
        await apiClient.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Logout failed',
          statusCode: error.response?.status,
        },
      };
    }
  },

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: any }>> =
        await apiClient.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || 'Failed to get profile',
          statusCode: error.response?.status,
        },
      };
    }
  },
};
