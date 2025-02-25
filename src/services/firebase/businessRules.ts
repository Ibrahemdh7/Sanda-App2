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

interface BusinessRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'credit_limit' | 'payment_terms' | 'approval_flow' | 'notification';
  rule_definition: {
    conditions: Array<{
      field: string;
      operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
      value: any;
    }>;
    actions: Array<{
      type: string;
      params: Record<string, any>;
    }>;
  };
  is_active: boolean;
  priority: number;
  description: string;
  created_at: any;
  updated_at: any;
  created_by: string;
  updated_by?: string;
}

export const businessRulesService = {
  create: async (ruleData: Omit<BusinessRule, 'rule_id' | 'created_at' | 'updated_at'>) => {
    const ruleRef = doc(collection(db, 'businessRules'));
    const rule: BusinessRule = {
      ...ruleData,
      rule_id: ruleRef.id,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(ruleRef, rule);
    return rule;
  },

  getById: async (ruleId: string) => {
    const docRef = doc(db, 'businessRules', ruleId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Business rule not found');
    }
    
    return docSnap.data() as BusinessRule;
  },

  getActiveRules: async (ruleType?: BusinessRule['rule_type']) => {
    let q = query(
      collection(db, 'businessRules'),
      where('is_active', '==', true)
    );

    if (ruleType) {
      q = query(q, where('rule_type', '==', ruleType));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
      .map(doc => doc.data() as BusinessRule)
      .sort((a, b) => b.priority - a.priority);
  },

  update: async (ruleId: string, updates: Partial<BusinessRule>, updatedBy: string) => {
    const docRef = doc(db, 'businessRules', ruleId);
    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp(),
      updated_by: updatedBy
    });
  },

  toggleActive: async (ruleId: string, isActive: boolean, updatedBy: string) => {
    const docRef = doc(db, 'businessRules', ruleId);
    await updateDoc(docRef, {
      is_active: isActive,
      updated_at: serverTimestamp(),
      updated_by: updatedBy
    });
  }
};