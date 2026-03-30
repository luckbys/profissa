import React, { useState, useEffect, useCallback } from 'react';
import { Client } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import {
    pipelineService,
    PipelineLead,
    PipelineStage,
    STAGE_CONFIG,
    STAGE_ORDER,
    CreateLeadInput,
} from '../services/pipelineService';
import {
    Plus, X, Phone, Mail, DollarSign, ChevronRight, ChevronLeft,
    Trash2, Edit2, MoreVertical, TrendingUp, User, Briefcase,
    MessageCircle, Search, Filter, RefreshCw, AlertCircle
} from 'lucide-react';

interface PipelineProps {
    clients: Client[];
    onGenerateDocument?: (clientId: string, type: 'quote') => void;
}

const formatCurrency = (v: number) =>
    v >= 1000 ? `R$ ${(v / 1000).toFixed(1)}k` : `R$ ${v.toFixed(0)}`;

const Pipeline: React.FC<PipelineProps> = ({ clients, onGenerateDocument }) => {
    const { user } = useAuth();
    const { showToast } = useToast();

    const [leads, setLeads] = useState<PipelineLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStage, setActiveStage] = useState<PipelineStage>('lead');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
    const [showMoveMenu, setShowMoveMenu] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showLostModal, setShowLostModal] = useState<{ leadId: string; targetStage: PipelineStage } | null>(null);
    const [lostReason, setLostReason] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // New Lead Form State
    const [form, setForm] = useState<CreateLeadInput>({
        name: '',
        phone: '',
        email: '',
        service_interest: '',
        estimated_value: 0,
        stage: 'lead',
        notes: '',
        client_id: null,
    });

    const loadLeads = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const data = await pipelineService.getLeads(user.id);
            setLeads(data);
        } catch {
            showToast('Erro', 'Não foi possível carregar os leads.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [user?.id]);

    useEffect(() => { loadLeads(); }, [loadLeads]);

    // Derived data
    const filteredLeads = leads.filter(l => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return l.name.toLowerCase().includes(q) ||
            l.service_interest?.toLowerCase().includes(q) ||
            l.phone?.includes(q);
    });

    const leadsByStage = STAGE_ORDER.reduce((acc, stage) => {
        acc[stage] = filteredLeads.filter(l => l.stage === stage);
        return acc;
    }, {} as Record<PipelineStage, PipelineLead[]>);

    const stageValue = (stage: PipelineStage) =>
        leadsByStage[stage].reduce((sum, l) => sum + (l.estimated_value || 0), 0);

    const totalPipeline = leads
        .filter(l => !['ganho', 'perdido'].includes(l.stage))
        .reduce((sum, l) => sum + (l.estimated_value || 0), 0);

    const totalGanho = leads
        .filter(l => l.stage === 'ganho')
        .reduce((sum, l) => sum + (l.estimated_value || 0), 0);

    // ── Actions ─────────────────────────────────────────────────────────────
    const handleAddLead = async () => {
        if (!user?.id || !form.name.trim()) return;
        try {
            // Pre-fill phone/email from selected client
            const linkedClient = form.client_id ? clients.find(c => c.id === form.client_id) : null;
            const input: CreateLeadInput = {
                ...form,
                name: linkedClient ? linkedClient.name : form.name,
                phone: form.phone || linkedClient?.phone,
                email: form.email || linkedClient?.email,
            };
            const lead = await pipelineService.createLead(user.id, input);
            setLeads(prev => [lead, ...prev]);
            setShowAddModal(false);
            setForm({ name: '', phone: '', email: '', service_interest: '', estimated_value: 0, stage: 'lead', notes: '', client_id: null });
            showToast('Lead adicionado!', `${lead.name} está no funil.`, 'success');
        } catch {
            showToast('Erro', 'Não foi possível adicionar o lead.', 'error');
        }
    };

    const handleMoveStage = async (lead: PipelineLead, newStage: PipelineStage) => {
        setShowMoveMenu(null);
        if (newStage === 'perdido') {
            setShowLostModal({ leadId: lead.id, targetStage: newStage });
            return;
        }
        try {
            await pipelineService.updateStage(lead.id, newStage);
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, stage: newStage } : l));
            const label = STAGE_CONFIG[newStage].label;
            showToast('Movido!', `${lead.name} → ${label}`, 'success');
        } catch {
            showToast('Erro', 'Não foi possível mover o lead.', 'error');
        }
    };

    const handleConfirmLost = async () => {
        if (!showLostModal) return;
        try {
            await pipelineService.updateStage(showLostModal.leadId, 'perdido', lostReason);
            setLeads(prev => prev.map(l =>
                l.id === showLostModal.leadId
                    ? { ...l, stage: 'perdido', lost_reason: lostReason }
                    : l
            ));
            setShowLostModal(null);
            setLostReason('');
            showToast('Lead marcado como perdido', '', 'info');
        } catch {
            showToast('Erro', 'Não foi possível atualizar o lead.', 'error');
        }
    };

    const handleDelete = async (leadId: string) => {
        setShowDeleteConfirm(null);
        setSelectedLead(null);
        try {
            await pipelineService.deleteLead(leadId);
            setLeads(prev => prev.filter(l => l.id !== leadId));
            showToast('Lead removido', '', 'success');
        } catch {
            showToast('Erro', 'Não foi possível remover o lead.', 'error');
        }
    };

    const currentStageLeads = leadsByStage[activeStage];
    const currentStageIdx = STAGE_ORDER.indexOf(activeStage);
    const cfg = STAGE_CONFIG[activeStage];

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="pb-24 space-y-4">
            {/* Header */}
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <TrendingUp size={22} className="text-brand-600" /> Pipeline
                    </h1>
                    <p className="text-gray-500 text-sm">Funil de vendas e leads</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-600 text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-sm hover:bg-brand-700 transition-colors"
                >
                    <Plus size={16} /> Novo Lead
                </button>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 mb-1">Em negociação</p>
                    <p className="text-xl font-bold text-gray-800">{formatCurrency(totalPipeline)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                        {leads.filter(l => !['ganho', 'perdido'].includes(l.stage)).length} leads ativos
                    </p>
                </div>
                <div className="bg-green-50 rounded-2xl border border-green-100 p-4 shadow-sm">
                    <p className="text-xs text-green-600 mb-1">Ganhos</p>
                    <p className="text-xl font-bold text-green-700">{formatCurrency(totalGanho)}</p>
                    <p className="text-xs text-green-500 mt-1">
                        {leadsByStage.ganho.length} fechados
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                    type="text"
                    placeholder="Buscar leads..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                />
            </div>

            {/* Stage Tabs (Horizontal Scroll) */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {STAGE_ORDER.map(stage => {
                    const s = STAGE_CONFIG[stage];
                    const count = leadsByStage[stage].length;
                    const isActive = stage === activeStage;
                    return (
                        <button
                            key={stage}
                            onClick={() => setActiveStage(stage)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                isActive
                                    ? `${s.bg} ${s.color} ${s.border}`
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? s.dot : 'bg-gray-300'}`} />
                            {s.label}
                            {count > 0 && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white/60' : 'bg-gray-100'}`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Active Stage Header */}
            <div className={`rounded-xl px-4 py-3 ${cfg.bg} border ${cfg.border} flex items-center justify-between`}>
                <div>
                    <p className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</p>
                    <p className={`text-xs ${cfg.color} opacity-80`}>
                        {currentStageLeads.length} lead(s) · {formatCurrency(stageValue(activeStage))}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {currentStageIdx > 0 && (
                        <button
                            onClick={() => setActiveStage(STAGE_ORDER[currentStageIdx - 1])}
                            className={`p-1.5 rounded-lg ${cfg.bg} border ${cfg.border} ${cfg.color} hover:opacity-80`}
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                    {currentStageIdx < STAGE_ORDER.length - 1 && (
                        <button
                            onClick={() => setActiveStage(STAGE_ORDER[currentStageIdx + 1])}
                            className={`p-1.5 rounded-lg ${cfg.bg} border ${cfg.border} ${cfg.color} hover:opacity-80`}
                        >
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Leads List */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <RefreshCw size={24} className="animate-spin text-gray-300" />
                </div>
            ) : currentStageLeads.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                    <div className={`w-12 h-12 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                        <TrendingUp size={24} className={cfg.color} />
                    </div>
                    <p className="text-gray-600 font-medium">Nenhum lead aqui</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {activeStage === 'lead' ? 'Adicione seu primeiro lead acima.' : 'Mova leads para este estágio.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {currentStageLeads.map(lead => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            onSelect={() => setSelectedLead(lead)}
                            onMove={(newStage) => handleMoveStage(lead, newStage)}
                            onDelete={() => setShowDeleteConfirm(lead.id)}
                            showMoveMenu={showMoveMenu === lead.id}
                            onToggleMoveMenu={() => setShowMoveMenu(showMoveMenu === lead.id ? null : lead.id)}
                            onCloseMoveMenu={() => setShowMoveMenu(null)}
                        />
                    ))}
                </div>
            )}

            {/* ── Add Lead Modal ─────────────────────────────────────────────── */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-gray-800">Novo Lead</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {/* Link to existing client */}
                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                    Vincular a cliente existente (opcional)
                                </label>
                                <select
                                    value={form.client_id || ''}
                                    onChange={e => {
                                        const cid = e.target.value || null;
                                        const c = cid ? clients.find(cl => cl.id === cid) : null;
                                        setForm(f => ({
                                            ...f,
                                            client_id: cid,
                                            name: c ? c.name : f.name,
                                            phone: c ? c.phone : f.phone,
                                            email: c ? (c.email || '') : f.email,
                                        }));
                                    }}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                >
                                    <option value="">— Novo contato —</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                    Nome *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nome do lead"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="(11) 99999-9999"
                                        value={form.phone || ''}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                        Valor Est.
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="0,00"
                                        value={form.estimated_value || ''}
                                        onChange={e => setForm(f => ({ ...f, estimated_value: parseFloat(e.target.value) || 0 }))}
                                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                    Serviço de interesse
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Corte + Barba, Manicure..."
                                    value={form.service_interest || ''}
                                    onChange={e => setForm(f => ({ ...f, service_interest: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                    Estágio inicial
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {STAGE_ORDER.filter(s => s !== 'ganho' && s !== 'perdido').map(stage => {
                                        const s = STAGE_CONFIG[stage];
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => setForm(f => ({ ...f, stage }))}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                                    form.stage === stage
                                                        ? `${s.bg} ${s.color} ${s.border}`
                                                        : 'bg-gray-50 text-gray-500 border-gray-200'
                                                }`}
                                            >
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5 block">
                                    Observações
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Anotações sobre o lead..."
                                    value={form.notes || ''}
                                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAddLead}
                                disabled={!form.name.trim()}
                                className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3.5 rounded-xl font-bold disabled:opacity-40 transition-colors"
                            >
                                Adicionar Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lead Detail Modal ──────────────────────────────────────────── */}
            {selectedLead && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center">
                    <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full ${STAGE_CONFIG[selectedLead.stage].bg} flex items-center justify-center`}>
                                    <User size={18} className={STAGE_CONFIG[selectedLead.stage].color} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{selectedLead.name}</h3>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${STAGE_CONFIG[selectedLead.stage].bg} ${STAGE_CONFIG[selectedLead.stage].color} ${STAGE_CONFIG[selectedLead.stage].border}`}>
                                        {STAGE_CONFIG[selectedLead.stage].label}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Value */}
                            {selectedLead.estimated_value > 0 && (
                                <div className="bg-green-50 rounded-xl p-3 flex items-center gap-3">
                                    <DollarSign size={20} className="text-green-600" />
                                    <div>
                                        <p className="text-xs text-green-600">Valor estimado</p>
                                        <p className="font-bold text-green-700 text-lg">
                                            R$ {selectedLead.estimated_value.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Contact */}
                            <div className="space-y-2">
                                {selectedLead.phone && (
                                    <a
                                        href={`tel:${selectedLead.phone}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <Phone size={16} className="text-gray-500" />
                                        <span className="text-sm text-gray-700">{selectedLead.phone}</span>
                                    </a>
                                )}
                                {selectedLead.email && (
                                    <a
                                        href={`mailto:${selectedLead.email}`}
                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <Mail size={16} className="text-gray-500" />
                                        <span className="text-sm text-gray-700">{selectedLead.email}</span>
                                    </a>
                                )}
                                {selectedLead.service_interest && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                        <Briefcase size={16} className="text-gray-500" />
                                        <span className="text-sm text-gray-700">{selectedLead.service_interest}</span>
                                    </div>
                                )}
                            </div>

                            {selectedLead.notes && (
                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-amber-700 mb-1">Observações</p>
                                    <p className="text-sm text-amber-800">{selectedLead.notes}</p>
                                </div>
                            )}

                            {selectedLead.lost_reason && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                                    <AlertCircle size={16} className="text-red-500 mt-0.5" />
                                    <div>
                                        <p className="text-xs font-semibold text-red-700">Motivo da perda</p>
                                        <p className="text-sm text-red-600">{selectedLead.lost_reason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Move Stage */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mover para</p>
                                <div className="flex flex-wrap gap-2">
                                    {STAGE_ORDER.filter(s => s !== selectedLead.stage).map(stage => {
                                        const s = STAGE_CONFIG[stage];
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => {
                                                    handleMoveStage(selectedLead, stage);
                                                    setSelectedLead(null);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${s.bg} ${s.color} ${s.border} hover:opacity-80 transition-opacity`}
                                            >
                                                → {s.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            {selectedLead.phone && (
                                <a
                                    href={`https://wa.me/${selectedLead.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${selectedLead.name}! Tudo bem?`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
                                >
                                    <MessageCircle size={18} /> WhatsApp
                                </a>
                            )}

                            {selectedLead.client_id && onGenerateDocument && (
                                <button
                                    onClick={() => {
                                        onGenerateDocument(selectedLead.client_id!, 'quote');
                                        setSelectedLead(null);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    <Briefcase size={18} /> Gerar Orçamento
                                </button>
                            )}

                            <button
                                onClick={() => setShowDeleteConfirm(selectedLead.id)}
                                className="w-full flex items-center justify-center gap-2 py-3 text-red-600 border border-red-200 rounded-xl font-semibold hover:bg-red-50 transition-colors text-sm"
                            >
                                <Trash2 size={16} /> Remover Lead
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Lost Reason Modal ──────────────────────────────────────────── */}
            {showLostModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5">
                        <h3 className="font-bold text-gray-800 mb-1">Marcar como Perdido</h3>
                        <p className="text-sm text-gray-500 mb-4">Qual foi o motivo da perda? (opcional)</p>
                        <textarea
                            rows={3}
                            placeholder="Ex: Preço acima do orçamento, escolheu outro profissional..."
                            value={lostReason}
                            onChange={e => setLostReason(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowLostModal(null); setLostReason(''); }}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmLost}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-5 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Trash2 size={22} className="text-red-600" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">Remover lead?</h3>
                        <p className="text-sm text-gray-500 mb-5">Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700"
                            >
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Lead Card Sub-Component ────────────────────────────────────────────────────
interface LeadCardProps {
    lead: PipelineLead;
    onSelect: () => void;
    onMove: (stage: PipelineStage) => void;
    onDelete: () => void;
    showMoveMenu: boolean;
    onToggleMoveMenu: () => void;
    onCloseMoveMenu: () => void;
}

const LeadCard: React.FC<LeadCardProps> = ({
    lead, onSelect, onMove, onDelete, showMoveMenu, onToggleMoveMenu, onCloseMoveMenu
}) => {
    const cfg = STAGE_CONFIG[lead.stage];
    const currentIdx = STAGE_ORDER.indexOf(lead.stage);
    const canMoveForward = currentIdx < STAGE_ORDER.length - 1;
    const nextStage = canMoveForward ? STAGE_ORDER[currentIdx + 1] : null;

    return (
        <div
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={onSelect}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                        <User size={16} className={cfg.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{lead.name}</p>
                        {lead.service_interest && (
                            <p className="text-xs text-gray-500 truncate">{lead.service_interest}</p>
                        )}
                        {lead.phone && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                <Phone size={10} /> {lead.phone}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
                    {lead.estimated_value > 0 && (
                        <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">
                            {formatCurrency(lead.estimated_value)}
                        </span>
                    )}
                    <div className="relative">
                        <button
                            onClick={onToggleMoveMenu}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <MoreVertical size={16} className="text-gray-400" />
                        </button>

                        {showMoveMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={onCloseMoveMenu} />
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 min-w-[160px]">
                                    <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wide">Mover para</p>
                                    {STAGE_ORDER.filter(s => s !== lead.stage).map(stage => {
                                        const s = STAGE_CONFIG[stage];
                                        return (
                                            <button
                                                key={stage}
                                                onClick={() => { onMove(stage); onCloseMoveMenu(); }}
                                                className={`w-full px-3 py-2 text-left text-sm ${s.color} hover:${s.bg} hover:opacity-80 flex items-center gap-2 transition-colors`}
                                            >
                                                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                                {s.label}
                                            </button>
                                        );
                                    })}
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                        onClick={() => { onDelete(); onCloseMoveMenu(); }}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Remover
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick advance button */}
            {nextStage && (
                <button
                    onClick={(e) => { e.stopPropagation(); onMove(nextStage); }}
                    className={`mt-3 w-full py-1.5 rounded-lg text-xs font-semibold border ${STAGE_CONFIG[nextStage].bg} ${STAGE_CONFIG[nextStage].color} ${STAGE_CONFIG[nextStage].border} flex items-center justify-center gap-1 hover:opacity-80 transition-opacity`}
                >
                    <ChevronRight size={14} /> Mover para {STAGE_CONFIG[nextStage].label}
                </button>
            )}
        </div>
    );
};

export default Pipeline;
