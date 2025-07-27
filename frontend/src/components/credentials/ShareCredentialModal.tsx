import React, { useState, useEffect } from 'react';
import { Credential, Team } from '@/types';
import { credentialService, ShareCredentialRequest } from '@/services/credentialService';
import teamService from '@/services/teamService';
import { useAlertActions } from '@/hooks/useAlerts';
import { useConfirm } from '@/hooks/useConfirm';
import { usePermissions } from '@/hooks/usePermissions';
import { Dialog } from '@/components/common/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { X, Users, User as UserIcon } from 'lucide-react';

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
  const { showError, showSuccess } = useAlertActions();
  const { confirm, confirmState, handleClose, handleConfirm } = useConfirm();
  const { getCredentialPermissions } = usePermissions();
  const permissions = getCredentialPermissions(credential);
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
      showError('Please select at least one team to share with');
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
        showSuccess('Credential shared successfully');
        onSuccess();
        // Reload shares to show the updated list
        loadShares();
        // Reset form
        setSelectedTeams([]);
        setExpiresAt('');
        setAccessLevel('READ');
      } else {
        showError(response.error?.message || 'Failed to share credential');
      }
    } catch (err) {
      showError('An unexpected error occurred');
      console.error('Share error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    const confirmed = await confirm({
      title: 'Remove Share',
      message: 'Are you sure you want to remove this share? The user or team will lose access to this credential.',
      confirmText: 'Remove Share',
      cancelText: 'Cancel',
      variant: 'warning'
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await credentialService.removeCredentialShare(credential.id, shareId);
      if (response.success) {
        loadShares(); // Reload shares
        showSuccess('Share removed successfully');
      } else {
        showError(response.error?.message || 'Failed to remove share');
      }
    } catch (err) {
      showError('An unexpected error occurred');
      console.error('Remove share error:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="flex justify-between items-center mb-6 p-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-900">
          Share "{credential.name}"
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 pb-6">

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Share with Teams Form */}
          {permissions.canShare && (
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
                            <Users className="w-4 h-4 text-purple-600" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-blue-600" />
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
                    {permissions.canShare && (
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
        
        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={confirmState.isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          title={confirmState.title}
          message={confirmState.message}
          confirmText={confirmState.confirmText}
          cancelText={confirmState.cancelText}
          variant={confirmState.variant}
          loading={confirmState.loading}
        />
    </Dialog>
  );
};
