// src/services/firebase/invoices.ts
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
  runTransaction,
  DocumentReference,
  FieldValue
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Invoice, InvoiceItem } from '@/types/firebase';
import { Client } from '@/types/firebase';
import { activityLogService } from './activityLogs';

// Extend the Invoice type to include the additional properties used in this service
interface ExtendedInvoice extends Invoice {
  comments?: Array<{
    id: string;
    text: string;
    created_by: string;
    created_at: Timestamp | Date;
  }>;
  payment_date?: Timestamp | Date;
  cancellation_reason?: string;
  cancelled_by?: string;
  cancelled_at?: Timestamp | FieldValue;
}

export class InvoiceServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'InvoiceServiceError';
  }
}

export const invoiceService = {
  /**
   * Create a new invoice with proper validation and client credit limit check
   */
  create: async (invoiceData: Omit<Invoice, 'invoice_id' | 'created_at' | 'updated_at'>): Promise<Invoice> => {
    try {
      // Validate required fields
      if (!invoiceData.client_id) {
        throw new InvoiceServiceError('Client ID is required');
      }
      if (!invoiceData.provider_id) {
        throw new InvoiceServiceError('Provider ID is required');
      }
      if (!invoiceData.invoice_date) {
        throw new InvoiceServiceError('Invoice date is required');
      }
      if (!invoiceData.due_date) {
        throw new InvoiceServiceError('Due date is required');
      }
      if (invoiceData.total_amount <= 0) {
        throw new InvoiceServiceError('Total amount must be greater than zero');
      }
      
      // Check if invoice items are valid
      if (!invoiceData.items || invoiceData.items.length === 0) {
        throw new InvoiceServiceError('Invoice must have at least one item');
      }
      
      // Validate each item
      invoiceData.items.forEach((item, index) => {
        if (!item.description) {
          throw new InvoiceServiceError(`Item ${index + 1} is missing a description`);
        }
        if (item.quantity <= 0) {
          throw new InvoiceServiceError(`Item ${index + 1} must have a quantity greater than zero`);
        }
        if (item.unit_price < 0) {
          throw new InvoiceServiceError(`Item ${index + 1} must have a non-negative unit price`);
        }
      });
      
      // Recalculate total amount to ensure it matches item totals
      const calculatedTotal = invoiceData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 
        0
      );
      
      if (Math.abs(calculatedTotal - invoiceData.total_amount) > 0.01) {
        throw new InvoiceServiceError(
          `Invoice total amount (${invoiceData.total_amount}) doesn't match the sum of item totals (${calculatedTotal})`
        );
      }
      
      // Run as a transaction to ensure credit limit is respected
      return await runTransaction(db, async (transaction) => {
        // Get client to check credit limit
        const clientRef = doc(db, 'clients', invoiceData.client_id);
        const clientSnap = await transaction.get(clientRef);
        
        if (!clientSnap.exists()) {
          throw new InvoiceServiceError('Client not found', 'not-found');
        }
        
        const client = clientSnap.data() as Client;
        
        // Get all pending/unpaid invoices for this client to calculate available credit
        const pendingInvoicesQuery = query(
          collection(db, 'invoices'),
          where('client_id', '==', invoiceData.client_id),
          where('status', '==', 'pending')
        );
        
        const pendingInvoicesSnap = await getDocs(pendingInvoicesQuery);
        const pendingTotal = pendingInvoicesSnap.docs.reduce(
          (sum, doc) => sum + doc.data().total_amount, 
          0
        );
        
        const availableCredit = client.credit_limit - pendingTotal;
        
        if (invoiceData.total_amount > availableCredit) {
          throw new InvoiceServiceError(
            `Invoice amount (${invoiceData.total_amount}) exceeds available credit (${availableCredit})`,
            'credit-limit-exceeded'
          );
        }
        
        // Create the invoice
        const invoiceRef = doc(collection(db, 'invoices'));
        
        // Add unique IDs to items if they don't have them
        const itemsWithIds = invoiceData.items.map((item, index) => ({
          ...item,
          item_id: item.item_id || `${invoiceRef.id}-item-${index + 1}`
        }));
        
        const invoice: Invoice = {
          ...invoiceData,
          invoice_id: invoiceRef.id,
          items: itemsWithIds,
          status: invoiceData.status || 'pending',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        transaction.set(invoiceRef, invoice);
        
        // Add activity log separate from transaction since it shouldn't block invoice creation
        try {
          await activityLogService.log({
            user_id: invoiceData.provider_id,
            activity_type: 'create',
            entity_type: 'invoice',
            entity_id: invoiceRef.id,
            description: `Created invoice for ${client.client_name} with amount ${invoice.total_amount}`
          });
        } catch (logError) {
          console.error('Failed to log invoice creation:', logError);
          // Continue without failing the invoice creation
        }
        
        // Return with accurate timestamps for client use
        const returnInvoice = {
          ...invoice,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        };
        
        return returnInvoice;
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to create invoice');
      }
    }
  },

  getById: async (invoiceId: string): Promise<ExtendedInvoice> => {
    try {
      const docRef = doc(db, 'invoices', invoiceId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new InvoiceServiceError('Invoice not found', 'not-found');
      }
      
      return {
        ...docSnap.data(),
        invoice_id: docSnap.id
      } as ExtendedInvoice;
    } catch (error) {
      console.error('Error getting invoice by ID:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to get invoice');
      }
    }
  },

  getByClientId: async (clientId: string, limitCount?: number): Promise<Invoice[]> => {
    try {
      let q = query(
        collection(db, 'invoices'),
        where('client_id', '==', clientId),
        orderBy('created_at', 'desc')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        invoice_id: doc.id
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting invoices by client ID:', error);
      if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to get invoices by client ID');
      }
    }
  },

  getByProviderId: async (providerId: string, limitCount?: number, status?: Invoice['status']): Promise<Invoice[]> => {
    try {
      let q;
      
      if (status) {
        q = query(
          collection(db, 'invoices'),
          where('provider_id', '==', providerId),
          where('status', '==', status),
          orderBy('created_at', 'desc')
        );
      } else {
        q = query(
          collection(db, 'invoices'),
          where('provider_id', '==', providerId),
          orderBy('created_at', 'desc')
        );
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        invoice_id: doc.id
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting invoices by provider ID:', error);
      if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to get invoices by provider ID');
      }
    }
  },

  updateStatus: async (invoiceId: string, status: Invoice['status'], userId: string): Promise<void> => {
    try {
      // Get current invoice to compare before update
      const invoice = await invoiceService.getById(invoiceId);
      
      if (invoice.status === status) {
        // No change, return early
        return;
      }
      
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        status,
        updated_at: serverTimestamp()
      });
      
      // Log status change
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'update',
          entity_type: 'invoice',
          entity_id: invoiceId,
          description: `Updated invoice status from ${invoice.status} to ${status}`
        });
      } catch (logError) {
        console.error('Failed to log invoice status update:', logError);
      }
      
      // If status changes to 'paid', update client's used credit
      if (status === 'paid' && invoice.status !== 'paid') {
        try {
          const clientRef = doc(db, 'clients', invoice.client_id);
          const clientSnap = await getDoc(clientRef);
          
          if (clientSnap.exists()) {
            // No need to update credit limit for 'paid' invoices
            // They no longer count against the client's credit limit
            console.log(`Invoice ${invoiceId} marked as paid, releasing credit hold`);
          }
        } catch (clientError) {
          console.error('Error updating client credit usage:', clientError);
          // Continue - the invoice status update already succeeded
        }
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to update invoice status');
      }
    }
  },
  
  getOverdueInvoices: async (providerId?: string): Promise<Invoice[]> => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let q;
      
      if (providerId) {
        q = query(
          collection(db, 'invoices'),
          where('provider_id', '==', providerId),
          where('status', '==', 'pending'),
          where('due_date', '<', today),
          orderBy('due_date', 'asc')
        );
      } else {
        q = query(
          collection(db, 'invoices'),
          where('status', '==', 'pending'),
          where('due_date', '<', today),
          orderBy('due_date', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        invoice_id: doc.id
      })) as Invoice[];
    } catch (error) {
      console.error('Error getting overdue invoices:', error);
      if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to get overdue invoices');
      }
    }
  },
  
  searchInvoices: async (providerId: string, searchTerm: string): Promise<Invoice[]> => {
    try {
      // Get all invoices for this provider first
      const allInvoices = await invoiceService.getByProviderId(providerId);
      
      // Filter by invoice ID or total amount
      return allInvoices.filter(invoice => 
        invoice.invoice_id.includes(searchTerm) || 
        invoice.total_amount.toString().includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching invoices:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else {
        throw new InvoiceServiceError('Failed to search invoices');
      }
    }
  },
  
  getInvoiceSummary: async (providerId: string): Promise<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  }> => {
    try {
      // Get all invoices for this provider
      const allInvoices = await invoiceService.getByProviderId(providerId);
      
      // Calculate summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const summary = {
        total: allInvoices.length,
        paid: 0,
        pending: 0,
        overdue: 0
      };
      
      allInvoices.forEach(invoice => {
        if (invoice.status === 'paid') {
          summary.paid++;
        } else if (invoice.status === 'pending') {
          const dueDate = invoice.due_date instanceof Timestamp 
            ? new Date(invoice.due_date.seconds * 1000) 
            : new Date(invoice.due_date as any); // Add type assertion here
          
          if (dueDate < today) {
            summary.overdue++;
          } else {
            summary.pending++;
          }
        }
      });
      
      return summary;
    } catch (error) {
      console.error('Error getting invoice summary:', error);
      throw new InvoiceServiceError('Failed to get invoice summary');
    }
  },
  
  addItem: async (invoiceId: string, item: Omit<InvoiceItem, 'item_id'>): Promise<Invoice> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Don't modify paid invoices
      if (invoice.status === 'paid') {
        throw new InvoiceServiceError('Cannot modify a paid invoice');
      }
      
      // Validate item
      if (!item.description) {
        throw new InvoiceServiceError('Item description is required');
      }
      if (item.quantity <= 0) {
        throw new InvoiceServiceError('Item quantity must be greater than zero');
      }
      if (item.unit_price < 0) {
        throw new InvoiceServiceError('Item unit price cannot be negative');
      }
      
      // Create new item with ID
      const newItem: InvoiceItem = {
        ...item,
        item_id: `${invoiceId}-item-${Date.now()}`,
        total: item.quantity * item.unit_price
      };
      
      // Add item to invoice
      const updatedItems = [...invoice.items, newItem];
      
      // Recalculate total
      const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      // Update invoice
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        items: updatedItems,
        total_amount: newTotal,
        updated_at: serverTimestamp()
      });
      
      // Return updated invoice with safe timestamp
      const returnInvoice = {
        ...invoice,
        items: updatedItems,
        total_amount: newTotal,
        // Use Timestamp.now() instead of serverTimestamp() for the return value
        updated_at: Timestamp.now()
      };
      
      return returnInvoice;
    } catch (error) {
      console.error('Error adding item to invoice:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to add item to invoice');
      }
    }
  },
  
  removeItem: async (invoiceId: string, itemId: string): Promise<Invoice> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Don't modify paid invoices
      if (invoice.status === 'paid') {
        throw new InvoiceServiceError('Cannot modify a paid invoice');
      }
      
      // Find item index
      const itemIndex = invoice.items.findIndex(item => item.item_id === itemId);
      
      if (itemIndex === -1) {
        throw new InvoiceServiceError('Item not found in invoice');
      }
      
      // Remove item
      const updatedItems = [
        ...invoice.items.slice(0, itemIndex),
        ...invoice.items.slice(itemIndex + 1)
      ];
      
      // Recalculate total
      const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      // Update invoice
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        items: updatedItems,
        total_amount: newTotal,
        updated_at: serverTimestamp()
      });
      
      // Return updated invoice with safe timestamp
      const returnInvoice = {
        ...invoice,
        items: updatedItems,
        total_amount: newTotal
      };
      
      // Add the timestamp separately to avoid type conversion error
      returnInvoice.updated_at = Timestamp.now();
      
      return returnInvoice;
    } catch (error) {
      console.error('Error removing item from invoice:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to remove item from invoice');
      }
    }
  },
  
  updateItem: async (invoiceId: string, itemId: string, updates: Partial<InvoiceItem>): Promise<Invoice> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Don't modify paid invoices
      if (invoice.status === 'paid') {
        throw new InvoiceServiceError('Cannot modify a paid invoice');
      }
      
      // Find item index
      const itemIndex = invoice.items.findIndex(item => item.item_id === itemId);
      
      if (itemIndex === -1) {
        throw new InvoiceServiceError('Item not found in invoice');
      }
      
      // Update item
      const currentItem = invoice.items[itemIndex];
      const updatedItem: InvoiceItem = {
        ...currentItem,
        ...updates,
        // Make sure item_id is not changed
        item_id: currentItem.item_id
      };
      
      // Recalculate item total if quantity or unit_price changed
      if (updates.quantity !== undefined || updates.unit_price !== undefined) {
        const quantity = updates.quantity !== undefined ? updates.quantity : currentItem.quantity;
        const unitPrice = updates.unit_price !== undefined ? updates.unit_price : currentItem.unit_price;
        updatedItem.total = quantity * unitPrice;
      }
      
      // Update items array
      const updatedItems = [
        ...invoice.items.slice(0, itemIndex),
        updatedItem,
        ...invoice.items.slice(itemIndex + 1)
      ];
      
      // Recalculate invoice total
      const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
      
      // Update invoice
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        items: updatedItems,
        total_amount: newTotal,
        updated_at: serverTimestamp()
      });
      
      // Return updated invoice with safe timestamp
      const returnInvoice = {
        ...invoice,
        items: updatedItems,
        total_amount: newTotal
      };
      
      // Add the timestamp separately to avoid type conversion error
      returnInvoice.updated_at = Timestamp.now();
      
      return returnInvoice;
    } catch (error) {
      console.error('Error updating invoice item:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to update invoice item');
      }
    }
  },
  
  // Add a comment or note to an invoice
  addComment: async (invoiceId: string, comment: string, userId: string): Promise<void> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Create comments array if it doesn't exist
      const comments = invoice.comments || [];
      
      // Add new comment
      const newComment = {
        id: `comment-${Date.now()}`,
        text: comment,
        created_by: userId,
        created_at: Timestamp.now()
      };
      
      // Update invoice
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        comments: [...comments, newComment],
        updated_at: serverTimestamp()
      });
      
      // Log comment
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'update',
          entity_type: 'invoice',
          entity_id: invoiceId,
          description: `Added comment to invoice`
        });
      } catch (logError) {
        console.error('Failed to log invoice comment:', logError);
      }
    } catch (error) {
      console.error('Error adding comment to invoice:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to add comment to invoice');
      }
    }
  },
  
  // Update invoice due date
  updateDueDate: async (invoiceId: string, newDueDate: Date, userId: string): Promise<void> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Don't modify paid invoices
      if (invoice.status === 'paid') {
        throw new InvoiceServiceError('Cannot modify a paid invoice');
      }
      
      // Update due date
      const docRef = doc(db, 'invoices', invoiceId);
      await updateDoc(docRef, {
        due_date: newDueDate,
        updated_at: serverTimestamp()
      });
      
      // Log update
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'update',
          entity_type: 'invoice',
          entity_id: invoiceId,
          description: `Updated invoice due date to ${newDueDate.toISOString().split('T')[0]}`
        });
      } catch (logError) {
        console.error('Failed to log invoice due date update:', logError);
      }
    } catch (error) {
      console.error('Error updating invoice due date:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to update invoice due date');
      }
    }
  },
  
  // Cancel an invoice
  cancelInvoice: async (invoiceId: string, reason: string, userId: string): Promise<void> => {
    try {
      const invoice = await invoiceService.getById(invoiceId);
      
      // Only pending invoices can be cancelled
      if (invoice.status !== 'pending') {
        throw new InvoiceServiceError(`Cannot cancel invoice with status: ${invoice.status}`);
      }
      
      // Update invoice status
      const docRef = doc(db, 'invoices', invoiceId);
      
      // Use object literal type for the update to avoid FieldValue conversion issues
      const updateData: Record<string, any> = {
        status: 'cancelled',
        cancellation_reason: reason,
        cancelled_by: userId
      };
      
      // Add timestamps separately to avoid type conversion errors
      updateData.updated_at = serverTimestamp();
      updateData.cancelled_at = serverTimestamp();
      
      await updateDoc(docRef, updateData);
      
      // Log cancellation
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'update',
          entity_type: 'invoice',
          entity_id: invoiceId,
          description: `Cancelled invoice with reason: ${reason}`
        });
      } catch (logError) {
        console.error('Failed to log invoice cancellation:', logError);
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      if (error instanceof InvoiceServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new InvoiceServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new InvoiceServiceError('Failed to cancel invoice');
      }
    }
  },
  
  // Get invoice statistics for dashboard
  getInvoiceStats: async (providerId: string): Promise<{
    totalInvoices: number;
    totalValue: number;
    paidValue: number;
    pendingValue: number;
    overdueValue: number;
    averagePaymentTime: number;
  }> => {
    try {
      // Get all invoices for this provider
      const allInvoices = await invoiceService.getByProviderId(providerId) as ExtendedInvoice[];
      
      // Calculate statistics
      const today = new Date();
      let totalValue = 0;
      let paidValue = 0;
      let pendingValue = 0;
      let overdueValue = 0;
      let paymentTimeSum = 0;
      let paidCount = 0;
      
      allInvoices.forEach(invoice => {
        totalValue += invoice.total_amount;
        
        if (invoice.status === 'paid') {
          paidValue += invoice.total_amount;
          
          // Calculate payment time if we have both invoice date and payment date
          if (invoice.invoice_date && invoice.payment_date) {
            let invoiceDate: Date;
            let paymentDate: Date;
            
            // Handle Timestamp objects
            if (invoice.invoice_date instanceof Timestamp) {
              invoiceDate = new Date(invoice.invoice_date.seconds * 1000);
            } else {
              // Use type assertion to handle potential FieldValue
              invoiceDate = new Date(invoice.invoice_date as any);
            }
            
            // Handle Timestamp objects for payment_date
            if (invoice.payment_date instanceof Timestamp) {
              paymentDate = new Date(invoice.payment_date.seconds * 1000);
            } else {
              // Use type assertion to handle potential FieldValue
              paymentDate = new Date(invoice.payment_date as any);
            }
            
            // Only calculate if we have valid dates
            if (!isNaN(invoiceDate.getTime()) && !isNaN(paymentDate.getTime())) {
              const paymentTime = Math.round((paymentDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24)); // days
              if (paymentTime >= 0) { // Only count positive payment times
                paymentTimeSum += paymentTime;
                paidCount++;
              }
            }
          }
        } else if (invoice.status === 'pending') {
          const dueDate = invoice.due_date instanceof Timestamp 
            ? new Date(invoice.due_date.seconds * 1000) 
            : new Date(invoice.due_date as any);
          
          if (dueDate < today) {
            overdueValue += invoice.total_amount;
          } else {
            pendingValue += invoice.total_amount;
          }
        }
      });
      
      return {
        totalInvoices: allInvoices.length,
        totalValue,
        paidValue,
        pendingValue,
        overdueValue,
        averagePaymentTime: paidCount > 0 ? Math.round(paymentTimeSum / paidCount) : 0
      };
    } catch (error) {
      console.error('Error getting invoice statistics:', error);
      throw new InvoiceServiceError('Failed to get invoice statistics');
    }
  }
};