import React, { useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { User } from '@/types';
import { auth } from '@/config/firebase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // For demo/presentation purposes only
  const demoUsers = {
    admin: {
      id: 'admin-1',
      email: 'admin@sanad.com',
      role: 'admin',
      displayName: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    provider: {
      id: 'provider-1',
      email: 'provider@sanad.com',
      role: 'provider',
      displayName: 'Provider User',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    client: {
      id: 'client-1', 
      email: 'client@sanad.com',
      role: 'client',
      displayName: 'Client User',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // For presentation - detect which type of user based on email
      if (email === 'admin@sanad.com') {
        setUser(demoUsers.admin as User);
        setIsAuthenticated(true);
      } else if (email === 'provider@sanad.com') {
        setUser(demoUsers.provider as User);
        setIsAuthenticated(true);
      } else if (email === 'client@sanad.com') {
        setUser(demoUsers.client as User);
        setIsAuthenticated(true);
      } else {
        // Default to client for any email
        const customUser = {
          ...demoUsers.client,
          email: email,
          displayName: email.split('@')[0] // Use part of email as name
        };
        setUser(customUser as User);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a new demo user
      const newUser = {
        id: `${userData.role}-${Date.now()}`,
        email: email,
        role: userData.role || 'client',
        displayName: userData.displayName || email.split('@')[0],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUser(newUser as User);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // Just pretend we sent an email
      setError(null);
      alert(`Password reset email sent to ${email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};