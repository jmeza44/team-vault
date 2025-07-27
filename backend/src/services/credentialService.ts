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
          {
            sharedWith: {
              some: {
                sharedWithTeam: {
                  memberships: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        ],
      };

      // Apply team filter if specified
      if (filters.teamId) {
        where.OR = [
          {
            // Credentials owned by user and shared with specific team
            ownerId: userId,
            sharedWith: {
              some: {
                sharedWithTeamId: filters.teamId,
              },
            },
          },
          {
            // Credentials shared with specific team where user is member
            sharedWith: {
              some: {
                sharedWithTeamId: filters.teamId,
                sharedWithTeam: {
                  memberships: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              },
            },
          },
        ];
      }

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

  static async shareCredential(credentialId: string, userId: string, shareData: {
    userIds?: string[];
    teamIds?: string[];
    accessLevel?: AccessLevel;
    expiresAt?: Date;
  }) {
    try {
      // Check if user owns this credential or has write access
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          OR: [
            { ownerId: userId },
            {
              sharedWith: {
                some: {
                  sharedWithUserId: userId,
                  accessLevel: AccessLevel.WRITE,
                },
              },
            },
            {
              sharedWith: {
                some: {
                  sharedWithTeam: {
                    memberships: {
                      some: {
                        userId: userId,
                        role: 'ADMIN',
                      },
                    },
                  },
                  accessLevel: AccessLevel.WRITE,
                },
              },
            },
          ],
        },
      });

      if (!credential) {
        return false;
      }

      const accessLevel = shareData.accessLevel || AccessLevel.READ;
      const expiresAt = shareData.expiresAt;

      // Share with individual users
      if (shareData.userIds && shareData.userIds.length > 0) {
        // Remove existing user shares not in the new list
        await prisma.sharedCredential.deleteMany({
          where: {
            credentialId,
            sharedWithUserId: { notIn: shareData.userIds },
            sharedWithTeamId: null, // Only remove individual user shares
          },
        });

        // Add new user shares
        const userSharePromises = shareData.userIds.map(async (targetUserId) => {
          try {
            const shareData: any = {
              credentialId,
              sharedWithUserId: targetUserId,
              createdById: userId,
              accessLevel,
            };

            if (expiresAt) {
              shareData.expiresAt = expiresAt;
            }

            return await prisma.sharedCredential.create({
              data: shareData,
            });
          } catch (error) {
            // Check if it's a unique constraint violation, try to update
            try {
              const updateData: any = { accessLevel };
              if (expiresAt !== undefined) {
                updateData.expiresAt = expiresAt;
              }

              return await prisma.sharedCredential.updateMany({
                where: {
                  credentialId,
                  sharedWithUserId: targetUserId,
                },
                data: updateData,
              });
            } catch (updateError) {
              logger.warn(`Failed to share with user ${targetUserId}:`, error);
              return null;
            }
          }
        });

        await Promise.all(userSharePromises);
      }

      // Share with teams
      if (shareData.teamIds && shareData.teamIds.length > 0) {
        // Verify user has access to share with these teams
        const userTeams = await prisma.teamMembership.findMany({
          where: {
            userId,
            teamId: { in: shareData.teamIds },
          },
          select: { teamId: true },
        });

        const validTeamIds = userTeams.map(membership => membership.teamId);

        if (validTeamIds.length > 0) {
          // Remove existing team shares not in the new list
          await prisma.sharedCredential.deleteMany({
            where: {
              credentialId,
              sharedWithTeamId: { notIn: validTeamIds },
              sharedWithUserId: null, // Only remove team shares
            },
          });

          // Add new team shares
          const teamSharePromises = validTeamIds.map(async (teamId) => {
            try {
              const shareData: any = {
                credentialId,
                sharedWithTeamId: teamId,
                createdById: userId,
                accessLevel,
              };

              if (expiresAt) {
                shareData.expiresAt = expiresAt;
              }

              return await prisma.sharedCredential.create({
                data: shareData,
              });
            } catch (error) {
              // Check if it's a unique constraint violation, try to update
              try {
                const updateData: any = { accessLevel };
                if (expiresAt !== undefined) {
                  updateData.expiresAt = expiresAt;
                }

                return await prisma.sharedCredential.updateMany({
                  where: {
                    credentialId,
                    sharedWithTeamId: teamId,
                  },
                  data: updateData,
                });
              } catch (updateError) {
                logger.warn(`Failed to share with team ${teamId}:`, error);
                return null;
              }
            }
          });

          await Promise.all(teamSharePromises);
        }
      }

      const totalShared = (shareData.userIds?.length || 0) + (shareData.teamIds?.length || 0);
      logger.info(`Shared credential ${credentialId} with ${totalShared} users/teams`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'SHARE_CREDENTIAL',
          details: {
            credentialName: credential.name,
            userCount: shareData.userIds?.length || 0,
            teamCount: shareData.teamIds?.length || 0,
            accessLevel,
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

  static async getCredentialShares(credentialId: string, userId: string) {
    try {
      // Check if user has access to this credential
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
            {
              sharedWith: {
                some: {
                  sharedWithTeam: {
                    memberships: {
                      some: {
                        userId: userId,
                      },
                    },
                  },
                },
              },
            },
          ],
        },
      });

      if (!credential) {
        return null;
      }

      // Get all shares for this credential
      const shares = await prisma.sharedCredential.findMany({
        where: {
          credentialId,
        },
        include: {
          sharedWithUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          sharedWithTeam: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return shares;
    } catch (error) {
      logger.error('Error getting credential shares:', error);
      throw error;
    }
  }

  static async removeCredentialShare(credentialId: string, shareId: string, userId: string) {
    try {
      // Check if user owns this credential or is admin of the team
      const credential = await prisma.credential.findFirst({
        where: {
          id: credentialId,
          ownerId: userId,
        },
      });

      if (!credential) {
        // Check if user is admin of a team that has this share
        const teamShare = await prisma.sharedCredential.findFirst({
          where: {
            id: shareId,
            credentialId,
            sharedWithTeam: {
              memberships: {
                some: {
                  userId: userId,
                  role: 'ADMIN',
                },
              },
            },
          },
        });

        if (!teamShare) {
          return false;
        }
      }

      // Remove the share
      await prisma.sharedCredential.delete({
        where: {
          id: shareId,
        },
      });

      logger.info(`Removed share ${shareId} for credential ${credentialId} by user ${userId}`);

      // Log audit entry
      await prisma.auditLog.create({
        data: {
          action: 'REMOVE_SHARE',
          details: {
            credentialName: credential?.name || 'Unknown',
            shareId,
          },
          userId: userId,
          credentialId: credentialId,
        },
      });

      return true;
    } catch (error) {
      logger.error('Error removing credential share:', error);
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
