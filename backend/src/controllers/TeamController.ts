import { Response } from 'express';
import { TeamFilters, CreateTeamData, UpdateTeamData, AddTeamMemberData, UpdateTeamMemberRoleData, AuthenticatedRequest } from '@/models';
import { TeamService } from '@/services';
import { ResponseUtil } from '@/utils';

export class TeamController {
  async getTeams(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { search, role, limit, offset } = req.query;

      const filters: TeamFilters = {};
      if (search) filters.search = search as string;
      if (role) filters.role = role as any;
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const teams = await TeamService.getUserTeams(userId, filters);

      ResponseUtil.success(res, {
        teams,
        count: teams.length,
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get teams');
    }
  }

  async getTeamById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId } = req.params;

      const team = await TeamService.getTeamById(teamId, userId);

      if (!team) {
        return ResponseUtil.notFound(res, 'Team not found');
      }

      ResponseUtil.success(res, { team });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Get team');
    }
  }

  async createTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const teamData: CreateTeamData = req.body;

      const team = await TeamService.createTeam(userId, teamData);

      ResponseUtil.success(res, {
        team,
        message: 'Team created successfully',
      }, 201);
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Create team');
    }
  }

  async updateTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId } = req.params;
      const updateData: UpdateTeamData = req.body;

      const updatedTeam = await TeamService.updateTeam(teamId, userId, updateData);

      ResponseUtil.success(res, {
        team: updatedTeam,
        message: 'Team updated successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Update team');
    }
  }

  async deleteTeam(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId } = req.params;

      await TeamService.deleteTeam(teamId, userId);

      ResponseUtil.success(res, {
        message: 'Team deleted successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Delete team');
    }
  }

  async addTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId } = req.params;
      const memberData: AddTeamMemberData = req.body;

      await TeamService.addTeamMember(teamId, userId, memberData);

      ResponseUtil.success(res, {
        message: 'Team member added successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Add team member');
    }
  }

  async removeTeamMember(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId, userId: memberUserId } = req.params;

      await TeamService.removeTeamMember(teamId, userId, memberUserId);

      ResponseUtil.success(res, {
        message: 'Team member removed successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Remove team member');
    }
  }

  async updateTeamMemberRole(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id: teamId, userId: memberUserId } = req.params;
      const roleData: UpdateTeamMemberRoleData = req.body;

      await TeamService.updateTeamMemberRole(teamId, userId, memberUserId, roleData);

      ResponseUtil.success(res, {
        message: 'Team member role updated successfully',
      });
    } catch (error) {
      ResponseUtil.handleError(res, error, 'Update team member role');
    }
  }
}
