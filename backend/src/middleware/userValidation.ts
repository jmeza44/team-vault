import { body } from 'express-validator';

export const validateUpdateProfile = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

export const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

export const validateUpdateSettings = [
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Theme must be light, dark, or system'),
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications setting must be a boolean'),
  body('notifications.credentialExpiry')
    .optional()
    .isBoolean()
    .withMessage('Credential expiry notifications setting must be a boolean'),
  body('notifications.securityAlerts')
    .optional()
    .isBoolean()
    .withMessage('Security alerts notifications setting must be a boolean'),
  body('security.sessionTimeout')
    .optional()
    .isInt({ min: 5, max: 480 })
    .withMessage('Session timeout must be between 5 and 480 minutes'),
  body('privacy.shareUsageData')
    .optional()
    .isBoolean()
    .withMessage('Share usage data setting must be a boolean'),
];
