import React, { useState } from 'react';
import { Credential, RiskLevel } from '@/types';

interface CredentialDetailModalProps {
  credential: Credential;
  onClose: () => void;
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
  onClose,
  onEdit,
  onDelete,
  onShare
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(`${label} copied!`);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      setCopyFeedback('Failed to copy');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleOpenUrl = () => {
    if (credential.url) {
      window.open(credential.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {credential.name}
              </h2>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRiskLevelColor(credential.riskLevel)}`}>
                  {credential.riskLevel} Risk
                </span>
                {credential.category && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {credential.category}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Username */}
          {credential.username && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm font-mono">
                  {credential.username}
                </code>
                <button
                  onClick={() => handleCopy(credential.username!, 'Username')}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Copy username"
                >
                  📋
                </button>
              </div>
            </div>
          )}

          {/* Password/Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password/Secret
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={credential.secret || '••••••••••••'}
                  readOnly
                  className="w-full p-3 bg-gray-100 rounded-md text-sm font-mono pr-12"
                />
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-blue-600"
                  title={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button
                onClick={() => handleCopy(credential.secret || '', 'Secret')}
                className="p-2 text-gray-600 hover:text-blue-600"
                title="Copy secret"
                disabled={!credential.secret}
              >
                📋
              </button>
            </div>
          </div>

          {/* URL */}
          {credential.url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-3 bg-gray-100 rounded-md text-sm font-mono break-all">
                  {credential.url}
                </code>
                <button
                  onClick={() => handleCopy(credential.url!, 'URL')}
                  className="p-2 text-gray-600 hover:text-blue-600"
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  onClick={handleOpenUrl}
                  className="p-2 text-gray-600 hover:text-green-600"
                  title="Open URL"
                >
                  🔗
                </button>
              </div>
            </div>
          )}

          {/* Description */}
          {credential.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <p className="p-3 bg-gray-50 rounded-md text-sm">
                {credential.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {credential.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {credential.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires
                </label>
                <p className="text-sm text-gray-600">
                  {formatDate(credential.expirationDate)}
                </p>
              </div>
            )}
            {credential.lastRotated && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Rotated
                </label>
                <p className="text-sm text-gray-600">
                  {formatDate(credential.lastRotated)}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-sm text-gray-600">
                {formatDate(credential.createdAt)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Updated
              </label>
              <p className="text-sm text-gray-600">
                {formatDate(credential.updatedAt)}
              </p>
            </div>
          </div>

          {/* Owner */}
          {credential.owner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owner
              </label>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {credential.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{credential.owner.name}</p>
                  <p className="text-xs text-gray-600">{credential.owner.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Copy Feedback */}
          {copyFeedback && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg">
              {copyFeedback}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <div className="flex space-x-3">
            <button
              onClick={() => onShare(credential)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Share
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => onEdit(credential)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(credential)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
