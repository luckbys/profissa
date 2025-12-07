import React, { useState } from 'react';
import { Client, InvoiceItem, UserProfile } from '../types';
import { Sparkles, Send, Download, Trash2, Plus, Receipt, CircleDollarSign, Loader2, Briefcase, X, ChevronDown, Wand2, AlertCircle, FileText } from 'lucide-react';
import { professionalizeDescription, estimateServicePrice } from '../services/geminiService';
import { useSubscription } from '../hooks/useSubscription';
import { saveDocument, generateDocumentNumber } from '../services/documentService';
import { SavedDocument } from '../types/documents';
import { ServiceTemplate } from '../types/serviceTemplate';
import CreditsDisplay from './CreditsDisplay';
import ServiceTemplateSelector from './ServiceTemplateSelector';

interface FinanceProps {
  clients: Client[];
  userProfile?: UserProfile;
  onViewHistory?: () => void;
}

const Finance: React.FC<FinanceProps> = ({ clients, userProfile, onViewHistory }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [type, setType] = useState<'quote' | 'receipt'>('quote');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPricingAI, setIsPricingAI] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showNoCreditsWarning, setShowNoCreditsWarning] = useState(false);

  const { subscription, canGenerateDocument, useCredit, upgradeToPro } = useSubscription();

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleAddItem = () => {
    if (!newItemDesc || !newItemPrice) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: newItemDesc,
        quantity: 1,
        price: parseFloat(newItemPrice)
      }
    ]);
    setNewItemDesc('');
    setNewItemPrice('');
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleAIImprovement = async () => {
    if (!newItemDesc) return;
    setIsGeneratingAI(true);
    const improved = await professionalizeDescription(newItemDesc);
    setNewItemDesc(improved);
    setIsGeneratingAI(false);
  };

  const handlePriceSuggestion = async () => {
    if (!newItemDesc) return;
    setIsPricingAI(true);
    const estimatedPrice = await estimateServicePrice(newItemDesc);
    if (estimatedPrice && estimatedPrice !== '0') {
      setNewItemPrice(estimatedPrice);
    }
    setIsPricingAI(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('invoice-preview');
    if (!element) return;

    setIsDownloading(true);

    const filename = `${type === 'quote' ? 'orcamento' : 'recibo'}_${selectedClient?.name.replace(/\s+/g, '_')}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;

    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      // @ts-ignore - html2pdf is loaded via script tag in index.html
      await window.html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao gerar PDF", error);
      alert("Houve um erro ao gerar o PDF. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const total = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const generateWhatsAppLink = () => {
    if (!selectedClient) return '#';

    const lineItems = items.map(i => `• ${i.description}: R$ ${i.price.toFixed(2)}`).join('\n');
    const message = `Olá ${selectedClient.name}!\n\nSegue o ${type === 'quote' ? 'orçamento' : 'recibo'} solicitado:\n\n${lineItems}\n\n*Total: R$ ${total.toFixed(2)}*\n\nFico à disposição!`;

    return `https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex flex-col h-full justify-center items-center p-4">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header Actions */}
          <div className="bg-gray-800 p-3 flex justify-between items-center px-4">
            <span className="text-gray-400 text-xs font-medium">Visualização</span>
            <button onClick={() => setShowPreview(false)} className="text-white hover:text-gray-300 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content (The Invoice) */}
          <div className="flex-1 overflow-y-auto p-8" id="invoice-preview">
            {/* Brand Header */}
            <div className="flex justify-between items-start mb-8 border-b-2 border-brand-500 pb-6">
              <div className="flex items-center gap-3">
                {userProfile?.logo ? (
                  <img src={userProfile.logo} alt="Logo" className="h-12 object-contain" />
                ) : (
                  <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                    <Briefcase size={20} />
                  </div>
                )}
                <div>
                  <span className="font-bold text-xl tracking-tight text-gray-800">
                    {userProfile?.companyName || (<>Gerente<span className="text-brand-600">deBolso</span></>)}
                  </span>
                  <p className="text-xs text-gray-400 font-medium">
                    {userProfile?.companyName ? userProfile.profession || '' : 'Soluções para Autônomos'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-black text-gray-800 tracking-wider uppercase">
                  {type === 'quote' ? 'Orçamento' : 'Recibo'}
                </h2>
                <div className="mt-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full font-mono">
                    #{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 font-medium">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-200"></div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cliente</h3>
              <div className="flex flex-col gap-1">
                <span className="text-lg font-bold text-gray-800">{selectedClient?.name}</span>
                <span className="text-sm text-gray-600">{selectedClient?.phone}</span>
                {selectedClient?.email && <span className="text-sm text-gray-600">{selectedClient?.email}</span>}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-brand-100">
                    <th className="py-2 text-left text-xs font-bold text-brand-600 uppercase w-2/3 pl-2">Descrição</th>
                    <th className="py-2 text-right text-xs font-bold text-brand-600 uppercase pr-2">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map(item => (
                    <tr key={item.id} className="group">
                      <td className="py-3 pl-2 text-sm text-gray-700 group-hover:bg-gray-50 transition-colors rounded-l-lg">{item.description}</td>
                      <td className="py-3 pr-2 text-sm text-gray-800 font-medium text-right whitespace-nowrap group-hover:bg-gray-50 transition-colors rounded-r-lg">
                        R$ {item.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-10">
              <div className="bg-brand-50 rounded-xl p-6 min-w-[200px] text-right border border-brand-100 shadow-sm">
                <span className="text-xs text-brand-600 font-bold uppercase tracking-wider block mb-1">Valor Total</span>
                <span className="text-3xl font-bold text-brand-700">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="text-center border-t border-gray-100 pt-8">
              <p className="text-gray-800 font-medium mb-1">Obrigado pela preferência!</p>
              <div className="flex justify-center items-center gap-1.5 opacity-50 mt-2">
                <Briefcase size={12} className="text-gray-400" />
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Powered by Gerente de Bolso</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 z-10">
            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 transition-all hover:-translate-y-0.5"
            >
              <Send size={18} /> <span className="text-sm">WhatsApp</span>
            </a>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-200 disabled:opacity-50 disabled:cursor-wait"
            >
              {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="text-sm">{isDownloading ? 'Baixando...' : 'Baixar PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Novo Documento</h1>
          <p className="text-gray-500">Preencha os dados abaixo para gerar.</p>
        </div>
        <CreditsDisplay subscription={subscription} onUpgrade={upgradeToPro} compact />
      </header>

      {/* Credits Card */}
      <CreditsDisplay subscription={subscription} onUpgrade={upgradeToPro} />

      {/* History Link */}
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <FileText size={18} className="text-purple-600" />
            </div>
            <span className="font-medium text-gray-700">Ver Histórico de Documentos</span>
          </div>
          <ChevronDown size={18} className="text-gray-400 -rotate-90" />
        </button>
      )}

      <div className="space-y-6">

        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Type Selection - Segmented Control */}
          <div className="p-4 pb-0">
            <div className="bg-gray-100 p-1.5 rounded-xl flex relative">
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative z-10 ${type === 'quote' ? 'text-brand-700 shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setType('quote')}
              >
                Orçamento
              </button>
              <button
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all relative z-10 ${type === 'receipt' ? 'text-brand-700 shadow-sm bg-white' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setType('receipt')}
              >
                Recibo
              </button>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* Client Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Para quem é?</label>
              <div className="relative group">
                <select
                  className="w-full p-3.5 pl-4 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all appearance-none cursor-pointer group-hover:bg-white"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-500 transition-colors" size={20} />
              </div>
            </div>

            {/* Input Group */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">O que foi feito?</label>
                <ServiceTemplateSelector
                  onSelect={(template: ServiceTemplate) => {
                    setNewItemDesc(template.description);
                    setNewItemPrice(template.price.toString());
                  }}
                  currentDescription={newItemDesc}
                  currentPrice={newItemPrice ? parseFloat(newItemPrice) : undefined}
                />
              </div>

              {/* Description + AI Button */}
              <div className="relative group">
                <textarea
                  placeholder="Ex: Troca de fiação, Pintura de parede..."
                  className="w-full p-4 border border-gray-200 rounded-xl text-sm min-h-[120px] focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none transition-all bg-white"
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                />

                {/* Floating AI Button inside textarea */}
                <button
                  onClick={handleAIImprovement}
                  disabled={isGeneratingAI || !newItemDesc}
                  className="absolute bottom-3 right-3 bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-purple-100 shadow-sm"
                >
                  {isGeneratingAI ? <Loader2 className="animate-spin" size={14} /> : <Wand2 size={14} />}
                  {isGeneratingAI ? 'Criando mágica...' : 'Melhorar Texto'}
                </button>
              </div>

              {/* Price Row */}
              <div className="flex gap-3">
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium select-none pointer-events-none group-focus-within:text-brand-500 transition-colors">R$</div>
                  <input
                    type="number"
                    placeholder="0,00"
                    className="w-full p-3.5 pl-10 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                  />

                  {/* Price Suggestion Button */}
                  <button
                    onClick={handlePriceSuggestion}
                    disabled={isPricingAI || !newItemDesc}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-all disabled:opacity-30"
                    title="Sugerir preço com IA"
                  >
                    {isPricingAI ? <Loader2 className="animate-spin" size={18} /> : <CircleDollarSign size={18} />}
                  </button>
                </div>

                <button
                  onClick={handleAddItem}
                  disabled={!newItemDesc || !newItemPrice}
                  className="aspect-square h-[50px] bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 shadow-lg shadow-brand-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 active:scale-95"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>

          {/* Items List (Receipt Style) */}
          {items.length > 0 && (
            <div className="bg-gray-50 border-t border-dashed border-gray-300 p-5 space-y-4">
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm group">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-gray-700 leading-snug">{item.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-gray-800">R$ {item.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-300 hover:text-red-500 p-1 -mr-2 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-dashed border-gray-300">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total estimado</span>
                <span className="text-2xl font-bold text-brand-700">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Generate Action - Sticky looking */}
        <button
          onClick={() => {
            if (!canGenerateDocument) {
              setShowNoCreditsWarning(true);
              return;
            }
            // Use a credit when generating
            const success = useCredit();
            if (success) {
              // Save the document to history
              if (selectedClient) {
                const docToSave: SavedDocument = {
                  id: Date.now().toString(),
                  type,
                  clientId: selectedClientId,
                  clientName: selectedClient.name,
                  clientPhone: selectedClient.phone,
                  items: [...items],
                  total,
                  createdAt: new Date().toISOString(),
                  documentNumber: generateDocumentNumber(type)
                };
                saveDocument(docToSave);
              }
              setShowPreview(true);
            } else {
              setShowNoCreditsWarning(true);
            }
          }}
          disabled={items.length === 0 || !selectedClientId}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-[0.98] ${!canGenerateDocument
            ? 'bg-gray-400 text-white shadow-gray-100 cursor-not-allowed'
            : 'bg-gray-900 text-white shadow-gray-200 hover:bg-gray-800 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed'
            }`}
        >
          <Receipt size={22} />
          <span>Gerar {type === 'quote' ? 'Orçamento' : 'Recibo'}</span>
          {!canGenerateDocument && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Sem créditos</span>
          )}
        </button>

        {/* No Credits Warning Modal */}
        {showNoCreditsWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Créditos esgotados!</h3>
              <p className="text-gray-500 mb-6">
                Você usou todos os seus {subscription.maxCredits} créditos deste mês.
                Faça upgrade para o Pro e tenha 100 créditos!
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowNoCreditsWarning(false);
                    upgradeToPro();
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  Upgrade para Pro
                </button>
                <button
                  onClick={() => setShowNoCreditsWarning(false)}
                  className="w-full text-gray-500 py-2 text-sm font-medium hover:text-gray-700"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;