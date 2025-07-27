import React, { useState } from 'react';
import { Team, TeamRole } from '@/types';
import {
  TeamWithMembers,
  AddMemberRequest,
  UpdateMemberRequest,
} from '@/services/teamService';
import { useConfirm } from '@/hooks/useConfirm';
import { Dialog } from '@/components/common/Dialog';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Edit, X, Trash2 } from 'lucide-react';

interface TeamDetailModalProps {
  team: TeamWithMembers;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (team: Team) => void;
  onAddMember: (teamId: string, data: AddMemberRequest) => Promise<void>;
  onUpdateMember: (
    teamId: string,
    userId: string,
    data: UpdateMemberRequest
  ) => Promise<void>;
  onRemoveMember: (teamId: string, userId: string) => Promise<void>;
  isLoading?: boolean;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getUserRole = (
  team: TeamWithMembers,
  userId: string
): TeamRole | null => {
  const membership = team.memberships?.find(m => m.userId === userId);
  return membership?.role || null;
};

const isTeamAdmin = (team: TeamWithMembers, userId: string): boolean => {
  const role = getUserRole(team, userId);
  return role === TeamRole.ADMIN;
};

export const TeamDetailModal: React.FC<TeamDetailModalProps> = ({
  team,
  currentUserId,
  isOpen,
  onClose,
  onEdit,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
}) => {
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<TeamRole>(TeamRole.MEMBER);
  const [loadingActions, setLoadingActions] = useState<{
    [key: string]: boolean;
  }>({});
  const { confirm, confirmState, handleClose, handleConfirm } = useConfirm();

  const userRole = getUserRole(team, currentUserId);
  const isAdmin = isTeamAdmin(team, currentUserId);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setLoadingActions(prev => ({ ...prev, addMember: true }));
    try {
      await onAddMember(team.id, {
        email: newMemberEmail.trim(),
        role: newMemberRole,
      });
      setNewMemberEmail('');
      setNewMemberRole(TeamRole.MEMBER);
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, addMember: false }));
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: TeamRole) => {
    setLoadingActions(prev => ({ ...prev, [`update-${userId}`]: true }));
    try {
      await onUpdateMember(team.id, userId, { role: newRole });
    } catch (error) {
      console.error('Error updating member role:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`update-${userId}`]: false }));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const member = team.memberships?.find(m => m.userId === userId);
    const memberName =
      member?.user?.name || member?.user?.email || 'this member';

    const confirmed = await confirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${memberName} from the team? This action cannot be undone.`,
      variant: 'danger',
    });

    if (!confirmed) return;

    setLoadingActions(prev => ({ ...prev, [`remove-${userId}`]: true }));
    try {
      await onRemoveMember(team.id, userId);
    } catch (error) {
      console.error('Error removing member:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`remove-${userId}`]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-700 md:px-6">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
              {team.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.memberCount || team.memberships?.length || 0}{' '}
              {(team.memberCount || team.memberships?.length || 0) === 1
                ? 'member'
                : 'members'}
            </p>
          </div>
          <div className="ml-4 flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => onEdit(team)}
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:text-gray-400 dark:hover:bg-primary-800 dark:hover:text-primary-300"
                title="Edit Team"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-4 md:px-6">
          {/* Team Description */}
          {team.description && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {team.description}
              </p>
            </div>
          )}

          {/* Team Info */}
          <div className="mb-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Created:
              </span>
              <span className="ml-1 text-gray-600 dark:text-gray-400">
                {formatDate(team.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Your Role:
              </span>
              <span
                className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  userRole === TeamRole.ADMIN
                    ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-100'
                    : 'bg-primary-100 text-primary-800 dark:bg-primary-800 dark:text-primary-100'
                }`}
              >
                {userRole}
              </span>
            </div>
          </div>

          {/* Members Section */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Team Members
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Member
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <form
                onSubmit={handleAddMember}
                className="mb-4 rounded-md bg-gray-50 p-4 dark:bg-gray-700"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={e => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                    required
                  />
                  <select
                    value={newMemberRole}
                    onChange={e => setNewMemberRole(e.target.value as TeamRole)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value={TeamRole.MEMBER}>Member</option>
                    <option value={TeamRole.ADMIN}>Admin</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loadingActions.addMember}
                      className="flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loadingActions.addMember ? (
                        <>
                          <div className="mr-2 h-3 w-3 animate-spin rounded-full border border-white border-b-transparent"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="rounded-md bg-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-3">
              {team.memberships?.map(membership => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between rounded-md bg-gray-50 p-3 dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                      {membership.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {membership.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {membership.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isAdmin && membership.userId !== currentUserId ? (
                      <>
                        <select
                          value={membership.role}
                          onChange={e =>
                            handleUpdateMemberRole(
                              membership.userId,
                              e.target.value as TeamRole
                            )
                          }
                          disabled={
                            loadingActions[`update-${membership.userId}`]
                          }
                          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        >
                          <option value={TeamRole.MEMBER}>Member</option>
                          <option value={TeamRole.ADMIN}>Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(membership.userId)}
                          disabled={
                            loadingActions[`remove-${membership.userId}`]
                          }
                          className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          title="Remove Member"
                        >
                          {loadingActions[`remove-${membership.userId}`] ? (
                            <div className="h-4 w-4 animate-spin rounded-full border border-gray-400 border-b-transparent"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          membership.role === TeamRole.ADMIN
                            ? 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800/20 dark:text-secondary-100'
                            : 'bg-primary-100 text-primary-800 dark:bg-primary-800/20 dark:text-primary-100'
                        }`}
                      >
                        {membership.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        {...confirmState}
        onClose={handleClose}
        onConfirm={handleConfirm}
      />
    </>
  );
};
