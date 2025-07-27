import { Team, TeamMembership, User } from './coreTypes';

export interface TeamFormData {
  name: string;
  description: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {}

export interface AddMemberRequest {
  email: string;
  role?: 'MEMBER' | 'ADMIN';
}

export interface UpdateMemberRequest {
  role: 'MEMBER' | 'ADMIN';
}

export interface GetTeamsResponse {
  teams: Team[];
  count: number;
}

export interface TeamWithMembers extends Team {
  memberships: (TeamMembership & { user: User; })[];
  memberCount?: number;
}

export interface GetTeamResponse {
  team: TeamWithMembers;
}