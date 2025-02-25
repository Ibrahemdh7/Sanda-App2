// API Constants
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Authentication Constants
export const AUTH_TOKEN_KEY = '@auth_token';
export const REFRESH_TOKEN_KEY = '@refresh_token';

// App Constants
export const APP_NAME = 'SANAD';
export const APP_VERSION = '1.0.0';

// Navigation Constants
export const STACK_SCREENS = {
  AUTH: 'Auth',
  PROVIDER: 'Provider',
  CLIENT: 'Client',
  ADMIN: 'Admin'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNKNOWN_ERROR: 'An unknown error occurred'
};