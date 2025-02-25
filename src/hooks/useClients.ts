import { useState, useCallback } from 'react';
import { clientService } from '@/services/firebase/clients';
import { Client } from '@/types/firebase';
import { useAuth } from './useAuth';

export const useClients = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getClientsByProvider = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await clientService.getByProviderId(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = useCallback(async (clientData: Omit<Client, 'client_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);
      return await clientService.create(clientData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClient = useCallback(async (clientId: string, updates: Partial<Client>) => {
    try {
      setLoading(true);
      setError(null);
      await clientService.update(clientId, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getClientsByProvider,
    createClient,
    updateClient
  };
};