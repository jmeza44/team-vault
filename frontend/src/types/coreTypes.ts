export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Credential {
  id: string;
  name: string;
  username?: string;
  encryptedSecret: string;
  secret?: string; // Decrypted secret when available
  description?: string;
  category?: string;
  url?: string;
  tags: string[];
  ownerId: string;
  expirationDate?: string;
  lastRotated?: string;
  riskLevel: RiskLevel;
  encryptionMethod: string;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  sharedWith?: SharedCredential[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  memberships?: TeamMembership[];
}

export interface TeamMembership {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  user?: User;
  team?: Team;
}

export interface SharedCredential {
  id: string;
  credentialId: string;
  sharedWithUserId?: string;
  sharedWithTeamId?: string;
  accessLevel: AccessLevel;
  createdById: string;
  expiresAt?: string;
  createdAt: string;
}

export interface OneTimeLink {
  id: string;
  credentialId: string;
  token: string;
  accessLevel: AccessLevel;
  createdById: string;
  expiresAt: string;
  usedAt?: string;
  usedByIp?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  credentialId?: string;
  action: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Enums
export enum UserRole {
  USER = 'USER',
  TEAM_ADMIN = 'TEAM_ADMIN',
  GLOBAL_ADMIN = 'GLOBAL_ADMIN',
}

export enum TeamRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
}

export enum AccessLevel {
  READ = 'READ',
  WRITE = 'WRITE',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}