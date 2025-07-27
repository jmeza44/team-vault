import { TeamRole, TeamWithMembers } from '@/types';

export const getUserRole = (
  team: TeamWithMembers,
  userId: string
): TeamRole | null => {
  if (!('memberships' in team) || !team.memberships) return null;
  const membership = team.memberships.find(m => m.userId === userId);
  return membership?.role || null;
};

export const isTeamAdmin = (team: TeamWithMembers, userId: string): boolean => {
  const role = getUserRole(team, userId);
  return role === TeamRole.ADMIN;
};