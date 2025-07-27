import { PrismaClient, UserRole } from '@prisma/client';
import { logger } from '@/utils/logger';
import {
  DashboardMetrics,
  CredentialStatistics,
  TeamActivityMetrics,
  SecurityMetrics,
  RecentActivity,
  AnalyticsFilters,
  AnalyticsSummary
} from '@/models/AnalyticsModels';

const prisma = new PrismaClient();

export class AnalyticsService {
  /**
   * Get dashboard metrics for a specific user
   */
  static async getDashboardMetrics(userId: string, userRole: UserRole, filters: AnalyticsFilters = {}): Promise<DashboardMetrics> {
    try {
      const timeRange = AnalyticsService.getTimeRangeFilter(filters.timeRange || 'last30d');
      
      // Get user's team IDs for filtering
      const userTeamIds = await AnalyticsService.getUserTeamIds(userId);
      
      const [
        credentialStats,
        teamStats,
        securityStats
      ] = await Promise.all([
        AnalyticsService.getCredentialMetrics(userId, userRole, userTeamIds, timeRange),
        AnalyticsService.getTeamMetrics(userId, userRole, userTeamIds),
        AnalyticsService.getSecurityMetrics(userId, userRole, timeRange)
      ]);

      return {
        totalCredentials: credentialStats.total,
        expiringSoon: credentialStats.expiring.next30Days,
        expired: credentialStats.expired,
        teamMembers: teamStats.totalMembers,
        sharedCredentials: teamStats.sharedCredentials,
        securityAlerts: securityStats.totalEvents
      };
    } catch (error) {
      logger.error('Error getting dashboard metrics:', error);
      throw error;
    }
  }

  /**
   * Get detailed credential statistics
   */
  static async getCredentialStatistics(userId: string, userRole: UserRole, filters: AnalyticsFilters = {}): Promise<CredentialStatistics> {
    try {
      const userTeamIds = await AnalyticsService.getUserTeamIds(userId);
      const timeRange = AnalyticsService.getTimeRangeFilter(filters.timeRange || 'last30d');

      return await AnalyticsService.getCredentialMetrics(userId, userRole, userTeamIds, timeRange);
    } catch (error) {
      logger.error('Error getting credential statistics:', error);
      throw error;
    }
  }

  /**
   * Get team activity metrics
   */
  static async getTeamActivityMetrics(userId: string, userRole: UserRole, filters: AnalyticsFilters = {}): Promise<TeamActivityMetrics> {
    try {
      const userTeamIds = await AnalyticsService.getUserTeamIds(userId);
      const timeRange = AnalyticsService.getTimeRangeFilter(filters.timeRange || 'last30d');

      const teamStats = await AnalyticsService.getTeamMetrics(userId, userRole, userTeamIds);
      const recentActivity = await AnalyticsService.getRecentActivity(userId, userRole, userTeamIds, timeRange, 20);      return {
        ...teamStats,
        recentActivity
      };
    } catch (error) {
      logger.error('Error getting team activity metrics:', error);
      throw error;
    }
  }

  /**
   * Get security metrics
   */
  static async getSecurityAnalytics(userId: string, userRole: UserRole, filters: AnalyticsFilters = {}): Promise<SecurityMetrics> {
    try {
      const timeRange = AnalyticsService.getTimeRangeFilter(filters.timeRange || 'last30d');

      return await AnalyticsService.getSecurityMetrics(userId, userRole, timeRange);
    } catch (error) {
      logger.error('Error getting security analytics:', error);
      throw error;
    }
  }

