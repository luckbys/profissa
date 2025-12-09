export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  tags?: string[];
  birthday?: string; // MM-DD format
  createdAt?: string; // ISO date
}

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // ISO string
  service: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  items: InvoiceItem[];
  total: number;
  date: string;
  type: 'quote' | 'receipt'; // Orçamento ou Recibo
  status?: 'pending' | 'paid' | 'overdue';
}

export type ExpenseCategory = 'material' | 'transport' | 'food' | 'marketing' | 'utilities' | 'other';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string; // ISO date
  category: ExpenseCategory;
  notes?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'usage' | 'bonus' | 'refund';
  description?: string;
  createdAt: string;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  name: string;
  profession: string;
  phone: string;
  email: string;
  companyName?: string;
  logo?: string; // base64 encoded image
  isPro?: boolean;
  subscriptionStatus?: 'free' | 'pro';
  credits?: number;
}

export type ViewState = 'dashboard' | 'clients' | 'calendar' | 'finance' | 'documents' | 'profile' | 'history' | 'coach' | 'booking';

export * from './types/serviceTemplate';