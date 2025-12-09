import React, { useState, useEffect } from 'react';
import { Client, UserProfile } from '../types';
import { professionalizeDescription, estimateServicePrice } from '../services/geminiService';
import { useSubscription } from '../hooks/useSubscription';
import { saveDocument, generateDocumentNumber, getDocuments, getDocumentStats } from '../services/documentService';
import { SavedDocument } from '../types/documents';
import { ServiceTemplate } from '../types/serviceTemplate';
import ServiceTemplateSelector from './ServiceTemplateSelector';
import CreditsDisplay from './CreditsDisplay';
import {
    Send, Download, Plus, Loader2, X, FileText
} from 'lucide-react';
import InvoiceTemplate from './InvoiceTemplate';
import DocumentCustomizer, { DocumentCustomization, DEFAULT_CUSTOMIZATION } from './DocumentCustomizer';
import { fiscalService } from '../services/fiscalService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';

interface DocumentGeneratorProps {
    clients: Client[];
    userProfile?: UserProfile;
    initialType?: 'quote' | 'receipt' | 'nfse';
    initialClientId?: string;
    onNavigateToHistory?: () => void;
    onBack?: () => void; // Optional back button if needed
}

const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
    clients,
    userProfile,
    initialType = 'quote',
    initialClientId = '',
    onNavigateToHistory
}) => {
    const [selectedClientId, setSelectedClientId] = useState(initialClientId);
    const [type, setType] = useState<'quote' | 'receipt' | 'nfse'>(initialType);
    const { user } = useAuth();
    const { showToast } = useToast();

    // Reset state when props change
    useEffect(() => {
        if (initialType) setType(initialType);
        if (initialClientId) setSelectedClientId(initialClientId);
    }, [initialType, initialClientId]);

    const [items, setItems] = useState<any[]>([]);
    const [newItemDesc, setNewItemDesc] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [isPricingAI, setIsPricingAI] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isEmitting, setIsEmitting] = useState(false);

    const [showPreview, setShowPreview] = useState(false);
    const [showNoCreditsWarning, setShowNoCreditsWarning] = useState(false);
    const [docCustomization, setDocCustomization] = useState<DocumentCustomization>(DEFAULT_CUSTOMIZATION);

    const { subscription, canGenerateDocument, useCredit, upgradeToPro } = useSubscription(userProfile);
    const selectedClient = clients.find(c => c.id === selectedClientId);

    // Document Handlers
    const handleAddItem = () => {
        if (!newItemDesc || !newItemPrice) return;
        setItems([...items, { id: Date.now().toString(), description: newItemDesc, quantity: 1, price: parseFloat(newItemPrice) }]);
        setNewItemDesc('');
        setNewItemPrice('');
    };

    const handleRemoveItem = (id: string) => setItems(items.filter(i => i.id !== id));

    const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    const handleGenerateDocument = () => {
        if (!canGenerateDocument) {
            setShowNoCreditsWarning(true);
            return;
        }
        if (useCredit() && selectedClient) {
            const docToSave: SavedDocument = {
                id: Date.now().toString(),
                type,
                clientId: selectedClientId,
                clientName: selectedClient.name,
                clientPhone: selectedClient.phone,
                items: [...items],
                total,
                createdAt: new Date().toISOString(),
                documentNumber: generateDocumentNumber(type),
                status: type === 'receipt' ? 'paid' : 'pending'
            };
            saveDocument(docToSave);
            setShowPreview(true);
        } else {
            setShowNoCreditsWarning(true);
        }
    };

    const handleEmitNFSe = async () => {
        if (!selectedClientId || items.length === 0) return;

        if (!user?.id) {
            showToast('Erro de autenticação', 'Tente recarregar a página.', 'error');
            return;
        }

        const confirmEmission = window.confirm("Confirma a emissão da Nota Fiscal para este cliente?");
        if (!confirmEmission) return;

        try {
            setIsEmitting(true);
            const draft = await fiscalService.createInvoiceDraft(user.id, null, total, selectedClientId);

            if (draft) {
                try {
                    const result = await fiscalService.emitNFSe(draft.id);
                    if (result.sucesso) {
                        showToast('Nota Fiscal Emitida!', `Número: ${result.numero || 'Em processamento'}`, 'success');
                    } else {
                        showToast('Falha na Emissão', result.erro || 'Erro desconhecido', 'error');
                    }
                } catch (emitError: any) {
                    console.error(emitError);
                    showToast('Erro na Emissão', emitError.message || 'Verifique o histórico.', 'error');
                } finally {
                    if (onNavigateToHistory) onNavigateToHistory();
                }
            }
        } catch (error: any) {
            console.error(error);
            showToast('Erro Crítico', 'Não foi possível criar o rascunho da nota.', 'error');
        } finally {
            setIsEmitting(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = document.getElementById('invoice-preview');
        if (!element) return;
        setIsDownloading(true);
        const filename = `${type === 'quote' ? 'orcamento' : 'recibo'}_${selectedClient?.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
        const opt = { margin: [10, 10, 10, 10], filename: filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, letterRendering: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };

        try {
            // @ts-ignore
            await window.html2pdf().set(opt).from(element).save();
        } catch (error) { console.error(error); alert("Erro ao gerar PDF."); }
        finally { setIsDownloading(false); }
    };

    const generateWhatsAppLink = () => {
        if (!selectedClient) return '#';
        const lineItems = items.map(i => `• ${i.description}: R$ ${i.price.toFixed(2)}`).join('\n');
        const message = `Olá ${selectedClient.name}!\n\nSegue o ${type === 'quote' ? 'orçamento' : 'recibo'} solicitado:\n\n${lineItems}\n\n*Total: R$ ${total.toFixed(2)}*\n\nFico à disposição!`;
        return `https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    };

    // Preview Modal
    if (showPreview && selectedClient) {
        const documentNumber = generateDocumentNumber(type);

        return (
            <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col h-full animate-in fade-in duration-200">
                <div className="bg-gray-800 p-3 flex justify-between items-center px-4 shrink-0">
                    <span className="text-gray-400 text-xs font-medium">
                        Visualização do {type === 'quote' ? 'Orçamento' : 'Recibo'}
                    </span>
                    <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                    <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl mx-auto">
                        <InvoiceTemplate
                            type={type}
                            documentNumber={documentNumber}
                            clientName={selectedClient.name}
                            clientPhone={selectedClient.phone}
                            clientEmail={selectedClient.email}
                            clientAddress={selectedClient.address}
                            items={items}
                            total={total}
                            createdAt={new Date().toISOString()}
                            userProfile={userProfile}
                            templateStyle={docCustomization.template}
                            validityDays={docCustomization.validityDays}
                            showWatermark={docCustomization.showWatermark}
                            showSignature={docCustomization.showSignature}
                            showPaymentMethods={docCustomization.showPaymentMethods}
                            paymentMethods={docCustomization.paymentMethods}
                            showLogo={docCustomization.showLogo}
                            notes={docCustomization.customNotes}
                        />
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-200 flex gap-3 shrink-0">
                    <a
                        href={generateWhatsAppLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
                    >
                        <Send size={18} /> WhatsApp
                    </a>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                        {isDownloading ? 'Gerando...' : 'Baixar PDF'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Novo Documento</h1>
                    <p className="text-gray-500 text-sm">Crie orçamentos e notas.</p>
                </div>
                <CreditsDisplay subscription={subscription} onUpgrade={upgradeToPro} compact />
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Type Selection */}
                <div className="p-4 pb-0">
                    <div className="bg-gray-100 p-1.5 rounded-xl flex relative">
                        <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'quote' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`} onClick={() => setType('quote')}>Orçamento</button>
                        <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'receipt' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`} onClick={() => setType('receipt')}>Recibo</button>
                        <button className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'nfse' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`} onClick={() => setType('nfse')}>Nota Fiscal</button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <select className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)}>
                        <option value="">Selecione o Cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <ServiceTemplateSelector onSelect={(t: ServiceTemplate) => { setNewItemDesc(t.description); setNewItemPrice(t.price.toString()); }} currentDescription={newItemDesc} currentPrice={newItemPrice ? parseFloat(newItemPrice) : undefined} />

                    <textarea placeholder="Descrição..." className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200" value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} />
                    <div className="flex gap-2">
                        <input type="number" placeholder="0.00" className="flex-1 p-3 bg-gray-50 rounded-xl border border-gray-200" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} />
                        <button onClick={handleAddItem} className="bg-gray-900 text-white p-3 rounded-xl"><Plus /></button>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="bg-gray-50 p-4 border-t border-dashed border-gray-200">
                        {items.map(i => (
                            <div key={i.id} className="flex justify-between text-sm mb-2"><span>{i.description}</span><span className="font-bold">R$ {i.price.toFixed(2)}</span></div>
                        ))}
                        <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200"><span>Total</span><span>R$ {total.toFixed(2)}</span></div>
                    </div>
                )}

                <div className="p-4 border-t border-gray-100">
                    <DocumentCustomizer
                        customization={docCustomization}
                        onChange={setDocCustomization}
                        isPro={userProfile?.isPro || false}
                        onUpgrade={upgradeToPro}
                    />
                </div>
            </div>

            <button
                onClick={type === 'nfse' ? handleEmitNFSe : handleGenerateDocument}
                disabled={items.length === 0 || !selectedClientId}
                className={`w-full text-white py-4 rounded-xl font-bold shadow-lg transition-colors disabled:opacity-50 disabled:shadow-none ${type === 'nfse' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200'}`}
            >
                {isEmitting ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" />
                        <span>Emitindo Nota Fiscal...</span>
                    </div>
                ) : (
                    type === 'nfse' ? 'Emitir Nota Fiscal (RPS)' : `Gerar ${type === 'quote' ? 'Orçamento' : 'Recibo'}`
                )}
            </button>

            {onNavigateToHistory && (
                <button
                    onClick={onNavigateToHistory}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <FileText size={20} className="text-purple-600" />
                        </div>
                        <div className="text-left">
                            <span className="font-bold text-gray-800 block">Histórico de Documentos</span>
                            <span className="text-xs text-gray-500">Ver todos emitidos</span>
                        </div>
                    </div>
                </button>
            )}

            {showNoCreditsWarning && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl max-w-sm text-center">
                        <h3 className="font-bold text-xl mb-2">Sem créditos!</h3>
                        <button onClick={() => setShowNoCreditsWarning(false)} className="text-gray-500">Fechar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentGenerator;
