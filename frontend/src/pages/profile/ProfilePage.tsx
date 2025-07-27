import React, { useState, useEffect } from 'react';
import { User, Lock, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserType } from '@/types';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { SettingsForm } from '@/components/profile/SettingsForm';

type ProfileTab = 'profile' | 'password' | 'settings';

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
  ] as const;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account information and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsEditing(false);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="inline h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'profile' && (
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Personal Information</h2>
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
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.name}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Email</label>
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.email}
                      {!user.emailVerified && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          Unverified
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Role</label>
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {user.role}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Member Since</label>
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <label className="form-label">Last Login</label>
                      <div className="text-gray-900 dark:text-gray-100 font-medium">
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Change Password</h2>
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
      </div>
    </div>
  );
};
