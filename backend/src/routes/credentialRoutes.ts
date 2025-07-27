import { Router } from 'express';
import { body, param } from 'express-validator';
import { CredentialController } from '@/controllers';
import { authenticateToken, validateRequest } from '@/middleware';
import { createCredentialValidation, credentialIdValidation, updateCredentialValidation } from '@/validations';

const router = Router();
const credentialController = new CredentialController();

// All credential routes require authentication
router.use(authenticateToken);

// Get all credentials for user
router.get('/', credentialController.getCredentials);

// Get credential by ID
router.get(
  '/:id',
  credentialIdValidation,
  validateRequest,
  credentialController.getCredentialById
);

// Create credential
router.post(
  '/',
  createCredentialValidation,
  validateRequest,
  credentialController.createCredential
);

// Update credential
router.patch(
  '/:id',
  updateCredentialValidation,
  validateRequest,
  credentialController.updateCredential
);

// Delete credential
router.delete(
  '/:id',
  credentialIdValidation,
  validateRequest,
  credentialController.deleteCredential
);

// Share credential
router.post(
  '/:id/share',
  [
    param('id').isUUID().withMessage('Invalid credential ID'),
    body('userIds')
      .optional()
      .isArray()
      .withMessage('userIds must be an array'),
    body('userIds.*')
      .optional()
      .isUUID()
      .withMessage('Each userId must be a valid UUID'),
    body('teamIds')
      .optional()
      .isArray()
      .withMessage('teamIds must be an array'),
    body('teamIds.*')
      .optional()
      .isUUID()
      .withMessage('Each teamId must be a valid UUID'),
    body('accessLevel')
      .optional()
      .isIn(['READ', 'WRITE'])
      .withMessage('accessLevel must be READ or WRITE'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('expiresAt must be a valid date'),
  ],
  validateRequest,
  credentialController.shareCredential
);

// Create one-time link
router.post(
  '/:id/one-time-link',
  [
    param('id').isUUID().withMessage('Invalid credential ID'),
    body('accessLevel')
      .optional()
      .isIn(['READ', 'WRITE'])
      .withMessage('accessLevel must be READ or WRITE'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('expiresAt must be a valid date'),
  ],
  validateRequest,
  credentialController.createOneTimeLink
);

// Get credential shares
router.get(
  '/:id/shares',
  [
    param('id').isUUID().withMessage('Invalid credential ID'),
  ],
  validateRequest,
  credentialController.getCredentialShares
);

// Remove credential share
router.delete(
  '/:id/shares/:shareId',
  [
    param('id').isUUID().withMessage('Invalid credential ID'),
    param('shareId').isUUID().withMessage('Invalid share ID'),
  ],
  validateRequest,
  credentialController.removeCredentialShare
);

export default router;
