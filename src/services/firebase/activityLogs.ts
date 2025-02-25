import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface ActivityLog {
  log_id: string;
  user_id: string;
  activity_type: 'login' | 'logout' | 'create' | 'update' | 'delete' | 'approve' | 'reject';
  entity_type: 'client' | 'invoice' | 'payment' | 'credit_limit';
  entity_id: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: any;
}

export const activityLogService = {
  log: async (logData: Omit<ActivityLog, 'log_id' | 'timestamp'>) => {
    const logRef = doc(collection(db, 'userActivityLog'));
    const log: ActivityLog = {
      ...logData,
      log_id: logRef.id,
      timestamp: serverTimestamp()
    };
    
    await setDoc(logRef, log);
    return log;
  },

  getUserActivity: async (userId: string, limit_count: number = 50) => {
    const q = query(
      collection(db, 'userActivityLog'),
      where('user_id', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ActivityLog);
  },

  getEntityActivity: async (entityType: ActivityLog['entity_type'], entityId: string) => {
    const q = query(
      collection(db, 'userActivityLog'),
      where('entity_type', '==', entityType),
      where('entity_id', '==', entityId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as ActivityLog);
  }
};