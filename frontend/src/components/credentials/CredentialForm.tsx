import React, { useState, useEffect, useMemo } from 'react';
import { Credential, RiskLevel } from '@/types';
import { Dialog } from '@/components/common/Dialog';
import { Eye, EyeOff, RefreshCw, Circle, CheckCircle } from 'lucide-react';

interface CredentialFormProps {
  credential?: Credential;
  isOpen: boolean;
  onSubmit: (data: CredentialFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface CredentialFormData {
  name: string;
  username: string;
  secret: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
  expirationDate: string;
  riskLevel: RiskLevel;
}

const CATEGORIES = [
  'Database',
  'API Keys',
  'Cloud Services',
  'Social Media',
  'Development Tools',
  'Infrastructure',
  'Third-party Services',
  'Other',
];

export const CredentialForm: React.FC<CredentialFormProps> = ({
  credential,
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CredentialFormData>({
    name: '',
    username: '',
    secret: '',
    description: '',
    category: '',
    url: '',
    tags: [],
    expirationDate: '',
    riskLevel: RiskLevel.LOW,
  });

  const [tagInput, setTagInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password strength and requirement checking
  const passwordRequirements = useMemo(() => {
    const password = formData.secret;

    // Skip validation for very short passwords to avoid noise
    if (password.length === 0) {
      return { allMet: false, firstUnmetRequirement: null, strength: 'none' };
    }

    const requirements = [
      {
        id: 'length',
        test: password.length >= 8,
        message: 'At least 8 characters',
      },
      {
        id: 'lowercase',
        test: /[a-z]/.test(password),
        message: 'One lowercase letter',
      },
      {
        id: 'uppercase',
        test: /[A-Z]/.test(password),
        message: 'One uppercase letter',
      },
      {
        id: 'number',
        test: /\d/.test(password),
        message: 'One number',
      },
      {
        id: 'special',
        test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
        message: 'One special character (!@#$%^&*()_+-=[]{}|;:,.<>?)',
      },
    ];

    const firstUnmetRequirement = requirements.find(req => !req.test);
    const allMet = requirements.every(req => req.test);
    const metCount = requirements.filter(req => req.test).length;

    let strength = 'weak';
    if (allMet) strength = 'strong';
    else if (metCount >= 3) strength = 'medium';

    return {
      requirements,
      firstUnmetRequirement,
      allMet,
      strength,
    };
  }, [formData.secret]);

  useEffect(() => {
    if (credential) {
      setFormData({
        name: credential.name,
        username: credential.username || '',
        secret: credential.secret || '',
        description: credential.description || '',
        category: credential.category || '',
        url: credential.url || '',
        tags: credential.tags || [],
        expirationDate: credential.expirationDate
          ? credential.expirationDate.split('T')[0]
          : '',
        riskLevel: credential.riskLevel,
      });
    } else {
      // Reset form data when creating a new credential
      setFormData({
        name: '',
        username: '',
        secret: '',
        description: '',
        category: '',
        url: '',
        tags: [],
        expirationDate: '',
        riskLevel: RiskLevel.LOW,
      });
    }
  }, [credential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (
    field: keyof CredentialFormData,
    value: string | RiskLevel
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const generatePassword = () => {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`~';
    let password = '';
    for (let i = 0; i < 20; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    handleInputChange('secret', password);
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 sm:px-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
          {credential ? 'Edit Credential' : 'Add New Credential'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="custom-scrollbar space-y-4 overflow-y-auto px-4 py-4 sm:space-y-6 sm:px-6"
      >
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="e.g., Production Database, GitHub API Key"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={e => handleInputChange('username', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="Username or email"
          />
        </div>

        {/* Secret/Password */}
        <div>
          <label
            htmlFor="secret"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password/Secret *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="secret"
              value={formData.secret}
              onChange={e => handleInputChange('secret', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 pr-20 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
              placeholder="Enter password or secret"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                title="Generate secure password"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Password strength indicator - show when there's a password */}
          {formData.secret && (
            <div className="mt-2">
              <div className="text-sm">
                {passwordRequirements.allMet ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="font-medium">Strong password</span>
                  </div>
                ) : passwordRequirements.firstUnmetRequirement ? (
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Circle className="mr-2 h-4 w-4" />
                    <span>
                      Consider:{' '}
                      {passwordRequirements.firstUnmetRequirement.message}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Category and Risk Level */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={e => handleInputChange('category', e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="riskLevel"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Risk Level
            </label>
            <select
              id="riskLevel"
              value={formData.riskLevel}
              onChange={e =>
                handleInputChange('riskLevel', e.target.value as RiskLevel)
              }
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value={RiskLevel.LOW}>Low</option>
              <option value={RiskLevel.MEDIUM}>Medium</option>
              <option value={RiskLevel.HIGH}>High</option>
              <option value={RiskLevel.CRITICAL}>Critical</option>
            </select>
          </div>
        </div>

        {/* URL */}
        <div>
          <label
            htmlFor="url"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            URL
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={e => handleInputChange('url', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Tags */}
        <div>
          <label
            htmlFor="tags"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="min-h-[44px] rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="custom-scrollbar flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-sm text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 flex min-h-[24px] min-w-[24px] items-center justify-center text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expiration Date */}
        <div>
          <label
            htmlFor="expirationDate"
            className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Expiration Date
          </label>
          <input
            type="date"
            id="expirationDate"
            value={formData.expirationDate}
            onChange={e => handleInputChange('expirationDate', e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            min={new Date().toISOString().split('T')[0]}
          />
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
            className="custom-scrollbar w-full resize-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
            placeholder="Additional notes or description"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-md border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-[44px] rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                {credential ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              credential ? 'Update Credential' : 'Create Credential'
            )}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
