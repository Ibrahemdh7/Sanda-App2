// src/context/auth/AuthContext.ts
import { createContext } from 'react';
import { User } from '@/types';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create a proper default context value that matches your interface
const defaultContextValue: AuthContextType = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  login: async () => { throw new Error('Not implemented') },
  register: async () => { throw new Error('Not implemented') },
  logout: async () => { throw new Error('Not implemented') },
  resetPassword: async () => { throw new Error('Not implemented') }
};

// Create context with the default value
export const AuthContext = createContext<AuthContextType>(defaultContextValue);