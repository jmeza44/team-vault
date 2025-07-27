import React, { useState } from "react";
import { Team, TeamRole } from "@/types";
import {
  TeamWithMembers,
  AddMemberRequest,
  UpdateMemberRequest,
} from "@/services/teamService";
import { useConfirm } from "@/hooks/useConfirm";
import { Dialog } from "@/components/common/Dialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Edit, X, Trash2 } from "lucide-react";

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
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUserRole = (
  team: TeamWithMembers,
  userId: string
): TeamRole | null => {
  const membership = team.memberships?.find((m) => m.userId === userId);
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
  const [newMemberEmail, setNewMemberEmail] = useState("");
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

    setLoadingActions((prev) => ({ ...prev, addMember: true }));
    try {
      await onAddMember(team.id, {
        email: newMemberEmail.trim(),
        role: newMemberRole,
      });
      setNewMemberEmail("");
      setNewMemberRole(TeamRole.MEMBER);
      setShowAddMember(false);
    } catch (error) {
      console.error("Error adding member:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, addMember: false }));
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: TeamRole) => {
    setLoadingActions((prev) => ({ ...prev, [`update-${userId}`]: true }));
    try {
      await onUpdateMember(team.id, userId, { role: newRole });
    } catch (error) {
      console.error("Error updating member role:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`update-${userId}`]: false }));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    const member = team.memberships?.find((m) => m.userId === userId);
    const memberName =
      member?.user?.name || member?.user?.email || "this member";

    const confirmed = await confirm({
      title: "Remove Team Member",
      message: `Are you sure you want to remove ${memberName} from the team? This action cannot be undone.`,
      variant: "danger",
    });

    if (!confirmed) return;

    setLoadingActions((prev) => ({ ...prev, [`remove-${userId}`]: true }));
    try {
      await onRemoveMember(team.id, userId);
    } catch (error) {
      console.error("Error removing member:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [`remove-${userId}`]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog isOpen={isOpen} onClose={onClose}>
        {/* Header */}
        <div className="px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
              {team.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.memberCount || team.memberships?.length || 0}{" "}
              {(team.memberCount || team.memberships?.length || 0) === 1
                ? "member"
                : "members"}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isAdmin && (
              <button
                onClick={() => onEdit(team)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-blue-300 dark:hover:bg-blue-800 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Edit Team"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4">
          {/* Team Description */}
          {team.description && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {team.description}
              </p>
            </div>
          )}

          {/* Team Info */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Created:
              </span>
              <span className="text-gray-600 ml-1 dark:text-gray-400">
                {formatDate(team.createdAt)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                Your Role:
              </span>
              <span
                className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  userRole === TeamRole.ADMIN
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                }`}
              >
                {userRole}
              </span>
            </div>
          </div>

          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Team Members
              </h3>
              {isAdmin && (
                <button
                  onClick={() => setShowAddMember(!showAddMember)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Member
                </button>
              )}
            </div>

            {/* Add Member Form */}
            {showAddMember && (
              <form
                onSubmit={handleAddMember}
                className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                  <select
                    value={newMemberRole}
                    onChange={(e) =>
                      setNewMemberRole(e.target.value as TeamRole)
                    }
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value={TeamRole.MEMBER}>Member</option>
                    <option value={TeamRole.ADMIN}>Admin</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={loadingActions.addMember}
                      className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Members List */}
            <div className="space-y-3">
              {team.memberships?.map((membership) => (
                <div
                  key={membership.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md dark:bg-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
                          onChange={(e) =>
                            handleUpdateMemberRole(
                              membership.userId,
                              e.target.value as TeamRole
                            )
                          }
                          disabled={
                            loadingActions[`update-${membership.userId}`]
                          }
                          className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                        >
                          <option value={TeamRole.MEMBER}>Member</option>
                          <option value={TeamRole.ADMIN}>Admin</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(membership.userId)}
                          disabled={
                            loadingActions[`remove-${membership.userId}`]
                          }
                          className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          membership.role === TeamRole.ADMIN
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
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
