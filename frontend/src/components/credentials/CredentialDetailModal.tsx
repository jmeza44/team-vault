import React, { useState } from 'react';
import { Credential, RiskLevel, AccessLevel } from '@/types';
import { Copy, Eye, EyeOff, ExternalLink, X } from 'lucide-react';
import { Dialog } from '@/components/common/Dialog';
import { useToast } from '@/hooks/useToast';
import { usePermissions } from '@/hooks/usePermissions';

interface CredentialDetailModalProps {
  credential: Credential | null;
  isOpen: boolean;
  onClose: () => void;
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
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const CredentialDetailModal: React.FC<CredentialDetailModalProps> = ({
  credential,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onShare
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const { showCopySuccess, showCopyError } = useToast();
  const { getCredentialPermissions } = usePermissions();
  
  // Don't render if credential is not provided or modal is not open
  if (!isOpen || !credential) return null;
  
  const permissions = getCredentialPermissions(credential);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showCopySuccess(label);
    } catch (err) {
      showCopyError();
    }
  };

  const handleOpenUrl = () => {
    if (credential.url) {
      window.open(credential.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 truncate">
              {credential.name}
            </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRiskLevelColor(credential.riskLevel)}`}>
                  {credential.riskLevel} Risk
                </span>
                {credential.category && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full">
                    {credential.category}
                  </span>
                )}
                {permissions.isOwner && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-800 dark:text-blue-100">
                    Owner
                  </span>
                )}
                {!permissions.isOwner && permissions.accessLevel && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-full">
                    {permissions.accessLevel === AccessLevel.WRITE ? 'Read & Write Access' : 'Read Only Access'}
                  </span>
                )}
              </div>
          </div>
          
          {/* Close button - more prominent on mobile */}
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

        {/* Content */}
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Username */}
          {credential.username && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono text-gray-900 dark:text-gray-100">
                  {credential.username}
                </code>
                <button
                  onClick={() => handleCopy(credential.username!, 'Username')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Copy username"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Password/Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password/Secret
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={credential.secret || '••••••••••••'}
                  readOnly
                  className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono pr-12 text-gray-900 dark:text-gray-100"
                />
                {permissions.canCopySecret && (
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
              {permissions.canCopySecret && (
                <button
                  onClick={() => handleCopy(credential.secret || '', 'Secret')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Copy secret"
                  disabled={!credential.secret}
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* URL */}
          {credential.url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm font-mono break-all text-gray-900 dark:text-gray-100">
                  {credential.url}
                </code>
                <button
                  onClick={() => handleCopy(credential.url!, 'URL')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  title="Copy URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={handleOpenUrl}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  title="Open URL"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          {credential.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <p className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm text-gray-900 dark:text-gray-100">
                {credential.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {credential.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {credential.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-800 dark:text-blue-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credential.expirationDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Expires
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(credential.expirationDate)}
                </p>
              </div>
            )}
            {credential.lastRotated && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Rotated
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(credential.lastRotated)}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(credential.createdAt)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Updated
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(credential.updatedAt)}
              </p>
            </div>
          </div>

          {/* Owner */}
          {credential.owner && credential.owner.name && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Owner
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {credential.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{credential.owner.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{credential.owner.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-3 sm:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            {permissions.canShare && (
              <button
                onClick={() => onShare(credential)}
                className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[44px] font-medium"
              >
                Share
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {permissions.canEdit && (
              <button
                onClick={() => onEdit(credential)}
                className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] font-medium"
              >
                Edit
              </button>
            )}
            {permissions.canDelete && (
              <button
                onClick={() => onDelete(credential)}
                className="px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px] font-medium"
              >
                Delete
              </button>
            )}
          </div>
        </div>
    </Dialog>
  );
};
