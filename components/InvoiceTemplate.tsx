import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Calendar, Building2, Phone, Mail, FileText, Award, Star, Copy, Check } from 'lucide-react';
import { generatePixPayload, getQRCodeUrl } from '../utils/pixUtils';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export type InvoiceTemplateStyle = 'modern' | 'classic' | 'minimal' | 'elegant' | 'bold';

interface InvoiceTemplateProps {
    type: 'quote' | 'receipt' | 'nfse';
    documentNumber: string;
    clientName: string;
    clientPhone?: string;
    clientEmail?: string;
    clientAddress?: string;
    items: InvoiceItem[];
    total: number;
    createdAt: string;
    userProfile?: UserProfile;
    notes?: string;
    templateStyle?: InvoiceTemplateStyle;
    // Customization options
    validityDays?: number;
    showWatermark?: boolean;
    showSignature?: boolean;
    showPaymentMethods?: boolean;
    paymentMethods?: string[];
    showLogo?: boolean;
}

// Template style configurations
const TEMPLATE_STYLES = {
    modern: {
        name: 'Moderno',
        description: 'Design limpo com cores vibrantes',
        headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        headerText: 'text-white',
        accentColor: 'blue',
        badgeStyle: 'bg-white/20 text-white',
        tableBg: 'bg-gray-50',
        totalBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
        totalText: 'text-white'
    },
    classic: {
        name: 'Clássico',
        description: 'Elegância tradicional',
        headerBg: 'bg-gray-900',
        headerText: 'text-white',
        accentColor: 'gray',
        badgeStyle: 'bg-amber-500 text-white',
        tableBg: 'bg-amber-50',
        totalBg: 'bg-gray-900',
        totalText: 'text-white'
    },
    minimal: {
        name: 'Minimalista',
        description: 'Simples e sofisticado',
        headerBg: 'bg-white border-b-4 border-gray-900',
        headerText: 'text-gray-900',
        accentColor: 'gray',
        badgeStyle: 'border-2 border-gray-900 text-gray-900',
        tableBg: 'bg-white',
        totalBg: 'bg-gray-100',
        totalText: 'text-gray-900'
    },
    elegant: {
        name: 'Elegante',
        description: 'Dourado e refinado',
        headerBg: 'bg-gradient-to-r from-amber-700 to-yellow-600',
        headerText: 'text-white',
        accentColor: 'amber',
        badgeStyle: 'bg-white/20 text-white border border-white/30',
        tableBg: 'bg-amber-50/50',
        totalBg: 'bg-gradient-to-r from-amber-700 to-yellow-600',
        totalText: 'text-white'
    },
    bold: {
        name: 'Impactante',
        description: 'Cores fortes e marcantes',
        headerBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
        headerText: 'text-white',
        accentColor: 'purple',
        badgeStyle: 'bg-white text-purple-600 font-black',
        tableBg: 'bg-purple-50',
        totalBg: 'bg-gradient-to-r from-purple-600 to-pink-500',
        totalText: 'text-white'
    }
};

