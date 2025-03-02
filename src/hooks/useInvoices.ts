import { useState, useEffect } from 'react';
import { invoiceService } from '@/services/firebase/invoices';
import { useAuth } from './useAuth';
import { Invoice } from '@/types/firebase';
import { clientService } from '@/services/firebase/clients';

export const useInvoices = (clientId?: string) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        
        if (clientId) {
          const data = await invoiceService.getByClientId(clientId);
          setInvoices(data);
        } else if (user) {
          if (user.role === 'provider') {
            const data = await invoiceService.getByProviderId(user.id);
            setInvoices(data);
          } else if (user.role === 'client') {
            // Assuming we need to get the client id first
            // This may need to be adjusted based on your data structure
            const clientDoc = await clientService.getByUserId(user.id);
            const data = await invoiceService.getByClientId(clientDoc.client_id);
            setInvoices(data);
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [clientId, user]);

  return { invoices, loading, error };
};