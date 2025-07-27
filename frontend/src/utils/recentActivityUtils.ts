import { RecentActivity } from '@/types';

export const generateActivityDescription = (activity: RecentActivity): string => {
  const userName = activity.userName;
  const resourceName = activity.resourceName;

  switch (activity.type) {
    case 'CREDENTIAL_CREATED':
      return resourceName
        ? `${userName} created credential "${resourceName}"`
        : `${userName} created a new credential`;
    case 'CREDENTIAL_UPDATED':
      return resourceName
        ? `${userName} updated credential "${resourceName}"`
        : `${userName} updated a credential`;
    case 'CREDENTIAL_DELETED':
      return resourceName
        ? `${userName} deleted credential "${resourceName}"`
        : `${userName} deleted a credential`;
    case 'CREDENTIAL_ACCESSED':
      return resourceName
        ? `${userName} accessed credential "${resourceName}"`
        : `${userName} accessed a credential`;
    case 'CREDENTIAL_SHARED':
      return resourceName
        ? `${userName} shared credential "${resourceName}"`
        : `${userName} shared a credential`;
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

export const getActivityColor = (type: RecentActivity['type']) => {
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

export const formatTimeAgo = (timestamp: string) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - time.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return time.toLocaleDateString();
};