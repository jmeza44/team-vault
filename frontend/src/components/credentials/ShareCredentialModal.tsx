import React, { useState, useEffect } from 'react';
import { Credential, Team, User } from '@/types';
import { credentialService, ShareCredentialRequest } from '@/services/credentialService';
import teamService from '@/services/teamService';
import { useAuth } from '@/contexts/AuthContext';

interface ShareCredentialModalProps {
  credential: Credential;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ShareData {
  shares: Array<{
    id: string;
    accessLevel: 'READ' | 'WRITE';
    expiresAt?: string;
    sharedWithUser?: {
      id: string;
      name: string;
      email: string;
    };
    sharedWithTeam?: {
      id: string;
      name: string;
      description?: string;
    };
    createdBy: {
      id: string;
      name: string;
      email: string;
    };
    createdAt: string;
  }>;
}

export const ShareCredentialModal: React.FC<ShareCredentialModalProps> = ({
  credential,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [shares, setShares] = useState<ShareData['shares']>([]);
  const [loading, setLoading] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [accessLevel, setAccessLevel] = useState<'READ' | 'WRITE'>('READ');
  const [expiresAt, setExpiresAt] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      loadShares();
    }
  }, [isOpen, credential.id]);

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams();
      if (response.success && response.data) {
        setTeams(response.data.teams);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
    }
  };

  const loadShares = async () => {
    try {
      setSharesLoading(true);
      const response = await credentialService.getCredentialShares(credential.id);
      if (response.success && response.data) {
        setShares(response.data.shares);
      }
    } catch (err) {
      console.error('Failed to load shares:', err);
    } finally {
      setSharesLoading(false);
    }
  };

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeams.length === 0) {
      setError('Please select at least one team to share with');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const shareData: ShareCredentialRequest = {
        teamIds: selectedTeams,
        accessLevel: accessLevel.toUpperCase() as 'READ' | 'WRITE',
      };

      if (expiresAt) {
        shareData.expiresAt = expiresAt;
      }

      const response = await credentialService.shareCredential(credential.id, shareData);

      if (response.success) {
        onSuccess();
        // Reload shares to show the updated list
        loadShares();
        // Reset form
        setSelectedTeams([]);
        setExpiresAt('');
        setAccessLevel('READ');
      } else {
        setError(response.error?.message || 'Failed to share credential');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Share error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    if (!confirm('Are you sure you want to remove this share?')) {
      return;
    }

    try {
      const response = await credentialService.removeCredentialShare(credential.id, shareId);
      if (response.success) {
        loadShares(); // Reload shares
      } else {
        setError(response.error?.message || 'Failed to remove share');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Remove share error:', err);
    }
  };

  const isOwner = credential.ownerId === user?.id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Share "{credential.name}"
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Share with Teams Form */}
          {isOwner && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Share with Teams</h3>
              <form onSubmit={handleShare} className="space-y-4">
                <div>
                  <label className="form-label">Select Teams</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {teams.map((team) => (
                      <label key={team.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTeams.includes(team.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeams([...selectedTeams, team.id]);
                            } else {
                              setSelectedTeams(selectedTeams.filter(id => id !== team.id));
                            }
                          }}
                          className="form-checkbox"
                        />
                        <span className="text-sm">
                          <span className="font-medium">{team.name}</span>
                          {team.description && (
                            <span className="text-gray-500 ml-2">- {team.description}</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Access Level</label>
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value as 'READ' | 'WRITE')}
                      className="form-input"
                    >
                      <option value="READ">Read Only</option>
                      <option value="WRITE">Read & Write</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Expires At (Optional)</label>
                    <input
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || selectedTeams.length === 0}
                    className="btn-primary"
                  >
                    {loading ? 'Sharing...' : 'Share Credential'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Shares */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Shares</h3>
            {sharesLoading ? (
              <p className="text-gray-500">Loading shares...</p>
            ) : shares.length > 0 ? (
              <div className="space-y-3">
                {shares.map((share) => (
                  <div key={share.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {share.sharedWithTeam ? (
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {share.sharedWithTeam ? share.sharedWithTeam.name : share.sharedWithUser?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {share.sharedWithTeam ? 'Team' : share.sharedWithUser?.email} • 
                            {share.accessLevel === 'READ' ? ' Read Only' : ' Read & Write'}
                            {share.expiresAt && ` • Expires ${new Date(share.expiresAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveShare(share.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">This credential is not shared with anyone.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
