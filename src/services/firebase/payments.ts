import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Payment } from '@/types/firebase';

export const paymentService = {
  create: async (paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>, receiptFile?: File) => {
    const paymentRef = doc(collection(db, 'payments'));
    let receipt_url = '';

    if (receiptFile) {
      const storageRef = ref(storage, `receipts/${paymentRef.id}/${receiptFile.name}`);
      await uploadBytes(storageRef, receiptFile);
      receipt_url = await getDownloadURL(storageRef);
    }

    const payment: Payment = {
      ...paymentData,
      payment_id: paymentRef.id,
      receipt_url,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp()
    };
    
    await setDoc(paymentRef, payment);
    return payment;
  },

  getByInvoiceId: async (invoiceId: string) => {
    const q = query(
      collection(db, 'payments'),
      where('invoice_id', '==', invoiceId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      payment_id: doc.id
    })) as Payment[];
  }
};