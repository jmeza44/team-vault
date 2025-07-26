// User creation data interface
export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

// User response interface
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

// Login response interface
export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

// Refresh token response interface
export interface RefreshTokenResponse {
  accessToken: string;
}