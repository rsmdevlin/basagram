// Edge cases and error handling utilities

/**
 * Safely parse JSON with fallback
 */
export const safeParse = <T,>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch {
    console.warn('JSON parse failed, using fallback');
    return fallback;
  }
};

/**
 * Retry logic for failed operations
 */
export const retry = async <T,>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> => {
  const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = delayMs * Math.pow(backoffMultiplier, attempt);
      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        lastError.message
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max attempts exceeded');
};

/**
 * Debounce function to limit execution frequency
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
};

/**
 * Throttle function to limit execution rate
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delayMs) {
      lastCall = now;
      fn(...args);
    }
  };
};

/**
 * Handle async operations with timeout
 */
export const withTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Operation timed out after ${timeoutMs}ms`)),
      timeoutMs
    )
  );

  return Promise.race([promise, timeoutPromise]);
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const getPasswordStrength = (
  password: string
): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';
  if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) return 'medium';
  if (!/[!@#$%^&*]/.test(password)) return 'medium';
  return 'strong';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format timestamp in Russian
 */
export const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'только что';
  if (minutes < 60) return `${minutes}м назад`;
  if (hours < 24) return `${hours}ч назад`;
  if (days < 7) return `${days}д назад`;

  return date.toLocaleDateString('ru-RU');
};

/**
 * Deep clone object
 */
export const deepClone = <T,>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as any;
  if (obj instanceof Object) {
    const cloned: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};

/**
 * Validate URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHtml = (html: string): string => {
  const element = document.createElement('div');
  element.textContent = html;
  return element.innerHTML;
};

/**
 * Generate random ID
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if object is empty
 */
export const isEmpty = (obj: any): boolean => {
  if (typeof obj !== 'object' || obj === null) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Merge objects deeply
 */
export const mergeObjects = <T,>(target: T, source: Partial<T>): T => {
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    const value = (source as any)[key];
    if (typeof value === 'object' && value !== null) {
      (result as any)[key] = mergeObjects((target as any)[key], value);
    } else {
      (result as any)[key] = value;
    }
  });
  return result;
};

/**
 * Normalize path
 */
export const normalizePath = (path: string): string => {
  return path.replace(/\\/g, '/').replace(/\/+/g, '/');
};

/**
 * Check if string is URL
 */
export const isUrl = (str: string): boolean => {
  try {
    new URL(str);
    return true;
  } catch {
    return str.startsWith('http://') || str.startsWith('https://');
  }
};

/**
 * Create URL with query parameters
 */
export const createUrl = (baseUrl: string, params: Record<string, string>): string => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};
