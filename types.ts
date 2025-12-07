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
}

export interface UserProfile {
  name: string;
  profession: string;
  phone: string;
  email: string;
  companyName?: string;
  logo?: string; // base64 encoded image
}

export type ViewState = 'dashboard' | 'clients' | 'calendar' | 'finance' | 'profile' | 'history';