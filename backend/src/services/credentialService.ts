import { PrismaClient, RiskLevel, AccessLevel } from '@prisma/client';
import { encryptSensitiveData, decryptSensitiveData } from '../utils/encryption';
import { logger } from '../utils/logger';
import { CredentialFilters, CreateCredentialData, UpdateCredentialData } from '@/models/CredentialModels';

const prisma = new PrismaClient();

export class CredentialService {
  static async getUserCredentials(userId: string, filters: CredentialFilters = {}) {
    try {
      const where: any = {
        OR: [
          { ownerId: userId },
          {
            sharedWith: {
              some: {
                sharedWithUserId: userId,
              },
            },
          },
        ],
      };

      // Apply filters
      if (filters.search) {
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { username: { contains: filters.search, mode: 'insensitive' } },
          ],
        });
      }

      if (filters.category) {
        where.category = { equals: filters.category, mode: 'insensitive' };
      }

      if (filters.riskLevel) {
        where.riskLevel = filters.riskLevel as RiskLevel;
      }

      const queryOptions: any = {
        where,
        select: {
          id: true,
          name: true,
          username: true,
          description: true,
          category: true,
          url: true,
          tags: true,
          expirationDate: true,
          riskLevel: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
        orderBy: { createdAt: 'desc' },
      };

      if (filters.limit) queryOptions.take = filters.limit;
      if (filters.offset) queryOptions.skip = filters.offset;

      const credentials = await prisma.credential.findMany(queryOptions);

      logger.info(`Retrieved ${credentials.length} credentials for user ${userId}`);
      return credentials;
    } catch (error) {
      logger.error('Error retrieving user credentials:', error);
      throw error;
    }
  }

  static async getCredential(credentialId: string, userId: string) {
    try {
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  sharedWithUserId: userId,
                },
              },
            },
          ],
        },
        include: {
          sharedWith: {
            include: {
              sharedWithUser: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!credential) {
        return null;
      }

      // Decrypt the secret for authorized users
      const decryptedCredential = {
        ...credential,
        secret: decryptSensitiveData(credential.encryptedSecret),
      };

      logger.info(`Retrieved credential ${credentialId} for user ${userId}`);
      return decryptedCredential;
    } catch (error) {
      logger.error('Error retrieving credential:', error);
      throw error;
    }
  }

  static async createCredential(userId: string, data: CreateCredentialData) {
    try {
      // Encrypt the secret before storing
      const encryptedSecret = encryptSensitiveData(data.secret);

      const credential = await prisma.credential.create({
        data: {
          name: data.name,
          username: data.username || null,
          encryptedSecret: encryptedSecret,
          description: data.description || null,
          category: data.category || null,
          url: data.url || null,
          tags: data.tags || [],
          expirationDate: data.expirationDate || null,
          riskLevel: data.riskLevel || RiskLevel.MEDIUM,
          ownerId: userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          description: true,
          category: true,
          url: true,
          tags: true,
          expirationDate: true,
          riskLevel: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
      });

      logger.info(`Created credential ${credential.id} for user ${userId}`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_CREDENTIAL',
          details: { credentialName: data.name },
          userId: userId,
          credentialId: credential.id,
        },
      });

      return credential;
    } catch (error) {
      logger.error('Error creating credential:', error);
      throw error;
    }
  }

  static async updateCredential(credentialId: string, userId: string, data: UpdateCredentialData) {
    try {
      // First check if user has access to this credential
      const existingCredential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          ownerId: userId, // Only owner can update
        },
      });

      if (!existingCredential) {
        return null;
      }

      // Prepare update data
      const updateData: any = {};

      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          if (key === 'secret') {
            updateData.encryptedSecret = encryptSensitiveData(value);
          } else {
            updateData[key] = value;
          }
        }
      });

      updateData.updatedAt = new Date();

      const credential = await prisma.credential.update({
        where: { id: credentialId },
        data: updateData,
        select: {
          id: true,
          name: true,
          username: true,
          description: true,
          category: true,
          url: true,
          tags: true,
          expirationDate: true,
          riskLevel: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
        },
      });

      logger.info(`Updated credential ${credentialId} by user ${userId}`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_CREDENTIAL',
          details: { credentialName: credential.name },
          userId: userId,
          credentialId: credentialId,
        },
      });

      return credential;
    } catch (error) {
      logger.error('Error updating credential:', error);
      throw error;
    }
  }

  static async deleteCredential(credentialId: string, userId: string) {
    try {
      // First check if user owns this credential
      const existingCredential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          ownerId: userId, // Only owner can delete
        },
      });

      if (!existingCredential) {
        return false;
      }

      // Delete all related records first
      await prisma.sharedCredential.deleteMany({
        where: { credentialId },
      });

      await prisma.oneTimeLink.deleteMany({
        where: { credentialId },
      });

      // Delete the credential
      await prisma.credential.delete({
        where: { id: credentialId },
      });

      logger.info(`Deleted credential ${credentialId} by user ${userId}`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'DELETE_CREDENTIAL',
          details: { credentialName: existingCredential.name },
          userId: userId,
          credentialId: credentialId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error deleting credential:', error);
      throw error;
    }
  }

  static async shareCredential(credentialId: string, userId: string, targetUserIds: string[]) {
    try {
      // Check if user owns this credential
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          ownerId: userId,
        },
      });

      if (!credential) {
        return false;
      }

      // Remove existing shares not in the new list
      await prisma.sharedCredential.deleteMany({
        where: {
          credentialId,
          sharedWithUserId: { notIn: targetUserIds },
        },
      });

      // Add new shares
      const sharePromises = targetUserIds.map(async (targetUserId) => {
        try {
          return await prisma.sharedCredential.create({
            data: {
              credentialId,
              sharedWithUserId: targetUserId,
              createdById: userId,
              accessLevel: AccessLevel.READ,
            },
          });
        } catch (error) {
          // Ignore duplicates
          return null;
        }
      });

      await Promise.all(sharePromises);

      logger.info(`Shared credential ${credentialId} with ${targetUserIds.length} users`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'SHARE_CREDENTIAL',
          details: {
            credentialName: credential.name,
            sharedWithCount: targetUserIds.length
          },
          userId: userId,
          credentialId: credentialId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error sharing credential:', error);
      throw error;
    }
  }

  static async createOneTimeLink(credentialId: string, userId: string) {
    try {
      // Check if user has access to this credential
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: { sharedWithUserId: userId },
              },
            },
          ],
        },
      });

      if (!credential) {
        return null;
      }

      // Generate a unique token
      const token = Buffer.from(
        `${credentialId}-${userId}-${Date.now()}-${Math.random()}`
      ).toString('base64url');

      // Create one-time link (expires in 24 hours)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      await prisma.oneTimeLink.create({
        data: {
          token,
          credentialId,
          createdById: userId,
          accessLevel: AccessLevel.READ,
          expiresAt,
        },
      });

      logger.info(`Created one-time link for credential ${credentialId}`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'CREATE_ONE_TIME_LINK',
          details: { credentialName: credential.name },
          userId: userId,
          credentialId: credentialId,
        },
      });

      return token;
    } catch (error) {
      logger.error('Error creating one-time link:', error);
      throw error;
    }
  }
}
