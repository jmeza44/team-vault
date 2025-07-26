import React, { useState } from 'react';
import { Credential, RiskLevel } from '@/types';

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
      return 'bg-green-100 text-green-800';
    case RiskLevel.MEDIUM:
      return 'bg-yellow-100 text-yellow-800';
    case RiskLevel.HIGH:
      return 'bg-orange-100 text-orange-800';
    case RiskLevel.CRITICAL:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {credential.name}
          </h3>
          {credential.username && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">{credential.username}</span>
              <button
                onClick={handleCopyUsername}
                className="text-blue-600 hover:text-blue-800"
                title="Copy username"
              >
                📋
              </button>
            </div>
          )}
        </div>

        {/* Risk Level Badge */}
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(credential.riskLevel)}`}>
          {credential.riskLevel}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Category */}
        {credential.category && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Category:</span> {credential.category}
          </div>
        )}

        {/* URL */}
        {credential.url && (
          <div className="text-sm text-gray-600">
            <button
              onClick={handleOpenUrl}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {credential.url}
            </button>
          </div>
        )}

        {/* Description */}
        {credential.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {credential.description}
          </p>
        )}

        {/* Tags */}
        {credential.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {credential.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
            {credential.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                +{credential.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Expiration Warning */}
        {credential.expirationDate && (
          <div className="text-sm">
            {isExpired(credential.expirationDate) ? (
              <span className="text-red-600 font-medium">
                ⚠️ Expired on {formatDate(credential.expirationDate)}
              </span>
            ) : isExpiringSoon(credential.expirationDate) ? (
              <span className="text-orange-600 font-medium">
                ⏰ Expires {formatDate(credential.expirationDate)}
              </span>
            ) : (
              <span className="text-gray-600">
                Expires {formatDate(credential.expirationDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Updated {formatDate(credential.updatedAt)}</span>
        {credential.lastRotated && (
          <span>Last rotated {formatDate(credential.lastRotated)}</span>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="absolute top-2 right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex space-x-1">
          <button
            onClick={() => onView(credential)}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="View details"
          >
            👁️
          </button>
          <button
            onClick={() => onEdit(credential)}
            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onShare(credential)}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="Share"
          >
            🔗
          </button>
          <button
            onClick={() => onDelete(credential)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
};
