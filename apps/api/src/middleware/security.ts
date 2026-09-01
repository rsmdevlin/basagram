import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import argon2 from 'argon2';

// Two-Factor Authentication (2FA) Setup
export const generateTwoFactorSecret = async (userId: string, email: string) => {
  const secret = speakeasy.generateSecret({
    name: `Basagram (${email})`,
    issuer: 'Basagram',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
    backupCodes: generateBackupCodes(),
  };
};

// Verify 2FA token
export const verifyTwoFactorToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
};

// Generate backup codes for 2FA
export const generateBackupCodes = (count = 10): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

// Encryption utilities
export const encryptData = (data: string, key: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    crypto.scryptSync(key, 'salt', 32),
    iv
  );

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
};

export const decryptData = (encrypted: string, key: string): string => {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    crypto.scryptSync(key, 'salt', 32),
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

// Password hashing with Argon2
export const hashPassword = async (password: string): Promise<string> => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
  });
};

export const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return argon2.verify(hash, password);
};

// Session encryption for secure storage
export const createSecureSession = (userId: string, metadata: any): string => {
  const session = {
    userId,
    metadata,
    timestamp: Date.now(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  return Buffer.from(JSON.stringify(session)).toString('base64');
};

export const parseSecureSession = (sessionToken: string): any => {
  return JSON.parse(Buffer.from(sessionToken, 'base64').toString('utf-8'));
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const verifyCSRFToken = (token: string, storedToken: string): boolean => {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
};

// Secure random token generation
export const generateSecureToken = (length = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Rate limiting configuration for different endpoints
export const rateLimitConfig = {
  login: { windowMs: 15 * 60 * 1000, max: 5 },
  register: { windowMs: 60 * 60 * 1000, max: 3 },
  passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
  twoFactor: { windowMs: 5 * 60 * 1000, max: 3 },
  api: { windowMs: 15 * 60 * 1000, max: 100 },
};

// Input validation and sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

// Secure header configuration
export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// IP whitelisting utility
export const isIpAllowed = (ip: string, whitelist: string[]): boolean => {
  return whitelist.includes(ip);
};

// Sensitive data logging filter
export const filterSensitiveData = (data: any): any => {
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'refreshToken'];
  const filtered = { ...data };

  Object.keys(filtered).forEach((key) => {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      filtered[key] = '***REDACTED***';
    }
  });

  return filtered;
};

// Session validation
export const validateSessionIntegrity = (session: any): boolean => {
  return session && session.userId && session.timestamp && session.nonce;
};

// Device fingerprinting for security checks
export const generateDeviceFingerprint = (
  userAgent: string,
  acceptLanguage: string,
  timezone: string
): string => {
  const fingerprint = `${userAgent}:${acceptLanguage}:${timezone}`;
  return crypto.createHash('sha256').update(fingerprint).digest('hex');
};
