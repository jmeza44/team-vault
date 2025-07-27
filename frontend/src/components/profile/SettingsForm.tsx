import React, { useState, useEffect } from 'react';
import { userService, UserSettings, UpdateSettingsRequest } from '@/services/userService';
import { useAlertActions } from '@/hooks/useAlerts';

interface SettingsFormProps {
  onCancel: () => void;
}

export const SettingsForm: React.FC<SettingsFormProps> = ({ onCancel }) => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [formData, setFormData] = useState<UpdateSettingsRequest>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const { showSuccess, showError } = useAlertActions();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await userService.getSettings();
      
      if (response.success && response.data?.settings) {
        setSettings(response.data.settings);
        setFormData(response.data.settings);
      } else {
        showError('Load Failed', 'Failed to load settings');
      }
    } catch (error) {
      showError('Load Failed', 'Failed to load settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.updateSettings(formData);
      
      if (response.success) {
        showSuccess('Settings updated successfully');
        if (response.data?.settings) {
          setSettings(response.data.settings);
        }
      } else {
        showError('Update Failed', response.error?.message || 'Failed to update settings');
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setFormData(prev => ({
      ...prev,
      theme,
    }));
  };

  const handleNotificationChange = (field: keyof NonNullable<UpdateSettingsRequest['notifications']>, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const handleSecurityChange = (field: keyof NonNullable<UpdateSettingsRequest['security']>, value: number) => {
    setFormData(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [field]: value,
      },
    }));
  };

  const handlePrivacyChange = (field: keyof NonNullable<UpdateSettingsRequest['privacy']>, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-300">Failed to load settings</p>
        <button onClick={loadSettings} className="mt-2 btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Theme Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Theme Preferences</h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {(['light', 'dark', 'system'] as const).map((theme) => (
              <label key={theme} className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="theme"
                  value={theme}
                  checked={formData.theme === theme}
                  onChange={() => handleThemeChange(theme)}
                  className="form-radio"
                  disabled={isLoading}
                />
                <span className="capitalize">{theme}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Notification Preferences</h3>
        </div>
        <div className="card-body space-y-4">
          <label className="flex items-center justify-between">
            <span>Email notifications</span>
            <input
              type="checkbox"
              checked={formData.notifications?.email ?? settings.notifications.email}
              onChange={(e) => handleNotificationChange('email', e.target.checked)}
              className="form-checkbox"
              disabled={isLoading}
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>Credential expiry alerts</span>
            <input
              type="checkbox"
              checked={formData.notifications?.credentialExpiry ?? settings.notifications.credentialExpiry}
              onChange={(e) => handleNotificationChange('credentialExpiry', e.target.checked)}
              className="form-checkbox"
              disabled={isLoading}
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span>Security alerts</span>
            <input
              type="checkbox"
              checked={formData.notifications?.securityAlerts ?? settings.notifications.securityAlerts}
              onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
              className="form-checkbox"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Security Settings</h3>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Session timeout (minutes)</label>
            <input
              type="number"
              min="5"
              max="480"
              value={formData.security?.sessionTimeout ?? settings.security.sessionTimeout}
              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
              className="form-input"
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500 mt-1">
              Automatically log out after this period of inactivity (5-480 minutes)
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                Two-factor authentication is not yet available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium">Privacy Settings</h3>
        </div>
        <div className="card-body">
          <label className="flex items-center justify-between">
            <span>Share usage data to improve the service</span>
            <input
              type="checkbox"
              checked={formData.privacy?.shareUsageData ?? settings.privacy.shareUsageData}
              onChange={(e) => handlePrivacyChange('shareUsageData', e.target.checked)}
              className="form-checkbox"
              disabled={isLoading}
            />
          </label>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
