import React, { useState, useEffect } from 'react';
import { Credential, RiskLevel, Team } from '@/types';
import { credentialService, CreateCredentialRequest, UpdateCredentialRequest, GetCredentialsParams } from '@/services/credentialService';
import teamService from '@/services/teamService';
import { CredentialForm, CredentialFormData } from '@/components/credentials/CredentialForm';
import { CredentialCard } from '@/components/credentials/CredentialCard';
import { CredentialDetailModal } from '@/components/credentials/CredentialDetailModal';
import { ShareCredentialModal } from '@/components/credentials/ShareCredentialModal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { useAlertActions, useApiErrorHandler } from '@/hooks/useAlerts';
import { useConfirm } from '@/hooks/useConfirm';
import { usePermissions } from '@/hooks/usePermissions';
import { Shield, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Database',
  'API Keys',
  'Cloud Services',
  'Social Media',
  'Development Tools',
  'Infrastructure',
  'Third-party Services',
  'Other'
];

type ViewMode = 'list' | 'form' | 'detail';

export const CredentialsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  
  // Alert hooks
  const { showSuccess, showError } = useAlertActions();
  const { handleApiError } = useApiErrorHandler();
  const { confirm, confirmState, handleClose, handleConfirm } = useConfirm();
  const { userPermissions, getCredentialPermissions } = usePermissions();
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  // Modal state
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [credentialToShare, setCredentialToShare] = useState<Credential | null>(null);

  useEffect(() => {
    loadCredentials();
    loadTeams();
  }, [searchTerm, selectedCategory, selectedRiskLevel, selectedTeam]);

  const loadTeams = async () => {
    try {
      const response = await teamService.getTeams();
      if (response.success && response.data) {
        setTeams(response.data.teams);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
      showError('Failed to load teams', 'Unable to fetch team information');
    }
  };

  const loadCredentials = async () => {
    try {
      setLoading(true);
      
      const params: GetCredentialsParams = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedTeam) params.teamId = selectedTeam;
      
      const response = await credentialService.getCredentials(params);
      
      if (response.success && response.data) {
        let filteredCredentials = response.data.credentials;
        
        // Client-side risk level filtering
        if (selectedRiskLevel) {
          filteredCredentials = filteredCredentials.filter(
            cred => cred.riskLevel === selectedRiskLevel
          );
        }
        
        setCredentials(filteredCredentials);
      } else {
        handleApiError(response, 'Failed to load credentials');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while loading credentials');
      console.error('Load credentials error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCredential = async (formData: CredentialFormData) => {
    try {
      setIsFormLoading(true);
      
      const createData: CreateCredentialRequest = {
        name: formData.name,
        username: formData.username || undefined,
        secret: formData.secret,
        description: formData.description || undefined,
        category: formData.category || undefined,
        url: formData.url || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        expirationDate: formData.expirationDate || undefined,
        riskLevel: formData.riskLevel,
      };

      const response = await credentialService.createCredential(createData);
      
      if (response.success) {
        await loadCredentials(); // Reload the list
        setViewMode('list');
        setSelectedCredential(null);
        showSuccess('Credential Created', 'The credential has been created successfully');
      } else {
        handleApiError(response, 'Failed to create credential');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while creating the credential');
      console.error('Create credential error:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleUpdateCredential = async (formData: CredentialFormData) => {
    if (!selectedCredential) return;
    
    try {
      setIsFormLoading(true);
      
      const updateData: UpdateCredentialRequest = {
        name: formData.name,
        username: formData.username || undefined,
        secret: formData.secret,
        description: formData.description || undefined,
        category: formData.category || undefined,
        url: formData.url || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        expirationDate: formData.expirationDate || undefined,
        riskLevel: formData.riskLevel,
      };

      const response = await credentialService.updateCredential(selectedCredential.id, updateData);
      
      if (response.success) {
        await loadCredentials(); // Reload the list
        setViewMode('list');
        setSelectedCredential(null);
        showSuccess('Credential Updated', 'The credential has been updated successfully');
      } else {
        handleApiError(response, 'Failed to update credential');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while updating the credential');
      console.error('Update credential error:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleViewCredential = async (credential: Credential) => {
    const permissions = getCredentialPermissions(credential);
    if (!permissions.canView) {
      showError('Access Denied', 'You do not have permission to view this credential');
      return;
    }

    try {
      // Fetch the full credential with decrypted secret
      const response = await credentialService.getCredentialById(credential.id);
      
      if (response.success && response.data) {
        setSelectedCredential(response.data.credential);
        setViewMode('detail');
      } else {
        handleApiError(response, 'Failed to load credential details');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while loading credential details');
      console.error('View credential error:', err);
    }
  };

  const handleEditCredential = async (credential: Credential) => {
    const permissions = getCredentialPermissions(credential);
    if (!permissions.canEdit) {
      showError('Access Denied', 'You do not have permission to edit this credential');
      return;
    }

    try {
      // Fetch the full credential with decrypted secret for editing
      const response = await credentialService.getCredentialById(credential.id);
      
      if (response.success && response.data) {
        setSelectedCredential(response.data.credential);
        setViewMode('form');
      } else {
        handleApiError(response, 'Failed to load credential for editing');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while loading credential for editing');
      console.error('Edit credential error:', err);
    }
  };

  const handleDeleteCredential = async (credential: Credential) => {
    const permissions = getCredentialPermissions(credential);
    if (!permissions.canDelete) {
      showError('Access Denied', 'You do not have permission to delete this credential');
      return;
    }

    const confirmed = await confirm({
      title: 'Delete Credential',
      message: `Are you sure you want to delete "${credential.name}"? This action cannot be undone and will permanently remove all credential data.`,
      confirmText: 'Delete Credential',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      const response = await credentialService.deleteCredential(credential.id);
      
      if (response.success) {
        await loadCredentials(); // Reload the list
        if (selectedCredential?.id === credential.id) {
          setSelectedCredential(null);
          setViewMode('list');
        }
        showSuccess('Credential Deleted', 'The credential has been deleted successfully');
      } else {
        handleApiError(response, 'Failed to delete credential');
      }
    } catch (err) {
      handleApiError(err, 'An unexpected error occurred while deleting the credential');
      console.error('Delete credential error:', err);
    }
  };

  const handleShareCredential = (credential: Credential) => {
    const permissions = getCredentialPermissions(credential);
    if (!permissions.canShare) {
      showError('Access Denied', 'You do not have permission to share this credential');
      return;
    }

    setCredentialToShare(credential);
    setIsShareModalOpen(true);
  };

  const handleShareSuccess = () => {
    setIsShareModalOpen(false);
    setCredentialToShare(null);
    // Optionally reload credentials to reflect sharing status
    loadCredentials();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedRiskLevel('');
    setSelectedTeam('');
  };

  if (viewMode === 'form') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setViewMode('list');
              setSelectedCredential(null);
            }}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Credentials
          </button>
        </div>

        <CredentialForm
          credential={selectedCredential || undefined}
          onSubmit={selectedCredential ? handleUpdateCredential : handleCreateCredential}
          onCancel={() => {
            setViewMode('list');
            setSelectedCredential(null);
          }}
          isLoading={isFormLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Credentials</h1>
          <p className="text-gray-600">Manage your team's secure credentials</p>
        </div>
        {userPermissions.canCreateCredentials && (
          <button
            onClick={() => {
              setSelectedCredential(null);
              setViewMode('form');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Credential
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search credentials..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              id="team"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 mb-1">
              Risk Level
            </label>
            <select
              id="riskLevel"
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value={RiskLevel.LOW}>Low</option>
              <option value={RiskLevel.MEDIUM}>Medium</option>
              <option value={RiskLevel.HIGH}>High</option>
              <option value={RiskLevel.CRITICAL}>Critical</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading credentials...</p>
        </div>
      ) : credentials.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <div className="text-gray-400 mb-4 flex justify-center">
            <Shield className="h-16 w-16" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedRiskLevel || selectedTeam
              ? 'No credentials match your current filters. Try adjusting your search criteria.'
              : 'Start by adding your first credential to securely store your team\'s sensitive information.'
            }
          </p>
          {(searchTerm || selectedCategory || selectedRiskLevel || selectedTeam) ? (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={() => {
                setSelectedCredential(null);
                setViewMode('form');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Your First Credential
            </button>
          )}
        </div>
      ) : (
        /* Credentials Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map(credential => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onView={handleViewCredential}
              onEdit={handleEditCredential}
              onDelete={handleDeleteCredential}
              onShare={handleShareCredential}
            />
          ))}
        </div>
      )}

      {/* Credential Detail Modal */}
      <CredentialDetailModal
        credential={selectedCredential}
        isOpen={viewMode === 'detail' && !!selectedCredential}
        onClose={() => {
          setViewMode('list');
          setSelectedCredential(null);
        }}
        onEdit={handleEditCredential}
        onDelete={handleDeleteCredential}
        onShare={handleShareCredential}
      />

      {/* Share Credential Modal */}
      {isShareModalOpen && credentialToShare && (
        <ShareCredentialModal
          credential={credentialToShare}
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setCredentialToShare(null);
          }}
          onSuccess={handleShareSuccess}
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
