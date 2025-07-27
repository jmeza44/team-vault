import React from 'react';
import { RecentActivity } from '@/types';
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
  FileText 
} from 'lucide-react';

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

const generateActivityDescription = (activity: RecentActivity): string => {
  const userName = activity.userName;
  const resourceName = activity.resourceName;
  
  switch (activity.type) {
    case 'CREDENTIAL_CREATED':
      return resourceName ? `${userName} created credential "${resourceName}"` : `${userName} created a new credential`;
    case 'CREDENTIAL_UPDATED':
      return resourceName ? `${userName} updated credential "${resourceName}"` : `${userName} updated a credential`;
    case 'CREDENTIAL_DELETED':
      return resourceName ? `${userName} deleted credential "${resourceName}"` : `${userName} deleted a credential`;
    case 'CREDENTIAL_ACCESSED':
      return resourceName ? `${userName} accessed credential "${resourceName}"` : `${userName} accessed a credential`;
    case 'CREDENTIAL_SHARED':
      return resourceName ? `${userName} shared credential "${resourceName}"` : `${userName} shared a credential`;
    case 'TEAM_CREATED':
      return `${userName} created a new team`;
    case 'TEAM_MEMBER_ADDED':
      return `${userName} added a member to the team`;
    case 'TEAM_MEMBER_REMOVED':
      return `${userName} removed a member from the team`;
    case 'USER_LOGIN':
      return `${userName} logged in`;
    case 'SECURITY_ALERT':
      return activity.description || `Security alert triggered by ${userName}`;
    default:
      return activity.description || `${userName} performed an action`;
  }
};

const getActivityColor = (type: RecentActivity['type']) => {
  switch (type) {
    case 'CREDENTIAL_CREATED':
    case 'TEAM_CREATED':
    case 'TEAM_MEMBER_ADDED':
    case 'USER_LOGIN':
      return 'text-success-600 dark:text-success-400';
    case 'CREDENTIAL_DELETED':
    case 'TEAM_MEMBER_REMOVED':
    case 'SECURITY_ALERT':
      return 'text-danger-600 dark:text-danger-400';
    case 'CREDENTIAL_UPDATED':
    case 'CREDENTIAL_SHARED':
      return 'text-warning-600 dark:text-warning-400';
    case 'CREDENTIAL_ACCESSED':
      return 'text-info-600 dark:text-info-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return time.toLocaleDateString();
};

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  isLoading = false,
  maxItems = 10
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="animate-pulse flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex justify-center mb-2">
          <FileText size={48} className="text-gray-400 dark:text-gray-600" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No recent activity to display.</p>
      </div>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayedActivities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)} bg-gray-100 dark:bg-gray-700`}>
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {generateActivityDescription(activity)}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          </div>
        </div>
      ))}
      {activities.length > maxItems && (
        <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {maxItems} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
};
