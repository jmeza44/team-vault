import React, { useState, useEffect } from 'react';
import { User, Lock, Settings, Palette } from 'lucide-react';
import { PatternSelector } from '@/components/common';
import {
  ProfileForm,
  ChangePasswordForm,
  SettingsForm,
} from '@/components/profile';
import { useAuth } from '@/contexts';
import { User as UserType } from '@/types';

type ProfileTab = 'profile' | 'password' | 'settings' | 'appearance';

export const ProfilePage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUserState] = useState<UserType | null>(authUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setUserState(authUser);
  }, [authUser]);

  const handleProfileUpdate = (updatedUser: UserType) => {
    setUserState(updatedUser);
    updateUser(updatedUser);
    setIsEditing(false);
  };

  const handlePasswordChangeSuccess = () => {
    setActiveTab('profile');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ] as const;

  if (!user) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Manage your account information and preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="overflow-x-auto overflow-y-hidden border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex min-w-max space-x-4 px-1 md:space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsEditing(false);
              }}
              className={`flex min-h-[44px] items-center whitespace-nowrap border-b-2 px-2 py-3 text-sm font-medium md:px-1 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs sm:hidden">
                {tab.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Personal Information
              </h2>
            </div>
            <div className="card-body">
              {isEditing ? (
                <ProfileForm
                  user={user}
                  onUpdate={handleProfileUpdate}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Name</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {user.email}
                      {!user.emailVerified && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-warning-100 px-2.5 py-0.5 text-xs font-medium text-warning-800 dark:bg-warning-900/20 dark:text-warning-200">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {user.role}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Member Since</label>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <label className="form-label">Last Login</label>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(user.lastLoginAt).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {!isEditing && (
              <div className="card-footer">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'password' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Change Password
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ensure your account is secure by using a strong password
              </p>
            </div>
            <div className="card-body">
              <ChangePasswordForm
                onSuccess={handlePasswordChangeSuccess}
                onCancel={() => setActiveTab('profile')}
              />
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <SettingsForm onCancel={() => setActiveTab('profile')} />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Appearance Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize the visual appearance of your Team Vault experience
              </p>
            </div>
            <div className="card-body">
              <PatternSelector
                onPatternChange={() => {
                  // Pattern change is handled automatically by the component
                  // Could add analytics or notifications here if needed
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
