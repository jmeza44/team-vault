import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { authenticateToken } from '@/middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticateToken);

// Get current user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.patch('/profile', userController.updateProfile);

// Get user settings
router.get('/settings', userController.getSettings);

// Update user settings
router.patch('/settings', userController.updateSettings);

export default router;
