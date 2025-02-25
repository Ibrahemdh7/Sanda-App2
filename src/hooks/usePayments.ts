import { useState, useCallback } from 'react';
import { paymentService } from '@/services/firebase/payments';
import { Payment } from '@/types/firebase';
import { useAuth } from './useAuth';

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getPaymentsByInvoice = useCallback(async (invoiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await paymentService.getByInvoiceId(invoiceId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createPayment = useCallback(async (
    paymentData: Omit<Payment, 'payment_id' | 'created_at' | 'updated_at'>,
    receiptFile?: File
  ) => {
    try {
      setLoading(true);
      setError(null);
      return await paymentService.create(paymentData, receiptFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePayment = useCallback(async (
    paymentId: string,
    updates: Partial<Payment>,
    newReceiptFile?: File
  ) => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.update(paymentId, updates, newReceiptFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPaymentsByInvoice,
    createPayment,
    updatePayment
  };
};