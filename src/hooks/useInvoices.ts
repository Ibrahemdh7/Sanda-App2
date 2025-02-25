import { useState, useCallback } from 'react';
import { invoiceService } from '@/services/firebase/invoices';
import { Invoice } from '@/types/firebase';
import { useAuth } from './useAuth';

export const useInvoices = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getInvoicesByProvider = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await invoiceService.getByProviderId(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoicesByClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await invoiceService.getByClientId(clientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (invoiceData: Omit<Invoice, 'invoice_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      return await invoiceService.create(invoiceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvoice = useCallback(async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      setLoading(true);
      setError(null);
      await invoiceService.update(invoiceId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getInvoicesByProvider,
    getInvoicesByClient,
    createInvoice,
    updateInvoice
  };
};