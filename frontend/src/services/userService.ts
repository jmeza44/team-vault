import { AxiosResponse } from 'axios';
import { ApiResponse, User } from '@/types';
import { apiClient } from './apiClient';

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
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await apiClient.get('/users/profile');
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to get profile' } };
    }
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<{ user: User; message: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; message: string }>> = await apiClient.patch('/users/profile', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to update profile' } };
    }
  }

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.patch('/users/password', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to change password' } };
    }
  }

  async getSettings(): Promise<ApiResponse<{ settings: UserSettings }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ settings: UserSettings }>> = await apiClient.get('/users/settings');
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to get settings' } };
    }
  }

  async updateSettings(data: UpdateSettingsRequest): Promise<ApiResponse<{ message: string; settings: UserSettings }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: string; settings: UserSettings }>> = await apiClient.patch('/users/settings', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, error: { message: 'Failed to update settings' } };
    }
  }
}

export const userService = new UserService();
