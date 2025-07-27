import { body, param } from 'express-validator';

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