import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Appointment, Client, UserProfile } from '../types';
import {
  User, Briefcase, Phone, Mail, Edit2, Save, Award, TrendingUp, Users, DollarSign,
  CalendarCheck, Building2, Upload, X, Loader2, ShieldCheck, Shield, Download,
  AlertTriangle, Lock, Unlock, Link2, PieChart, ChevronDown, ChevronRight, Settings,
  FileText, HardDrive
} from 'lucide-react';
import { exportData, importData } from '../services/backupService';
import { setPIN, removePIN, hasPIN, isAppLocked } from '../services/authService';
import LockScreen from './LockScreen';
import ProPlanModal from './ProPlanModal';
import BookingSettings from './BookingSettings';
import { FiscalSettings } from './FiscalSettings';
import { redirectToCustomerPortal } from '../services/stripeService';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  appointments: Appointment[];
  clients: Client[];
  onSignOut: () => void;
  onViewFinance?: () => void;
}

// Collapsible Section Component
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, icon, children, defaultOpen = false, badge }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-xl text-brand-600">
            {icon}
          </div>
          <span className="font-bold text-gray-800">{title}</span>
          {badge && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{badge}</span>
          )}
        </div>
        {isOpen ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
};

const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdateProfile, appointments, clients, onSignOut, onViewFinance }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  // Backup States
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Security States
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

  // Modals
  const [showProModal, setShowProModal] = useState(false);
  const [showBookingSettings, setShowBookingSettings] = useState(false);

  useEffect(() => {
    setIsLockEnabled(hasPIN());
  }, []);

  const handleToggleLock = () => {
    if (isLockEnabled) {
      if (confirm('Tem certeza que deseja remover o bloqueio por PIN?')) {
        removePIN();
        setIsLockEnabled(false);
      }
    } else {
      setShowPinSetup(true);
    }
  };

  const handlePinSet = async (pin: string) => {
    await setPIN(pin);
    setIsLockEnabled(true);
    setShowPinSetup(false);
    alert('Senha definida com sucesso! O App será bloqueado ao reiniciar.');
  };

  // KPIs
  const stats = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'completed');
    const totalEarnings = completed.reduce((acc, curr) => acc + curr.price, 0);
    const totalAppointments = completed.length;
    const totalClients = clients.length;
    const avgTicket = totalAppointments > 0 ? totalEarnings / totalAppointments : 0;
    const validAppointments = appointments.filter(a => a.status !== 'cancelled').length;
    const completionRate = validAppointments > 0 ? Math.round((totalAppointments / validAppointments) * 100) : 0;

    return { totalEarnings, totalAppointments, totalClients, avgTicket, completionRate };
  }, [appointments, clients]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleSaveBranding = () => {
    onUpdateProfile(formData);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }
    if (file.size > 500000) {
      alert('A imagem deve ter no máximo 500KB.');
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result as string });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Erro ao ler imagem.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => setFormData({ ...formData, logo: undefined });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportData();
    } catch (error) {
      alert('Erro ao criar backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      await importData(file);
      alert('Dados restaurados! Recarregando...');
      window.location.reload();
    } catch (error) {
      alert('Erro ao restaurar backup.');
    } finally {
      setIsImporting(false);
      setShowRestoreModal(false);
    }
  };

  return (
    <div className="pb-24 space-y-4">
      {/* Modals */}
      {showPinSetup && (
        <LockScreen onUnlock={() => { }} isSettingUp={true} onPinSet={handlePinSet} onCancelSetup={() => setShowPinSetup(false)} />
      )}
      <ProPlanModal isOpen={showProModal} onClose={() => setShowProModal(false)} />
      <BookingSettings userProfile={userProfile} isOpen={showBookingSettings} onClose={() => setShowBookingSettings(false)} />

      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
          <p className="text-sm text-gray-500">Gerencie suas configurações</p>
        </div>
        <button
          onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
          className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {isEditing ? <><Save size={16} /> Salvar</> : <><Edit2 size={16} /> Editar</>}
        </button>
      </header>

      {/* User Card - Premium Redesign */}
      <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden transition-all hover:shadow-brand-500/20">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -translate-x-10 translate-y-10"></div>

        {isEditing ? (
          <div className="space-y-4 relative z-10 animate-in fade-in duration-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">Nome</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">Profissão</label>
                <input
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                  placeholder="Ex: Eletricista"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">Telefone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-white/60 uppercase font-black tracking-wider">Email</label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex items-center gap-5">
            {/* Avatar with Glow and Badge */}
            <div className="relative">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-inner group overflow-hidden">
                {formData.logo ? (
                  <img src={formData.logo} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white drop-shadow-md" />
                )}
              </div>
              {userProfile.isPro && (
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 rounded-lg p-1.5 shadow-lg border border-yellow-200 animate-bounce-subtle">
                  <Award size={14} fill="currentColor" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="space-y-0.5">
                <h2 className="text-2xl font-black tracking-tight leading-tight">{userProfile.name}</h2>
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 px-2 py-0.5 rounded-md">
                  <Briefcase size={12} className="text-brand-200" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-brand-50">{userProfile.profession}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Phone size={12} className="text-white/70" />
                  </div>
                  <span className="text-sm font-medium text-white/90">{userProfile.phone}</span>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="p-1 rounded-md bg-white/5 group-hover:bg-white/10 transition-colors">
                    <Mail size={12} className="text-white/70" />
                  </div>
                  <span className="text-sm font-medium text-white/90 truncate max-w-[180px]">{userProfile.email}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Grid - Refined */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onViewFinance}
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <PieChart size={24} className="text-green-600" />
          </div>
          <div>
            <p className="font-black text-gray-800 tracking-tight">Financeiro</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Relatórios</p>
          </div>
        </button>

        <button
          onClick={() => setShowBookingSettings(true)}
          className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-left flex flex-col gap-3 group"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Link2 size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-black text-gray-800 tracking-tight">Agendamento</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Link Público</p>
          </div>
        </button>
      </div>

      {/* Indicators Section - Modernized */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-50 rounded-lg">
              <TrendingUp size={16} className="text-brand-600" />
            </div>
            <span className="text-sm font-black text-gray-800 uppercase tracking-tight">Desempenho</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">ÚLTIMOS 30 DIAS</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <DollarSign size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Faturamento</span>
            </div>
            <p className="text-xl font-black text-gray-900 leading-none">R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <CalendarCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Serviços</span>
            </div>
            <p className="text-xl font-black text-gray-900 leading-none">{stats.totalAppointments}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Clientes</span>
            </div>
            <p className="text-xl font-black text-gray-900 leading-none">{stats.totalClients}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Award size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Conclusão</span>
            </div>
            <p className="text-xl font-black text-green-600 leading-none">{stats.completionRate}%</p>
          </div>
        </div>
      </div>

      {/* Collapsible Sections */}
      <CollapsibleSection title="Segurança" icon={<ShieldCheck size={20} />} badge={isLockEnabled ? 'Ativo' : undefined}>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mt-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLockEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              {isLockEnabled ? <Lock size={18} /> : <Unlock size={18} />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 text-sm">Bloqueio por PIN</h4>
              <p className="text-xs text-gray-500">{isLockEnabled ? 'Proteção ativada' : 'Proteja seus dados'}</p>
            </div>
          </div>
          <button
            onClick={handleToggleLock}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isLockEnabled
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-brand-600 text-white hover:bg-brand-700'}`}
          >
            {isLockEnabled ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Notas Fiscais" icon={<FileText size={20} />}>
        <div className="mt-2">
          <FiscalSettings />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Marca & Documentos" icon={<Building2 size={20} />}>
        <div className="space-y-4 mt-3">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Nome da Empresa</label>
            <input
              type="text"
              placeholder="Sua empresa ou nome comercial..."
              value={formData.companyName || ''}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Logotipo</label>
            {formData.logo ? (
              <div className="relative inline-block">
                <img src={formData.logo} alt="Logo" className="h-16 object-contain rounded-xl border border-gray-200 p-2 bg-gray-50" />
                <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-brand-300 transition-all flex flex-col items-center gap-1 disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} className="text-gray-400" />}
                <span className="text-xs">{isUploading ? 'Enviando...' : 'Clique para enviar logo'}</span>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>

          <button onClick={handleSaveBranding} className="w-full py-2.5 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2">
            <Save size={14} /> Salvar
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Backup e Dados" icon={<HardDrive size={20} />}>
        <div className="mt-3">
          <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mb-3">
            <p className="text-xs text-blue-800">Faça backups regulares para não perder seus dados.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={handleExport} disabled={isExporting} className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors">
              {isExporting ? <Loader2 className="animate-spin text-brand-600" size={18} /> : <Download size={18} className="text-brand-600" />}
              <span className="font-semibold text-xs">Fazer Backup</span>
            </button>
            <button onClick={() => setShowRestoreModal(true)} className="bg-gray-50 border border-gray-200 p-3 rounded-xl flex flex-col items-center gap-1 hover:bg-gray-100 transition-colors">
              <Upload size={18} className="text-brand-600" />
              <span className="font-semibold text-xs">Restaurar</span>
            </button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Subscription Banner */}
      {userProfile.isPro ? (
        <div className="bg-gray-900 text-white p-4 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500 rounded-full blur-3xl opacity-20 -translate-y-8 translate-x-8"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Plano PRO</span>
                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-md">ATIVO</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Backup em nuvem ativado</p>
            </div>
            <button onClick={redirectToCustomerPortal} className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-semibold">
              Gerenciar
            </button>
          </div>
        </div>
      ) : (
        <div onClick={() => setShowProModal(true)} className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold">Seja Profissional</h4>
              <p className="text-xs text-gray-400 mt-1">Desbloqueie recursos avançados</p>
            </div>
            <Award size={24} className="text-yellow-400" />
          </div>
        </div>
      )}

      {/* Sign Out */}
      <div className="text-center pt-2">
        <button onClick={onSignOut} className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
          Sair da conta
        </button>
        <p className="text-xs text-gray-300 mt-1">v1.0.3</p>
      </div>

      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Atenção!</h3>
              <p className="text-gray-500 text-sm mt-2">Ao restaurar, <strong>todos os dados atuais serão substituídos</strong>.</p>
            </div>
            <label className={`w-full py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer ${isImporting ? 'opacity-70' : ''}`}>
              {isImporting ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
              <span>Selecionar Arquivo</span>
              <input type="file" accept=".json" className="hidden" onChange={handleImportFile} disabled={isImporting} />
            </label>
            <button onClick={() => setShowRestoreModal(false)} disabled={isImporting} className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;