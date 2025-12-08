import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Briefcase, Phone, ArrowRight, ArrowLeft, Loader2, CheckCircle, Sparkles } from 'lucide-react';

interface OnboardingScreenProps {
    userId: string;
    userEmail: string;
    userName?: string;
    onComplete: () => void;
}

const PROFESSIONS = [
    { id: 'manicure', label: '💅 Manicure/Pedicure', icon: '💅' },
    { id: 'cabeleireiro', label: '✂️ Cabeleireiro(a)', icon: '✂️' },
    { id: 'eletricista', label: '⚡ Eletricista', icon: '⚡' },
    { id: 'encanador', label: '🔧 Encanador', icon: '🔧' },
    { id: 'personal', label: '🏋️ Personal Trainer', icon: '🏋️' },
    { id: 'fotografo', label: '📸 Fotógrafo(a)', icon: '📸' },
    { id: 'designer', label: '🎨 Designer', icon: '🎨' },
    { id: 'mecanico', label: '🚗 Mecânico', icon: '🚗' },
    { id: 'diarista', label: '🧹 Diarista', icon: '🧹' },
    { id: 'confeiteira', label: '🍰 Confeiteira', icon: '🍰' },
    { id: 'outros', label: '💼 Outros', icon: '💼' }
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userId, userEmail, userName, onComplete }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(userName || '');
    const [profession, setProfession] = useState('');
    const [customProfession, setCustomProfession] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleComplete = async () => {
        setIsLoading(true);

        try {
            const finalProfession = profession === 'outros' ? customProfession :
                PROFESSIONS.find(p => p.id === profession)?.label.split(' ').slice(1).join(' ') || profession;

            // Check if profile exists first to avoid constraint errors
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();

            let error;

            if (existingProfile) {
                // Update existing profile
                const result = await supabase
                    .from('profiles')
                    .update({
                        name: name,
                        profession: finalProfession,
                        phone: phone,
                        email: userEmail,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);
                error = result.error;
            } else {
                // Insert new profile
                const result = await supabase
                    .from('profiles')
                    .insert({
                        user_id: userId,
                        name: name,
                        profession: finalProfession,
                        phone: phone,
                        email: userEmail,
                        updated_at: new Date().toISOString()
                    });
                error = result.error;
            }

            if (error) throw error;

            // Mark onboarding as complete in localStorage
            localStorage.setItem('profissa_onboarding_complete', 'true');

            onComplete();
        } catch (error) {
            console.error('Error saving profile:', error);
            // Still complete onboarding even if save fails
            localStorage.setItem('profissa_onboarding_complete', 'true');
            onComplete();
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return name.trim().length >= 2;
            case 2: return profession !== '' && (profession !== 'outros' || customProfession.trim().length >= 2);
            case 3: return true; // Phone is optional
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white/70 text-sm">Passo {step} de {totalSteps}</span>
                        <span className="text-white/70 text-sm">{Math.round((step / totalSteps) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 animate-in slide-in-from-bottom-4 duration-500">
                    {/* Step 1: Name */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
                                    <User className="w-8 h-8 text-brand-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Qual é o seu nome?</h2>
                                <p className="text-gray-500 mt-2">Como seus clientes te conhecem</p>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-center"
                                    placeholder="Ex: Maria Silva"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Profession */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
                                    <Briefcase className="w-8 h-8 text-brand-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">O que você faz?</h2>
                                <p className="text-gray-500 mt-2">Selecione sua profissão</p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                                {PROFESSIONS.map((prof) => (
                                    <button
                                        key={prof.id}
                                        type="button"
                                        onClick={() => setProfession(prof.id)}
                                        className={`p-3 rounded-xl text-left transition-all ${profession === prof.id
                                            ? 'bg-brand-600 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <span className="text-sm font-medium">{prof.label}</span>
                                    </button>
                                ))}
                            </div>

                            {profession === 'outros' && (
                                <input
                                    type="text"
                                    value={customProfession}
                                    onChange={(e) => setCustomProfession(e.target.value)}
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                                    placeholder="Digite sua profissão"
                                    autoFocus
                                />
                            )}
                        </div>
                    )}

                    {/* Step 3: Phone */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
                                    <Phone className="w-8 h-8 text-brand-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Seu WhatsApp</h2>
                                <p className="text-gray-500 mt-2">Para receber contato dos clientes (opcional)</p>
                            </div>

                            <div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-center"
                                    placeholder="11 99999-9999"
                                    autoFocus
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex items-center gap-2 text-green-600">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-medium">Resumo do seu perfil</span>
                                </div>
                                <p className="text-gray-700">
                                    <strong>{name}</strong> • {profession === 'outros' ? customProfession : PROFESSIONS.find(p => p.id === profession)?.label}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                Voltar
                            </button>
                        )}

                        {step < totalSteps ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!canProceed()}
                                className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={isLoading}
                                className="flex-1 py-3 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-bold hover:from-brand-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Começar a Usar
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
