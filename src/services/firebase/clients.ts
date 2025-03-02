import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Client } from '@/types/firebase';

export const clientService = {
  create: async (clientData: Omit<Client, 'client_id' | 'created_at' | 'updated_at'>) => {
    const clientRef = doc(collection(db, 'clients'));
    const client: Client = {
      ...clientData,
      client_id: clientRef.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(clientRef, client);
    return client;
  },

  getByUserId: async (userId: string) => {
    const q = query(collection(db, 'clients'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Client not found for this user');
    }
    
    const doc = querySnapshot.docs[0];
    return {
      ...doc.data(),
      client_id: doc.id
    } as Client;
  },

  getByProviderId: async (providerId: string) => {
    const q = query(collection(db, 'clients'), where('provider_id', '==', providerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      client_id: doc.id
    })) as Client[];
  },

  update: async (clientId: string, updates: Partial<Client>) => {
    const docRef = doc(db, 'clients', clientId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  }
};