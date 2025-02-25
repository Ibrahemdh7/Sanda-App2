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
  orderBy
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface CreditLimitRequest {
  request_id: string;
  client_id: string;
  provider_id: string;
  requested_limit: number;
  current_limit: number;
  status: 'pending' | 'approved' | 'rejected';
  request_date: any;
  decision_date?: any;
  decision_by?: string;
  notes?: string;
  created_at: any;
  updated_at: any;
}

export const creditLimitRequestService = {
  create: async (requestData: Omit<CreditLimitRequest, 'request_id' | 'created_at' | 'updated_at'>) => {
    const requestRef = doc(collection(db, 'creditLimitRequests'));
    const request: CreditLimitRequest = {
      ...requestData,
      request_id: requestRef.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(requestRef, request);
    return request;
  },

  getById: async (requestId: string) => {
    const docRef = doc(db, 'creditLimitRequests', requestId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Credit limit request not found');
    }
    
    return docSnap.data() as CreditLimitRequest;
  },

  getByClientId: async (clientId: string) => {
    const q = query(
      collection(db, 'creditLimitRequests'),
      where('client_id', '==', clientId),
      orderBy('request_date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CreditLimitRequest);
  },

  getByProviderId: async (providerId: string) => {
    const q = query(
      collection(db, 'creditLimitRequests'),
      where('provider_id', '==', providerId),
      orderBy('request_date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as CreditLimitRequest);
  },

  updateStatus: async (requestId: string, status: CreditLimitRequest['status'], decisionBy: string, notes?: string) => {
    const docRef = doc(db, 'creditLimitRequests', requestId);
    await updateDoc(docRef, {
      status,
      decision_date: serverTimestamp(),
      decision_by: decisionBy,
      notes,
      updated_at: serverTimestamp()
    });
  }
};