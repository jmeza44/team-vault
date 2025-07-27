// Core types for the application
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

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode?: number;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Analytics types
export interface DashboardMetrics {
  totalCredentials: number;
  expiringSoon: number;
  expired: number;
  teamMembers: number;
  sharedCredentials: number;
  securityAlerts: number;
}

export interface CredentialStatistics {
  total: number;
  byRiskLevel: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  byCategory: Record<string, number>;
  expiring: {
    next7Days: number;
    next14Days: number;
    next30Days: number;
    next90Days: number;
  };
  expired: number;
  lastRotated: {
    never: number;
    within30Days: number;
    within90Days: number;
    older: number;
  };
}

export interface TeamActivityMetrics {
  totalTeams: number;
  totalMembers: number;
  activeTeams: number;
  teamCredentials: number;
  sharedCredentials: number;
  recentActivity: RecentActivity[];
}

export interface RecentActivity {
  id: string;
  type:
    | 'CREDENTIAL_CREATED'
    | 'CREDENTIAL_UPDATED'
    | 'CREDENTIAL_DELETED'
    | 'CREDENTIAL_ACCESSED'
    | 'CREDENTIAL_SHARED'
    | 'TEAM_CREATED'
    | 'TEAM_MEMBER_ADDED'
    | 'TEAM_MEMBER_REMOVED'
    | 'USER_LOGIN'
    | 'SECURITY_ALERT';
  description: string;
  userId: string;
  userName: string;
  resourceId?: string;
  resourceName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SecurityMetrics {
  totalEvents: number;
  failedLogins: number;
  suspiciousActivities: number;
  unauthorizedAccess: number;
  riskScore: number;
  recentEvents: SecurityEvent[];
}

export interface SecurityEvent {
  id: string;
  type:
    | 'FAILED_LOGIN'
    | 'SUSPICIOUS_ACTIVITY'
    | 'UNAUTHORIZED_ACCESS'
    | 'TOKEN_THEFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  ipAddress?: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface AnalyticsFilters {
  timeRange?: 'last24h' | 'last7d' | 'last30d' | 'last90d' | 'last1y';
  teamId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface AnalyticsSummary {
  dashboard: DashboardMetrics;
  credentials: CredentialStatistics;
  teams: TeamActivityMetrics;
  security: SecurityMetrics;
  generatedAt: string;
  filters: AnalyticsFilters;
}

// Re-export alert types
export type { Alert, AlertType, AlertContextType } from './alert';
