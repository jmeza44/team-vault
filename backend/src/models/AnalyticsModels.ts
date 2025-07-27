// Analytics models for dashboard and reporting
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
  type: 'CREDENTIAL_CREATED' | 'CREDENTIAL_UPDATED' | 'CREDENTIAL_DELETED' | 'CREDENTIAL_ACCESSED' | 
        'CREDENTIAL_SHARED' | 'TEAM_CREATED' | 'TEAM_MEMBER_ADDED' | 'TEAM_MEMBER_REMOVED' | 
        'USER_LOGIN' | 'SECURITY_ALERT';
  description: string;
  userId: string;
  userName: string;
  resourceId?: string;
  resourceName?: string;
  timestamp: Date;
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
  type: 'FAILED_LOGIN' | 'SUSPICIOUS_ACTIVITY' | 'UNAUTHORIZED_ACCESS' | 'TOKEN_THEFT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  userId?: string;
  ipAddress?: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface AnalyticsFilters {
  timeRange?: 'last24h' | 'last7d' | 'last30d' | 'last90d' | 'last1y';
  teamId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AnalyticsSummary {
  dashboard: DashboardMetrics;
  credentials: CredentialStatistics;
  teams: TeamActivityMetrics;
  security: SecurityMetrics;
  generatedAt: Date;
  filters: AnalyticsFilters;
}
