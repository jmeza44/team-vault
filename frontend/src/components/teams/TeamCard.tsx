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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow relative cursor-pointer touch-manipulation"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView(team)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {team.name}
          </h3>
          {team.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {team.description}
            </p>
          )}
        </div>
        
        {/* User Role Badge */}
        {userRole && (
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              userRole === TeamRole.ADMIN 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
            }`}>
              {userRole}
            </span>
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
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
      <div className="text-xs text-gray-400 dark:text-gray-500">
        Created {formatDate(team.createdAt)}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(team);
            }}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Edit Team"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
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
