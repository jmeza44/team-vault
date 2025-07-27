import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '@/utils';
import { CreateUserData, UserResponse } from '@/models/AuthModels';

const prisma = new PrismaClient();

// Auth service class
export class AuthService {
  // Check if user exists
  static async userExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }

  // Create new user
  static async createUser(userData: CreateUserData): Promise<UserResponse> {
    const { email, name, password } = userData;

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
    return user;
  }

  // Authenticate user
  static async authenticateUser(email: string, password: string): Promise<any | null> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return null;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  // Store refresh token
  static async storeRefreshToken(userId: string, token: string): Promise<void> {
    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  // Update last login
  static async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  // Find refresh token
  static async findRefreshToken(token: string): Promise<any | null> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || !storedToken.user.isActive) {
      return null;
    }

    return storedToken;
  }

  // Remove refresh token (for logout)
  static async removeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }
}
