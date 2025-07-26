import React from 'react';

export const CredentialsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="text-gray-600">Manage your team's secure credentials</p>
        </div>
        <button className="btn-primary">
          Add Credential
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-center text-gray-500 py-8">
            No credentials found. Start by adding your first credential.
          </p>
        </div>
      </div>
    </div>
  );
};
