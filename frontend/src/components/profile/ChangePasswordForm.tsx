import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Circle, CheckCircle } from 'lucide-react';
import { userService, ChangePasswordRequest } from '@/services/userService';
import { useAlertActions } from '@/hooks/useAlerts';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ValidationErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const { showSuccess, showError } = useAlertActions();

  // Password validation regex - matches backend validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

  // Validation logic
  const validationErrors = useMemo<ValidationErrors>(() => {
    const errors: ValidationErrors = {};

    // Current password validation
    if (touched.currentPassword && !formData.currentPassword.trim()) {
      errors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (touched.newPassword) {
      if (!formData.newPassword) {
        errors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        errors.newPassword = 'New password must be at least 8 characters long';
      } else if (!passwordRegex.test(formData.newPassword)) {
        errors.newPassword = 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character';
      }
    }

    // Confirm password validation
    if (touched.confirmPassword) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Please confirm your new password';
      } else if (formData.newPassword && confirmPassword !== formData.newPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  }, [formData.currentPassword, formData.newPassword, confirmPassword, touched, passwordRegex]);

  // Password strength and requirement checking
  const passwordRequirements = useMemo(() => {
    const password = formData.newPassword;
    const requirements = [
      {
        id: 'uppercase',
        test: /[A-Z]/.test(password),
        message: 'One uppercase letter',
      },
      {
        id: 'lowercase',
        test: /[a-z]/.test(password),
        message: 'One lowercase letter',
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
      {
        id: 'length',
        test: password.length >= 8,
        message: 'At least 8 characters',
      },
    ];

    const firstUnmetRequirement = requirements.find(req => !req.test);
    const allMet = requirements.every(req => req.test);

    return {
      requirements,
      firstUnmetRequirement,
      allMet,
      metCount: requirements.filter(req => req.test).length,
    };
  }, [formData.newPassword]);

  const isFormValid = Object.keys(validationErrors).length === 0 && 
                     formData.currentPassword && 
                     formData.newPassword && 
                     confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched for validation display
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // Check for client-side validation errors
    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      showError('Validation Error', firstError);
      return;
    }

    // Additional client-side checks (though these should be caught by validation)
    if (formData.newPassword !== confirmPassword) {
      showError('Password Mismatch', 'New password and confirmation do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      showError('Invalid Password', 'New password must be at least 8 characters long');
      return;
    }

    if (!passwordRegex.test(formData.newPassword)) {
      showError('Invalid Password', 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character');
      return;
    }

    setIsLoading(true);

    try {
      const response = await userService.changePassword(formData);
      
      if (response.success) {
        showSuccess('Password changed successfully');
        onSuccess();
      } else {
        showError('Password Change Failed', response.error?.message || 'Failed to change password');
      }
    } catch (error) {
      showError('Password Change Failed', 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="form-label">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            id="currentPassword"
            name="currentPassword"
            className={`form-input pr-10 ${validationErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            value={formData.currentPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('currentPassword')}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => togglePasswordVisibility('current')}
          >
            {showPasswords.current ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {validationErrors.currentPassword && (
          <p className="form-error">{validationErrors.currentPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="form-label">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            className={`form-input pr-10 ${validationErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            value={formData.newPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('newPassword')}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => togglePasswordVisibility('new')}
          >
            {showPasswords.new ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Password requirements - show one at a time */}
        <div className="mt-2">
          {formData.newPassword && (
            <div className="text-sm">
              {passwordRequirements.allMet ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Strong password</span>
                </div>
              ) : passwordRequirements.firstUnmetRequirement ? (
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Circle className="h-4 w-4 mr-2" />
                  <span>{passwordRequirements.firstUnmetRequirement.message}</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
        
        {validationErrors.newPassword && (
          <p className="form-error">{validationErrors.newPassword}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="form-label">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            className={`form-input pr-10 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            value={confirmPassword}
            onChange={handleChange}
            onBlur={() => handleBlur('confirmPassword')}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => togglePasswordVisibility('confirm')}
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {validationErrors.confirmPassword && (
          <p className="form-error">{validationErrors.confirmPassword}</p>
        )}
        {!validationErrors.confirmPassword && confirmPassword && formData.newPassword === confirmPassword && (
          <p className="text-sm text-green-600 mt-1 flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            Passwords match
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading || !isFormValid}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};
