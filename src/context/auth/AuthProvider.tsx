import React, { useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import { User } from '@/types';
import { auth } from '@/config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase/auth';
import { Alert } from 'react-native';
import { signOut } from 'firebase/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Single useEffect for auth state management and demo users
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Create demo users first (only in development)
    const setupDemoUsers = async () => {
      if (__DEV__) {
        try {
          await firebaseAuth.createDemoUsers();
        } catch (error) {
          console.warn('Error creating demo users:', error);
        }
      }
    };
    
    setupDemoUsers();
    
    // Then set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        
        if (firebaseUser) {
          console.log('Firebase user authenticated:', firebaseUser.uid);
          
          try {
            // Get the user data from Firestore
            const userData = await firebaseAuth.getCurrentUser();
            
            if (userData) {
              console.log('User data retrieved successfully, role:', userData.role);
              setUser(userData);
              setIsAuthenticated(true);
              setError(null);
            } else {
              console.log('No user data returned from Firestore');
              setUser(null);
              setIsAuthenticated(false);
              setError('Failed to load user data');
            }
          } catch (error) {
            console.error("Error getting user data:", error);
            setUser(null);
            setIsAuthenticated(false);
            setError("Failed to load user data");
          }
        } else {
          console.log('No Firebase user authenticated');
          setUser(null);
          setIsAuthenticated(false);
          setError(null);
        }
      } catch (e) {
        console.error('Auth state listener error:', e);
        setUser(null);
        setIsAuthenticated(false);
        setError('Authentication error');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    });
    
    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign out any existing user first to prevent multiple authentications
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const userData = await firebaseAuth.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      console.error('Login error in AuthProvider:', err);
      setError(errorMessage);
      
      // Show alert for better user experience
      Alert.alert('Login Failed', errorMessage);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Sign out any existing user first to prevent multiple authentications
      if (auth.currentUser) {
        await signOut(auth);
      }
      
      const registeredUser = await firebaseAuth.register(email, password, userData);
      setUser(registeredUser);
      setIsAuthenticated(true);
      return registeredUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      console.error('Registration error in AuthProvider:', err);
      setError(errorMessage);
      
      // Show alert for better user experience
      Alert.alert('Registration Failed', errorMessage);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await firebaseAuth.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      console.error('Logout error in AuthProvider:', err);
      setError(errorMessage);
      
      // Show alert for better user experience
      Alert.alert('Logout Failed', errorMessage);
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await firebaseAuth.resetPassword(email);
      Alert.alert('Success', 'Password reset email sent. Please check your inbox.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed';
      console.error('Password reset error in AuthProvider:', err);
      setError(errorMessage);
      
      // Show alert for better user experience
      Alert.alert('Password Reset Failed', errorMessage);
      
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
    resetPassword,
    initialLoading
  };

  // Don't render children until the initial authentication check is complete
  if (initialLoading) {
    // Return empty fragment or loading component
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};