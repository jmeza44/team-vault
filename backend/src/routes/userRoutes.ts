import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticateToken, validateRequest } from '@/middleware';
import {
  validateUpdateProfile,
  validateChangePassword,
  validateUpdateSettings,
} from '@/validations/userValidation';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.patch('/profile', validateUpdateProfile, validateRequest, userController.updateProfile);

// Change password
router.patch('/password', validateChangePassword, validateRequest, userController.changePassword);

// Get user settings
router.get('/settings', userController.getSettings);

// Update user settings
router.patch('/settings', validateUpdateSettings, validateRequest, userController.updateSettings);

export default router;
