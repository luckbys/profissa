import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { SavedDocument, DocumentFilters } from '../types/documents';
import { useAuth } from '../hooks/useAuth';
import {
    getDocuments,
    deleteDocument,
    getFilteredDocuments,
    generateDocumentWhatsAppLink,
    duplicateDocument,
    saveDocument,
    toggleDocumentStatus,
    fetchDocuments,
    filterDocuments
} from '../services/documentService';
import {
    FileText, Receipt, Search, Filter, Send, Copy, Trash2,

    Eye, ChevronDown, X, Calendar, Clock, MoreVertical, CheckCircle2, AlertCircle,
    ScrollText, ExternalLink, Ban, Info
} from 'lucide-react';

interface DocumentHistoryProps {
    onDuplicate?: (doc: SavedDocument) => void;
}

const DocumentHistory: React.FC<DocumentHistoryProps> = ({ onDuplicate }) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [documents, setDocuments] = useState<SavedDocument[]>([]);
    const [filters, setFilters] = useState<DocumentFilters>({ type: 'all' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDoc, setSelectedDoc] = useState<SavedDocument | null>(null);
    const [actionMenuId, setActionMenuId] = useState<string | null>(null);

    // Load documents
    useEffect(() => {
        loadDocuments();
    }, [filters, user?.id]);

    const loadDocuments = async () => {
        const allDocs = await fetchDocuments(user?.id);
        const filtered = filterDocuments(allDocs, {
            ...filters,
            searchQuery: searchQuery || undefined
        });
        setDocuments(filtered);
    };

    useEffect(() => {
        const timer = setTimeout(loadDocuments, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, user?.id]);

    const handleDelete = (id: string) => {
        if (confirm('Excluir este documento?')) {
            deleteDocument(id);
            loadDocuments();
            showToast('Documento excluído', 'O documento foi removido com sucesso.', 'success');
        }
        setActionMenuId(null);
    };

    const handleDuplicate = (doc: SavedDocument) => {
        const newDoc = duplicateDocument(doc);
        saveDocument(newDoc);
        loadDocuments();
        showToast('Documento duplicado', 'Um novo rascunho foi criado.', 'success');
        if (onDuplicate) {
            onDuplicate(newDoc);
        }
        setActionMenuId(null);
    };

    const handleStatusChange = (id: string, newStatus: 'pending' | 'paid' | 'overdue') => {
        toggleDocumentStatus(id, newStatus);
        loadDocuments();
        showToast('Status atualizado', `Documento marcado como ${getStatusLabel(newStatus)}.`, 'success');
        setActionMenuId(null);
    };

    const handleResend = (doc: SavedDocument) => {
        const link = generateDocumentWhatsAppLink(doc);
        window.open(link, '_blank');
        setActionMenuId(null);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-600 bg-green-50 border-green-100';
            case 'authorized': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'overdue': return 'text-red-600 bg-red-50 border-red-100';
            case 'error': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-amber-600 bg-amber-50 border-amber-100';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago';
            case 'authorized': return 'Autorizada';
            case 'overdue': return 'Vencido';
            case 'error': return 'Falha';
            default: return 'Pendente';
        }
    };

    return (
        <div className="pb-24 space-y-4">
            {/* Header */}
            <header>
                <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
                <p className="text-gray-500">Seus documentos gerados</p>
            </header>

            {/* Search & Filters */}
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou serviço..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                    <button onClick={() => setFilters({ ...filters, type: 'all' })} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filters.type === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>Todos</button>
                    <button onClick={() => setFilters({ ...filters, type: 'quote' })} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filters.type === 'quote' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>Orçamentos</button>
                    <button onClick={() => setFilters({ ...filters, type: 'receipt' })} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filters.type === 'receipt' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-600'}`}>Recibos</button>
                    <button onClick={() => setFilters({ ...filters, type: 'nfse' })} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filters.type === 'nfse' ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'}`}>Notas Fiscais</button>
                </div>
            </div>

            {/* Documents List */}
            {documents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum documento encontrado</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {documents.map((doc) => (
                        <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                                {/* Left */}
                                <div className="flex items-start gap-3">
                                    <div className={`p-2.5 rounded-xl ${doc.type === 'quote' ? 'bg-blue-50 text-blue-600' :
                                        doc.type === 'nfse' ? 'bg-purple-50 text-purple-600' :
                                            'bg-green-50 text-green-600'
                                        }`}>
                                        {doc.type === 'quote' ? <FileText size={20} /> :
                                            doc.type === 'nfse' ? <ScrollText size={20} /> :
                                                <Receipt size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{doc.clientName}</h3>
                                        <p className="text-xs text-gray-500">#{doc.documentNumber}</p>

                                        {/* Status Badge */}
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(doc.status)}`}>
                                                {getStatusLabel(doc.status)}
                                            </span>
                                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                                <Calendar size={10} /> {formatDate(doc.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right & Menu */}
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-bold text-gray-800">R$ {doc.total.toFixed(2)}</span>

                                    <div className="relative">
                                        <button onClick={() => setActionMenuId(actionMenuId === doc.id ? null : doc.id)} className="p-1 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical size={18} className="text-gray-400" />
                                        </button>

                                        {actionMenuId === doc.id && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setActionMenuId(null)} />
                                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[180px]">
                                                    <div className="p-2 border-b border-gray-100 flex gap-1">
                                                        <button
                                                            onClick={() => handleStatusChange(doc.id, 'paid')}
                                                            className={`flex-1 py-1.5 rounded-lg flex justify-center text-green-600 hover:bg-green-50 ${doc.status === 'paid' ? 'bg-green-50 font-bold' : ''}`}
                                                            title="Marcar como Pago"
                                                        ><CheckCircle2 size={16} /></button>
                                                        <button
                                                            onClick={() => handleStatusChange(doc.id, 'pending')}
                                                            className={`flex-1 py-1.5 rounded-lg flex justify-center text-amber-600 hover:bg-amber-50 ${doc.status === 'pending' ? 'bg-amber-50 font-bold' : ''}`}
                                                            title="Marcar como Pendente"
                                                        ><Clock size={16} /></button>
                                                        <button
                                                            onClick={() => handleStatusChange(doc.id, 'overdue')}
                                                            className={`flex-1 py-1.5 rounded-lg flex justify-center text-red-600 hover:bg-red-50 ${doc.status === 'overdue' ? 'bg-red-50 font-bold' : ''}`}
                                                            title="Marcar como Vencido"
                                                        ><AlertCircle size={16} /></button>
                                                    </div>

                                                    <button onClick={() => setSelectedDoc(doc)} className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye size={16} /> Visualizar</button>
                                                    {doc.url_pdf && (
                                                        <button onClick={() => window.open(doc.url_pdf, '_blank')} className="w-full px-4 py-2.5 text-left text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2"><ExternalLink size={16} /> Ver PDF</button>
                                                    )}
                                                    <button onClick={() => handleResend(doc)} className="w-full px-4 py-2.5 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"><Send size={16} /> Reenviar</button>
                                                    <button onClick={() => handleDuplicate(doc)} className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"><Copy size={16} /> Duplicar</button>
                                                    <hr className="my-1 border-gray-100" />
                                                    {doc.type === 'nfse' ? (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    showToast('Funcionalidade indisponível', 'O cancelamento de notas fiscais será habilitado em breve.', 'warning');
                                                                    setActionMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Ban size={16} /> Cancelar Nota
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedDoc(doc);
                                                                    setActionMenuId(null);
                                                                }}
                                                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Info size={16} /> Informações
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => handleDelete(doc.id)} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={16} /> Excluir</button>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Same Preview Modal logic */}
            {selectedDoc && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">
                                {selectedDoc.type === 'quote' ? 'Orçamento' : selectedDoc.type === 'nfse' ? 'Nota Fiscal' : 'Recibo'} #{selectedDoc.documentNumber}
                            </h3>
                            <button onClick={() => setSelectedDoc(null)}><X size={20} className="text-gray-500" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Cliente</p>
                                <p className="font-semibold text-gray-800">{selectedDoc.clientName}</p>
                                <div className="mt-3 flex gap-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getStatusColor(selectedDoc.status)}`}>
                                        Status: {getStatusLabel(selectedDoc.status)}
                                    </span>
                                </div>
                                {selectedDoc.status === 'error' && selectedDoc.error_message && (
                                    <div className="mt-3 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                                        <Ban size={16} className="text-red-500 mt-0.5" />
                                        <div>
                                            <p className="text-xs font-bold text-red-700">Falha na Emissão</p>
                                            <p className="text-xs text-red-600 mt-1">{selectedDoc.error_message}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedDoc.type === 'nfse' && (
                                    <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Número da Nota:</span> <span className="font-mono">{selectedDoc.documentNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Ambiente:</span> <span className="font-medium">Homologação</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Emissão:</span> <span>{new Date(selectedDoc.createdAt).toLocaleString()}</span></div>
                                    </div>
                                )}
                                {selectedDoc.url_pdf && (
                                    <button
                                        onClick={() => window.open(selectedDoc.url_pdf, '_blank')}
                                        className="mt-3 w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition"
                                    >
                                        <ExternalLink size={16} /> Abrir PDF da Nota
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium mb-2">Itens</p>
                            <div className="space-y-2">{selectedDoc.items.map((item, index) => (<div key={index} className="flex justify-between text-sm"><span className="text-gray-700">{item.description}</span><span className="font-medium text-gray-800">R$ {item.price.toFixed(2)}</span></div>))}</div>
                        </div>
                        <div className="bg-brand-50 rounded-xl p-4 flex justify-between items-center"><span className="font-medium text-brand-700">Total</span><span className="text-2xl font-bold text-brand-700">R$ {selectedDoc.total.toFixed(2)}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentHistory;
