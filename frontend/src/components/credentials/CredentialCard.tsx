import React, { useState } from 'react';
import { Credential, RiskLevel, AccessLevel } from '@/types';
import {
  Copy,
  Eye,
  Edit,
  Share,
  Trash2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface CredentialCardProps {
  credential: Credential;
  onView: (credential: Credential) => void;
  onEdit: (credential: Credential) => void;
  onDelete: (credential: Credential) => void;
  onShare: (credential: Credential) => void;
}

const getRiskLevelColor = (riskLevel: RiskLevel) => {
  switch (riskLevel) {
    case RiskLevel.LOW:
      return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
    case RiskLevel.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    case RiskLevel.HIGH:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100';
    case RiskLevel.CRITICAL:
      return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const isExpiringSoon = (expirationDate?: string) => {
  if (!expirationDate) return false;
  const expiry = new Date(expirationDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
};

const isExpired = (expirationDate?: string) => {
  if (!expirationDate) return false;
  return new Date(expirationDate) < new Date();
};

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  onView,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { getCredentialPermissions } = usePermissions();
  const permissions = getCredentialPermissions(credential);

  const handleCopyUsername = async () => {
    if (credential.username) {
      await navigator.clipboard.writeText(credential.username);
      // TODO: Show toast notification
    }
  };

  const handleOpenUrl = () => {
    if (credential.url) {
      window.open(credential.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {credential.name}
          </h3>
          {credential.username && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="mr-2 truncate">{credential.username}</span>
              <button
                onClick={handleCopyUsername}
                className="flex min-h-[32px] min-w-[32px] flex-shrink-0 items-center justify-center p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="Copy username"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Risk Level Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium ${getRiskLevelColor(credential.riskLevel)}`}
          >
            {credential.riskLevel}
          </span>
          {permissions.isOwner && (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Owner
            </span>
          )}
          {!permissions.isOwner && permissions.accessLevel && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {permissions.accessLevel === AccessLevel.WRITE
                ? 'Read & Write'
                : 'Read Only'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Category */}
        {credential.category && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Category:</span> {credential.category}
          </div>
        )}

        {/* URL */}
        {credential.url && (
          <div className="w-full overflow-hidden text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={handleOpenUrl}
              className="w-full truncate text-start text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {credential.url}
            </button>
          </div>
        )}

        {/* Description */}
        {credential.description && (
          <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
            {credential.description}
          </p>
        )}

        {/* Tags */}
        {credential.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {credential.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {credential.tags.length > 3 && (
              <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                +{credential.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {credential.expirationDate && (
          <div className="text-sm">
            {isExpired(credential.expirationDate) ? (
              <span className="flex items-center font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="mr-1 h-4 w-4" />
                Expired on {formatDate(credential.expirationDate)}
              </span>
            ) : isExpiringSoon(credential.expirationDate) ? (
              <span className="flex items-center font-medium text-orange-600 dark:text-orange-400">
                <Clock className="mr-1 h-4 w-4" />
                Expires {formatDate(credential.expirationDate)}
              </span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                Expires {formatDate(credential.expirationDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <span>Updated {formatDate(credential.updatedAt)}</span>
        {credential.lastRotated && (
          <span>Last rotated {formatDate(credential.lastRotated)}</span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute right-2 top-2 flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {permissions.canView && (
            <button
              onClick={() => onView(credential)}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {permissions.canEdit && (
            <button
              onClick={() => onEdit(credential)}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-600 hover:bg-green-50 hover:text-green-600 dark:text-gray-400 dark:hover:bg-green-900/20 dark:hover:text-green-400"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {permissions.canShare && (
            <button
              onClick={() => onShare(credential)}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-600 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
              title="Share"
            >
              <Share className="h-4 w-4" />
            </button>
          )}
          {permissions.canDelete && (
            <button
              onClick={() => onDelete(credential)}
              className="flex min-h-[36px] min-w-[36px] items-center justify-center rounded p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
