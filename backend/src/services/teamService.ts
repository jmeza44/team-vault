import { PrismaClient, TeamRole } from '@prisma/client';
import { logger } from '../utils/logger';
import { 
  CreateTeamData, 
  UpdateTeamData, 
  AddTeamMemberData, 
  UpdateTeamMemberRoleData,
  TeamWithMembers,
  TeamSummary,
  TeamFilters 
} from '../models/TeamModels';

const prisma = new PrismaClient();

export class TeamService {
  /**
   * Get all teams for a user with their role in each team
   */
  static async getUserTeams(userId: string, filters: TeamFilters = {}): Promise<TeamSummary[]> {
    try {
      const where: any = {
        memberships: {
          some: {
            userId: userId,
          },
        },
      };

      // Apply search filter
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      // Apply role filter
      if (filters.role) {
        where.memberships.some.role = filters.role;
      }

      const queryOptions: any = {
        where,
        include: {
          memberships: {
            where: { userId: userId },
            select: { role: true },
          },
          _count: {
            select: { memberships: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      };

      if (filters.limit) {
        queryOptions.take = filters.limit;
        if (filters.offset) {
          queryOptions.skip = filters.offset;
        }
      }

      const teams = await prisma.team.findMany(queryOptions) as Array<{
        id: string;
        name: string;
        description: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        memberships: Array<{ role: TeamRole }>;
        _count: { memberships: number };
      }>;

      return teams.map(team => ({
        id: team.id,
        name: team.name,
        description: team.description,
        createdById: team.createdById,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        memberCount: team._count.memberships,
        role: team.memberships[0]?.role || TeamRole.MEMBER,
      }));
    } catch (error) {
      logger.error('Error getting user teams:', error);
      throw new Error('Failed to get teams');
    }
  }

  /**
   * Get team by ID with full member details
   */
  static async getTeamById(teamId: string, userId: string): Promise<TeamWithMembers | null> {
    try {
      // First check if user is a member of this team
      const membership = await prisma.teamMembership.findFirst({
        where: {
          teamId: teamId,
          userId: userId,
        },
      });

      if (!membership) {
        throw new Error('Access denied: You are not a member of this team');
      }

      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: [
              { role: 'asc' }, // Admins first
              { joinedAt: 'asc' }, // Then by join date
            ],
          },
        },
      }) as {
        id: string;
        name: string;
        description: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        memberships: Array<{
          id: string;
          userId: string;
          teamId: string;
          role: TeamRole;
          joinedAt: Date;
          user: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      } | null;

      if (!team) {
        return null;
      }

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        createdById: team.createdById,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        memberships: team.memberships,
        memberCount: team.memberships.length,
      };
    } catch (error) {
      logger.error('Error getting team by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new team
   */
  static async createTeam(userId: string, teamData: CreateTeamData): Promise<TeamWithMembers> {
    try {
      const team = await prisma.team.create({
        data: {
          name: teamData.name,
          description: teamData.description || null,
          createdById: userId,
          memberships: {
            create: {
              userId: userId,
              role: TeamRole.ADMIN, // Creator is automatically an admin
            },
          },
        },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }) as {
        id: string;
        name: string;
        description: string | null;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        memberships: Array<{
          id: string;
          userId: string;
          teamId: string;
          role: TeamRole;
          joinedAt: Date;
          user: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      };

      logger.info('Team created successfully', { teamId: team.id, userId, teamName: team.name });

      return {
        id: team.id,
        name: team.name,
        description: team.description,
        createdById: team.createdById,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
        memberships: team.memberships,
        memberCount: team.memberships.length,
      };
    } catch (error) {
      logger.error('Error creating team:', error);
      throw new Error('Failed to create team');
    }
  }

  /**
   * Update team information
   */
  static async updateTeam(teamId: string, userId: string, updateData: UpdateTeamData): Promise<any> {
    try {
      // Check if user is an admin of this team
      await this.requireTeamAdmin(teamId, userId);

      const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: updateData,
      });

      logger.info('Team updated successfully', { teamId, userId });
      
      return {
        id: updatedTeam.id,
        name: updatedTeam.name,
        description: updatedTeam.description,
        createdById: updatedTeam.createdById,
        createdAt: updatedTeam.createdAt,
        updatedAt: updatedTeam.updatedAt,
      };
    } catch (error) {
      logger.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete a team
   */
  static async deleteTeam(teamId: string, userId: string): Promise<void> {
    try {
      // Check if user is an admin of this team
      await this.requireTeamAdmin(teamId, userId);

      await prisma.team.delete({
        where: { id: teamId },
      });

      logger.info('Team deleted successfully', { teamId, userId });
    } catch (error) {
      logger.error('Error deleting team:', error);
      throw error;
    }
  }

  /**
   * Add a member to a team
   */
  static async addTeamMember(teamId: string, adminUserId: string, memberData: AddTeamMemberData): Promise<void> {
    try {
      // Check if requester is an admin of this team
      await this.requireTeamAdmin(teamId, adminUserId);

      // Find user by email
      const userToAdd = await prisma.user.findUnique({
        where: { email: memberData.email },
      });

      if (!userToAdd) {
        throw new Error('User not found with this email address');
      }

      // Check if user is already a member
      const existingMembership = await prisma.teamMembership.findFirst({
        where: {
          teamId: teamId,
          userId: userToAdd.id,
        },
      });

      if (existingMembership) {
        throw new Error('User is already a member of this team');
      }

      await prisma.teamMembership.create({
        data: {
          teamId: teamId,
          userId: userToAdd.id,
          role: memberData.role,
        },
      });

      logger.info('Team member added successfully', { teamId, adminUserId, newMemberId: userToAdd.id, newMemberEmail: memberData.email });
    } catch (error) {
      logger.error('Error adding team member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a team
   */
  static async removeTeamMember(teamId: string, adminUserId: string, memberUserId: string): Promise<void> {
    try {
      // Check if requester is an admin of this team
      await this.requireTeamAdmin(teamId, adminUserId);

      // Prevent removing the team creator unless there's another admin
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
          memberships: {
            where: { role: TeamRole.ADMIN },
          },
        },
      });

      if (!team) {
        throw new Error('Team not found');
      }

      if (team.createdById === memberUserId && team.memberships.length === 1) {
        throw new Error('Cannot remove the team creator unless there is another admin');
      }

      const deletedMembership = await prisma.teamMembership.deleteMany({
        where: {
          teamId: teamId,
          userId: memberUserId,
        },
      });

      if (deletedMembership.count === 0) {
        throw new Error('User is not a member of this team');
      }

      logger.info('Team member removed successfully', { teamId, adminUserId, removedMemberId: memberUserId });
    } catch (error) {
      logger.error('Error removing team member:', error);
      throw error;
    }
  }

  /**
   * Update a team member's role
   */
  static async updateTeamMemberRole(
    teamId: string, 
    adminUserId: string, 
    memberUserId: string, 
    roleData: UpdateTeamMemberRoleData
  ): Promise<void> {
    try {
      // Check if requester is an admin of this team
      await this.requireTeamAdmin(teamId, adminUserId);

      // Prevent removing admin role from team creator unless there's another admin
      if (roleData.role === TeamRole.MEMBER) {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: {
            memberships: {
              where: { role: TeamRole.ADMIN },
            },
          },
        });

        if (team?.createdById === memberUserId && team.memberships.length === 1) {
          throw new Error('Cannot remove admin role from team creator unless there is another admin');
        }
      }

      const updatedMembership = await prisma.teamMembership.updateMany({
        where: {
          teamId: teamId,
          userId: memberUserId,
        },
        data: {
          role: roleData.role,
        },
      });

      if (updatedMembership.count === 0) {
        throw new Error('User is not a member of this team');
      }

      logger.info('Team member role updated successfully', { 
        teamId, 
        adminUserId, 
        memberId: memberUserId, 
        newRole: roleData.role 
      });
    } catch (error) {
      logger.error('Error updating team member role:', error);
      throw error;
    }
  }

  /**
   * Check if user is an admin of the team
   */
  private static async requireTeamAdmin(teamId: string, userId: string): Promise<void> {
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
        role: TeamRole.ADMIN,
      },
    });

    if (!membership) {
      throw new Error('Access denied: Admin role required');
    }
  }

  /**
   * Check if user is a member of the team
   */
  static async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
    });

    return !!membership;
  }

  /**
   * Get user's role in a team
   */
  static async getUserRoleInTeam(teamId: string, userId: string): Promise<TeamRole | null> {
    const membership = await prisma.teamMembership.findFirst({
      where: {
        teamId: teamId,
        userId: userId,
      },
      select: {
        role: true,
      },
    });

    return membership?.role || null;
  }
}
