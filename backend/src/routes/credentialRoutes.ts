import { Router } from 'express';
import { 
  CredentialController,
  createCredentialValidation,
  updateCredentialValidation,
  credentialIdValidation
} from '@/controllers/CredentialController';
import { authenticateToken } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validationMiddleware';
import { body, param } from 'express-validator';

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
    body('sharedWithUserId')
      .optional()
      .isUUID()
      .withMessage('sharedWithUserId must be a valid UUID'),
    body('sharedWithTeamId')
      .optional()
      .isUUID()
      .withMessage('sharedWithTeamId must be a valid UUID'),
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

export default router;
