import { Timestamp, FieldValue } from 'firebase/firestore';

export type TimestampType = Timestamp | FieldValue;

export interface Provider {
  provider_id: string;
  user_id: string;
  company_name: string;
  company_details: string;
  contact_info: {
    phone: string;
    email: string;
    address: string;
  };
  created_at: TimestampType;
  updated_at: TimestampType;
}

export interface Client {
  client_id: string;
  provider_id: string;
  user_id: string;
  client_name: string;
  contact_details: {
    phone: string;
    email: string;
    address: string;
  };
  credit_limit: number;
  account_status: 'active' | 'suspended' | 'closed';
  created_at: TimestampType;
  updated_at: TimestampType;
}

export interface Invoice {
  invoice_id: string;
  client_id: string;
  provider_id: string;
  invoice_date: TimestampType;
  due_date: TimestampType;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  created_at: TimestampType;
  updated_at: TimestampType;
}

export interface InvoiceItem {
  item_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Payment {
  payment_id: string;
  invoice_id: string;
  payment_date: TimestampType;
  amount: number;
  payment_method: 'bank_transfer' | 'credit_card' | 'cash';
  receipt_url?: string;
  created_at: TimestampType;
  updated_at: TimestampType;
}