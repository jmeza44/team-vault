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