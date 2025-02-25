// src/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/context/auth/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context;
};