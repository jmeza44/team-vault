import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { Dialog } from '@/components/common/Dialog';
import { Loader2 } from 'lucide-react';

interface TeamFormProps {
  team?: Team;
  isOpen: boolean;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface TeamFormData {
  name: string;
  description: string;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: ''
  });

  const [errors, setErrors] = useState<Partial<TeamFormData>>({});

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || ''
      });
    } else {
      // Reset form data when creating a new team
      setFormData({
        name: '',
        description: ''
      });
    }
    // Clear any existing errors when switching between edit/create modes
    setErrors({});
  }, [team]);

  const validateForm = (): boolean => {
    const newErrors: Partial<TeamFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Team name must be less than 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim()
      });
    } catch (error) {
      console.error('Error submitting team form:', error);
    }
  };

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {team ? 'Edit Team' : 'Create New Team'}
        </h2>
      </div>        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Team Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter team name"
              maxLength={100}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                errors.description ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Enter team description (optional)"
              maxLength={500}
              disabled={isLoading}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
              )}
              {team ? 'Update Team' : 'Create Team'}
            </button>
          </div>
        </form>
    </Dialog>
  );
};
