import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

/**
 * Derives an encryption key from a master key and salt using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Gets the master encryption key from environment variables
 */
function getMasterKey(): string {
  const masterKey = process.env['ENCRYPTION_KEY'];
  if (!masterKey) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  if (masterKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
  }
  return masterKey;
}

/**
 * Encrypts sensitive data using AES-256-CBC
 * Returns a base64-encoded string containing: salt + iv + encrypted_data
 */
export function encryptSensitiveData(plaintext: string): string {
  try {
    const masterKey = getMasterKey();
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive encryption key
    const key = deriveKey(masterKey, salt);
    
    // Create cipher with explicit IV
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the data
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Combine all components: salt + iv + encrypted_data
    const combined = Buffer.concat([
      salt,
      iv,
      Buffer.from(encrypted, 'hex')
    ]);
    
    // Return as base64 string
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypts sensitive data using AES-256-CBC
 * Expects a base64-encoded string containing: salt + iv + encrypted_data
 */
export function decryptSensitiveData(encryptedData: string): string {
  try {
    const masterKey = getMasterKey();
    
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH);
    
    // Derive decryption key
    const key = deriveKey(masterKey, salt);
    
    // Create decipher with explicit IV
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    // Decrypt the data
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates that the encryption configuration is properly set up
 */
export function validateEncryptionSetup(): boolean {
  try {
    const testData = 'test-encryption-validation';
    const encrypted = encryptSensitiveData(testData);
    const decrypted = decryptSensitiveData(encrypted);
    return decrypted === testData;
  } catch (error) {
    return false;
  }
}

/**
 * Generates a secure random password
 */
export function generateSecurePassword(length: number = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
}

/**
 * Generates a secure random key for encryption
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}
