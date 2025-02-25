import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface SystemSetting {
  setting_id: string;
  setting_name: string;
  setting_value: string | number | boolean;
  category: 'general' | 'security' | 'notifications' | 'payments';
  description: string;
  is_editable: boolean;
  created_at: any;
  updated_at: any;
  updated_by?: string;
}

export const systemSettingsService = {
  create: async (settingData: Omit<SystemSetting, 'setting_id' | 'created_at' | 'updated_at'>) => {
    const settingRef = doc(collection(db, 'systemSettings'));
    const setting: SystemSetting = {
      ...settingData,
      setting_id: settingRef.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(settingRef, setting);
    return setting;
  },

  getById: async (settingId: string) => {
    const docRef = doc(db, 'systemSettings', settingId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Setting not found');
    }
    
    return docSnap.data() as SystemSetting;
  },

  getAllSettings: async () => {
    const querySnapshot = await getDocs(collection(db, 'systemSettings'));
    return querySnapshot.docs.map(doc => doc.data() as SystemSetting);
  },

  getByCategory: async (category: SystemSetting['category']) => {
    const q = query(collection(db, 'systemSettings'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as SystemSetting);
  },

  update: async (settingId: string, value: SystemSetting['setting_value'], updatedBy: string) => {
    const docRef = doc(db, 'systemSettings', settingId);
    await updateDoc(docRef, {
      setting_value: value,
      updated_at: serverTimestamp(),
      updated_by: updatedBy
    });
  }
};