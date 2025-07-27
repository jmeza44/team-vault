import { Router } from 'express';
import { query } from 'express-validator';
import { AnalyticsController } from '@/controllers';
import { authenticateToken, validateRequest } from '@/middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication
router.use(authenticateToken);

// Dashboard analytics endpoint
router.get(
  '/dashboard',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('teamId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  analyticsController.getDashboard.bind(analyticsController)
);

// Credential usage statistics
router.get(
  '/credentials/usage',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('teamId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  analyticsController.getCredentialUsage.bind(analyticsController)
);

// Team activity metrics
router.get(
  '/teams/activity',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('teamId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  analyticsController.getTeamActivity.bind(analyticsController)
);

// Security events and metrics
router.get(
  '/security/events',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  analyticsController.getSecurityEvents.bind(analyticsController)
);

// Recent activity feed
router.get(
  '/activity/recent',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('teamId').optional().isUUID(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  analyticsController.getRecentActivity.bind(analyticsController)
);

// Complete analytics summary
router.get(
  '/summary',
  [
    query('timeRange').optional().isIn(['last24h', 'last7d', 'last30d', 'last90d', 'last1y']),
    query('teamId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  analyticsController.getAnalyticsSummary.bind(analyticsController)
);

export default router;
