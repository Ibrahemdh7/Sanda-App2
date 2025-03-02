// src/services/firebase/payments.ts
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
  limit,
  serverTimestamp,
  Timestamp,
  FirestoreError,
  runTransaction
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/config/firebase';
import { Payment } from '@/types/firebase';
// Import services directly instead of using dynamic imports
import { activityLogService } from './activityLogs';
import { invoiceService } from './invoices';

export class PaymentServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PaymentServiceError';
  }
}

export const paymentService = {
  /**
   * Creates a new payment and updates the related invoice
   */
  create: async (
    paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>, 
    receiptFile?: File,
    userId?: string
  ): Promise<Payment> => {
    try {
      // Validate required fields
      if (!paymentData.invoice_id) {
        throw new PaymentServiceError('Invoice ID is required');
      }
      if (!paymentData.payment_date) {
        throw new PaymentServiceError('Payment date is required');
      }
      if (paymentData.amount <= 0) {
        throw new PaymentServiceError('Payment amount must be greater than zero');
      }
      
      // Run as a transaction to ensure invoice is updated atomically
      return await runTransaction(db, async (transaction) => {
        // Get the invoice to be paid
        const invoiceRef = doc(db, 'invoices', paymentData.invoice_id);
        const invoiceSnap = await transaction.get(invoiceRef);
        
        if (!invoiceSnap.exists()) {
          throw new PaymentServiceError('Invoice not found', 'not-found');
        }
        
        const invoice = invoiceSnap.data();
        
        // Check if invoice is already paid
        if (invoice.status === 'paid') {
          throw new PaymentServiceError('Invoice is already paid', 'already-paid');
        }
        
        // Get existing payments for this invoice
        const paymentsQuery = query(
          collection(db, 'payments'),
          where('invoice_id', '==', paymentData.invoice_id)
        );
        
        const paymentsSnap = await getDocs(paymentsQuery);
        const existingPaymentsTotal = paymentsSnap.docs.reduce(
          (sum, doc) => sum + doc.data().amount, 
          0
        );
        
        // Create the payment document
        const paymentRef = doc(collection(db, 'payments'));
        
        // Upload receipt if provided
        let receipt_url = '';
        if (receiptFile) {
          try {
            const storageRef = ref(storage, `receipts/${paymentRef.id}/${receiptFile.name}`);
            await uploadBytes(storageRef, receiptFile);
            receipt_url = await getDownloadURL(storageRef);
          } catch (uploadError) {
            console.error('Error uploading receipt:', uploadError);
            // Continue without receipt
          }
        }
        
        // Create the payment object
        const payment: Payment = {
          ...paymentData,
          payment_id: paymentRef.id,
          receipt_url,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        // Set the payment document
        transaction.set(paymentRef, payment);
        
        // Calculate the new total paid amount
        const totalPaid = existingPaymentsTotal + paymentData.amount;
        
        // Update the invoice status if fully paid
        if (totalPaid >= invoice.total_amount) {
          transaction.update(invoiceRef, {
            status: 'paid',
            updated_at: serverTimestamp()
          });
        }
        
        // Add activity log entry (outside the transaction)
        try {
          if (userId) {
            // Use imported service instead of dynamic import
            await activityLogService.log({
              user_id: userId,
              activity_type: 'create',
              entity_type: 'payment',
              entity_id: paymentRef.id,
              description: `Created payment of ${payment.amount} for invoice ${payment.invoice_id}`
            });
          }
        } catch (logError) {
          console.error('Failed to log payment creation:', logError);
          // Continue without failing the payment creation
        }
        
        // Return with concrete Timestamp instances instead of FieldValue
        return {
          ...payment,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      if (error instanceof PaymentServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to create payment');
      }
    }
  },

  getById: async (paymentId: string): Promise<Payment> => {
    try {
      const docRef = doc(db, 'payments', paymentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new PaymentServiceError('Payment not found', 'not-found');
      }
      
      return {
        ...docSnap.data(),
        payment_id: docSnap.id
      } as Payment;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      if (error instanceof PaymentServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to get payment');
      }
    }
  },

  getByInvoiceId: async (invoiceId: string): Promise<Payment[]> => {
    try {
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
    } catch (error) {
      console.error('Error getting payments by invoice ID:', error);
      if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to get payments by invoice ID');
      }
    }
  },
  
  getByClientId: async (clientId: string, limitCount?: number): Promise<Payment[]> => {
    try {
      // Use imported service instead of dynamic import
      const invoices = await invoiceService.getByClientId(clientId);
      
      if (invoices.length === 0) {
        return [];
      }
      
      // Get invoice IDs
      const invoiceIds = invoices.map(invoice => invoice.invoice_id);
      
      // Query payments for these invoices
      // Note: Firebase has a limit on 'in' queries (usually 10 items), so we may need to batch
      const paymentsPromises = [];
      
      // Process in batches of 10
      for (let i = 0; i < invoiceIds.length; i += 10) {
        const batchIds = invoiceIds.slice(i, i + 10);
        
        const q = query(
          collection(db, 'payments'),
          where('invoice_id', 'in', batchIds),
          orderBy('created_at', 'desc')
        );
        
        paymentsPromises.push(getDocs(q));
      }
      
      // Resolve all queries
      const paymentsSnapshots = await Promise.all(paymentsPromises);
      
      // Combine results
      let payments: Payment[] = [];
      
      paymentsSnapshots.forEach(snapshot => {
        payments = payments.concat(
          snapshot.docs.map(doc => ({
            ...doc.data(),
            payment_id: doc.id
          }) as Payment)
        );
      });
      
      // Sort by date descending
      payments.sort((a, b) => {
        const dateA = a.created_at instanceof Timestamp 
          ? a.created_at.toMillis() 
          : new Date(a.created_at as any).getTime();
        
        const dateB = b.created_at instanceof Timestamp 
          ? b.created_at.toMillis() 
          : new Date(b.created_at as any).getTime();
        
        return dateB - dateA;
      });
      
      // Apply limit if specified
      if (limitCount && payments.length > limitCount) {
        payments = payments.slice(0, limitCount);
      }
      
      return payments;
    } catch (error) {
      console.error('Error getting payments by client ID:', error);
      if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to get payments by client ID');
      }
    }
  },
  
  getByProviderId: async (providerId: string, limitCount?: number): Promise<Payment[]> => {
    try {
      // Use imported service instead of dynamic import
      const invoices = await invoiceService.getByProviderId(providerId);
      
      if (invoices.length === 0) {
        return [];
      }
      
      // Get invoice IDs
      const invoiceIds = invoices.map(invoice => invoice.invoice_id);
      
      // Query payments for these invoices in batches of 10
      const paymentsPromises = [];
      
      for (let i = 0; i < invoiceIds.length; i += 10) {
        const batchIds = invoiceIds.slice(i, i + 10);
        
        const q = query(
          collection(db, 'payments'),
          where('invoice_id', 'in', batchIds),
          orderBy('created_at', 'desc')
        );
        
        paymentsPromises.push(getDocs(q));
      }
      
      // Resolve all queries
      const paymentsSnapshots = await Promise.all(paymentsPromises);
      
      // Combine results
      let payments: Payment[] = [];
      
      paymentsSnapshots.forEach(snapshot => {
        payments = payments.concat(
          snapshot.docs.map(doc => ({
            ...doc.data(),
            payment_id: doc.id
          }) as Payment)
        );
      });
      
      // Sort by date descending
      payments.sort((a, b) => {
        const dateA = a.created_at instanceof Timestamp 
          ? a.created_at.toMillis() 
          : new Date(a.created_at as any).getTime();
        
        const dateB = b.created_at instanceof Timestamp 
          ? b.created_at.toMillis() 
          : new Date(b.created_at as any).getTime();
        
        return dateB - dateA;
      });
      
      // Apply limit if specified
      if (limitCount && payments.length > limitCount) {
        payments = payments.slice(0, limitCount);
      }
      
      return payments;
    } catch (error) {
      console.error('Error getting payments by provider ID:', error);
      if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to get payments by provider ID');
      }
    }
  },

  update: async (
    paymentId: string, 
    updates: Partial<Payment>,
    newReceiptFile?: File,
    userId?: string
  ): Promise<void> => {
    try {
      // Get current payment
      const payment = await paymentService.getById(paymentId);
      
      // Prevent updating certain fields
      const safeUpdates = { ...updates };
      
      // Don't allow changing the payment_id
      delete safeUpdates.payment_id;
      
      // Don't allow changing the created_at timestamp
      delete safeUpdates.created_at;
      
      // Don't allow changing the invoice_id (would break relationships)
      delete safeUpdates.invoice_id;
      
      // Handle receipt file update
      if (newReceiptFile) {
        try {
          // Delete old receipt if it exists
          if (payment.receipt_url) {
            try {
              const oldReceiptRef = ref(storage, payment.receipt_url);
              await deleteObject(oldReceiptRef);
            } catch (deleteError) {
              console.error('Error deleting old receipt:', deleteError);
              // Continue even if delete fails
            }
          }
          
          // Upload new receipt
          const storageRef = ref(storage, `receipts/${paymentId}/${newReceiptFile.name}`);
          await uploadBytes(storageRef, newReceiptFile);
          safeUpdates.receipt_url = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error('Error updating receipt:', uploadError);
          throw new PaymentServiceError('Failed to update receipt file');
        }
      }
      
      // Update payment document
      const docRef = doc(db, 'payments', paymentId);
      await updateDoc(docRef, {
        ...safeUpdates,
        updated_at: serverTimestamp()
      });
      
      // If the amount changed, we need to check if the invoice status should be updated
      if (updates.amount !== undefined && updates.amount !== payment.amount) {
        // Get the invoice
        const invoiceRef = doc(db, 'invoices', payment.invoice_id);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (invoiceSnap.exists()) {
          const invoice = invoiceSnap.data();
          
          // Get all payments for this invoice
          const paymentsQuery = query(
            collection(db, 'payments'),
            where('invoice_id', '==', payment.invoice_id)
          );
          
          const paymentsSnap = await getDocs(paymentsQuery);
          
          // Calculate total amount paid (excluding this payment)
          let totalPaid = 0;
          
          paymentsSnap.docs.forEach(doc => {
            if (doc.id === paymentId) {
              // Add the updated amount
              totalPaid += updates.amount as number;
            } else {
              totalPaid += doc.data().amount;
            }
          });
          
          // Update invoice status based on total paid
          if (totalPaid >= invoice.total_amount && invoice.status !== 'paid') {
            await updateDoc(invoiceRef, {
              status: 'paid',
              updated_at: serverTimestamp()
            });
          } else if (totalPaid < invoice.total_amount && invoice.status === 'paid') {
            await updateDoc(invoiceRef, {
              status: 'pending',
              updated_at: serverTimestamp()
            });
          }
        }
      }
      
      // Log activity
      if (userId) {
        try {
          // Use imported service instead of dynamic import
          await activityLogService.log({
            user_id: userId,
            activity_type: 'update',
            entity_type: 'payment',
            entity_id: paymentId,
            description: `Updated payment for invoice ${payment.invoice_id}`
          });
        } catch (logError) {
          console.error('Failed to log payment update:', logError);
          // Continue without failing the payment update
        }
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      if (error instanceof PaymentServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new PaymentServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new PaymentServiceError('Failed to update payment');
      }
    }
  },
  
  getPaymentStats: async (providerId: string, startDate?: Date, endDate?: Date): Promise<{
    totalPayments: number;
    totalAmount: number;
    paymentsByMethod: Record<string, { count: number; amount: number }>;
  }> => {
    try {
      // Get all payments for this provider
      const payments = await paymentService.getByProviderId(providerId);
      
      // Filter by date range if provided
      let filteredPayments = payments;
      
      if (startDate || endDate) {
        filteredPayments = payments.filter(payment => {
          const paymentDate = payment.payment_date instanceof Timestamp
            ? new Date(payment.payment_date.seconds * 1000)
            : new Date(payment.payment_date as any);
          
          if (startDate && paymentDate < startDate) {
            return false;
          }
          
          if (endDate && paymentDate > endDate) {
            return false;
          }
          
          return true;
        });
      }
      
      // Calculate stats
      const stats = {
        totalPayments: filteredPayments.length,
        totalAmount: 0,
        paymentsByMethod: {} as Record<string, { count: number; amount: number }>
      };
      
      filteredPayments.forEach(payment => {
        // Add to total amount
        stats.totalAmount += payment.amount;
        
        // Group by payment method
        const method = payment.payment_method || 'unknown';
        
        if (!stats.paymentsByMethod[method]) {
          stats.paymentsByMethod[method] = { count: 0, amount: 0 };
        }
        
        stats.paymentsByMethod[method].count++;
        stats.paymentsByMethod[method].amount += payment.amount;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw new PaymentServiceError('Failed to get payment statistics');
    }
  }
};