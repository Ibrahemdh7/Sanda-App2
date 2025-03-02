// src/services/firebase/clients.ts
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
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  DocumentReference,
  FirestoreError
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Client } from '@/types/firebase';
// Import the activity log service directly instead of using dynamic imports
import { activityLogService } from './activityLogs';
// Import the invoice service directly 
import { invoiceService } from './invoices';

export class ClientServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ClientServiceError';
  }
}

export const clientService = {
  create: async (clientData: Omit<Client, 'client_id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    try {
      // Validate required fields
      if (!clientData.provider_id) {
        throw new ClientServiceError('Provider ID is required');
      }
      if (!clientData.user_id) {
        throw new ClientServiceError('User ID is required');
      }
      if (!clientData.client_name) {
        throw new ClientServiceError('Client name is required');
      }

      // Create client document
      const clientRef = doc(collection(db, 'clients'));
      
      // Prepare client data with defaults for missing fields
      const client: Client = {
        ...clientData,
        client_id: clientRef.id,
        contact_details: clientData.contact_details || {
          phone: '',
          email: '',
          address: ''
        },
        credit_limit: clientData.credit_limit || 0,
        account_status: clientData.account_status || 'active',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      await setDoc(clientRef, client);
      
      // Create activity log for new client creation
      try {
        await activityLogService.log({
          user_id: clientData.user_id,
          activity_type: 'create',
          entity_type: 'client',
          entity_id: clientRef.id,
          description: `Created new client: ${client.client_name}`
        });
      } catch (logError) {
        console.error('Failed to log client creation:', logError);
        // Continue without failing the client creation
      }
      
      return {
        ...client,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      };
    } catch (error) {
      console.error('Error creating client:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to create client');
      }
    }
  },

  getById: async (clientId: string): Promise<Client> => {
    try {
      const docRef = doc(db, 'clients', clientId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new ClientServiceError('Client not found', 'not-found');
      }
      
      const data = docSnap.data();
      return {
        ...data,
        client_id: docSnap.id
      } as Client;
    } catch (error) {
      console.error('Error getting client by ID:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to get client');
      }
    }
  },

  getByUserId: async (userId: string): Promise<Client> => {
    try {
      const q = query(collection(db, 'clients'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new ClientServiceError('Client not found for this user', 'not-found');
      }
      
      const doc = querySnapshot.docs[0];
      return {
        ...doc.data(),
        client_id: doc.id
      } as Client;
    } catch (error) {
      console.error('Error getting client by user ID:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to get client by user ID');
      }
    }
  },

  getByProviderId: async (providerId: string, limitCount?: number): Promise<Client[]> => {
    try {
      let q = query(
        collection(db, 'clients'), 
        where('provider_id', '==', providerId),
        orderBy('client_name')
      );
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        client_id: doc.id
      })) as Client[];
    } catch (error) {
      console.error('Error getting clients by provider ID:', error);
      if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to get clients by provider ID');
      }
    }
  },
  
  searchClients: async (providerId: string, searchTerm: string): Promise<Client[]> => {
    try {
      // Firebase doesn't support direct text search, so we'll fetch all clients for this provider
      // and filter client-side
      const allClients = await clientService.getByProviderId(providerId);
      
      // Case-insensitive search on client name, email, and phone
      const lowercaseSearch = searchTerm.toLowerCase();
      return allClients.filter(client => 
        client.client_name.toLowerCase().includes(lowercaseSearch) ||
        client.contact_details.email.toLowerCase().includes(lowercaseSearch) ||
        client.contact_details.phone.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error searching clients:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else {
        throw new ClientServiceError('Failed to search clients');
      }
    }
  },

  update: async (clientId: string, updates: Partial<Client>, userId?: string): Promise<void> => {
    try {
      // Validate updates
      if (updates.client_id) {
        throw new ClientServiceError('Cannot update client ID');
      }
      
      // Prevent updating created_at
      if (updates.created_at) {
        delete updates.created_at;
      }
      
      // Get current client to compare changes
      const currentClient = await clientService.getById(clientId);
      
      const docRef = doc(db, 'clients', clientId);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp()
      });
      
      // Log activity if user ID is provided
      if (userId) {
        try {
          // Create description of changes
          let description = 'Updated client';
          
          // Add details about what changed
          const changes: string[] = [];
          if (updates.client_name && updates.client_name !== currentClient.client_name) {
            changes.push(`name changed to "${updates.client_name}"`);
          }
          if (updates.credit_limit && updates.credit_limit !== currentClient.credit_limit) {
            changes.push(`credit limit changed from ${currentClient.credit_limit} to ${updates.credit_limit}`);
          }
          if (updates.account_status && updates.account_status !== currentClient.account_status) {
            changes.push(`status changed to ${updates.account_status}`);
          }
          
          if (changes.length > 0) {
            description += ': ' + changes.join(', ');
          }
          
          await activityLogService.log({
            user_id: userId,
            activity_type: 'update',
            entity_type: 'client',
            entity_id: clientId,
            description
          });
        } catch (logError) {
          console.error('Failed to log client update:', logError);
          // Continue without failing the client update
        }
      }
    } catch (error) {
      console.error('Error updating client:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to update client');
      }
    }
  },
  
  updateCreditLimit: async (clientId: string, newLimit: number, userId: string): Promise<void> => {
    try {
      const client = await clientService.getById(clientId);
      const oldLimit = client.credit_limit;
      
      await clientService.update(clientId, { credit_limit: newLimit }, userId);
      
      // Log specific credit limit change
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'update',
          entity_type: 'client',
          entity_id: clientId,
          description: `Updated credit limit from ${oldLimit} to ${newLimit}`,
          metadata: { previous_limit: oldLimit, new_limit: newLimit }
        });
      } catch (logError) {
        console.error('Failed to log credit limit update:', logError);
      }
    } catch (error) {
      console.error('Error updating credit limit:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else {
        throw new ClientServiceError('Failed to update credit limit');
      }
    }
  },

  updateAccountStatus: async (clientId: string, status: Client['account_status'], userId: string): Promise<void> => {
    try {
      await clientService.update(clientId, { account_status: status }, userId);
    } catch (error) {
      console.error('Error updating account status:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else {
        throw new ClientServiceError('Failed to update account status');
      }
    }
  },

  delete: async (clientId: string, userId: string): Promise<void> => {
    try {
      // Get client info before deletion for logging
      const client = await clientService.getById(clientId);
      
      // Check if there are any related invoices - if there are, don't allow deletion
      const invoices = await invoiceService.getByClientId(clientId);
      
      if (invoices.length > 0) {
        throw new ClientServiceError(
          'Cannot delete client with existing invoices. Deactivate the account instead.',
          'constraint-violation'
        );
      }
      
      // Delete the client document
      await deleteDoc(doc(db, 'clients', clientId));
      
      // Log deletion
      try {
        await activityLogService.log({
          user_id: userId,
          activity_type: 'delete',
          entity_type: 'client',
          entity_id: clientId,
          description: `Deleted client: ${client.client_name}`
        });
      } catch (logError) {
        console.error('Failed to log client deletion:', logError);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      if (error instanceof ClientServiceError) {
        throw error;
      } else if (error instanceof FirestoreError) {
        throw new ClientServiceError(`Firestore error: ${error.message}`, error.code);
      } else {
        throw new ClientServiceError('Failed to delete client');
      }
    }
  }
};