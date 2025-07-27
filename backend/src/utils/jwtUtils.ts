import jwt from 'jsonwebtoken';
import { logger } from './logger';

// Helper function to validate JWT expiration values
function validateJwtExpiration(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  
  // Validate that the value matches the expected StringValue format
  // Either a number or a number followed by a time unit
  const timeRegex = /^\d+[smhdwy]?$/i;
  if (!timeRegex.test(value)) {
    logger.warn(`Invalid JWT expiration format: ${value}, using fallback: ${fallback}`);
    return fallback;
  }
  
  return value;
}

// Type-safe JWT expiration helper
export function getJwtExpiration(envValue: string | undefined, fallback: string): string {
  const validated = validateJwtExpiration(envValue, fallback);
  return validated;
}

// JWT configuration interface
interface JwtConfig {
  secret: string;
  refreshSecret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

// Get JWT configuration from environment
export function getJwtConfig(): JwtConfig {
  const secret = process.env['JWT_SECRET'];
  const refreshSecret = process.env['JWT_REFRESH_SECRET'];
  
  if (!secret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }
  
  return {
    secret,
    refreshSecret,
    expiresIn: getJwtExpiration(process.env['JWT_EXPIRES_IN'], '15m'),
    refreshExpiresIn: getJwtExpiration(process.env['JWT_REFRESH_EXPIRES_IN'], '7d'),
  };
}

// Generate token pair
export function generateTokens(userId: string): { accessToken: string; refreshToken: string } {
  const config = getJwtConfig();
  
  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: config.expiresIn as any
  };
  
  const refreshTokenOptions: jwt.SignOptions = {
    expiresIn: config.refreshExpiresIn as any
  };
  
  const accessToken = jwt.sign(
    { userId },
    config.secret,
    accessTokenOptions
  );
  
  const refreshToken = jwt.sign(
    { userId },
    config.refreshSecret,
    refreshTokenOptions
  );
  
  return { accessToken, refreshToken };
}

// Generate access token only
export function generateAccessToken(userId: string): string {
  const config = getJwtConfig();
  
  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: config.expiresIn as any
  };
  
  return jwt.sign(
    { userId },
    config.secret,
    accessTokenOptions
  );
}

// Verify refresh token
export function verifyRefreshToken(token: string): any {
  const config = getJwtConfig();
  return jwt.verify(token, config.refreshSecret);
}
