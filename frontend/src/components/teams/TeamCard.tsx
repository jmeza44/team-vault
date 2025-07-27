import React, { useState } from 'react';
import { Eye, Users, Edit, Trash2, Lock } from 'lucide-react';
import { Team, TeamRole, TeamWithMembers } from '@/types';
import { getUserRole, isTeamAdmin, formatDate } from '@/utils';

interface TeamCardProps {
  team: Team | TeamWithMembers;
  onView: (team: Team | TeamWithMembers) => void;
  onEdit: (team: Team | TeamWithMembers) => void;
  onDelete: (team: Team | TeamWithMembers) => void;
  currentUserId?: string;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  onView,
  onEdit,
  onDelete,
  currentUserId,
}) => {
  const [showActions, setShowActions] = useState(false);

  const isWithMembers = 'memberships' in team && team.memberships;
  const memberCount = isWithMembers
    ? (team as TeamWithMembers).memberCount ||
      (team as TeamWithMembers).memberships?.length ||
      0
    : 0;
  const userRole =
    isWithMembers && currentUserId
      ? getUserRole(team as TeamWithMembers, currentUserId)
      : null;
  const isAdmin =
    isWithMembers && currentUserId
      ? isTeamAdmin(team as TeamWithMembers, currentUserId)
      : false;

  return (
    <div
      className="relative cursor-pointer touch-manipulation rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={() => onView(team)}
    >
      {/* Header */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {team.name}
          </h3>
          {team.description && (
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
              {team.description}
            </p>
          )}
        </div>

        {/* User Role Badge */}
        {userRole && (
          <div className="flex-shrink-0">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                userRole === TeamRole.ADMIN
                  ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800/20 dark:text-secondary-100'
                  : 'bg-primary-100 text-primary-800 dark:bg-primary-800/20 dark:text-primary-100'
              }`}
            >
              {userRole}
            </span>
          </div>
        )}
      </div>

      {/* Team Stats */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <Users className="mr-1 h-4 w-4" />
            <span>
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
          <div className="flex items-center">
            <Lock className="mr-1 h-4 w-4" />
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
        <div className="absolute right-2 top-2 flex gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={e => {
              e.stopPropagation();
              onView(team);
            }}
            className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {isAdmin && (
            <>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onEdit(team);
                }}
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-500 transition-colors hover:bg-yellow-50 hover:text-yellow-600 dark:text-gray-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-400"
                title="Edit Team"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={e => {
                  e.stopPropagation();
                  onDelete(team);
                }}
                className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                title="Delete Team"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
