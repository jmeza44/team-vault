import React, { useState, useEffect } from 'react';
import { X, Users, User as UserIcon } from 'lucide-react';
import { Dialog, ConfirmDialog } from '@/components/common';
import { useAlertActions, useConfirm, usePermissions } from '@/hooks';
import {
  credentialService,
  teamService,
} from '@/services';
import { Credential, Team, ShareData, ShareCredentialRequest } from '@/types';

interface ShareCredentialModalProps {
  credential: Credential;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
      const response = await credentialService.getCredentialShares(
        credential.id
      );
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

    const availableTeams = teams.filter(
      team => !shares.some(share => share.sharedWithTeam?.id === team.id)
    );

    if (selectedTeams.length === 0) {
      if (availableTeams.length === 0) {
        showError('All available teams already have access to this credential');
      } else {
        showError('Please select at least one team to share with');
      }
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

      const response = await credentialService.shareCredential(
        credential.id,
        shareData
      );

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
      message:
        'Are you sure you want to remove this share? The user or team will lose access to this credential.',
      confirmText: 'Remove Share',
      cancelText: 'Cancel',
      variant: 'warning',
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await credentialService.removeCredentialShare(
        credential.id,
        shareId
      );
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
      <div className="mb-6 flex items-center justify-between p-6 pb-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Share "{credential.name}"
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="px-6 pb-6">
        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        {/* Current Shares */}
        <div>
          <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            Current Shares
          </h3>
          {sharesLoading ? (
            <div className="space-y-3">
              {/* Skeleton loaders for shares */}
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex flex-1 items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="flex-1">
                      <div className="mb-1 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-3">
              {shares.map(share => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {share.sharedWithTeam ? (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-300">
                          <Users className="h-4 w-4 text-secondary-600 dark:text-secondary-800" />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-300">
                          <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-800" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {share.sharedWithTeam
                            ? share.sharedWithTeam.name
                            : share.sharedWithUser?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">
                          {share.sharedWithTeam
                            ? 'Team'
                            : share.sharedWithUser?.email}{' '}
                          •
                          {share.accessLevel === 'READ'
                            ? ' Read Only'
                            : ' Read & Write'}
                          {share.expiresAt &&
                            ` • Expires ${new Date(
                              share.expiresAt
                            ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                  </div>
                  {permissions.canShare && (
                    <button
                      onClick={() => handleRemoveShare(share.id)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              This credential is not shared with anyone.
            </p>
          )}
        </div>

        {/* Share with Teams Form */}
        {permissions.canShare && (
          <div className="mt-8">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
              Share with Teams
            </h3>
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="form-label">Select Teams to Share With</label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-gray-300 p-2 dark:border-gray-700">
                  {teams.filter(
                    team =>
                      !shares.some(
                        share => share.sharedWithTeam?.id === team.id
                      )
                  ).length > 0 ? (
                    teams
                      .filter(
                        team =>
                          !shares.some(
                            share => share.sharedWithTeam?.id === team.id
                          )
                      )
                      .map(team => (
                        <label
                          key={team.id}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedTeams([...selectedTeams, team.id]);
                              } else {
                                setSelectedTeams(
                                  selectedTeams.filter(id => id !== team.id)
                                );
                              }
                            }}
                            className="form-checkbox"
                          />
                          <span className="text-sm">
                            <span className="font-medium">{team.name}</span>
                            {team.description && (
                              <span className="ml-2 text-gray-500 dark:text-gray-400">
                                - {team.description}
                              </span>
                            )}
                          </span>
                        </label>
                      ))
                  ) : (
                    <p className="py-2 text-sm text-gray-500 dark:text-gray-400">
                      All available teams already have access to this
                      credential.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Access Level</label>
                  <select
                    value={accessLevel}
                    onChange={e =>
                      setAccessLevel(e.target.value as 'READ' | 'WRITE')
                    }
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
                    onChange={e => setExpiresAt(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || selectedTeams.length === 0}
                  className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Sharing...
                    </div>
                  ) : (
                    'Share Credential'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
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
