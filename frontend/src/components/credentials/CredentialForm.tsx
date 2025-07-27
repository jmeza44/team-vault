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
  'Other'
];

export const CredentialForm: React.FC<CredentialFormProps> = ({
  credential,
  isOpen,
  onSubmit,
  onCancel,
  isLoading = false
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
    riskLevel: RiskLevel.LOW
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
        expirationDate: credential.expirationDate ? credential.expirationDate.split('T')[0] : '',
        riskLevel: credential.riskLevel
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
        riskLevel: RiskLevel.LOW
      });
    }
  }, [credential]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof CredentialFormData, value: string | RiskLevel) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const generatePassword = () => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`~';
    let password = '';
    for (let i = 0; i < 20; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    handleInputChange('secret', password);
  };

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onCancel}>
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          {credential ? 'Edit Credential' : 'Add New Credential'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-4 sm:space-y-6 custom-scrollbar overflow-y-auto">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="e.g., Production Database, GitHub API Key"
            required
          />
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Username or email"
          />
        </div>

        {/* Secret/Password */}
        <div>
          <label htmlFor="secret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password/Secret *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="secret"
              value={formData.secret}
              onChange={(e) => handleInputChange('secret', e.target.value)}
              className="w-full px-3 py-2 pr-20 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter password or secret"
              required
            />
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="font-medium">Strong password</span>
                  </div>
                ) : passwordRequirements.firstUnmetRequirement ? (
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <Circle className="h-4 w-4 mr-2" />
                    <span>Consider: {passwordRequirements.firstUnmetRequirement.message}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Category and Risk Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Risk Level
            </label>
            <select
              id="riskLevel"
              value={formData.riskLevel}
              onChange={(e) => handleInputChange('riskLevel', e.target.value as RiskLevel)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            URL
          </label>
          <input
            type="url"
            id="url"
            value={formData.url}
            onChange={(e) => handleInputChange('url', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Add a tag and press Enter"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 min-h-[44px]"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 min-h-[24px] min-w-[24px] flex items-center justify-center"
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
          <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Date
          </label>
          <input
            type="date"
            id="expirationDate"
            value={formData.expirationDate}
            onChange={(e) => handleInputChange('expirationDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            min={new Date().toISOString().split('T')[0]}
          />
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 custom-scrollbar resize-none"
            placeholder="Additional notes or description"
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium min-h-[44px]"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium min-h-[44px]"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (credential ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Dialog>
  );
};
