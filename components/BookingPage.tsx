import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, User, Send, ArrowLeft, CheckCircle, Briefcase, Phone } from 'lucide-react';
import { parseBookingLink, generateBookingMessage, sendBookingRequest } from '../services/bookingService';
import { getAvailableSlots, WorkSchedule, DEFAULT_WORK_SCHEDULE } from '../utils/scheduleUtils';

interface BookingPageProps {
    encodedData: string;
    onBack?: () => void;
}

const BookingPage: React.FC<BookingPageProps> = ({ encodedData, onBack }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [clientName, setClientName] = useState('');
    const [step, setStep] = useState<'service' | 'datetime' | 'confirm' | 'success'>('service');

    // Parse booking data from URL
    const bookingData = useMemo(() => parseBookingLink(encodedData), [encodedData]);

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-red-500" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Link Inválido</h2>
                    <p className="text-gray-500 text-sm">Este link de agendamento não é válido ou expirou.</p>
                    {onBack && (
                        <button onClick={onBack} className="mt-4 text-brand-600 font-medium">
                            Voltar
                        </button>
                    )}
                </div>
            </div>
        );
    }

    const { config, schedule } = bookingData;

    // Generate available dates (next 14 days)
    const availableDates = useMemo(() => {
        const dates: string[] = [];
        const today = new Date();

        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);

            if (schedule.workDays.includes(date.getDay())) {
                dates.push(date.toISOString().split('T')[0]);
            }
        }
        return dates;
    }, [schedule]);

    // Get available time slots for selected date
    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];
        // Since we don't have access to existing appointments in public view,
        // we show all slots (owner will validate on WhatsApp)
        return getAvailableSlots(selectedDate, [], schedule);
    }, [selectedDate, schedule]);

    const handleConfirmBooking = () => {
        if (!selectedService || !selectedDate || !selectedTime || !clientName.trim()) return;

        const message = generateBookingMessage(
            config.professionalName,
            selectedService,
            selectedDate,
            selectedTime,
            clientName.trim()
        );

        sendBookingRequest(config.phone, message);
        setStep('success');
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T12:00:00');
        return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-50 to-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-md mx-auto p-4">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                                <ArrowLeft size={20} className="text-gray-600" />
                            </button>
                        )}
                        <div className="flex-1">
                            <h1 className="font-bold text-gray-800">{config.professionalName}</h1>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase size={12} /> {config.profession}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                            <User className="text-brand-600" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto p-4 space-y-6">
                {/* Progress */}
                <div className="flex items-center justify-center gap-2">
                    {['service', 'datetime', 'confirm'].map((s, i) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? 'bg-brand-600 text-white' :
                                    ['service', 'datetime', 'confirm'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {['service', 'datetime', 'confirm'].indexOf(step) > i ? <CheckCircle size={16} /> : i + 1}
                            </div>
                            {i < 2 && <div className={`w-12 h-1 rounded ${['service', 'datetime', 'confirm'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                {/* Step 1: Service Selection */}
                {step === 'service' && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg animate-in slide-in-from-right">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Escolha o Serviço</h2>
                        <div className="space-y-3">
                            {config.services.map((service, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSelectedService(service.name); setStep('datetime'); }}
                                    className="w-full p-4 bg-gray-50 hover:bg-brand-50 rounded-xl text-left transition-all border-2 border-transparent hover:border-brand-200 group"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-800 group-hover:text-brand-700">{service.name}</h3>
                                            <p className="text-xs text-gray-500">{service.duration} min</p>
                                        </div>
                                        <span className="text-brand-600 font-bold">
                                            R$ {service.price.toFixed(2)}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Date & Time Selection */}
                {step === 'datetime' && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg animate-in slide-in-from-right">
                        <button onClick={() => setStep('service')} className="text-sm text-brand-600 mb-4 flex items-center gap-1">
                            <ArrowLeft size={14} /> Voltar
                        </button>

                        <h2 className="text-lg font-bold text-gray-800 mb-4">Escolha Data e Horário</h2>

                        {/* Date Selection */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Data</label>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                                {availableDates.map(date => (
                                    <button
                                        key={date}
                                        onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                                        className={`flex-shrink-0 p-3 rounded-xl text-center transition-all min-w-[70px] ${selectedDate === date
                                                ? 'bg-brand-600 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-brand-50'
                                            }`}
                                    >
                                        <div className="text-[10px] uppercase opacity-80">
                                            {new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {new Date(date + 'T12:00:00').getDate()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Time Selection */}
                        {selectedDate && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block flex items-center gap-1">
                                    <Clock size={12} /> Horário
                                </label>
                                {availableSlots.length === 0 ? (
                                    <p className="text-gray-500 text-sm">Nenhum horário disponível nesta data.</p>
                                ) : (
                                    <div className="grid grid-cols-4 gap-2">
                                        {availableSlots.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setSelectedTime(time)}
                                                className={`py-2 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                                        ? 'bg-brand-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-brand-50'
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedTime && (
                            <button
                                onClick={() => setStep('confirm')}
                                className="w-full mt-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors"
                            >
                                Continuar
                            </button>
                        )}
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 'confirm' && (
                    <div className="bg-white rounded-2xl p-6 shadow-lg animate-in slide-in-from-right">
                        <button onClick={() => setStep('datetime')} className="text-sm text-brand-600 mb-4 flex items-center gap-1">
                            <ArrowLeft size={14} /> Voltar
                        </button>

                        <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmar Agendamento</h2>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Serviço:</span>
                                <span className="font-bold text-gray-800">{selectedService}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Data:</span>
                                <span className="font-bold text-gray-800">{formatDate(selectedDate)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Horário:</span>
                                <span className="font-bold text-gray-800">{selectedTime}</span>
                            </div>
                        </div>

                        {/* Client Name */}
                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Seu Nome</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Digite seu nome..."
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleConfirmBooking}
                            disabled={!clientName.trim()}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} /> Enviar via WhatsApp
                        </button>

                        <p className="text-xs text-gray-400 text-center mt-3">
                            Você será redirecionado para o WhatsApp para confirmar o agendamento.
                        </p>
                    </div>
                )}

                {/* Success */}
                {step === 'success' && (
                    <div className="bg-white rounded-2xl p-8 shadow-lg text-center animate-in zoom-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="text-green-600" size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h2>
                        <p className="text-gray-500 text-sm mb-6">
                            Aguarde a confirmação de {config.professionalName} pelo WhatsApp.
                        </p>
                        <button
                            onClick={() => {
                                setStep('service');
                                setSelectedService('');
                                setSelectedDate('');
                                setSelectedTime('');
                                setClientName('');
                            }}
                            className="text-brand-600 font-medium"
                        >
                            Fazer novo agendamento
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="max-w-md mx-auto p-4 text-center">
                <p className="text-xs text-gray-400">
                    Powered by <span className="font-bold text-gray-500">Gerente de Bolso</span>
                </p>
            </div>
        </div>
    );
};

export default BookingPage;
