import { useState, useMemo } from 'react';
import { Client, Appointment } from '../types';
import SwipeableModal from './SwipeableModal';
import {
  Plus, Search, Phone, MapPin, FileText, Download, X,
  Tag, Cake, Calendar, ChevronRight, Star, Gift, Edit2,
  Mail, Clock, DollarSign, History, MoreVertical, Trash2
} from 'lucide-react';
import {
  DEFAULT_CLIENT_TAGS,
  getTagColorClasses,
  isBirthdayToday,
  isBirthdaySoon,
  formatBirthday
} from '../utils/clientUtils';

interface ClientsProps {
  clients: Client[];
  appointments: Appointment[];
  onAddClient: (client: Client) => void;
  onUpdateClient?: (client: Client) => void;
  onDeleteClient?: (id: string) => void;
  onGenerateDocument?: (clientId: string, type: 'quote' | 'receipt') => void;
}

const Clients: React.FC<ClientsProps> = ({
  clients,
  appointments,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  onGenerateDocument
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    tags: [] as string[],
    birthday: ''
  });

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm);
      const matchesTag = !selectedTag || (c.tags && c.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [clients, searchTerm, selectedTag]);

  // Get client service history
  const getClientHistory = (clientId: string) => {
    return appointments
      .filter(a => a.clientId === clientId && a.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Get total spent by client
  const getClientTotalSpent = (clientId: string) => {
    return appointments
      .filter(a => a.clientId === clientId && a.status === 'completed')
      .reduce((acc, a) => acc + a.price, 0);
  };

  // Birthdays coming up
  const upcomingBirthdays = useMemo(() => {
    return clients.filter(c => c.birthday && (isBirthdayToday(c.birthday) || isBirthdaySoon(c.birthday)));
  }, [clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client: Client = {
      id: isEditing && selectedClient ? selectedClient.id : crypto.randomUUID(),
      name: newClient.name,
      phone: newClient.phone,
      email: newClient.email || undefined,
      address: newClient.address || undefined,
      notes: newClient.notes || undefined,
      tags: newClient.tags.length > 0 ? newClient.tags : undefined,
      birthday: newClient.birthday || undefined,
      createdAt: isEditing && selectedClient?.createdAt ? selectedClient.createdAt : new Date().toISOString()
    };

    if (isEditing && onUpdateClient) {
      onUpdateClient(client);
    } else {
      onAddClient(client);
    }

    resetForm();
  };

  const resetForm = () => {
    setNewClient({ name: '', phone: '', email: '', address: '', notes: '', tags: [], birthday: '' });
    setIsModalOpen(false);
    setIsEditing(false);
  };

  const handleEditClient = (client: Client) => {
    setNewClient({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
      tags: client.tags || [],
      birthday: client.birthday || ''
    });
    setIsEditing(true);
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?') && onDeleteClient) {
      onDeleteClient(id);
      setSelectedClient(null);
    }
  };

  const closeModal = () => {
    setSelectedClient(null);
    setIsModalOpen(false);
  };

  const toggleTag = (tagId: string) => {
    setNewClient(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleExportCSV = () => {
    const BOM = "\uFEFF";
    const headers = ["Nome", "Telefone", "Email", "Endereço", "Tags", "Aniversário", "Notas"];

    const csvContent = BOM + [
      headers.join(","),
      ...clients.map(client => [
        `"${client.name.replace(/"/g, '""')}"`,
        `"${client.phone}"`,
        `"${(client.email || '').replace(/"/g, '""')}"`,
        `"${(client.address || '').replace(/"/g, '""')}"`,
        `"${(client.tags || []).join(', ')}"`,
        `"${client.birthday || ''}"`,
        `"${(client.notes || '').replace(/"/g, '""')}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `clientes_gerente_de_bolso_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-20 space-y-4">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          <p className="text-sm text-gray-500">{clients.length} cliente{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={clients.length === 0}
            className="bg-white text-gray-600 border border-gray-200 p-2.5 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            title="Exportar CSV"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
          >
            <Plus size={18} />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* Upcoming Birthdays Alert */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-100">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={18} className="text-pink-500" />
            <span className="font-semibold text-gray-800">Aniversários</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {upcomingBirthdays.map(client => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${isBirthdayToday(client.birthday)
                  ? 'bg-pink-500 text-white animate-pulse'
                  : 'bg-white text-gray-700 border border-pink-200 hover:bg-pink-50'
                  }`}
              >
                <Cake size={14} />
                <span>{client.name}</span>
                {isBirthdayToday(client.birthday) && <span>🎉</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nome ou telefone..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tag Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${!selectedTag
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
          Todos
        </button>
        {DEFAULT_CLIENT_TAGS.map(tag => {
          const colors = getTagColorClasses(tag.color);
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1 ${selectedTag === tag.id
                ? `${colors.bg} ${colors.text}`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              <Tag size={10} />
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.map(client => {
          const totalSpent = getClientTotalSpent(client.id);
          const serviceCount = getClientHistory(client.id).length;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClient(client)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${isBirthdayToday(client.birthday)
                    ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
                    : 'bg-brand-100 text-brand-600'
                    }`}>
                    {client.name.charAt(0).toUpperCase()}
                    {isBirthdayToday(client.birthday) && (
                      <span className="absolute -top-1 -right-1">🎂</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800">{client.name}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Phone size={10} />
                      {client.phone}
                    </p>

                    {/* Tags */}
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {client.tags.map(tagId => {
                          const tag = DEFAULT_CLIENT_TAGS.find(t => t.id === tagId);
                          if (!tag) return null;
                          const colors = getTagColorClasses(tag.color);
                          return (
                            <span
                              key={tagId}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.bg} ${colors.text}`}
                            >
                              {tag.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="text-right">
                  {totalSpent > 0 && (
                    <p className="text-sm font-bold text-green-600">
                      R$ {totalSpent.toFixed(0)}
                    </p>
                  )}
                  {serviceCount > 0 && (
                    <p className="text-[10px] text-gray-400">
                      {serviceCount} serviço{serviceCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Client Detail Modal */}
      {/* Client Detail Modal */}
      <SwipeableModal
        isOpen={!!selectedClient && !isModalOpen}
        onClose={closeModal}
        className="max-h-[85vh]"
        showCloseButton={false}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Custom Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl ${isBirthdayToday(selectedClient.birthday)
                  ? 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
                  : 'bg-brand-100 text-brand-600'
                  }`}>
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-lg">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedClient.phone}</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Quick Actions */}
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${selectedClient.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
                >
                  <Phone size={18} />
                  WhatsApp
                </a>
                <button
                  onClick={() => {
                    if (onGenerateDocument) {
                      onGenerateDocument(selectedClient.id, 'quote');
                      setIsModalOpen(false); // Close modal? Maybe keep it open or close it. Usually navigating away closes it effectively or better explicitly close it.
                      // Actually navigating changes view so this component unmounts/hides.
                    }
                  }}
                  className="bg-blue-50 text-blue-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                >
                  <FileText size={18} />
                  Orçamento
                </button>
                <button
                  onClick={() => {
                    if (onGenerateDocument) {
                      onGenerateDocument(selectedClient.id, 'receipt');
                    }
                  }}
                  className="bg-green-50 text-green-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-100 transition-colors"
                >
                  <Download size={18} />
                  Recibo
                </button>
                <button
                  onClick={() => handleEditClient(selectedClient)}
                  className="col-span-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                >
                  <Edit2 size={18} />
                  Editar Dados
                </button>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                {selectedClient.birthday && (
                  <div className="bg-pink-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-pink-600 mb-1">
                      <Cake size={14} />
                      <span className="text-xs font-medium">Aniversário</span>
                    </div>
                    <p className="font-semibold text-gray-800">{formatBirthday(selectedClient.birthday)}</p>
                  </div>
                )}
                {selectedClient.email && (
                  <div className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Mail size={14} />
                      <span className="text-xs font-medium">Email</span>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{selectedClient.email}</p>
                  </div>
                )}
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <DollarSign size={14} />
                    <span className="text-xs font-medium">Total Gasto</span>
                  </div>
                  <p className="font-bold text-gray-800">R$ {getClientTotalSpent(selectedClient.id).toFixed(2)}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <History size={14} />
                    <span className="text-xs font-medium">Serviços</span>
                  </div>
                  <p className="font-bold text-gray-800">{getClientHistory(selectedClient.id).length}</p>
                </div>
              </div>

              {/* Tags */}
              {selectedClient.tags && selectedClient.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Tags</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedClient.tags.map(tagId => {
                      const tag = DEFAULT_CLIENT_TAGS.find(t => t.id === tagId);
                      if (!tag) return null;
                      const colors = getTagColorClasses(tag.color);
                      return (
                        <span
                          key={tagId}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                        >
                          {tag.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Address */}
              {selectedClient.address && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Endereço</h4>
                  <p className="text-sm text-gray-700 flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 text-gray-400" />
                    {selectedClient.address}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedClient.notes && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Notas</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-xl">{selectedClient.notes}</p>
                </div>
              )}

              {/* Service History */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Histórico de Serviços</h4>
                {getClientHistory(selectedClient.id).length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum serviço registrado</p>
                ) : (
                  <div className="space-y-2">
                    {getClientHistory(selectedClient.id).slice(0, 5).map(apt => (
                      <div key={apt.id} className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-800">{apt.service}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(apt.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className="font-semibold text-green-600">R$ {apt.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => handleDeleteClient(selectedClient.id)}
                className="w-full py-2 text-red-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 size={16} />
                Excluir Cliente
              </button>
            </div>
          </div>
        )}
      </SwipeableModal>

      {/* Add/Edit Modal */}
      {
        isModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    required
                    type="text"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    value={newClient.name}
                    onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                  <input
                    required
                    type="tel"
                    placeholder="11999999999"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    value={newClient.phone}
                    onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                  />
                </div>

                {/* Birthday */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Cake size={14} className="text-pink-500" /> Aniversário
                  </label>
                  <input
                    type="text"
                    placeholder="MM-DD (ex: 12-25)"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    value={newClient.birthday}
                    onChange={e => setNewClient({ ...newClient, birthday: e.target.value })}
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Tag size={14} className="text-gray-400" /> Tags
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DEFAULT_CLIENT_TAGS.map(tag => {
                      const isSelected = newClient.tags.includes(tag.id);
                      const colors = getTagColorClasses(tag.color);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                            ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-${tag.color}-300`
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    value={newClient.email}
                    onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin size={14} className="text-gray-400" /> Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    value={newClient.address}
                    onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FileText size={14} className="text-gray-400" /> Notas
                  </label>
                  <textarea
                    placeholder="Preferências, avisos, etc."
                    rows={3}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none"
                    value={newClient.notes}
                    onChange={e => setNewClient({ ...newClient, notes: e.target.value })}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
                  >
                    {isEditing ? 'Salvar' : 'Adicionar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default Clients;