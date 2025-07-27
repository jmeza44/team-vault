import React, { useState } from 'react';
import { Credential, RiskLevel, AccessLevel } from '@/types';
import { Copy, Eye, Edit, Share, Trash2, AlertTriangle, Clock } from 'lucide-react';
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
    day: 'numeric'
  });
};

const isExpiringSoon = (expirationDate?: string) => {
  if (!expirationDate) return false;
  const expiry = new Date(expirationDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
  onShare
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
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {credential.name}
          </h3>
          {credential.username && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span className="mr-2 truncate">{credential.username}</span>
              <button
                onClick={handleCopyUsername}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex-shrink-0 p-1 min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Copy username"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Risk Level Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(credential.riskLevel)}`}>
            {credential.riskLevel}
          </span>
          {permissions.isOwner && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              Owner
            </span>
          )}
          {!permissions.isOwner && permissions.accessLevel && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              {permissions.accessLevel === AccessLevel.WRITE ? 'Read & Write' : 'Read Only'}
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
          <div className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden w-full">
            <button
              onClick={handleOpenUrl}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline truncate w-full text-start"
            >
              {credential.url}
            </button>
          </div>
        )}

        {/* Description */}
        {credential.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {credential.description}
          </p>
        )}

        {/* Tags */}
        {credential.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {credential.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {credential.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                +{credential.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {credential.expirationDate && (
          <div className="text-sm">
            {isExpired(credential.expirationDate) ? (
              <span className="text-red-600 dark:text-red-400 font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Expired on {formatDate(credential.expirationDate)}
              </span>
            ) : isExpiringSoon(credential.expirationDate) ? (
              <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center">
                <Clock className="h-4 w-4 mr-1" />
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
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Updated {formatDate(credential.updatedAt)}</span>
        {credential.lastRotated && (
          <span>Last rotated {formatDate(credential.lastRotated)}</span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex gap-1">
          {permissions.canView && (
            <button
              onClick={() => onView(credential)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {permissions.canEdit && (
            <button
              onClick={() => onEdit(credential)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {permissions.canShare && (
            <button
              onClick={() => onShare(credential)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Share"
            >
              <Share className="h-4 w-4" />
            </button>
          )}
          {permissions.canDelete && (
            <button
              onClick={() => onDelete(credential)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded min-h-[36px] min-w-[36px] flex items-center justify-center"
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
