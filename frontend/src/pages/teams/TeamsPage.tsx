import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import teamService, {
  TeamWithMembers,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddMemberRequest,
  UpdateMemberRequest,
} from '@/services/teamService';
import { TeamForm, TeamFormData } from '@/components/teams/TeamForm';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamDetailModal } from '@/components/teams/TeamDetailModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useConfirm } from '@/hooks/useConfirm';
import { Users } from 'lucide-react';

type ViewMode = 'list' | 'form' | 'detail';

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const { confirm, confirmState, handleClose, handleConfirm } = useConfirm();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsWithMembers, setTeamsWithMembers] = useState<{
    [key: string]: TeamWithMembers;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTeam, setSelectedTeam] = useState<
    Team | TeamWithMembers | null
  >(null);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await teamService.getTeams();

      if (response.success && response.data) {
        // The backend returns { teams: Team[], count: number }
        const teamsData = response.data.teams;
        setTeams(teamsData);

        // Load detailed info for each team
        const teamDetails: { [key: string]: TeamWithMembers } = {};
        for (const team of teamsData) {
          try {
            const detailResponse = await teamService.getTeam(team.id);
            if (detailResponse.success && detailResponse.data) {
              teamDetails[team.id] = detailResponse.data.team;
            }
          } catch (err) {
            console.warn(`Failed to load details for team ${team.id}:`, err);
          }
        }
        setTeamsWithMembers(teamDetails);
      } else {
        setError(response.error?.message || 'Failed to load teams');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading teams');
      console.error('Load teams error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (formData: TeamFormData) => {
    try {
      setIsFormLoading(true);

      const createData: CreateTeamRequest = {
        name: formData.name,
        description: formData.description || undefined,
      };

      const response = await teamService.createTeam(createData);

      if (response.success) {
        await loadTeams(); // Reload the list
        setViewMode('list');
        setSelectedTeam(null);
      } else {
        setError(response.error?.message || 'Failed to create team');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the team');
      console.error('Create team error:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateTeam = async (formData: TeamFormData) => {
    if (!selectedTeam) return;

    try {
      setIsFormLoading(true);

      const updateData: UpdateTeamRequest = {
        name: formData.name,
        description: formData.description || undefined,
      };

      const response = await teamService.updateTeam(
        selectedTeam.id,
        updateData
      );

      if (response.success) {
        await loadTeams(); // Reload the list
        setViewMode('list');
        setSelectedTeam(null);
      } else {
        setError(response.error?.message || 'Failed to update team');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating the team');
      console.error('Update team error:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleDeleteTeam = async (team: Team | TeamWithMembers) => {
    const confirmed = await confirm({
      title: 'Delete Team',
      message: `Are you sure you want to delete "${team.name}"? This action cannot be undone and will remove all team data.`,
      confirmText: 'Delete Team',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await teamService.deleteTeam(team.id);

      if (response.success) {
        await loadTeams(); // Reload the list
        if (selectedTeam?.id === team.id) {
          setViewMode('list');
          setSelectedTeam(null);
        }
      } else {
        setError(response.error?.message || 'Failed to delete team');
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the team');
      console.error('Delete team error:', err);
    }
  };

  const handleViewTeam = async (team: Team | TeamWithMembers) => {
    try {
      let teamWithMembers: TeamWithMembers;

      if ('memberships' in team && team.memberships) {
        teamWithMembers = team as TeamWithMembers;
      } else {
        const response = await teamService.getTeam(team.id);
        if (response.success && response.data) {
          teamWithMembers = response.data.team;
        } else {
          setError(response.error?.message || 'Failed to load team details');
          return;
        }
      }

      setSelectedTeam(teamWithMembers);
      setViewMode('detail');
    } catch (err) {
      setError('An unexpected error occurred while loading team details');
      console.error('View team error:', err);
    }
  };

  const handleEditTeam = (team: Team | TeamWithMembers) => {
    setSelectedTeam(team);
    setViewMode('form');
  };

  const handleAddMember = async (teamId: string, data: AddMemberRequest) => {
    try {
      const response = await teamService.addMember(teamId, data);

      if (response.success) {
        // Reload team details
        const teamResponse = await teamService.getTeam(teamId);
        if (teamResponse.success && teamResponse.data) {
          setSelectedTeam(teamResponse.data.team);
          setTeamsWithMembers(prev => ({
            ...prev,
            [teamId]: teamResponse.data!.team,
          }));
        }
      } else {
        setError(response.error?.message || 'Failed to add member');
      }
    } catch (err) {
      setError('An unexpected error occurred while adding member');
      console.error('Add member error:', err);
    }
  };

  const handleUpdateMember = async (
    teamId: string,
    userId: string,
    data: UpdateMemberRequest
  ) => {
    try {
      const response = await teamService.updateMember(teamId, userId, data);

      if (response.success) {
        // Reload team details
        const teamResponse = await teamService.getTeam(teamId);
        if (teamResponse.success && teamResponse.data) {
          setSelectedTeam(teamResponse.data.team);
          setTeamsWithMembers(prev => ({
            ...prev,
            [teamId]: teamResponse.data!.team,
          }));
        }
      } else {
        setError(response.error?.message || 'Failed to update member');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating member');
      console.error('Update member error:', err);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      const response = await teamService.removeMember(teamId, userId);

      if (response.success) {
        // Reload team details
        const teamResponse = await teamService.getTeam(teamId);
        if (teamResponse.success && teamResponse.data) {
          setSelectedTeam(teamResponse.data.team);
          setTeamsWithMembers(prev => ({
            ...prev,
            [teamId]: teamResponse.data!.team,
          }));
        }
      } else {
        setError(response.error?.message || 'Failed to remove member');
      }
    } catch (err) {
      setError('An unexpected error occurred while removing member');
      console.error('Remove member error:', err);
    }
  };

  // Filter teams based on search
  const filteredTeams = teams.filter(
    team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.description &&
        team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCloseModal = () => {
    setViewMode('list');
    setSelectedTeam(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Teams
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your teams and members
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Teams
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your teams and members
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setViewMode('form');
          }}
          className="min-h-[44px] w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto"
        >
          Create Team
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map(team => {
            const teamWithMembers = teamsWithMembers[team.id] || team;
            return (
              <TeamCard
                key={team.id}
                team={teamWithMembers}
                onView={handleViewTeam}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
                currentUserId={user?.id}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto mb-4 flex justify-center text-gray-400">
            <Users className="h-12 w-12" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
            {searchTerm ? 'No teams found' : 'No teams yet'}
          </h3>
          <p className="mb-4 text-gray-500">
            {searchTerm
              ? 'Try adjusting your search terms.'
              : 'Create your first team to start collaborating with your colleagues.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => {
                setSelectedTeam(null);
                setViewMode('form');
              }}
              className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Create Your First Team
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <TeamForm
        team={
          selectedTeam && 'memberships' in selectedTeam
            ? {
                id: selectedTeam.id,
                name: selectedTeam.name,
                description: selectedTeam.description,
                createdById: selectedTeam.createdById,
                createdAt: selectedTeam.createdAt,
                updatedAt: selectedTeam.updatedAt,
              }
            : (selectedTeam as Team)
        }
        isOpen={viewMode === 'form'}
        onSubmit={selectedTeam ? handleUpdateTeam : handleCreateTeam}
        onCancel={handleCloseModal}
        isLoading={isFormLoading}
      />

      {viewMode === 'detail' &&
        selectedTeam &&
        'memberships' in selectedTeam &&
        user && (
          <TeamDetailModal
            team={selectedTeam as TeamWithMembers}
            currentUserId={user.id}
            isOpen={viewMode === 'detail'}
            onClose={handleCloseModal}
            onEdit={handleEditTeam}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onRemoveMember={handleRemoveMember}
          />
        )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        loading={confirmState.loading}
      />
    </div>
  );
};
