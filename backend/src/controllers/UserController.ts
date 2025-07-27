import { Response } from 'express';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';

const prisma = new PrismaClient();

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
          },
        });
        return;
      }

      // Fetch complete user data from database
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get profile',
        },
      });
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { name, email } = req.body;

      // Check if email is already taken by another user
      if (email && email !== req.user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          res.status(409).json({
            success: false,
            error: {
              message: 'Email already in use',
            },
          });
          return;
        }
      }

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          user: updatedUser,
          message: 'Profile updated successfully',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update profile',
        },
      });
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
          },
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      // Fetch user with password hash
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          passwordHash: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: {
            message: 'User not found',
          },
        });
        return;
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Current password is incorrect',
          },
        });
        return;
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      res.json({
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to change password',
        },
      });
    }
  }

  async getSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
          },
        });
        return;
      }

      // For now, we'll return basic user preferences
      // This can be extended to include user-specific settings stored in a settings table
      const settings = {
        theme: 'system', // Default theme
        notifications: {
          email: true,
          credentialExpiry: true,
          securityAlerts: true,
        },
        security: {
          twoFactorEnabled: false,
          sessionTimeout: 30, // minutes
        },
        privacy: {
          shareUsageData: false,
        },
      };

      res.json({
        success: true,
        data: {
          settings,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to get settings',
        },
      });
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            message: 'User not authenticated',
          },
        });
        return;
      }

      // For now, we'll just return success
      // In a real implementation, you'd store these settings in a database
      const { theme, notifications, security, privacy } = req.body;

      // Here you would typically save the settings to a UserSettings table
      // For now, we'll just validate and return success

      res.json({
        success: true,
        data: {
          message: 'Settings updated successfully',
          settings: {
            theme,
            notifications,
            security,
            privacy,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to update settings',
        },
      });
    }
  }
}
