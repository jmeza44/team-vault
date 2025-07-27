import React, { useState } from 'react';
import { Team, TeamRole } from '@/types';
import { TeamWithMembers } from '@/services/teamService';

interface TeamCardProps {
  team: Team | TeamWithMembers;
  onView: (team: Team | TeamWithMembers) => void;
  onEdit: (team: Team | TeamWithMembers) => void;
  onDelete: (team: Team | TeamWithMembers) => void;
  onManageMembers: (team: Team | TeamWithMembers) => void;
  currentUserId?: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getUserRole = (team: TeamWithMembers, userId: string): TeamRole | null => {
  if (!('memberships' in team) || !team.memberships) return null;
  const membership = team.memberships.find(m => m.userId === userId);
  return membership?.role || null;
};

const isTeamAdmin = (team: TeamWithMembers, userId: string): boolean => {
  const role = getUserRole(team, userId);
  return role === TeamRole.ADMIN;
};

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onView,
  onEdit,
  onDelete,
  onManageMembers,
  currentUserId
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const isWithMembers = 'memberships' in team && team.memberships;
  const memberCount = isWithMembers ? (team as TeamWithMembers).memberCount || (team as TeamWithMembers).memberships?.length || 0 : 0;
  const userRole = isWithMembers && currentUserId ? getUserRole(team as TeamWithMembers, currentUserId) : null;
  const isAdmin = isWithMembers && currentUserId ? isTeamAdmin(team as TeamWithMembers, currentUserId) : false;

  return (
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow relative cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView(team)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {team.name}
          </h3>
          {team.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {team.description}
            </p>
          )}
        </div>
        
        {/* User Role Badge */}
        {userRole && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            userRole === TeamRole.ADMIN 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {userRole}
          </span>
        )}
      </div>

      {/* Team Stats */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-10V3a4 4 0 10-8 0v4a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4v-8a4 4 0 00-4-4z" />
            </svg>
            <span>Team Vault</span>
          </div>
        </div>
      </div>

      {/* Created Date */}
      <div className="text-xs text-gray-400">
        Created {formatDate(team.createdAt)}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 flex space-x-1 bg-white rounded-md shadow-lg border border-gray-200 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(team);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onManageMembers(team);
            }}
            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Manage Members"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>

          {isAdmin && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(team);
                }}
                className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                title="Edit Team"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Team"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
