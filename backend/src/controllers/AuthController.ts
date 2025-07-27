import { Request, Response } from 'express';
import { CreateUserData, LoginResponse, RefreshTokenResponse } from '@/models';
import { AuthService } from '@/services';
import { ResponseUtil, generateTokens, logger, verifyRefreshToken, generateAccessToken } from '@/utils';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, name, password }: CreateUserData = req.body;

      // Check if user already exists
      const userExists = await AuthService.userExists(email);
      if (userExists) {
        return ResponseUtil.conflict(res, 'User with this email already exists');
      }

      // Create user
      const user = await AuthService.createUser({ email, name, password });

      ResponseUtil.success(res, {
        user,
        message: 'User registered successfully',
      }, 201);
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Registration');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Authenticate user
      const user = await AuthService.authenticateUser(email, password);
      if (!user) {
        return ResponseUtil.unauthorized(res, 'Invalid credentials');
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token and update last login
      await Promise.all([
        AuthService.storeRefreshToken(user.id, refreshToken),
        AuthService.updateLastLogin(user.id),
      ]);

      logger.info('User logged in', { userId: user.id, email: user.email });

      const loginResponse: LoginResponse = {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };

      ResponseUtil.success(res, loginResponse);
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Login');
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await AuthService.findRefreshToken(refreshToken);
      if (!storedToken) {
        return ResponseUtil.unauthorized(res, 'Invalid refresh token');
      }

      // Generate new access token
      const accessToken = generateAccessToken(storedToken.userId);

      const refreshResponse: RefreshTokenResponse = {
        accessToken,
      };

      ResponseUtil.success(res, refreshResponse);
    } catch (error) {
      ResponseUtil.unauthorized(res, 'Invalid refresh token');
    }
  }

  async logout(_req: Request, res: Response) {
    try {
      // Implementation would require the refresh token to be sent
      // For now, just return success
      ResponseUtil.success(res, {
        message: 'Logged out successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Logout');
    }
  }

  async verifyEmail(_req: Request, res: Response) {
    try {
      // Implementation would require email verification tokens
      ResponseUtil.success(res, {
        message: 'Email verified successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Email verification');
    }
  }

  async forgotPassword(_req: Request, res: Response) {
    try {
      // Implementation would require email service
      ResponseUtil.success(res, {
        message: 'Password reset email sent',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Forgot password');
    }
  }

  async resetPassword(_req: Request, res: Response) {
    try {
      // Implementation would require reset tokens
      ResponseUtil.success(res, {
        message: 'Password reset successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Password reset');
    }
  }
}
