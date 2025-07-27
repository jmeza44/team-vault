import { useMemo } from 'react';
import { useAuth } from '@/contexts';
import { Credential, UserRole, TeamRole, AccessLevel } from '@/types';

export interface CredentialPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canShare: boolean;
  canCopySecret: boolean;
  accessLevel: AccessLevel | null;
  isOwner: boolean;
}

export interface UserPermissions {
  canCreateCredentials: boolean;
  canCreateTeams: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  isGlobalAdmin: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();

  const userPermissions = useMemo((): UserPermissions => {
    if (!user) {
      return {
        canCreateCredentials: false,
        canCreateTeams: false,
        canViewAuditLogs: false,
        canManageUsers: false,
        isGlobalAdmin: false,
      };
    }

    const isGlobalAdmin = user.role === UserRole.GLOBAL_ADMIN;

    return {
      canCreateCredentials: true, // All authenticated users can create credentials
      canCreateTeams: true, // All authenticated users can create teams
      canViewAuditLogs: isGlobalAdmin,
      canManageUsers: isGlobalAdmin,
      isGlobalAdmin,
    };
  }, [user]);

  const getCredentialPermissions = (
    credential: Credential | null
  ): CredentialPermissions => {
    if (!user || !credential) {
      return {
        canView: false,
        canEdit: false,
        canDelete: false,
        canShare: false,
        canCopySecret: false,
        accessLevel: null,
        isOwner: false,
      };
    }

    const isOwner = credential.ownerId === user.id;
    const isGlobalAdmin = user.role === UserRole.GLOBAL_ADMIN;

    // Global admins have full access to all credentials
    if (isGlobalAdmin) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canCopySecret: true,
        accessLevel: AccessLevel.WRITE,
        isOwner: false, // They're not the actual owner, but have admin access
      };
    }

    // Owners have full access to their credentials
    if (isOwner) {
      return {
        canView: true,
        canEdit: true,
        canDelete: true,
        canShare: true,
        canCopySecret: true,
        accessLevel: AccessLevel.WRITE,
        isOwner: true,
      };
    }

    // Check shared access
    const userSharedAccess = credential.sharedWith?.find(
      share =>
        share.sharedWithUserId === user.id &&
        (!share.expiresAt || new Date(share.expiresAt) > new Date())
    );

    if (userSharedAccess) {
      const hasWriteAccess = userSharedAccess.accessLevel === AccessLevel.WRITE;
      return {
        canView: true,
        canEdit: hasWriteAccess,
        canDelete: false, // Only owners can delete
        canShare: hasWriteAccess,
        canCopySecret: true,
        accessLevel: userSharedAccess.accessLevel,
        isOwner: false,
      };
    }

    // Check team-based access (this would require team membership data)
    // For now, we'll assume team access is handled by the backend
    // and credentials are only returned if user has access

    // If user can see the credential but has no explicit share, assume READ access
    // This handles the case where credentials are fetched from the backend with access already validated
    return {
      canView: true,
      canEdit: false,
      canDelete: false,
      canShare: false,
      canCopySecret: true,
      accessLevel: AccessLevel.READ,
      isOwner: false,
    };
  };

  const getTeamPermissions = (teamRole: TeamRole | null | undefined) => {
    const isAdmin = teamRole === TeamRole.ADMIN;
    const isMember = teamRole === TeamRole.MEMBER || isAdmin;

    return {
      canViewTeam: isMember,
      canEditTeam: isAdmin,
      canDeleteTeam: isAdmin,
      canManageMembers: isAdmin,
      canViewCredentials: isMember,
      canEditCredentials: isAdmin,
      isAdmin,
      isMember,
    };
  };

  return {
    user,
    userPermissions,
    getCredentialPermissions,
    getTeamPermissions,
  };
};
