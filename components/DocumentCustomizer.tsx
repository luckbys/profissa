import React, { useState } from 'react';
import { InvoiceTemplateStyle, getTemplateStyles } from './InvoiceTemplate';
import { Crown, Lock, Check, Palette, FileText, Clock, CreditCard, QrCode, Edit3 } from 'lucide-react';

export interface DocumentCustomization {
    template: InvoiceTemplateStyle;
    accentColor?: string;
    validityDays: number;
    showWatermark: boolean;
    showSignature: boolean;
    showPaymentMethods: boolean;
    paymentMethods: string[];
    showPixQR: boolean;
    pixKey?: string;
    customNotes?: string;
    showLogo: boolean;
}

export const DEFAULT_CUSTOMIZATION: DocumentCustomization = {
    template: 'modern',
    validityDays: 7,
    showWatermark: true,
    showSignature: true,
    showPaymentMethods: true,
    paymentMethods: ['Dinheiro', 'PIX', 'Cartão'],
    showPixQR: false,
    customNotes: '',
    showLogo: true
};

interface DocumentCustomizerProps {
    customization: DocumentCustomization;
    onChange: (customization: DocumentCustomization) => void;
    isPro: boolean;
    onUpgrade?: () => void;
}

const ACCENT_COLORS = [
    { name: 'Azul', value: '#3B82F6', gradient: 'from-blue-500 to-indigo-600' },
    { name: 'Verde', value: '#10B981', gradient: 'from-emerald-500 to-teal-600' },
    { name: 'Roxo', value: '#8B5CF6', gradient: 'from-purple-500 to-violet-600' },
    { name: 'Rosa', value: '#EC4899', gradient: 'from-pink-500 to-rose-600' },
    { name: 'Laranja', value: '#F97316', gradient: 'from-orange-500 to-red-500' },
    { name: 'Dourado', value: '#F59E0B', gradient: 'from-amber-500 to-yellow-600' },
];

