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
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { storage, db } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Payment, TimeStampOrField } from '@/types/firebase';

export const paymentService = {
  create: async (paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>, receiptFile?: File) => {
    const paymentRef = doc(collection(db, 'payments'));
    let receipt_url = '';

    if (receiptFile) {
      const storageRef = ref(storage, `receipts/${paymentRef.id}/${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      receipt_url = await getDownloadURL(storageRef);
    }

    const now: TimeStampOrField = serverTimestamp();
    const payment: Payment = {
      ...paymentData,
      payment_id: paymentRef.id,
      receipt_url,
      created_at: now,
      updated_at: now
    };
    
    await setDoc(paymentRef, payment);
    return payment;
  },

  getById: async (paymentId: string) => {
    const docRef = doc(db, 'payments', paymentId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Payment not found');
    }
    
    return docSnap.data() as Payment;
  },

  getByInvoiceId: async (invoiceId: string) => {
    const q = query(
      collection(db, 'payments'),
      where('invoice_id', '==', invoiceId),
      orderBy('payment_date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Payment);
  },

  update: async (paymentId: string, updates: Partial<Payment>, newReceiptFile?: File) => {
    const docRef = doc(db, 'payments', paymentId);
    
    if (newReceiptFile) {
      const storageRef = ref(storage, `receipts/${paymentId}/${newReceiptFile.name}`);
      await uploadBytes(storageRef, newReceiptFile);
      updates.receipt_url = await getDownloadURL(storageRef);
    }

    await updateDoc(docRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  },

  delete: async (paymentId: string) => {
    await deleteDoc(doc(db, 'payments', paymentId));
  }
};