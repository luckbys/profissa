import { InvoiceItem } from '../types';

export interface SavedDocument {
    id: string;
    type: 'quote' | 'receipt' | 'nfse';
    documentNumber: string;
    clientId: string;
    clientName: string;
    clientPhone: string;
    items: InvoiceItem[];
    total: number;
    createdAt: string;
    status: 'pending' | 'paid' | 'overdue' | 'authorized' | 'error';
    url_pdf?: string; // Optional for NFS-e
    error_message?: string; // Optional for failures
}

export interface DocumentFilters {
    type?: 'all' | 'quote' | 'receipt' | 'nfse';
    clientId?: string;
    dateFrom?: string;
    dateTo?: string;
    searchQuery?: string;
}