  /**
   * Get complete analytics summary
   */
  static async getAnalyticsSummary(userId: string, userRole: UserRole, filters: AnalyticsFilters = {}): Promise<AnalyticsSummary> {
    try {
      const [dashboard, credentials, teams, security] = await Promise.all([
        AnalyticsService.getDashboardMetrics(userId, userRole, filters),
        AnalyticsService.getCredentialStatistics(userId, userRole, filters),
        AnalyticsService.getTeamActivityMetrics(userId, userRole, filters),
        AnalyticsService.getSecurityAnalytics(userId, userRole, filters)
      ]);

      return {
        dashboard,
        credentials,
        teams,
        security,
        generatedAt: new Date(),
        filters
      };
    } catch (error) {
      logger.error('Error getting analytics summary:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private static async getUserTeamIds(userId: string): Promise<string[]> {
    const memberships = await prisma.teamMembership.findMany({
      where: { userId },
      select: { teamId: true }
    });
    return memberships.map(m => m.teamId);
  }

  private static getTimeRangeFilter(timeRange: string): { gte: Date } {
    const now = new Date();
    const ranges = {
      'last24h': 24 * 60 * 60 * 1000,
      'last7d': 7 * 24 * 60 * 60 * 1000,
      'last30d': 30 * 24 * 60 * 60 * 1000,
      'last90d': 90 * 24 * 60 * 60 * 1000,
      'last1y': 365 * 24 * 60 * 60 * 1000
    };
    
    const milliseconds = ranges[timeRange as keyof typeof ranges] || ranges['last30d'];
    return { gte: new Date(now.getTime() - milliseconds) };
  }

  private static async getCredentialMetrics(
    userId: string, 
    userRole: UserRole, 
    userTeamIds: string[], 
    _timeRange: { gte: Date }
  ): Promise<CredentialStatistics> {
    const isGlobalAdmin = userRole === UserRole.GLOBAL_ADMIN;
    
    // Build credential access filter
    const credentialFilter = isGlobalAdmin ? {} : {
      OR: [
        { ownerId: userId }, // Own credentials
        { 
          sharedWith: {
            some: {
              OR: [
                { sharedWithUserId: userId },
                { sharedWithTeamId: { in: userTeamIds } }
              ],
              AND: [
                {
                  OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                  ]
                }
              ]
            }
          }
        }
      ]
    };

    // Get total credentials
    const totalCredentials = await prisma.credential.count({
      where: credentialFilter
    });

    // Get credentials by risk level
    const credentialsByRisk = await prisma.credential.groupBy({
      by: ['riskLevel'],
      where: credentialFilter,
      _count: true
    });

    // Get credentials by category
    const credentialsByCategory = await prisma.credential.groupBy({
      by: ['category'],
      where: credentialFilter,
      _count: true
    });

    // Get expiring credentials
    const now = new Date();
    const expiringQueries = await Promise.all([
      prisma.credential.count({
        where: {
          ...credentialFilter,
          expirationDate: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          expirationDate: {
            gte: now,
            lte: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          expirationDate: {
            gte: now,
            lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          expirationDate: {
            gte: now,
            lte: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Get expired credentials
    const expiredCredentials = await prisma.credential.count({
      where: {
        ...credentialFilter,
        expirationDate: { lt: now }
      }
    });

    // Get rotation statistics
    const rotationQueries = await Promise.all([
      prisma.credential.count({
        where: {
          ...credentialFilter,
          lastRotated: null
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          lastRotated: {
            gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          lastRotated: {
            gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.credential.count({
        where: {
          ...credentialFilter,
          lastRotated: {
            lt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Transform risk level data
    const riskLevelCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0
    };
    credentialsByRisk.forEach(item => {
      if (item.riskLevel && item.riskLevel in riskLevelCounts) {
        riskLevelCounts[item.riskLevel as keyof typeof riskLevelCounts] = item._count;
      }
    });

    // Transform category data
    const categoryCounts: Record<string, number> = {};
    credentialsByCategory.forEach(item => {
      if (item.category) {
        categoryCounts[item.category] = item._count;
      }
    });

    return {
      total: totalCredentials,
      byRiskLevel: riskLevelCounts,
      byCategory: categoryCounts,
      expiring: {
        next7Days: expiringQueries[0],
        next14Days: expiringQueries[1],
        next30Days: expiringQueries[2],
        next90Days: expiringQueries[3]
      },
      expired: expiredCredentials,
      lastRotated: {
        never: rotationQueries[0],
        within30Days: rotationQueries[1],
        within90Days: rotationQueries[2],
        older: rotationQueries[3]
      }
    };
  }

  private static async getTeamMetrics(
    userId: string, 
    userRole: UserRole, 
    userTeamIds: string[]
  ): Promise<Omit<TeamActivityMetrics, 'recentActivity'>> {
    const isGlobalAdmin = userRole === UserRole.GLOBAL_ADMIN;
    
    const teamFilter = isGlobalAdmin ? {} : { id: { in: userTeamIds } };
    
    const [totalTeams, teamMemberships, teamCredentials, sharedCredentials] = await Promise.all([
      prisma.team.count({ where: teamFilter }),
      prisma.teamMembership.count({
        where: isGlobalAdmin ? {} : { teamId: { in: userTeamIds } }
      }),
      prisma.credential.count({
        where: isGlobalAdmin ? {} : {
          sharedWith: {
            some: { sharedWithTeamId: { in: userTeamIds } }
          }
        }
      }),
      prisma.sharedCredential.count({
        where: isGlobalAdmin ? {} : {
          OR: [
            { sharedWithUserId: userId },
            { sharedWithTeamId: { in: userTeamIds } }
          ]
        }
      })
    ]);

    return {
      totalTeams,
      totalMembers: teamMemberships,
      activeTeams: totalTeams, // For now, assume all teams are active
      teamCredentials,
      sharedCredentials
    };
  }

  private static async getRecentActivity(
    userId: string,
    userRole: UserRole,
    _userTeamIds: string[],
    timeRange: { gte: Date },
    limit: number = 20
  ): Promise<RecentActivity[]> {
    const isGlobalAdmin = userRole === UserRole.GLOBAL_ADMIN;
    
    // For now, we'll get audit logs - this would be expanded with proper audit logging
    const auditLogs = await prisma.auditLog.findMany({
      where: isGlobalAdmin ? {
        createdAt: timeRange
      } : {
        userId,
        createdAt: timeRange
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return auditLogs.map(log => ({
      id: log.id,
      type: AnalyticsService.mapActionToActivityType(log.action),
      description: AnalyticsService.generateActivityDescription(log.action),
      userId: log.userId || '',
      userName: log.user?.name || 'System',
      ...(log.credentialId && { resourceId: log.credentialId }),
      ...(AnalyticsService.extractResourceName(log.details) && { resourceName: AnalyticsService.extractResourceName(log.details) }),
      timestamp: log.createdAt,
      metadata: log.details ? JSON.parse(JSON.stringify(log.details)) : {}
    } as RecentActivity));
  }

  private static async getSecurityMetrics(
    userId: string,
    userRole: UserRole,
    timeRange: { gte: Date }
  ): Promise<SecurityMetrics> {
    const isGlobalAdmin = userRole === UserRole.GLOBAL_ADMIN;
    
    // This would be expanded with proper security event logging
    const auditFilter = isGlobalAdmin ? {
      createdAt: timeRange
    } : {
      userId,
      createdAt: timeRange
    };

    const [totalEvents, failedLogins, suspiciousActivities] = await Promise.all([
      prisma.auditLog.count({ where: auditFilter }),
      prisma.auditLog.count({
        where: {
          ...auditFilter,
          action: { contains: 'LOGIN_FAILURE' }
        }
      }),
      prisma.auditLog.count({
        where: {
          ...auditFilter,
          action: { contains: 'SUSPICIOUS' }
        }
      })
    ]);

    return {
      totalEvents,
      failedLogins,
      suspiciousActivities,
      unauthorizedAccess: 0, // Placeholder
      riskScore: this.calculateRiskScore(failedLogins, suspiciousActivities),
      recentEvents: [] // Would be populated with actual security events
    };
  }

  private static mapActionToActivityType(action: string): RecentActivity['type'] {
    if (action.includes('CREDENTIAL_CREATE')) return 'CREDENTIAL_CREATED';
    if (action.includes('CREDENTIAL_UPDATE')) return 'CREDENTIAL_UPDATED';
    if (action.includes('CREDENTIAL_DELETE')) return 'CREDENTIAL_DELETED';
    if (action.includes('CREDENTIAL_ACCESS')) return 'CREDENTIAL_ACCESSED';
    if (action.includes('CREDENTIAL_SHARE')) return 'CREDENTIAL_SHARED';
    if (action.includes('TEAM_CREATE')) return 'TEAM_CREATED';
    if (action.includes('TEAM_MEMBER_ADD')) return 'TEAM_MEMBER_ADDED';
    if (action.includes('TEAM_MEMBER_REMOVE')) return 'TEAM_MEMBER_REMOVED';
    if (action.includes('LOGIN')) return 'USER_LOGIN';
    return 'SECURITY_ALERT';
  }

  private static generateActivityDescription(action: string): string {
    // Generate human-readable descriptions based on action and details
    const actionMap: Record<string, string> = {
      'CREDENTIAL_CREATE': 'Created new credential',
      'CREDENTIAL_UPDATE': 'Updated credential',
      'CREDENTIAL_DELETE': 'Deleted credential',
      'CREDENTIAL_ACCESS': 'Accessed credential',
      'CREDENTIAL_SHARE': 'Shared credential',
      'TEAM_CREATE': 'Created new team',
      'TEAM_MEMBER_ADD': 'Added team member',
      'TEAM_MEMBER_REMOVE': 'Removed team member',
      'LOGIN': 'User login',
      'LOGIN_FAILURE': 'Failed login attempt'
    };

    return actionMap[action] || action;
  }

  private static extractResourceName(details: any): string | undefined {
    if (details && typeof details === 'object') {
      return details.name || details.title || details.resourceName;
    }
    return undefined;
  }

  private static calculateRiskScore(failedLogins: number, suspiciousActivities: number): number {
    // Simple risk scoring algorithm
    const baseScore = 0;
    const loginWeight = 0.3;
    const activityWeight = 0.7;
    
    const loginScore = Math.min(failedLogins * 10, 50);
    const activityScore = Math.min(suspiciousActivities * 20, 50);
    
    return Math.min(baseScore + (loginScore * loginWeight) + (activityScore * activityWeight), 100);
  }
}
