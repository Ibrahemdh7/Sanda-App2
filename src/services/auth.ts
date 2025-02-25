import { User } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    // Implement actual login logic
    throw new Error('Not implemented');
  },
  logout: async (): Promise<void> => {
    // Implement actual logout logic
    throw new Error('Not implemented');
  }
};
