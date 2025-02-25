import { useState, useCallback } from 'react';
import { creditLimitRequestService } from '@/services/firebase/creditLimitRequests';
import { useAuth } from './useAuth';

export const useCreditLimitRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const getRequestsByClient = useCallback(async (clientId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await creditLimitRequestService.getByClientId(clientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit limit requests');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getRequestsByProvider = useCallback(async (providerId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await creditLimitRequestService.getByProviderId(providerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credit limit requests');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (requestData: any) => {
    try {
      setLoading(true);
      setError(null);
      return await creditLimitRequestService.create(requestData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create credit limit request');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateRequestStatus = useCallback(async (
    requestId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      await creditLimitRequestService.updateStatus(requestId, status, user?.id || '', notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    error,
    getRequestsByClient,
    getRequestsByProvider,
    createRequest,
    updateRequestStatus
  };
};