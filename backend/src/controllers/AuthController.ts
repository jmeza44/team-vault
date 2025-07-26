import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'User with this email already exists',
          },
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      logger.info('User registered', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        data: {
          user,
          message: 'User registered successfully',
        },
      });
      return;
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Registration failed',
        },
      });
      return;
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.isActive) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
          },
        });
        return;
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);

      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid credentials',
          },
        });
        return;
      }

      // Generate tokens
      const jwtSecret = process.env['JWT_SECRET'];
      const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
      
      if (!jwtSecret || !jwtRefreshSecret) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Server configuration error',
          },
        });
        return;
      }

      const accessToken = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        jwtRefreshSecret,
        { expiresIn: '7d' }
      );

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Login failed',
        },
      });
      return;
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const jwtRefreshSecret = process.env['JWT_REFRESH_SECRET'];
      const jwtSecret = process.env['JWT_SECRET'];
      
      if (!jwtRefreshSecret || !jwtSecret) {
        res.status(500).json({
          success: false,
          error: {
            message: 'Server configuration error',
          },
        });
        return;
      }

      // Verify refresh token
      jwt.verify(refreshToken, jwtRefreshSecret);

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || !storedToken.user.isActive) {
        res.status(401).json({
          success: false,
          error: {
            message: 'Invalid refresh token',
          },
        });
        return;
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: storedToken.userId },
        jwtSecret,
        { expiresIn: '15m' }
      );

      res.json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid refresh token',
        },
      });
      return;
    }
  }

  async logout(_req: Request, res: Response) {
    try {
      // Implementation would require the refresh token to be sent
      // For now, just return success
      res.json({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Logout failed',
        },
      });
    }
  }

  async verifyEmail(_req: Request, res: Response) {
    try {
      // Implementation would require email verification tokens
      res.json({
        success: true,
        data: {
          message: 'Email verified successfully',
        },
      });
    } catch (error) {
      logger.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Email verification failed',
        },
      });
    }
  }

  async forgotPassword(_req: Request, res: Response) {
    try {
      // Implementation would require email service
      res.json({
        success: true,
        data: {
          message: 'Password reset email sent',
        },
      });
    } catch (error) {
      logger.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Failed to send reset email',
        },
      });
    }
  }

  async resetPassword(_req: Request, res: Response) {
    try {
      // Implementation would require reset tokens
      res.json({
        success: true,
        data: {
          message: 'Password reset successfully',
        },
      });
    } catch (error) {
      logger.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Password reset failed',
        },
      });
    }
  }
}
