import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { body, param } from 'express-validator';
import { ResponseUtil } from '../utils/responseUtils';
import { CredentialService } from '../services/credentialService';
import { CredentialFilters, CreateCredentialData, UpdateCredentialData } from '@/models/CredentialModels';

// Validation rules
export const createCredentialValidation = [
  body('name').notEmpty().withMessage('Name is required').isLength({ max: 255 }),
  body('username').optional().isLength({ max: 255 }),
  body('secret').notEmpty().withMessage('Secret is required'),
  body('description').optional().isLength({ max: 1000 }),
  body('category').optional().isLength({ max: 100 }),
  body('url').optional().isURL().withMessage('Must be a valid URL'),
  body('tags').optional().isArray(),
  body('expirationDate').optional().isISO8601(),
  body('riskLevel').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
];

export const updateCredentialValidation = [
  param('id').isUUID().withMessage('Invalid credential ID'),
  ...createCredentialValidation.map(rule => rule.optional()),
];

export const credentialIdValidation = [
  param('id').isUUID().withMessage('Invalid credential ID'),
];

export class CredentialController {
  async getCredentials(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { category, search, riskLevel, limit, offset } = req.query;

      const filters: CredentialFilters = {};

      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      if (riskLevel) filters.riskLevel = riskLevel as string;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const credentials = await CredentialService.getUserCredentials(userId, filters);

      ResponseUtil.success(res, {
        credentials,
        count: credentials.length,
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get credentials');
    }
  }

  async getCredentialById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const credential = await CredentialService.getCredential(id, userId);

      if (!credential) {
        return ResponseUtil.notFound(res, 'Credential not found');
      }

      ResponseUtil.success(res, { credential });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get credential');
    }
  }

  async createCredential(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data: CreateCredentialData = req.body;

      const credential = await CredentialService.createCredential(userId, data);

      ResponseUtil.success(res, {
        credential,
        message: 'Credential created successfully',
      }, 201);
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Create credential');
    }
  }

  async updateCredential(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data: UpdateCredentialData = req.body;

      const credential = await CredentialService.updateCredential(id, userId, data);

      if (!credential) {
        return ResponseUtil.notFound(res, 'Credential not found or access denied');
      }

      ResponseUtil.success(res, {
        credential,
        message: 'Credential updated successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Update credential');
    }
  }

  async deleteCredential(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const deleted = await CredentialService.deleteCredential(id, userId);

      if (!deleted) {
        return ResponseUtil.notFound(res, 'Credential not found or access denied');
      }

      ResponseUtil.success(res, {
        message: 'Credential deleted successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Delete credential');
    }
  }

  async shareCredential(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { userIds = [] } = req.body;

      const shared = await CredentialService.shareCredential(id, userId, userIds);

      if (!shared) {
        return ResponseUtil.notFound(res, 'Credential not found or access denied');
      }

      ResponseUtil.success(res, {
        message: 'Credential shared successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Share credential');
    }
  }

  async createOneTimeLink(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const token = await CredentialService.createOneTimeLink(id, userId);

      if (!token) {
        return ResponseUtil.notFound(res, 'Credential not found or access denied');
      }

      ResponseUtil.success(res, {
        token,
        message: 'One-time link created successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Create one-time link');
    }
  }
}
