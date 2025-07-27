import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from '@/types';
import { authService } from '@/services';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check if user is already authenticated on app start
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Verify token is still valid by fetching user profile
          const response = await authService.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response: ApiResponse<AuthResponse> =
        await authService.login(credentials);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data;

        // Store tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        // Set user
        setUser(user);
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data);

      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }

      // After registration, user needs to login
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API to invalidate refresh token
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        return false;
      }

      const response = await authService.refreshToken(storedRefreshToken);

      if (response.success && response.data) {
        localStorage.setItem('accessToken', response.data.accessToken);
        return true;
      } else {
        // Refresh failed, clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on error
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
