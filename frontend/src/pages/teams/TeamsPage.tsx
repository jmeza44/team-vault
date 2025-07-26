import React from 'react';

export const TeamsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and members</p>
        </div>
        <button className="btn-primary">
          Create Team
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <p className="text-center text-gray-500 py-8">
            No teams found. Create your first team to start collaborating.
          </p>
        </div>
      </div>
    </div>
  );
};
