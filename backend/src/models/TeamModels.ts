import { TeamRole } from '@prisma/client';

// Request types for team operations
export interface CreateTeamData {
  name: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface AddTeamMemberData {
  email: string;
  role: TeamRole;
}

export interface UpdateTeamMemberRoleData {
  role: TeamRole;
}

// Response types for team operations
export interface TeamWithMembers {
  id: string;
  name: string;
  description?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  memberships: TeamMembershipWithUser[];
  memberCount: number;
}

export interface TeamMembershipWithUser {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TeamSummary {
  id: string;
  name: string;
  description?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  role: TeamRole; // Current user's role in this team
}

// Filter types
export interface TeamFilters {
  search?: string;
  role?: TeamRole;
  limit?: number;
  offset?: number;
}
