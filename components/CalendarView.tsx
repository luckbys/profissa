import React, { useState, useMemo } from 'react';
import { Appointment, Client } from '../types';
import { Clock, CheckCircle, MapPin, Plus, Calendar as CalendarIcon, X, Circle, DollarSign, User, Send, Zap } from 'lucide-react';
import TimeSlotSelector from './TimeSlotSelector';

interface CalendarViewProps {
  appointments: Appointment[];
  clients: Client[];
  onAddAppointment: (appointment: Appointment) => void;
  onToggleStatus: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, clients, onAddAppointment, onToggleStatus }) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Appointment Form State
  const [newApt, setNewApt] = useState({
    clientId: '',
    date: '',
    time: '',
    service: '',
    price: ''
  });

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Desconhecido';

  // Grouping Logic
  const groupedAppointments = useMemo(() => {
    const filtered = appointments.filter(apt => {
      if (activeTab === 'upcoming') return apt.status === 'pending';
      return apt.status === 'completed' || apt.status === 'cancelled';
    });

    const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by Date String (YYYY-MM-DD)
    const groups: Record<string, Appointment[]> = {};

    sorted.forEach(apt => {
      const dateObj = new Date(apt.date);
      const dateKey = dateObj.toLocaleDateString('pt-BR');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(apt);
    });

    return groups;
  }, [appointments, activeTab]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApt.clientId || !newApt.date || !newApt.time || !newApt.service) return;

    const isoDate = new Date(`${newApt.date}T${newApt.time}`).toISOString();

    onAddAppointment({
      id: Date.now().toString(),
      clientId: newApt.clientId,
      date: isoDate,
      service: newApt.service,
      price: parseFloat(newApt.price) || 0,
      status: 'pending'
    });

    setNewApt({ clientId: '', date: '', time: '', service: '', price: '' });
    setIsModalOpen(false);
  };

  const handleSendReminder = (apt: Appointment) => {
    const client = clients.find(c => c.id === apt.clientId);
    if (!client) return;

    const dateObj = new Date(apt.date);
    const dateStr = dateObj.toLocaleDateString('pt-BR');
    const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const message = `Olá ${client.name}! Passando para confirmar nosso agendamento de *${apt.service}* para o dia *${dateStr}* às *${timeStr}*. Tudo certo?`;

    const link = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
  };

  const getRelativeDateLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString('pt-BR');
    const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString('pt-BR');

    if (dateStr === today) return 'Hoje';
    if (dateStr === tomorrow) return 'Amanhã';
    return dateStr;
  };

  return (
    <div className="pb-20 space-y-4">
      <header className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2 text-sm font-semibold"
        >
          <Plus size={18} /> Novo
        </button>
      </header>

      {/* Tabs */}
      <div className="bg-gray-200 p-1 rounded-xl flex mb-4">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'upcoming' ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-500'}`}
        >
          Próximos
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-gray-700 shadow-sm' : 'text-gray-500'}`}
        >
          Histórico
        </button>
      </div>

      {/* List */}
      <div className="space-y-6">
        {Object.entries(groupedAppointments).map(([dateLabel, apts]: [string, Appointment[]]) => (
          <div key={dateLabel}>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              {getRelativeDateLabel(dateLabel)}
            </h3>
            <div className="space-y-3">
              {apts.map(apt => (
                <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative group overflow-hidden">
                  {/* Left Color Indicator */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${apt.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'}`} />

                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-start">
                      <div className="flex flex-col items-center pt-1">
                        <span className="text-lg font-bold text-gray-800 leading-none">
                          {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">hrs</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-800 leading-tight">{getClientName(apt.clientId)}</h4>
                        <p className="text-sm text-gray-500 mb-1">{apt.service}</p>
                        <p className="text-xs text-brand-600 font-semibold mb-2">R$ {apt.price.toFixed(2)}</p>

                        {/* Reminder Button - Only for upcoming */}
                        {activeTab === 'upcoming' && (
                          <button
                            onClick={() => handleSendReminder(apt)}
                            className="flex items-center gap-1 text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-md hover:bg-green-100 transition-colors"
                          >
                            <Send size={10} /> Lembrete
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onToggleStatus(apt.id)}
                      className={`p-2 rounded-full transition-colors ${apt.status === 'completed' ? 'text-green-500 bg-green-50' : 'text-gray-300 hover:text-brand-500 hover:bg-brand-50'}`}
                    >
                      {apt.status === 'completed' ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedAppointments).length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarIcon size={48} className="mb-4 opacity-20" />
            <p>Nenhum agendamento {activeTab === 'upcoming' ? 'pendente' : 'no histórico'}.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Novo Agendamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">

              {/* Client Select */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <select
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-white"
                    value={newApt.clientId}
                    onChange={e => setNewApt({ ...newApt, clientId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Data</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newApt.date}
                  onChange={e => setNewApt({ ...newApt, date: e.target.value, time: '' })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Smart Time Slot Selector */}
              <TimeSlotSelector
                date={newApt.date}
                selectedTime={newApt.time}
                appointments={appointments}
                onSelectTime={(time) => setNewApt({ ...newApt, time })}
                showSuggestions={!newApt.date}
              />

              {/* Service */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Serviço</label>
                <input
                  type="text"
                  placeholder="Ex: Instalação"
                  required
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newApt.service}
                  onChange={e => setNewApt({ ...newApt, service: e.target.value })}
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Valor (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newApt.price}
                    onChange={e => setNewApt({ ...newApt, price: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-colors mt-2"
              >
                Confirmar Agendamento
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;