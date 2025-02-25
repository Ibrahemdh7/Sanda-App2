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
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Invoice } from '@/types/firebase';

export const invoiceService = {
  create: async (invoiceData: Omit<Invoice, 'invoice_id' | 'created_at' | 'updated_at'>) => {
    const now = serverTimestamp();
    const invoiceRef = doc(collection(db, 'invoices'));
    const invoice: Invoice = {
      ...invoiceData,
      invoice_id: invoiceRef.id,
      created_at: now,
      updated_at: now
    };
    
    await setDoc(invoiceRef, invoice);
    return invoice;
  },

  getById: async (invoiceId: string) => {
    const docRef = doc(db, 'invoices', invoiceId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Invoice not found');
    }
    
    return docSnap.data() as Invoice;
  },

  getByClientId: async (clientId: string) => {
    const q = query(
      collection(db, 'invoices'),
      where('client_id', '==', clientId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Invoice);
  },

  getByProviderId: async (providerId: string) => {
    const q = query(
      collection(db, 'invoices'),
      where('provider_id', '==', providerId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Invoice);
  },

  update: async (invoiceId: string, updates: Partial<Invoice>) => {
    const docRef = doc(db, 'invoices', invoiceId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  },

  delete: async (invoiceId: string) => {
    await deleteDoc(doc(db, 'invoices', invoiceId));
  }
};