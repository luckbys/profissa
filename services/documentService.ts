import { supabase } from './supabaseClient';
import { SavedDocument, DocumentFilters } from '../types/documents';

const DOCUMENTS_KEY = 'gerente_bolso_documents';

// Get all saved documents (Local)
export const getDocuments = (): SavedDocument[] => {
    try {
        const data = localStorage.getItem(DOCUMENTS_KEY);
        const docs = data ? JSON.parse(data) : [];
        return docs.map((d: any) => ({
            ...d,
            status: d.status || 'pending'
        }));
    } catch {
        return [];
    }
};

// Fetch all documents (Local + Supabase NFS-e)
export const fetchDocuments = async (userId?: string): Promise<SavedDocument[]> => {
    const localDocs = getDocuments();

    if (!userId) return localDocs;

    try {
        const { data: nfseDocs, error } = await supabase
            .from('nfs_e')
            .select('*, clients(name, phone)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching NFS-e:', error);
            return localDocs;
        }

        const mappedNfse: SavedDocument[] = nfseDocs.map(doc => ({
            id: doc.id,
            type: 'nfse',
            clientId: doc.client_id,
            clientName: doc.clients?.name || 'Cliente Desconhecido',
            clientPhone: doc.clients?.phone || '',
            documentNumber: doc.nfse_number ? `${doc.nfse_number}` : `RPS-${doc.rps_number || doc.id.slice(0, 8)}`,
            createdAt: doc.created_at,
            status: doc.status === 'authorized' ? 'paid' : (doc.status || 'pending'), // Map authorized to paid for UI or keep authorized if UI supports it
            items: doc.items || [{ description: 'Serviço Prestado', price: doc.service_amount, quantity: 1 }],
            total: doc.service_amount,
            note: doc.description,
            url_pdf: doc.url_pdf,
            error_message: doc.error_message
        }));

        // Merge and sort
        return [...localDocs, ...mappedNfse].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (err) {
        console.error('Fetch documents error:', err);
        return localDocs;
    }
};

// Save a new document
export const saveDocument = (document: SavedDocument): void => {
    try {
        const existing = getDocuments();
        const updated = [document, ...existing];
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save document:', error);
    }
};

// Delete a document
export const deleteDocument = (id: string): void => {
    try {
        const documents = getDocuments();
        const updated = documents.filter(d => d.id !== id);
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to delete document:', error);
    }
};

// Toggle document status
export const toggleDocumentStatus = (id: string, status: 'pending' | 'paid' | 'overdue'): void => {
    try {
        const documents = getDocuments();
        const updated = documents.map(d =>
            d.id === id ? { ...d, status } : d
        );
        localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to update document status:', error);
    }
};

// Filter helper
export const filterDocuments = (documents: SavedDocument[], filters: DocumentFilters): SavedDocument[] => {
    let result = [...documents];

    if (filters.type && filters.type !== 'all') {
        result = result.filter(d => d.type === filters.type);
    }

    if (filters.clientId) {
        result = result.filter(d => d.clientId === filters.clientId);
    }

    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(d =>
            d.clientName.toLowerCase().includes(query) ||
            d.items.some(item => item.description.toLowerCase().includes(query))
        );
    }

    if (filters.dateFrom) {
        result = result.filter(d => d.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
        result = result.filter(d => d.createdAt <= filters.dateTo!);
    }

    return result;
};

// Get filtered documents (Legacy Local Only)
export const getFilteredDocuments = (filters: DocumentFilters): SavedDocument[] => {
    return filterDocuments(getDocuments(), filters);
};

// Generate document number
export const generateDocumentNumber = (type: 'quote' | 'receipt' | 'nfse'): string => {
    let prefix = 'DOC';
    if (type === 'quote') prefix = 'ORC';
    if (type === 'receipt') prefix = 'REC';
    if (type === 'nfse') prefix = 'RPS';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}-${timestamp}${random}`;
};

// Generate WhatsApp link for a document
export const generateDocumentWhatsAppLink = (doc: SavedDocument): string => {
    const lineItems = doc.items.map(i => `• ${i.description}: R$ ${i.price.toFixed(2)}`).join('\n');
    const typeLabel = doc.type === 'quote' ? 'orçamento' : 'recibo';
    const message = `Olá ${doc.clientName}!\n\nSegue o ${typeLabel} #${doc.documentNumber}:\n\n${lineItems}\n\n*Total: R$ ${doc.total.toFixed(2)}*\n\nFico à disposição!`;

    return `https://wa.me/${doc.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
};

// Duplicate a document (create new with same items)
export const duplicateDocument = (doc: SavedDocument): SavedDocument => {
    return {
        ...doc,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        documentNumber: generateDocumentNumber(doc.type)
    };
};

// Get document stats
export const getDocumentStats = (): {
    quotes: number;
    receipts: number;
    totalValue: number;
    pendingValue: number;
    paidValue: number;
} => {
    const documents = getDocuments();
    return {
        quotes: documents.filter(d => d.type === 'quote').length,
        receipts: documents.filter(d => d.type === 'receipt').length,
        totalValue: documents.reduce((acc, d) => acc + d.total, 0),
        pendingValue: documents.filter(d => d.status === 'pending').reduce((acc, d) => acc + d.total, 0),
        paidValue: documents.filter(d => d.status === 'paid').reduce((acc, d) => acc + d.total, 0)
    };
};
