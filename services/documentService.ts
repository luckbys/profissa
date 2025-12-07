import { SavedDocument, DocumentFilters } from '../types/documents';

const DOCUMENTS_KEY = 'gerente_bolso_documents';

// Get all saved documents
export const getDocuments = (): SavedDocument[] => {
    try {
        const data = localStorage.getItem(DOCUMENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
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

// Get filtered documents
export const getFilteredDocuments = (filters: DocumentFilters): SavedDocument[] => {
    let documents = getDocuments();

    if (filters.type && filters.type !== 'all') {
        documents = documents.filter(d => d.type === filters.type);
    }

    if (filters.clientId) {
        documents = documents.filter(d => d.clientId === filters.clientId);
    }

    if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        documents = documents.filter(d =>
            d.clientName.toLowerCase().includes(query) ||
            d.items.some(item => item.description.toLowerCase().includes(query))
        );
    }

    if (filters.dateFrom) {
        documents = documents.filter(d => d.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
        documents = documents.filter(d => d.createdAt <= filters.dateTo!);
    }

    return documents;
};

// Generate document number
export const generateDocumentNumber = (type: 'quote' | 'receipt'): string => {
    const prefix = type === 'quote' ? 'ORC' : 'REC';
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
export const getDocumentStats = (): { quotes: number; receipts: number; totalValue: number } => {
    const documents = getDocuments();
    return {
        quotes: documents.filter(d => d.type === 'quote').length,
        receipts: documents.filter(d => d.type === 'receipt').length,
        totalValue: documents.reduce((acc, d) => acc + d.total, 0)
    };
};
