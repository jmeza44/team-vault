import { Router } from 'express';
import { body, param } from 'express-validator';
import { TeamController } from '@/controllers/TeamController';
import { authenticateToken, validateRequest } from '@/middleware';

const router = Router();
const teamController = new TeamController();

// All team routes require authentication
router.use(authenticateToken);

// Get all teams for user
router.get('/', teamController.getTeams);

// Get team by ID
router.get(
  '/:id',
  [param('id').isUUID()],
  validateRequest,
  teamController.getTeamById
);

// Create team
router.post(
  '/',
  [
    body('name').trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  teamController.createTeam
);

// Update team
router.patch(
  '/:id',
  [
    param('id').isUUID(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ max: 500 }),
  ],
  validateRequest,
  teamController.updateTeam
);

// Delete team
router.delete(
  '/:id',
  [param('id').isUUID()],
  validateRequest,
  teamController.deleteTeam
);

// Add team member
router.post(
  '/:id/members',
  [
    param('id').isUUID(),
    body('email').isEmail().withMessage('Valid email is required'),
    body('role').isIn(['MEMBER', 'ADMIN']),
  ],
  validateRequest,
  teamController.addTeamMember
);

// Remove team member
router.delete(
  '/:id/members/:userId',
  [
    param('id').isUUID(),
    param('userId').isUUID(),
  ],
  validateRequest,
  teamController.removeTeamMember
);

// Update team member role
router.patch(
  '/:id/members/:userId',
  [
    param('id').isUUID(),
    param('userId').isUUID(),
    body('role').isIn(['MEMBER', 'ADMIN']),
  ],
  validateRequest,
  teamController.updateTeamMemberRole
);

export default router;
