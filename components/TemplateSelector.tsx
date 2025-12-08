import React from 'react';
import { InvoiceTemplateStyle, getTemplateStyles } from './InvoiceTemplate';
import { Crown, Lock, Check } from 'lucide-react';

interface TemplateSelectorProps {
    selectedTemplate: InvoiceTemplateStyle;
    onSelect: (template: InvoiceTemplateStyle) => void;
    isPro: boolean;
    onUpgrade?: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    selectedTemplate,
    onSelect,
    isPro,
    onUpgrade
}) => {
    const templates = getTemplateStyles();
    const templateKeys = Object.keys(templates) as InvoiceTemplateStyle[];

    // Free users only get 'modern' template
    const freeTemplate: InvoiceTemplateStyle = 'modern';

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

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase">
                    Template do Documento
                </label>
                {!isPro && (
                    <span className="text-xs text-amber-600 flex items-center gap-1">
                        <Crown size={12} /> Pro tem 5 modelos
                    </span>
                )}
            </div>

            <div className="grid grid-cols-5 gap-2">
                {templateKeys.map((key) => {
                    const template = templates[key];
                    const isLocked = !isPro && key !== freeTemplate;
                    const isSelected = selectedTemplate === key;

                    return (
                        <button
                            key={key}
                            onClick={() => {
                                if (isLocked && onUpgrade) {
                                    onUpgrade();
                                } else if (!isLocked) {
                                    onSelect(key);
                                }
                            }}
                            className={`relative p-2 rounded-xl border-2 transition-all ${isSelected
                                    ? 'border-brand-500 ring-2 ring-brand-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                } ${isLocked ? 'opacity-60' : ''}`}
                            title={template.name}
                        >
                            {/* Mini Preview */}
                            <div className={`h-12 rounded-lg bg-gradient-to-br ${getPreviewGradient(key)} mb-1 relative overflow-hidden`}>
                                {/* Mini document mockup */}
                                <div className="absolute inset-1 bg-white/90 rounded flex flex-col p-1">
                                    <div className={`h-2 w-full rounded-sm bg-gradient-to-r ${getPreviewGradient(key)}`}></div>
                                    <div className="flex-1 flex flex-col justify-center gap-0.5 mt-1">
                                        <div className="h-0.5 w-3/4 bg-gray-200 rounded"></div>
                                        <div className="h-0.5 w-1/2 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] font-bold text-gray-700 truncate">{template.name}</p>

                            {/* Lock icon for non-pro */}
                            {isLocked && (
                                <div className="absolute inset-0 bg-white/50 rounded-xl flex items-center justify-center">
                                    <Lock size={16} className="text-gray-400" />
                                </div>
                            )}

                            {/* Selected check */}
                            {isSelected && !isLocked && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {!isPro && (
                <button
                    onClick={onUpgrade}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:from-amber-600 hover:to-yellow-600 transition-all"
                >
                    <Crown size={14} /> Desbloquear todos os modelos
                </button>
            )}
        </div>
    );
};

export default TemplateSelector;
