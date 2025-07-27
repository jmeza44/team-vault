import React, { useState } from 'react';
import { User } from '@/types';
import { userService, UpdateProfileRequest } from '@/services/userService';
import { useAlertActions } from '@/hooks/useAlerts';

interface ProfileFormProps {
  user: User;
  onUpdate: (user: User) => void;
  onCancel: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onUpdate,
  onCancel,
}) => {
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: user.name,
    email: user.email,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useAlertActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await userService.updateProfile(formData);

      if (response.success && response.data?.user) {
        onUpdate(response.data.user);
        showSuccess('Profile updated successfully');
      } else {
        showError(
          'Update Failed',
          response.error?.message || 'Failed to update profile'
        );
      }
    } catch (error) {
      showError('Update Failed', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="form-label">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="form-input disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.name || ''}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-input disabled:cursor-not-allowed disabled:opacity-50"
          value={formData.email || ''}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label className="form-label">Role</label>
        <input
          type="text"
          className="form-input bg-gray-100 dark:bg-gray-700"
          value={user.role}
          readOnly
          disabled
        />
        <p className="mt-1 text-sm text-gray-500">
          Role cannot be changed from this interface
        </p>
      </div>

      <div className="flex gap-3">
        <button 
          type="submit" 
          className="btn-primary disabled:cursor-not-allowed disabled:opacity-50" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Updating...
            </div>
          ) : (
            'Update Profile'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
