import React, { useState } from 'react';
import { Team, TeamRole } from '@/types';
import { TeamWithMembers } from '@/services/teamService';
import { Eye, Users, Edit, Trash2, Lock } from 'lucide-react';

interface TeamCardProps {
  team: Team | TeamWithMembers;
  onView: (team: Team | TeamWithMembers) => void;
  onEdit: (team: Team | TeamWithMembers) => void;
  onDelete: (team: Team | TeamWithMembers) => void;
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
            <Users className="w-4 h-4 mr-1" />
            <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
          </div>
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-1" />
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
            <Eye className="w-4 h-4" />
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
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete Team"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
