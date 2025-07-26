import { Router } from 'express';
import { AuditController } from '@/controllers/AuditController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validationMiddleware';
import { query } from 'express-validator';

const router = Router();
const auditController = new AuditController();

// All audit routes require authentication
router.use(authenticateToken);

// Get audit logs
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('action').optional().isString(),
    query('credentialId').optional().isUUID(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  auditController.getAuditLogs
);

// Get audit logs for specific credential
router.get(
  '/credential/:credentialId',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  auditController.getCredentialAuditLogs
);

export default router;
