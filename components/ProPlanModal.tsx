import React, { useState } from 'react';
import { X, Check, Shield, Zap, TrendingUp, Crown } from 'lucide-react';
import { redirectToCheckout } from '../services/stripeService';

interface ProPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProPlanModal: React.FC<ProPlanModalProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubscribe = async () => {
        setIsLoading(true);
        // Simulate network delay for effect
        setTimeout(() => {
            redirectToCheckout();
            setIsLoading(false); // In case of redirect failure or return
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

                {/* Header Image/Banner */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 translate-y-10 -translate-x-10"></div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 transform rotate-3">
                            <Crown size={32} className="text-white" fill="currentColor" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">Seja Profissional</h2>
                        <p className="text-gray-300 text-sm">Desbloqueie todo o poder do App</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4 mb-8">
                        <FeatureRow icon={<Shield size={18} />} text="Backup Automático em Nuvem" />
                        <FeatureRow icon={<TrendingUp size={18} />} text="Relatórios Financeiros Avançados" />
                        <FeatureRow icon={<Zap size={18} />} text="Orçamentos Personalizados Sem Limites" />
                        <FeatureRow icon={<Crown size={18} />} text="Prioridade no Suporte" />
                    </div>

                    <div className="text-center mb-6">
                        <span className="text-4xl font-bold text-gray-900">R$ 29,90</span>
                        <span className="text-gray-500 text-sm"> / mês</span>
                        <p className="text-xs text-green-600 font-medium mt-1">Cancele quando quiser</p>
                    </div>

                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl font-bold text-lg shadow-xl shadow-gray-900/10 hover:shadow-gray-900/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <>Assinar Agora <Zap size={20} className="fill-yellow-400 text-yellow-400" /></>
                        )}
                    </button>

                    <p className="text-[10px] text-gray-400 text-center mt-4">
                        Pagamento seguro via Stripe. Ao assinar você concorda com nossos termos.
                    </p>
                </div>
            </div>
        </div>
    );
};

const FeatureRow = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div className="flex items-start gap-3">
        <div className="p-1 rounded-full bg-yellow-50 text-yellow-600 mt-0.5">
            <Check size={12} strokeWidth={4} />
        </div>
        <div className="flex-1">
            <p className="text-gray-700 font-medium text-sm">{text}</p>
        </div>
    </div>
);

export default ProPlanModal;
