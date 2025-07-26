import { Router } from 'express';
import { CredentialController } from '@/controllers/CredentialController';
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
  [param('id').isUUID()],
  validateRequest,
  credentialController.getCredentialById
);

// Create credential
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('username').optional().trim().isLength({ max: 100 }),
    body('encryptedSecret').exists(),
    body('description').optional().trim().isLength({ max: 500 }),
    body('category').optional().trim().isLength({ max: 50 }),
    body('url').optional().isURL(),
    body('tags').optional().isArray(),
    body('expirationDate').optional().isISO8601(),
  ],
  validateRequest,
  credentialController.createCredential
);

// Update credential
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('username').optional().trim().isLength({ max: 100 }),
    body('encryptedSecret').optional(),
    body('description').optional().trim().isLength({ max: 500 }),
    body('category').optional().trim().isLength({ max: 50 }),
    body('url').optional().isURL(),
    body('tags').optional().isArray(),
    body('expirationDate').optional().isISO8601(),
  ],
  validateRequest,
  credentialController.updateCredential
);

// Delete credential
router.delete(
  '/:id',
  [param('id').isUUID()],
  validateRequest,
  credentialController.deleteCredential
);

// Share credential
router.post(
  '/:id/share',
  [
    param('id').isUUID(),
    body('sharedWithUserId').optional().isUUID(),
    body('sharedWithTeamId').optional().isUUID(),
    body('accessLevel').isIn(['READ', 'WRITE']),
    body('expiresAt').optional().isISO8601(),
  ],
  validateRequest,
  credentialController.shareCredential
);

// Create one-time link
router.post(
  '/:id/one-time-link',
  [
    param('id').isUUID(),
    body('accessLevel').isIn(['READ', 'WRITE']),
    body('expiresAt').isISO8601(),
  ],
  validateRequest,
  credentialController.createOneTimeLink
);

export default router;