const PAYMENT_OPTIONS = [
    { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
    { id: 'pix', label: 'PIX', icon: '📱' },
    { id: 'cartao_credito', label: 'Cartão Crédito', icon: '💳' },
    { id: 'cartao_debito', label: 'Cartão Débito', icon: '💳' },
    { id: 'transferencia', label: 'Transferência', icon: '🏦' },
    { id: 'boleto', label: 'Boleto', icon: '📄' },
];

const DocumentCustomizer: React.FC<DocumentCustomizerProps> = ({
    customization,
    onChange,
    isPro,
    onUpgrade
}) => {
    const [activeSection, setActiveSection] = useState<'template' | 'content' | 'payment' | null>('template');
    const templates = getTemplateStyles();
    const templateKeys = Object.keys(templates) as InvoiceTemplateStyle[];

    const getPreviewGradient = (key: InvoiceTemplateStyle) => {
        switch (key) {
            case 'modern': return 'from-blue-500 to-indigo-600';
            case 'classic': return 'from-gray-700 to-gray-900';
            case 'minimal': return 'from-gray-100 to-white';
            case 'elegant': return 'from-amber-500 to-yellow-600';
            case 'bold': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-400 to-gray-600';
        }
    };

    const togglePaymentMethod = (method: string) => {
        const methods = customization.paymentMethods.includes(method)
            ? customization.paymentMethods.filter(m => m !== method)
            : [...customization.paymentMethods, method];
        onChange({ ...customization, paymentMethods: methods });
    };

    const ProBadge = () => (
        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
            PRO
        </span>
    );

    return (
        <div className="space-y-4">
            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {[
                    { id: 'template', label: 'Template', icon: Palette },
                    { id: 'content', label: 'Conteúdo', icon: FileText },
                    { id: 'payment', label: 'Pagamento', icon: CreditCard },
                ].map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(activeSection === section.id ? null : section.id as any)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeSection === section.id
                                ? 'bg-brand-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <section.icon size={14} />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Template Section */}
            {activeSection === 'template' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Template Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Modelo</label>
                            {!isPro && <span className="text-xs text-amber-600 flex items-center gap-1"><Crown size={12} /> 5 modelos no Pro</span>}
                        </div>
                        <div className="grid grid-cols-5 gap-2">
                            {templateKeys.map((key) => {
                                const template = templates[key];
                                const isLocked = !isPro && key !== 'modern';
                                const isSelected = customization.template === key;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => !isLocked && onChange({ ...customization, template: key })}
                                        className={`relative p-1.5 rounded-lg border-2 transition-all ${isSelected ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200'
                                            } ${isLocked ? 'opacity-50' : ''}`}
                                    >
                                        <div className={`h-8 rounded bg-gradient-to-br ${getPreviewGradient(key)}`}></div>
                                        <p className="text-[9px] font-bold text-gray-600 mt-1 truncate">{template.name}</p>
                                        {isLocked && <Lock size={10} className="absolute top-1 right-1 text-gray-400" />}
                                        {isSelected && <Check size={10} className="absolute -top-1 -right-1 bg-brand-500 text-white rounded-full p-0.5" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Accent Color (Pro) */}
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Cor de Destaque</label>
                            {!isPro && <ProBadge />}
                        </div>
                        <div className="flex gap-2">
                            {ACCENT_COLORS.map(color => (
                                <button
                                    key={color.value}
                                    onClick={() => isPro && onChange({ ...customization, accentColor: color.value })}
                                    disabled={!isPro}
                                    className={`w-8 h-8 rounded-full bg-gradient-to-br ${color.gradient} transition-all ${customization.accentColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                                        } ${!isPro ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
                                    title={color.name}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Toggle Options */}
                    <div className="space-y-2">
                        {[
                            { key: 'showLogo', label: 'Exibir Logotipo', pro: false },
                            { key: 'showWatermark', label: 'Marca d\'água (Orçamentos)', pro: false },
                            { key: 'showSignature', label: 'Área de Assinatura (Recibos)', pro: false },
                        ].map(option => (
                            <label key={option.key} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    {option.label}
                                    {option.pro && !isPro && <ProBadge />}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={(customization as any)[option.key]}
                                    onChange={e => onChange({ ...customization, [option.key]: e.target.checked })}
                                    disabled={option.pro && !isPro}
                                    className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Validity Period */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                            <Clock size={12} className="inline mr-1" /> Validade do Orçamento
                        </label>
                        <div className="flex gap-2">
                            {[3, 7, 15, 30].map(days => (
                                <button
                                    key={days}
                                    onClick={() => onChange({ ...customization, validityDays: days })}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${customization.validityDays === days
                                            ? 'bg-brand-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {days} dias
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Notes */}
                    <div>
                        <div className="flex items-center gap-1 mb-2">
                            <Edit3 size={12} className="text-gray-500" />
                            <label className="text-xs font-bold text-gray-500 uppercase">Observações Personalizadas</label>
                            {!isPro && <ProBadge />}
                        </div>
                        <textarea
                            placeholder={isPro ? "Digite observações personalizadas..." : "Disponível no Pro"}
                            value={customization.customNotes || ''}
                            onChange={e => isPro && onChange({ ...customization, customNotes: e.target.value })}
                            disabled={!isPro}
                            className={`w-full p-3 border border-gray-200 rounded-xl text-sm resize-none h-20 ${!isPro ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-brand-500'
                                } outline-none`}
                        />
                    </div>
                </div>
            )}

            {/* Payment Section */}
            {activeSection === 'payment' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                    {/* Payment Methods Toggle */}
                    <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                        <span className="text-sm text-gray-700 font-medium">Exibir formas de pagamento</span>
                        <input
                            type="checkbox"
                            checked={customization.showPaymentMethods}
                            onChange={e => onChange({ ...customization, showPaymentMethods: e.target.checked })}
                            className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                        />
                    </label>

                    {customization.showPaymentMethods && (
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                                Formas Aceitas
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {PAYMENT_OPTIONS.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => togglePaymentMethod(option.label)}
                                        className={`p-2 rounded-lg border-2 text-sm font-medium flex items-center gap-2 transition-all ${customization.paymentMethods.includes(option.label)
                                                ? 'border-brand-500 bg-brand-50 text-brand-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <span>{option.icon}</span>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PIX QR Code (Pro) */}
                    <div className="border-t border-gray-200 pt-4">
                        <label className="flex items-center justify-between p-2 bg-gray-50 rounded-lg cursor-pointer">
                            <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                                <QrCode size={14} /> Incluir QR Code PIX
                                {!isPro && <ProBadge />}
                            </span>
                            <input
                                type="checkbox"
                                checked={customization.showPixQR}
                                onChange={e => isPro && onChange({ ...customization, showPixQR: e.target.checked })}
                                disabled={!isPro}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                            />
                        </label>

                        {customization.showPixQR && isPro && (
                            <div className="mt-2">
                                <input
                                    type="text"
                                    placeholder="Sua chave PIX (CPF, email, telefone...)"
                                    value={customization.pixKey || ''}
                                    onChange={e => onChange({ ...customization, pixKey: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1">O QR Code será gerado automaticamente</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upgrade CTA */}
            {!isPro && (
                <button
                    onClick={onUpgrade}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg"
                >
                    <Crown size={16} /> Desbloquear todas as personalizações
                </button>
            )}
        </div>
    );
};

export default DocumentCustomizer;
