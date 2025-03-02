import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';

export const firebaseAuth = {
  register: async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        role: userData.role || 'client',
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
  
      return {
        id: user.uid,
        email: user.email!,
        role: userData.role || 'client',
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error: any) {
      // Handle specific Firebase Authentication errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. It should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email format');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/password accounts are not enabled. Please contact support.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        // For any other errors
        throw new Error(error.message || 'Registration failed');
      }
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDoc.data() as User;
      return userData;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  }
};