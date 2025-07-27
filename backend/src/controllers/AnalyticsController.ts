import { Response } from 'express';
import { UserRole } from '@prisma/client';
import { AnalyticsFilters, AuthenticatedRequest } from '@/models';
import { AnalyticsService } from '@/services';
import { ResponseUtil } from '@/utils';

export class AnalyticsController {
  /**
   * Helper method to build filters from query parameters
   */
  private buildFilters(query: any): AnalyticsFilters {
    const filters: AnalyticsFilters = {};

    if (query['timeRange']) {
      filters.timeRange = query['timeRange'] as any;
    }

    if (query['teamId']) {
      filters.teamId = query['teamId'] as string;
    }

    if (query['userId']) {
      filters.userId = query['userId'] as string;
    }

    if (query['startDate']) {
      filters.startDate = new Date(query['startDate'] as string);
    }

    if (query['endDate']) {
      filters.endDate = new Date(query['endDate'] as string);
    }

    return filters;
  }

  /**
   * Get dashboard metrics
   */
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last30d';
      }

      const dashboard = await AnalyticsService.getDashboardMetrics(userId, userRole, filters);

      ResponseUtil.success(res, {
        dashboard,
        filters
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get dashboard analytics');
    }
  }

  /**
   * Get credential usage statistics
   */
  async getCredentialUsage(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last30d';
      }

      const credentials = await AnalyticsService.getCredentialStatistics(userId, userRole, filters);

      ResponseUtil.success(res, {
        credentials,
        filters
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get credential usage statistics');
    }
  }

  /**
   * Get team activity metrics
   */
  async getTeamActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last30d';
      }

      const teams = await AnalyticsService.getTeamActivityMetrics(userId, userRole, filters);

      ResponseUtil.success(res, {
        teams,
        filters
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get team activity metrics');
    }
  }

  /**
   * Get security events and metrics
   */
  async getSecurityEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last30d';
      }

      const security = await AnalyticsService.getSecurityAnalytics(userId, userRole, filters);

      ResponseUtil.success(res, {
        security,
        filters
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get security events');
    }
  }

  /**
   * Get complete analytics summary
   */
  async getAnalyticsSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last30d';
      }

      const summary = await AnalyticsService.getAnalyticsSummary(userId, userRole, filters);

      ResponseUtil.success(res, summary);
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get analytics summary');
    }
  }

  /**
   * Get recent activity feed
   */
  async getRecentActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role as UserRole;

      const filters = this.buildFilters(req.query);
      if (!filters.timeRange) {
        filters.timeRange = 'last7d';
      }

      const teamActivity = await AnalyticsService.getTeamActivityMetrics(userId, userRole, filters);

      ResponseUtil.success(res, {
        recentActivity: teamActivity.recentActivity,
        filters
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get recent activity');
    }
  }
}
