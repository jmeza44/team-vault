import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog } from '@/components/common';
import { Team, TeamFormData } from '@/types';

interface TeamFormProps {
  team?: Team;
  isOpen: boolean;
  onSubmit: (data: TeamFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TeamForm: React.FC<TeamFormProps> = ({
  team,
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<TeamFormData>>({});

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
      });
    } else {
      // Reset form data when creating a new team
      setFormData({
        name: '',
        description: '',
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
        description: formData.description.trim(),
      });
    } catch (error) {
      console.error('Error submitting team form:', error);
    }
  };

  const handleInputChange = (field: keyof TeamFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {team ? 'Edit Team' : 'Create New Team'}
        </h2>
      </div>{' '}
      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
        {/* Team Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Team Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-primary-400 ${
              errors.name
                ? 'border-danger-300 dark:border-danger-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter team name"
            maxLength={100}
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
              {errors.name}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={e => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full rounded-md border bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:ring-primary-400 ${
              errors.description
                ? 'border-danger-300 dark:border-danger-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            placeholder="Enter team description (optional)"
            maxLength={500}
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
              {errors.description}
            </p>
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
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:focus:ring-primary-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" />
                {team ? 'Updating...' : 'Creating...'}
              </>
            ) : team ? (
              'Update Team'
            ) : (
              'Create Team'
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
