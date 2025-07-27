import { RiskLevel } from '@/types';

export const getRiskLevelColor = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case RiskLevel.LOW:
      return 'bg-success-100 text-success-800 dark:bg-success-800/20 dark:text-success-100';
    case RiskLevel.MEDIUM:
      return 'bg-warning-100 text-warning-800 dark:bg-warning-800/20 dark:text-warning-100';
    case RiskLevel.HIGH:
      return 'bg-warning-200 text-warning-900 dark:bg-warning-700/20 dark:text-warning-200';
    case RiskLevel.CRITICAL:
      return 'bg-danger-100 text-danger-800 dark:bg-danger-800/20 dark:text-danger-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isExpiringSoon = (expirationDate?: string) => {
  if (!expirationDate) return false;
  const expiry = new Date(expirationDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

export const isExpired = (expirationDate?: string) => {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
};