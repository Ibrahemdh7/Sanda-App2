import { useState, useEffect } from 'react';
import { clientService } from '@/services/firebase/clients';
import { useAuth } from './useAuth';
import { Client } from '@/types/firebase';

export const useClients = (providerId?: string) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const id = providerId || user?.id;
        
        if (!id) {
          throw new Error('Provider ID is required');
        }
        
        const data = await clientService.getByProviderId(id);
        setClients(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [providerId, user]);

  return { clients, loading, error };
};