export const getTemplateStyles = () => TEMPLATE_STYLES;

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
    type,
    documentNumber,
    clientName,
    clientPhone,
    clientEmail,
    clientAddress,
    items,
    total,
    createdAt,
    userProfile,
    notes,
    templateStyle = 'modern',
    validityDays = 7,
    showWatermark = true,
    showSignature = true,
    showPaymentMethods = true,
    paymentMethods = ['Dinheiro', 'PIX', 'Cartão'],
    showLogo = true
}) => {
    const isQuote = type === 'quote';
    const style = TEMPLATE_STYLES[templateStyle];
    const [pixCopied, setPixCopied] = useState(false);

    const dateFormatted = new Date(createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    const pixPayload = userProfile?.pixKey ? generatePixPayload(
        userProfile.pixKey,
        userProfile.pixName || userProfile.companyName || userProfile.name || 'PROFISSIONAL',
        userProfile.pixCity || 'SAO PAULO',
        total,
        `${isQuote ? 'ORC' : 'REC'} ${documentNumber}`
    ) : null;

    const handleCopyPix = () => {
        if (!pixPayload) return;
        navigator.clipboard.writeText(pixPayload);
        setPixCopied(true);
        setTimeout(() => setPixCopied(false), 2000);
    };

    // Minimal template has a different structure
    if (templateStyle === 'minimal') {
        return (
            <div
                id="invoice-preview"
                className="bg-white p-10 font-sans"
                style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%', margin: '0 auto' }}
            >
                {/* Minimal Header */}
                <div className="border-b-4 border-gray-900 pb-8 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                {isQuote ? 'ORÇAMENTO' : (type === 'nfse' ? 'RPS - NOTA FISCAL' : 'RECIBO')}
                            </h1>
                            <p className="text-gray-500 mt-1 font-mono">#{documentNumber}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-900">
                                {userProfile?.companyName || userProfile?.name || 'Minha Empresa'}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">{userProfile?.profession}</p>
                            {userProfile?.phone && <p className="text-gray-500 text-xs mt-2">{userProfile.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Client */}
                <div className="mb-8">
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Cliente</p>
                    <p className="text-2xl font-bold text-gray-900">{clientName}</p>
                    {clientPhone && <p className="text-gray-600">{clientPhone}</p>}
                </div>

                {/* Items */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-3 text-xs font-black text-gray-900 uppercase">Descrição</th>
                            <th className="text-right py-3 text-xs font-black text-gray-900 uppercase w-32">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr key={item.id} className="border-b border-gray-200">
                                <td className="py-4 text-gray-800">{item.description}</td>
                                <td className="py-4 text-right font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end mb-8">
                    <div className="border-t-4 border-gray-900 pt-4">
                        <p className="text-xs text-gray-500 uppercase mb-1">Total</p>
                        <p className="text-4xl font-black text-gray-900">R$ {total.toFixed(2)}</p>
                    </div>
                </div>

                {/* PIX Section for Minimal */}
                {pixPayload && (
                    <div className="mb-8 p-6 border-2 border-gray-900 rounded-2xl flex items-center gap-6">
                        <div className="w-24 h-24 shrink-0 bg-white p-1 border border-gray-100">
                            <img src={getQRCodeUrl(pixPayload)} alt="PIX QR Code" className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Pagar com PIX</h4>
                            <p className="text-xs text-gray-500 mb-3">Escaneie o código ao lado ou use o botão para copiar o código.</p>
                            <button 
                                onClick={handleCopyPix}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-all"
                            >
                                {pixCopied ? <Check size={14} /> : <Copy size={14} />}
                                {pixCopied ? 'CÓDIGO COPIADO' : 'PIX COPIA E COLA'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
                    {dateFormatted}
                </div>
            </div>
        );
    }

    // Standard template with style variations
    return (
        <div
            id="invoice-preview"
            className="bg-white font-sans overflow-hidden"
            style={{ width: '210mm', minHeight: '297mm', maxWidth: '100%', margin: '0 auto' }}
        >
            {/* Styled Header */}
            <div className={`${style.headerBg} ${style.headerText} p-8`}>
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        {userProfile?.logo ? (
                            <img
                                src={userProfile.logo}
                                alt="Logo"
                                className="w-20 h-20 object-contain rounded-lg bg-white/10 p-2"
                            />
                        ) : (
                            <div className="w-20 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                                <Building2 size={36} />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold">
                                {userProfile?.companyName || userProfile?.name || 'Minha Empresa'}
                            </h1>
                            <p className="opacity-80 text-sm mt-1">{userProfile?.profession}</p>
                            <div className="flex gap-4 mt-3 text-xs opacity-70">
                                {userProfile?.phone && <span>📞 {userProfile.phone}</span>}
                                {userProfile?.email && <span>✉️ {userProfile.email}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${style.badgeStyle}`}>
                            {isQuote ? 'ORÇAMENTO' : (type === 'nfse' ? 'RPS - NOTA FISCAL' : 'RECIBO')}
                        </div>
                        <p className="opacity-60 text-xs mt-2 font-mono">#{documentNumber}</p>
                        <p className="opacity-80 text-xs mt-1">{dateFormatted}</p>
                    </div>
                </div>
            </div>

            <div className="p-8">
                {/* Client Info */}
                <div className={`mb-8 ${style.tableBg} rounded-xl p-5`}>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {isQuote ? 'Orçamento para' : (type === 'nfse' ? 'Tomador do Serviço' : 'Recibo emitido para')}
                    </h3>
                    <p className="text-xl font-bold text-gray-900">{clientName}</p>
                    {clientPhone && <p className="text-gray-600 text-sm mt-1">📞 {clientPhone}</p>}
                    {clientEmail && <p className="text-gray-600 text-sm">✉️ {clientEmail}</p>}
                    {clientAddress && <p className="text-gray-600 text-sm">📍 {clientAddress}</p>}
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase">Descrição</th>
                            <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase w-20">Qtd</th>
                            <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase w-28">Unit.</th>
                            <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase w-28">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => (
                            <tr
                                key={item.id}
                                className={`border-b border-gray-100 ${idx % 2 === 1 ? style.tableBg : ''}`}
                            >
                                <td className="py-4 text-gray-800">{item.description}</td>
                                <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-4 text-right text-gray-600">R$ {item.price.toFixed(2)}</td>
                                <td className="py-4 text-right font-semibold text-gray-800">
                                    R$ {(item.price * item.quantity).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Total */}
                <div className="flex justify-end mb-8">
                    <div className={`w-72 ${style.totalBg} ${style.totalText} rounded-xl p-6`}>
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/20">
                            <span className="opacity-80">Subtotal</span>
                            <span className="font-semibold">R$ {total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-lg">TOTAL</span>
                            <span className="font-bold text-3xl">R$ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* PIX Payment Section */}
                {pixPayload && (
                    <div className={`mb-8 p-6 rounded-2xl border-2 ${style.accentColor === 'blue' ? 'border-blue-100 bg-blue-50/30' : 
                        style.accentColor === 'amber' ? 'border-amber-100 bg-amber-50/30' : 
                        style.accentColor === 'purple' ? 'border-purple-100 bg-purple-50/30' : 'border-gray-100 bg-gray-50/30'} flex items-center gap-8`}>
                        <div className="w-32 h-32 shrink-0 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                            <img src={getQRCodeUrl(pixPayload)} alt="PIX QR Code" className="w-full h-full" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${style.totalBg} ${style.totalText}`}>
                                    <Star size={16} fill="currentColor" />
                                </div>
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pagar com PIX</h4>
                            </div>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">Pague de forma rápida e segura. Escaneie o QR Code ou utilize o botão abaixo para copiar o código PIX.</p>
                            <button 
                                onClick={handleCopyPix}
                                className={`flex items-center gap-2 px-6 py-3 ${style.totalBg} ${style.totalText} rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg`}
                            >
                                {pixCopied ? <Check size={16} /> : <Copy size={16} />}
                                {pixCopied ? 'Código Copiado!' : 'Copiar PIX Copia e Cola'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Payment Methods */}
                {showPaymentMethods && paymentMethods.length > 0 && (
                    <div className={`mb-6 p-4 ${style.tableBg} rounded-xl`}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">💳 Formas de Pagamento</h4>
                        <div className="flex flex-wrap gap-2">
                            {paymentMethods.map((method, idx) => (
                                <span key={idx} className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200">
                                    {method}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {(notes || isQuote) && (
                    <div className={`mb-8 p-5 ${style.tableBg} rounded-xl border border-gray-100`}>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">📝 Observações</h4>
                        <p className="text-gray-700 text-sm">
                            {notes || `Este orçamento é válido por ${validityDays} dias. Os valores podem sofrer alteração após este período. Forma de pagamento a combinar.`}
                        </p>
                    </div>
                )}

                {/* Signature for receipts */}
                {!isQuote && showSignature && (
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400 uppercase mb-6">Assinatura do Prestador</p>
                        <div className="w-56 mx-auto border-b-2 border-gray-300 mb-2"></div>
                        <p className="text-sm text-gray-600 font-medium">{userProfile?.name}</p>
                        <p className="text-xs text-gray-400">{userProfile?.profession}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-400 text-xs">
                    Documento gerado em {dateFormatted}
                    {isQuote && <span className="block mt-1">Válido até {new Date(new Date(createdAt).getTime() + validityDays * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</span>}
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;

