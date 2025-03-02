// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'provider' | 'client';
  displayName: string;
  phoneNumber: string;
  company?: string; // Add optional company field
  createdAt: Date;
  updatedAt: Date;
}

// Credit Account Types
export interface CreditAccount {
  id: string;
  clientId: string;
  providerId: string;
  creditLimit: number;
  currentBalance: number;
  status: 'active' | 'suspended' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

// Invoice Types
export interface Invoice {
  id: string;
  clientId: string;
  providerId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Payment Types
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: Date;
}