// Document Types for saved quotes and receipts

import { InvoiceItem } from '../types';

export interface SavedDocument {
    id: string;
    type: 'quote' | 'receipt';
    clientId: string;
    clientName: string;
    clientPhone: string;
    items: InvoiceItem[];
    total: number;
    createdAt: string;
    documentNumber: string;
}

export interface DocumentFilters {
    type?: 'quote' | 'receipt' | 'all';
    clientId?: string;
    searchQuery?: string;
    dateFrom?: string;
    dateTo?: string;
}
