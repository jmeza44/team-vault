import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Share2,
  Users,
  UserPlus,
  UserMinus,
  LogIn,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { RecentActivity } from '@/types';
import {
  formatTimeAgo,
  generateActivityDescription,
  getActivityColor,
} from '@/utils';

interface RecentActivityListProps {
  activities: RecentActivity[];
  isLoading?: boolean;
  maxItems?: number;
}

const getActivityIcon = (type: RecentActivity['type']) => {
  switch (type) {
    case 'CREDENTIAL_CREATED':
      return <Plus size={16} />;
    case 'CREDENTIAL_UPDATED':
      return <Edit3 size={16} />;
    case 'CREDENTIAL_DELETED':
      return <Trash2 size={16} />;
    case 'CREDENTIAL_ACCESSED':
      return <Eye size={16} />;
    case 'CREDENTIAL_SHARED':
      return <Share2 size={16} />;
    case 'TEAM_CREATED':
      return <Users size={16} />;
    case 'TEAM_MEMBER_ADDED':
      return <UserPlus size={16} />;
    case 'TEAM_MEMBER_REMOVED':
      return <UserMinus size={16} />;
    case 'USER_LOGIN':
      return <LogIn size={16} />;
    case 'SECURITY_ALERT':
      return <AlertTriangle size={16} />;
    default:
      return <FileText size={16} />;
  }
};

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  isLoading = false,
  maxItems = 10,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-start space-x-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 flex justify-center">
          <FileText size={48} className="text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          No recent activity to display.
        </p>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayedActivities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <div className="flex-shrink-0">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${getActivityColor(activity.type)} bg-gray-100 dark:bg-gray-700`}
            >
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {generateActivityDescription(activity)}
            </p>
            <div className="mt-1 flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      {activities.length > maxItems && (
        <div className="border-t border-gray-200 pt-3 text-center dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
};
