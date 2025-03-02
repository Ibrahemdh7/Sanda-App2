import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { User } from '@/types';

export const firebaseAuth = {
  /**
   * Register a new user with email and password
   * Creates both Firebase Auth account and Firestore user document
   */
  register: async (email: string, password: string, userData: Partial<User>): Promise<User> => {
    try {
      console.log('Registering user:', email);
      
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase Auth user created:', user.uid);
      
      // Step 2: Create user document in Firestore
      const userDocData = {
        id: user.uid,
        email: user.email || email,
        role: userData.role || 'client' as const, // Add type assertion
        displayName: userData.displayName || email.split('@')[0],
        phoneNumber: userData.phoneNumber || '',
        company: userData.company || '', // Add company field
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userDocData);
      console.log('Firestore user document created');
      
      // Step 3: If user is a provider or client, create additional documents
      if (userData.role === 'provider') {
        const providerRef = doc(collection(db, 'providers'));
        await setDoc(providerRef, {
          provider_id: providerRef.id,
          user_id: user.uid,
          company_name: userData.company || userData.displayName || 'New Company',
          company_details: '',
          contact_info: {
            phone: userData.phoneNumber || '',
            email: email,
            address: ''
          },
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        console.log('Provider document created:', providerRef.id);
      } else if (userData.role === 'client') {
        // In a real app, you might link this client to a provider
        // For now, we'll just create a basic client record
        const clientRef = doc(collection(db, 'clients'));
        await setDoc(clientRef, {
          client_id: clientRef.id,
          provider_id: 'default', // This would normally link to a real provider
          user_id: user.uid,
          client_name: userData.displayName || email.split('@')[0],
          contact_details: {
            phone: userData.phoneNumber || '',
            email: email,
            address: ''
          },
          credit_limit: 1000, // Default credit limit
          account_status: 'active',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        });
        console.log('Client document created:', clientRef.id);
      }
      
      return {
        id: user.uid,
        email: user.email || email,
        role: userData.role || 'client',
        displayName: userData.displayName || email.split('@')[0],
        phoneNumber: userData.phoneNumber || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Registration error:', error);
      // Handle specific Firebase Authentication errors
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          throw new Error('This email is already registered');
        } else if (error.message.includes('weak-password')) {
          throw new Error('Password is too weak. It should be at least 6 characters');
        } else if (error.message.includes('invalid-email')) {
          throw new Error('Invalid email format');
        } else {
          throw new Error(`Registration failed: ${error.message}`);
        }
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  },

  /**
   * Login with email and password
   * More robust error handling and falls back to creating Firestore document if missing
   */
  login: async (email: string, password: string): Promise<User> => {
    try {
      console.log('Attempting login for:', email);
      
      // Step 1: Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('Firebase Auth successful for:', firebaseUser.uid);
      
      // Step 2: Try to get user document from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      // Step 3: If Firestore document doesn't exist, create it
      if (!userDoc.exists()) {
        console.log('User document missing in Firestore. Creating it...');
        
        // Create a default user document
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || email,
          role: 'client' as const, // Add type assertion
          displayName: firebaseUser.displayName || email.split('@')[0],
          phoneNumber: firebaseUser.phoneNumber || '',
          company: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, userData);
        console.log('Created missing user document in Firestore');
        
        return {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Return the user data
      const userData = userDoc.data() as User;
      console.log('Login successful, user role:', userData.role);
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date()
      };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific authentication errors
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          throw new Error('No account exists with this email. Please register first.');
        } else if (error.message.includes('wrong-password')) {
          throw new Error('Incorrect password. Please try again.');
        } else if (error.message.includes('too-many-requests')) {
          throw new Error('Too many failed login attempts. Please try again later.');
        } else if (error.message.includes('network-request-failed')) {
          throw new Error('Network error. Please check your internet connection.');
        } else {
          throw new Error(`Login failed: ${error.message}`);
        }
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  },

  /**
   * Get current user with robust error handling
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No current user in Firebase Auth');
        return null;
      }
      
      console.log('Getting current user data for:', currentUser.uid);
      
      // Get user document from Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      // If Firestore document doesn't exist, create it
      if (!userDoc.exists()) {
        console.log('User document missing in Firestore. Creating it...');
        
        // Create a default user document
        const userData = {
          id: currentUser.uid,
          email: currentUser.email || '',
          role: 'client' as const, // Add type assertion
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          phoneNumber: currentUser.phoneNumber || '',
          company: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, userData);
        console.log('Created missing user document in Firestore');
        
        return {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Return the user data
      const userData = userDoc.data() as User;
      return {
        ...userData,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date()
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      console.log('Logging out user');
      await signOut(auth);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  resetPassword: async (email: string): Promise<void> => {
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('user-not-found')) {
          throw new Error('No account exists with this email.');
        } else {
          throw new Error(`Failed to send password reset email: ${error.message}`);
        }
      } else {
        throw new Error('Failed to send password reset email. Please try again.');
      }
    }
  },

  /**
   * Create demo users for testing purposes
   */
  createDemoUsers: async (): Promise<void> => {
    try {
      console.log('Checking and creating demo users if needed...');
      
      const demoUsers = [
        {
          email: 'admin@sanad.com',
          password: 'password123',
          userData: {
            role: 'admin' as const,
            displayName: 'Admin User'
          }
        },
        {
          email: 'provider@sanad.com',
          password: 'password123',
          userData: {
            role: 'provider' as const,
            displayName: 'Provider Demo',
            company: 'Demo Company'
          }
        },
        {
          email: 'client@sanad.com',
          password: 'password123',
          userData: {
            role: 'client' as const,
            displayName: 'Client Demo'
          }
        }
      ];
      
      for (const demoUser of demoUsers) {
        try {
          // Try to sign in first to check if user exists
          await signInWithEmailAndPassword(auth, demoUser.email, demoUser.password);
          console.log(`Demo user ${demoUser.email} already exists`);
        } catch (error) {
          if (error instanceof Error && error.message.includes('user-not-found')) {
            // User doesn't exist, create it
            await firebaseAuth.register(
              demoUser.email,
              demoUser.password,
              demoUser.userData
            );
            console.log(`Created demo user: ${demoUser.email}`);
          }
        }
      }
      
      console.log('Demo users check completed');
    } catch (error) {
      console.error('Error managing demo users:', error);
      // Only throw if it's not an "already exists" error
      if (error instanceof Error && !error.message.includes('email-already-in-use')) {
        throw error;
      }
    }
  }
};