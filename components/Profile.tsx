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

      {/* User Card - Compact */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-10 translate-x-10"></div>

        {isEditing ? (
          <div className="space-y-3 relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Nome</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Profissão</label>
                <input
                  value={formData.profession}
                  onChange={e => setFormData({ ...formData, profession: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Telefone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Email</label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20">
              <User size={32} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{userProfile.name}</h2>
              <p className="text-brand-100 text-sm flex items-center gap-1">
                <Briefcase size={12} /> {userProfile.profession}
              </p>
              <div className="flex gap-3 mt-1 text-xs text-brand-200">
                <span className="flex items-center gap-1"><Phone size={10} /> {userProfile.phone}</span>
                <span className="flex items-center gap-1"><Mail size={10} /> {userProfile.email}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onViewFinance}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-100 rounded-lg"><PieChart size={18} className="text-green-600" /></div>
          </div>
          <p className="font-bold text-gray-800">Financeiro</p>
          <p className="text-xs text-gray-500">Relatórios e despesas</p>
        </button>

        <button
          onClick={() => setShowBookingSettings(true)}
          className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg"><Link2 size={18} className="text-blue-600" /></div>
          </div>
          <p className="font-bold text-gray-800">Agendamento</p>
          <p className="text-xs text-gray-500">Link público</p>
        </button>
      </div>

      {/* KPIs - Compact */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-brand-600" />
          <span className="text-sm font-bold text-gray-700">Indicadores</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">R$ {(stats.totalEarnings / 1000).toFixed(1)}k</p>
            <p className="text-[10px] text-gray-500">Faturado</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.totalAppointments}</p>
            <p className="text-[10px] text-gray-500">Serviços</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.totalClients}</p>
            <p className="text-[10px] text-gray-500">Clientes</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded-xl">
            <p className="text-lg font-bold text-gray-800">{stats.completionRate}%</p>
            <p className="text-[10px] text-gray-500">Conclusão</p>
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