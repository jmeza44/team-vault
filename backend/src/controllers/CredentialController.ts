import { Response } from 'express';
import { CredentialFilters, CreateCredentialData, UpdateCredentialData, AuthenticatedRequest } from '@/models';
import { CredentialService } from '@/services';
import { ResponseUtil } from '@/utils';

export class CredentialController {
  async getCredentials(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { category, search, riskLevel, teamId, limit, offset } = req.query;

      const filters: CredentialFilters = {};

      if (search) filters.search = search as string;
      if (category) filters.category = category as string;
      if (riskLevel) filters.riskLevel = riskLevel as string;
      if (teamId) filters.teamId = teamId as string;
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
      const { userIds = [], teamIds = [], accessLevel = 'READ', expiresAt } = req.body;

      const shareData: {
        userIds?: string[];
        teamIds?: string[];
        accessLevel?: any;
        expiresAt?: Date;
      } = {
        userIds,
        teamIds,
        accessLevel,
      };

      if (expiresAt) {
        shareData.expiresAt = new Date(expiresAt);
      }

      const shared = await CredentialService.shareCredential(id, userId, shareData);

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

  async getCredentialShares(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const shares = await CredentialService.getCredentialShares(id, userId);

      if (!shares) {
        return ResponseUtil.notFound(res, 'Credential not found or access denied');
      }

      ResponseUtil.success(res, {
        shares,
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get credential shares');
    }
  }

  async removeCredentialShare(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id, shareId } = req.params;

      const removed = await CredentialService.removeCredentialShare(id, shareId, userId);

      if (!removed) {
        return ResponseUtil.notFound(res, 'Share not found or access denied');
      }

      ResponseUtil.success(res, {
        message: 'Share removed successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Remove credential share');
    }
  }
}
