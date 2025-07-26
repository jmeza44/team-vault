import React, { useState, useEffect } from 'react';
import { Credential, RiskLevel } from '@/types';
import { credentialService, CreateCredentialRequest, UpdateCredentialRequest, GetCredentialsParams } from '@/services/credentialService';
import { CredentialForm, CredentialFormData } from '@/components/credentials/CredentialForm';
import { CredentialCard } from '@/components/credentials/CredentialCard';
import { CredentialDetailModal } from '@/components/credentials/CredentialDetailModal';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('');

  // Form state
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [searchTerm, selectedCategory, selectedRiskLevel]);

  const loadCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: GetCredentialsParams = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
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
        setError(response.error?.message || 'Failed to load credentials');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading credentials');
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
      } else {
        setError(response.error?.message || 'Failed to create credential');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the credential');
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
      } else {
        setError(response.error?.message || 'Failed to update credential');
      }
    } catch (err) {
      setError('An unexpected error occurred while updating the credential');
      console.error('Update credential error:', err);
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleViewCredential = async (credential: Credential) => {
    try {
      // Fetch the full credential with decrypted secret
      const response = await credentialService.getCredentialById(credential.id);
      
      if (response.success && response.data) {
        setSelectedCredential(response.data.credential);
        setViewMode('detail');
      } else {
        setError(response.error?.message || 'Failed to load credential details');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading credential details');
      console.error('View credential error:', err);
    }
  };

  const handleEditCredential = async (credential: Credential) => {
    try {
      // Fetch the full credential with decrypted secret for editing
      const response = await credentialService.getCredentialById(credential.id);
      
      if (response.success && response.data) {
        setSelectedCredential(response.data.credential);
        setViewMode('form');
      } else {
        setError(response.error?.message || 'Failed to load credential for editing');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading credential for editing');
      console.error('Edit credential error:', err);
    }
  };

  const handleDeleteCredential = async (credential: Credential) => {
    if (!confirm(`Are you sure you want to delete "${credential.name}"? This action cannot be undone.`)) {
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
      } else {
        setError(response.error?.message || 'Failed to delete credential');
      }
    } catch (err) {
      setError('An unexpected error occurred while deleting the credential');
      console.error('Delete credential error:', err);
    }
  };

  const handleShareCredential = (credential: Credential) => {
    // TODO: Implement sharing modal
    console.log('Share credential:', credential);
    alert('Sharing feature coming soon!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedRiskLevel('');
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
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Back to Credentials
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
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
        <button
          onClick={() => {
            setSelectedCredential(null);
            setViewMode('form');
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add Credential
        </button>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading credentials...</p>
        </div>
      ) : credentials.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🔐</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No credentials found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory || selectedRiskLevel
              ? 'No credentials match your current filters. Try adjusting your search criteria.'
              : 'Start by adding your first credential to securely store your team\'s sensitive information.'
            }
          </p>
          {(searchTerm || selectedCategory || selectedRiskLevel) ? (
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
      {viewMode === 'detail' && selectedCredential && (
        <CredentialDetailModal
          credential={selectedCredential}
          onClose={() => {
            setViewMode('list');
            setSelectedCredential(null);
          }}
          onEdit={handleEditCredential}
          onDelete={handleDeleteCredential}
          onShare={handleShareCredential}
        />
      )}
    </div>
  );
};
