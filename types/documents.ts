import { InvoiceItem } from '../types';

export interface SavedDocument {
    id: string;
    type: 'quote' | 'receipt';
    documentNumber: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    items: InvoiceItem[];
    total: number;
    createdAt: string;
    status: 'pending' | 'paid' | 'overdue';
}

export interface DocumentFilters {
    type?: 'all' | 'quote' | 'receipt';
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;
}
