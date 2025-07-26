import React from 'react';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your application preferences</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-factor authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button className="btn-outline">Enable</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Session timeout</h3>
              <p className="text-sm text-gray-500">Automatically sign out after period of inactivity</p>
            </div>
            <select className="form-input w-32">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Email notifications</h3>
              <p className="text-sm text-gray-500">Receive email alerts for important events</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-primary-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Expiration alerts</h3>
              <p className="text-sm text-gray-500">Get notified when credentials are about to expire</p>
            </div>
            <input type="checkbox" className="h-4 w-4 text-primary-600" defaultChecked />
          </div>
        </div>
      </div>
    </div>
  );
};
