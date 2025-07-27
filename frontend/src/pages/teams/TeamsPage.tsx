import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import teamService, { TeamWithMembers, CreateTeamRequest, UpdateTeamRequest, AddMemberRequest, UpdateMemberRequest } from '@/services/teamService';
import { TeamForm, TeamFormData } from '@/components/teams/TeamForm';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamDetailModal } from '@/components/teams/TeamDetailModal';

type ViewMode = 'list' | 'form' | 'detail';

export const TeamsPage: React.FC = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsWithMembers, setTeamsWithMembers] = useState<{ [key: string]: TeamWithMembers }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTeam, setSelectedTeam] = useState<Team | TeamWithMembers | null>(null);
  
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

      const response = await teamService.updateTeam(selectedTeam.id, updateData);
      
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
    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
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
            [teamId]: teamResponse.data!.team
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

  const handleUpdateMember = async (teamId: string, userId: string, data: UpdateMemberRequest) => {
    try {
      const response = await teamService.updateMember(teamId, userId, data);
      
      if (response.success) {
        // Reload team details
        const teamResponse = await teamService.getTeam(teamId);
        if (teamResponse.success && teamResponse.data) {
          setSelectedTeam(teamResponse.data.team);
          setTeamsWithMembers(prev => ({
            ...prev,
            [teamId]: teamResponse.data!.team
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
            [teamId]: teamResponse.data!.team
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
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCloseModal = () => {
    setViewMode('list');
    setSelectedTeam(null);
    setError(null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
            <p className="text-gray-600">Manage your teams and members</p>
          </div>
        </div>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and members</p>
        </div>
        <button
          onClick={() => {
            setSelectedTeam(null);
            setViewMode('form');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Create Team
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
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
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => {
            const teamWithMembers = teamsWithMembers[team.id] || team;
            return (
              <TeamCard
                key={team.id}
                team={teamWithMembers}
                onView={handleViewTeam}
                onEdit={handleEditTeam}
                onDelete={handleDeleteTeam}
                onManageMembers={handleViewTeam}
                currentUserId={user?.id}
              />
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No teams found' : 'No teams yet'}
          </h3>
          <p className="text-gray-500 mb-4">
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Create Your First Team
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {viewMode === 'form' && (
        <TeamForm
          team={selectedTeam && 'memberships' in selectedTeam ? {
            id: selectedTeam.id,
            name: selectedTeam.name,
            description: selectedTeam.description,
            createdById: selectedTeam.createdById,
            createdAt: selectedTeam.createdAt,
            updatedAt: selectedTeam.updatedAt
          } : selectedTeam as Team}
          onSubmit={selectedTeam ? handleUpdateTeam : handleCreateTeam}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
        />
      )}

      {viewMode === 'detail' && selectedTeam && 'memberships' in selectedTeam && user && (
        <TeamDetailModal
          team={selectedTeam as TeamWithMembers}
          currentUserId={user.id}
          onClose={handleCloseModal}
          onEdit={handleEditTeam}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
    </div>
  );
};
