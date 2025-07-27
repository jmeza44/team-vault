import axios, { AxiosResponse } from 'axios';
import { ApiResponse, User } from '@/types';

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

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    credentialExpiry: boolean;
    securityAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
  };
  privacy: {
    shareUsageData: boolean;
  };
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    credentialExpiry?: boolean;
    securityAlerts?: boolean;
  };
  security?: {
    sessionTimeout?: number;
  };
  privacy?: {
    shareUsageData?: boolean;
  };
}

export class UserService {
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to get profile' } };
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User; message: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; message: string }>> = await api.patch('/users/profile', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to update profile' } };
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await api.patch('/users/password', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to change password' } };
    }
  }

  async getSettings(): Promise<ApiResponse<{ settings: UserSettings }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ settings: UserSettings }>> = await api.get('/users/settings');
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to get settings' } };
    }
  }

  async updateSettings(data: UpdateSettingsRequest): Promise<ApiResponse<{ message: string; settings: UserSettings }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string; settings: UserSettings }>> = await api.patch('/users/settings', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to update settings' } };
    }
  }
}

export const userService = new UserService();
