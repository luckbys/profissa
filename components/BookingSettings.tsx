import React, { useState, useEffect } from 'react';
import { Link2, Copy, Check, Plus, X, Trash2, Settings, ExternalLink } from 'lucide-react';
import { getBookingConfig, saveBookingConfig, generateBookingLink, BookingConfig } from '../services/bookingService';
import { UserProfile } from '../types';

interface BookingSettingsProps {
    userProfile: UserProfile;
    isOpen: boolean;
    onClose: () => void;
}

const BookingSettings: React.FC<BookingSettingsProps> = ({ userProfile, isOpen, onClose }) => {
    const [config, setConfig] = useState<BookingConfig>({
        isEnabled: false,
        professionalName: userProfile.name || '',
        profession: userProfile.profession || '',
        phone: userProfile.phone || '',
        services: [],
        welcomeMessage: ''
    });

    const [newService, setNewService] = useState({ name: '', duration: 60, price: 0 });
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const savedConfig = getBookingConfig();
        setConfig({
            ...savedConfig,
            professionalName: savedConfig.professionalName || userProfile.name || '',
            profession: savedConfig.profession || userProfile.profession || '',
            phone: savedConfig.phone || userProfile.phone || ''
        });
    }, [userProfile, isOpen]);

    const handleAddService = () => {
        if (!newService.name.trim()) return;
        setConfig({
            ...config,
            services: [...config.services, { ...newService }]
        });
        setNewService({ name: '', duration: 60, price: 0 });
    };

    const handleRemoveService = (index: number) => {
        setConfig({
            ...config,
            services: config.services.filter((_, i) => i !== index)
        });
    };

    const handleSave = () => {
        saveBookingConfig(config);
        if (config.isEnabled && config.services.length > 0) {
            const link = generateBookingLink();
            setGeneratedLink(link);
        }
    };

    const handleCopyLink = async () => {
        if (!generatedLink) return;
        try {
            await navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = generatedLink;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleGenerateLink = () => {
        saveBookingConfig({ ...config, isEnabled: true });
        const link = generateBookingLink();
        setGeneratedLink(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-white">
                        <Link2 size={20} />
                        <h2 className="font-bold">Link de Agendamento</h2>
                    </div>
                    <button onClick={onClose} className="text-white/70 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-60px)]">
                    {/* Info */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800">
                            Crie um link público para seus clientes agendarem horários. Eles escolhem data/hora e você recebe a solicitação via WhatsApp.
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                            Serviços Oferecidos
                        </label>

                        {config.services.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {config.services.map((service, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                                        <div>
                                            <span className="font-medium text-gray-800">{service.name}</span>
                                            <span className="text-xs text-gray-500 ml-2">{service.duration}min</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-600 font-bold text-sm">R$ {service.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => handleRemoveService(idx)}
                                                className="text-red-400 hover:text-red-600 p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add Service Form */}
                        <div className="border border-dashed border-gray-300 rounded-xl p-3 space-y-2">
                            <input
                                type="text"
                                placeholder="Nome do serviço..."
                                value={newService.name}
                                onChange={e => setNewService({ ...newService, name: e.target.value })}
                                className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[10px] text-gray-500">Duração (min)</label>
                                    <input
                                        type="number"
                                        value={newService.duration}
                                        onChange={e => setNewService({ ...newService, duration: parseInt(e.target.value) || 60 })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500">Preço (R$)</label>
                                    <input
                                        type="number"
                                        value={newService.price}
                                        onChange={e => setNewService({ ...newService, price: parseFloat(e.target.value) || 0 })}
                                        className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleAddService}
                                disabled={!newService.name.trim()}
                                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                            >
                                <Plus size={14} /> Adicionar Serviço
                            </button>
                        </div>
                    </div>

                    {/* Generate Link Button */}
                    {config.services.length > 0 && (
                        <button
                            onClick={handleGenerateLink}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Link2 size={18} /> Gerar Link de Agendamento
                        </button>
                    )}

                    {/* Generated Link */}
                    {generatedLink && (
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-3">
                            <div className="flex items-center gap-2 text-green-700 font-bold">
                                <Check size={18} /> Link Gerado!
                            </div>
                            <div className="bg-white p-2 rounded-lg text-xs text-gray-600 break-all border border-green-200">
                                {generatedLink}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={handleCopyLink}
                                    className="py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                                <button
                                    onClick={() => window.open(generatedLink, '_blank')}
                                    className="py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                                >
                                    <ExternalLink size={14} /> Testar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingSettings;
