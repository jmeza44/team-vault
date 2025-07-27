import React, { useState } from 'react';
import { Copy, Eye, EyeOff, ExternalLink, X } from 'lucide-react';
import { Dialog } from '@/components/common';
import { useToast, usePermissions } from '@/hooks';
import { AccessLevel, Credential } from '@/types';
import { getRiskLevelColor, formatDateTime } from '@/utils';

interface CredentialDetailModalProps {
  credential: Credential | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (credential: Credential) => void;
  onDelete: (credential: Credential) => void;
  onShare: (credential: Credential) => void;
}

export const CredentialDetailModal: React.FC<CredentialDetailModalProps> = ({
  credential,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onShare,
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copyingField, setCopyingField] = useState<string | null>(null);
  const { showCopySuccess, showCopyError } = useToast();
  const { getCredentialPermissions } = usePermissions();

  // Don't render if credential is not provided or modal is not open
  if (!isOpen || !credential) return null;

  const permissions = getCredentialPermissions(credential);

  const handleCopy = async (text: string, label: string) => {
    try {
      setCopyingField(label);
      await navigator.clipboard.writeText(text);
      showCopySuccess(label);
    } catch (err) {
      showCopyError();
    } finally {
      setCopyingField(null);
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
      <div className="border-b border-gray-200 p-4 dark:border-gray-700 md:p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h2 className="mb-2 truncate text-xl font-bold text-gray-900 dark:text-gray-100 md:text-2xl">
              {credential.name}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getRiskLevelColor(credential.riskLevel)}`}
              >
                {credential.riskLevel} Risk
              </span>
              {credential.category && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {credential.category}
                </span>
              )}
              {permissions.isOwner && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  Owner
                </span>
              )}
              {!permissions.isOwner && permissions.accessLevel && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {permissions.accessLevel === AccessLevel.WRITE
                    ? 'Read & Write Access'
                    : 'Read Only Access'}
                </span>
              )}
            </div>
          </div>

          {/* Close button - more prominent on mobile */}
          <button
            onClick={onClose}
            className="ml-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label="Close dialog"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4 md:space-y-6 md:p-6">
        {/* Username */}
        {credential.username && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 rounded-md bg-gray-100 p-3 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                {credential.username}
              </code>
              <button
                onClick={() => handleCopy(credential.username!, 'Username')}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-blue-400"
                title="Copy username"
                disabled={copyingField === 'Username'}
              >
                {copyingField === 'Username' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border border-gray-400 border-b-transparent"></div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Password/Secret */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password/Secret
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type={showSecret ? 'text' : 'password'}
                value={credential.secret || '••••••••••••'}
                readOnly
                className="w-full rounded-md bg-gray-100 p-3 pr-12 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100"
              />
              {permissions.canCopySecret && (
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  title={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            {permissions.canCopySecret && (
              <button
                onClick={() => handleCopy(credential.secret || '', 'Secret')}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-blue-400"
                title="Copy secret"
                disabled={!credential.secret || copyingField === 'Secret'}
              >
                {copyingField === 'Secret' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border border-gray-400 border-b-transparent"></div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* URL */}
        {credential.url && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 break-all rounded-md bg-gray-100 p-3 font-mono text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
                {credential.url}
              </code>
              <button
                onClick={() => handleCopy(credential.url!, 'URL')}
                className="p-2 text-gray-600 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:text-blue-400"
                title="Copy URL"
                disabled={copyingField === 'URL'}
              >
                {copyingField === 'URL' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border border-gray-400 border-b-transparent"></div>
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleOpenUrl}
                className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
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
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <p className="rounded-md bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-700 dark:text-gray-100">
              {credential.description}
            </p>
          </div>
        )}

        {/* Tags */}
        {credential.tags.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {credential.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {credential.expirationDate && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Expires
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(credential.expirationDate)}
              </p>
            </div>
          )}
          {credential.lastRotated && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Rotated
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDateTime(credential.lastRotated)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Created
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateTime(credential.createdAt)}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Updated
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatDateTime(credential.updatedAt)}
            </p>
          </div>
        </div>

        {/* Owner */}
        {credential.owner && credential.owner.name && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Owner
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                {credential.owner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {credential.owner.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {credential.owner.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:justify-between md:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          {permissions.canShare && (
            <button
              onClick={() => onShare(credential)}
              className="min-h-[44px] rounded-md bg-secondary-600 px-4 py-3 font-medium text-white hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            >
              Share
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {permissions.canEdit && (
            <button
              onClick={() => onEdit(credential)}
              className="min-h-[44px] rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
          )}
          {permissions.canDelete && (
            <button
              onClick={() => onDelete(credential)}
              className="min-h-[44px] rounded-md bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
};
