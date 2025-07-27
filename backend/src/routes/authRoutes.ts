import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@/controllers';
import { authenticateToken, validateRequest } from '@/middleware';

const router = Router();
const authController = new AuthController();

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  ],
  validateRequest,
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  validateRequest,
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  [
    body('refreshToken').exists(),
  ],
  validateRequest,
  authController.refreshToken
);

// Logout
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

// Verify email
router.post(
  '/verify-email',
  [
    body('token').exists(),
  ],
  validateRequest,
  authController.verifyEmail
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  validateRequest,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').exists(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  ],
  validateRequest,
  authController.resetPassword
);

export default router;
