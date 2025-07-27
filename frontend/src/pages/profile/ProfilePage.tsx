import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account information</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Personal Information</h2>
        </div>
        <div className="card-body space-y-4">
          <div>
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={user?.name || ''}
              readOnly
            />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email || ''}
              readOnly
            />
          </div>
          <div>
            <label className="form-label">Role</label>
            <input
              type="text"
              className="form-input"
              value={user?.role || ''}
              readOnly
            />
          </div>
        </div>
        <div className="card-footer">
          <button className="btn-primary">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
