import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Provider } from '@/types/firebase';

export const providerService = {
  create: async (providerData: Omit<Provider, 'provider_id' | 'created_at' | 'updated_at'>) => {
    const providerRef = doc(collection(db, 'providers'));
    const provider: Provider = {
      ...providerData,
      provider_id: providerRef.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(providerRef, provider);
    return provider;
  },

  getById: async (providerId: string) => {
    const docRef = doc(db, 'providers', providerId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Provider not found');
    }
    
    return docSnap.data() as Provider;
  },

  getByUserId: async (userId: string) => {
    const q = query(collection(db, 'providers'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Provider not found');
    }
    
    return querySnapshot.docs[0].data() as Provider;
  },

  update: async (providerId: string, updates: Partial<Provider>) => {
    const docRef = doc(db, 'providers', providerId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  },

  delete: async (providerId: string) => {
    await deleteDoc(doc(db, 'providers', providerId));
  }
};