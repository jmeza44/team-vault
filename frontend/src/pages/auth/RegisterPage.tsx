import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Circle, CheckCircle } from 'lucide-react';
import { BackgroundPattern, ThemeSwitch, Logo } from '@/components/common';
import { useAuth, usePatternContext } from '@/contexts';
import { useAlertActions } from '@/hooks';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { showError, showSuccess } = useAlertActions();
  const { pattern, settings } = usePatternContext();

  // Password validation regex - matches backend validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/;

  // Password strength and requirement checking
  const passwordRequirements = useMemo(() => {
    const password = formData.password;
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

    return {
      requirements,
      firstUnmetRequirement,
      allMet,
    };
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mark fields as touched for validation display
    setTouched({ password: true, confirmPassword: true });

    // Enhanced password validation
    if (formData.password.length < 8) {
      showError(
        'Invalid Password',
        'Password must be at least 8 characters long'
      );
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      showError(
        'Invalid Password',
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
      );
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Password Mismatch', 'Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      showSuccess(
        'Account Created Successfully!',
        'Please sign in with your new account'
      );
      navigate('/login');
    } catch (error: any) {
      showError(
        'Registration Failed',
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (field: 'password' | 'confirmPassword') => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      {/* Enhanced background pattern based on user preference */}
      <BackgroundPattern
        pattern={pattern}
        opacity={settings.opacity}
        size={settings.size}
        variant={settings.variant}
      />

      {/* Theme Switch - positioned in top right */}
      <div className="absolute right-4 top-4 z-10">
        <ThemeSwitch />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div>
          <div className="mb-6 flex justify-center">
            <Logo size={96} showText={false} />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="form-input rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input rounded-md disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPasswords.password ? 'text' : 'password'}
                  required
                  className="form-input rounded-md pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => togglePasswordVisibility('password')}
                  disabled={isLoading}
                >
                  {showPasswords.password ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>

              {/* Password requirements - show one at a time */}
              {touched.password && formData.password && (
                <div className="mt-2">
                  <div className="text-sm">
                    {passwordRequirements.allMet ? (
                      <div className="flex items-center text-success-600 dark:text-success-400">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span className="font-medium">Strong password</span>
                      </div>
                    ) : passwordRequirements.firstUnmetRequirement ? (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Circle className="mr-2 h-4 w-4" />
                        <span>
                          {passwordRequirements.firstUnmetRequirement.message}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirmPassword ? 'text' : 'password'}
                  required
                  className="form-input rounded-md pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  disabled={isLoading}
                >
                  {showPasswords.confirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>

              {/* Password match indicator */}
              {touched.confirmPassword &&
                formData.confirmPassword &&
                formData.password && (
                  <div className="mt-2">
                    {formData.password === formData.confirmPassword ? (
                      <p className="flex items-center text-sm text-success-600 dark:text-success-400">
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Passwords match
                      </p>
                    ) : (
                      <p className="flex items-center text-sm text-danger-600 dark:text-danger-400">
                        <Circle className="mr-1 h-4 w-4" />
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
