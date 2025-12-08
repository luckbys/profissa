import React, { useState } from 'react';
import { Subscription, PLAN_LIMITS } from '../types/subscription';
import { Coins, Crown, Sparkles, Check, X, Zap, Bot, FileText, Infinity } from 'lucide-react';

interface CreditsDisplayProps {
    subscription: Subscription;
    onUpgrade: () => void;
    compact?: boolean;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ subscription, onUpgrade, compact = false }) => {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPro = subscription.plan === 'pro';
    const hasUnlimitedDocs = isPro;
    const aiCreditsPercentage = (subscription.aiCredits / subscription.maxAiCredits) * 100;
    const docCreditsPercentage = hasUnlimitedDocs ? 100 : (subscription.credits / subscription.maxCredits) * 100;
    const isLowDocs = subscription.credits <= 2 && !isPro;
    const isLowAi = subscription.aiCredits <= 1;

    if (compact) {
        return (
            <button
                onClick={() => !isPro && setShowUpgradeModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isPro
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200'
                    : isLowDocs || isLowAi
                        ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}
            >
                {isPro ? (
                    <>
                        <Crown size={14} className="text-amber-500" />
                        <span>PRO</span>
                    </>
                ) : (
                    <>
                        <FileText size={14} />
                        <span>{subscription.credits}</span>
                        <span className="text-gray-400">|</span>
                        <Bot size={14} />
                        <span>{subscription.aiCredits}</span>
                    </>
                )}
            </button>
        );
    }

    return (
        <>
            <div className={`rounded-2xl p-4 border ${isPro
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isPro ? (
                            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-1.5 rounded-lg">
                                <Crown size={16} className="text-white" />
                            </div>
                        ) : (
                            <div className="bg-brand-100 p-1.5 rounded-lg">
                                <Coins size={16} className="text-brand-600" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">
                                {isPro ? 'Plano Pro' : 'Plano Gratuito'}
                            </h3>
                            <p className="text-[10px] text-gray-500">
                                {isPro ? 'Documentos ilimitados' : 'Créditos mensais'}
                            </p>
                        </div>
                    </div>

                    {!isPro && (
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:shadow-lg hover:shadow-amber-200 transition-all hover:-translate-y-0.5"
                        >
                            <Zap size={12} />
                            Upgrade
                        </button>
                    )}
                </div>

                {/* Credits Display */}
                <div className="space-y-3">
                    {/* Document Credits */}
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">Documentos</span>
                            </div>
                            <span className={`text-sm font-bold ${isLowDocs ? 'text-red-500' : 'text-gray-800'}`}>
                                {hasUnlimitedDocs ? (
                                    <span className="flex items-center gap-1">
                                        <Infinity size={16} className="text-amber-500" /> Ilimitado
                                    </span>
                                ) : (
                                    <>{subscription.credits}/{subscription.maxCredits}</>
                                )}
                            </span>
                        </div>
                        {!hasUnlimitedDocs && (
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${isLowDocs ? 'bg-red-500' : 'bg-brand-500'}`}
                                    style={{ width: `${docCreditsPercentage}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* AI Credits */}
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <Bot size={14} className="text-purple-500" />
                                <span className="text-xs font-medium text-gray-600">Créditos IA</span>
                            </div>
                            <span className={`text-sm font-bold ${isLowAi ? 'text-red-500' : 'text-gray-800'}`}>
                                {subscription.aiCredits}/{subscription.maxAiCredits}
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isLowAi ? 'bg-red-500' : 'bg-purple-500'}`}
                                style={{ width: `${aiCreditsPercentage}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center">
                        Renova todo mês • {subscription.documentsGenerated} documentos gerados
                    </p>
                </div>
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-white text-center relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10">
                                <Sparkles className="absolute top-2 left-4 w-6 h-6 animate-pulse" />
                                <Sparkles className="absolute bottom-4 right-6 w-8 h-8 animate-pulse delay-150" />
                                <Sparkles className="absolute top-6 right-12 w-4 h-4 animate-pulse delay-300" />
                            </div>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <Crown className="w-12 h-12 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold">Plano Pro</h2>
                            <p className="text-white/80 text-sm mt-1">Desbloqueie todo o potencial</p>
                        </div>

                        {/* Pricing */}
                        <div className="p-6 text-center border-b border-gray-100">
                            <div className="flex items-center justify-center gap-1">
                                <span className="text-gray-400 text-lg">R$</span>
                                <span className="text-5xl font-black text-gray-800">19</span>
                                <span className="text-2xl font-bold text-gray-800">,90</span>
                                <span className="text-gray-400 ml-1">/mês</span>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="p-6 space-y-2.5 max-h-64 overflow-y-auto">
                            {PLAN_LIMITS.pro.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="bg-green-100 p-1 rounded-full shrink-0">
                                        <Check size={12} className="text-green-600" />
                                    </div>
                                    <span className="text-gray-700 text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-6 pt-0 space-y-3">
                            <button
                                onClick={() => {
                                    onUpgrade();
                                    setShowUpgradeModal(false);
                                }}
                                className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <Zap size={20} />
                                Ativar Pro Agora
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full text-gray-500 py-2 text-sm font-medium hover:text-gray-700 transition-colors"
                            >
                                Continuar no plano gratuito
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CreditsDisplay;

