import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Appointment, Client, UserProfile } from '../types';
import { User, Briefcase, Phone, Mail, Edit2, Save, Award, TrendingUp, Users, DollarSign, CalendarCheck, Building2, Upload, X, Loader2, ShieldCheck, Download, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { exportData, importData } from '../services/backupService';
import { setPIN, removePIN, hasPIN, isAppLocked } from '../services/authService';
import LockScreen from './LockScreen';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  appointments: Appointment[];
  clients: Client[];
}

const Profile: React.FC<ProfileProps> = ({ userProfile, onUpdateProfile, appointments, clients }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup States
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Security States
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);

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

  const handlePinSet = (pin: string) => {
    setPIN(pin);
    setIsLockEnabled(true);
    setShowPinSetup(false);
    alert('Senha definida com sucesso! O App será bloqueado ao reiniciar.');
  };

  // KPIs Calculations
  const stats = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'completed');

    const totalEarnings = completed.reduce((acc, curr) => acc + curr.price, 0);
    const totalAppointments = completed.length;
    const totalClients = clients.length;
    const avgTicket = totalAppointments > 0 ? totalEarnings / totalAppointments : 0;

    // Calculate conversion (completed vs total non-cancelled)
    const validAppointments = appointments.filter(a => a.status !== 'cancelled').length;
    const completionRate = validAppointments > 0 ? Math.round((totalAppointments / validAppointments) * 100) : 0;

    return {
      totalEarnings,
      totalAppointments,
      totalClients,
      avgTicket,
      completionRate
    };
  }, [appointments, clients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500000) {
      alert('A imagem deve ter no máximo 500KB.');
      return;
    }

    setIsUploading(true);

    // Convert to base64 (works offline, no server needed)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFormData({ ...formData, logo: base64 });
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Erro ao ler imagem. Tente novamente.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setFormData({ ...formData, logo: undefined });
  };

  // Backup Handlers
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
      alert('Dados restaurados com sucesso! O aplicativo será recarregado.');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Erro ao restaurar backup. Verifique se o arquivo é válido.');
    } finally {
      setIsImporting(false);
      setShowRestoreModal(false);
    }
  };

  return (
    <div className="pb-24 space-y-6">
      {/* Pin Setup Modal */}
      {showPinSetup && (
        <LockScreen
          onUnlock={() => { }}
          isSettingUp={true}
          onPinSet={handlePinSet}
          onCancelSetup={() => setShowPinSetup(false)}
        />
      )}

      <header className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Meu Perfil</h1>
        <button
          onClick={() => isEditing ? handleSubmit({ preventDefault: () => { } } as any) : setIsEditing(true)}
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${isEditing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {isEditing ? <><Save size={16} /> Salvar</> : <><Edit2 size={16} /> Editar</>}
        </button>
      </header>

      {/* User Card */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>

        {isEditing ? (
          <form className="space-y-3 relative z-10">
            <div>
              <label className="text-xs text-brand-200 uppercase font-bold">Nome</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none focus:bg-white/30"
              />
            </div>
            <div>
              <label className="text-xs text-brand-200 uppercase font-bold">Profissão</label>
              <input
                value={formData.profession}
                onChange={e => setFormData({ ...formData, profession: e.target.value })}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none focus:bg-white/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Telefone</label>
                <input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none focus:bg-white/30"
                />
              </div>
              <div>
                <label className="text-xs text-brand-200 uppercase font-bold">Email</label>
                <input
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-brand-200 focus:outline-none focus:bg-white/30"
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border-4 border-white/10 shadow-inner">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold">{userProfile.name}</h2>
            <p className="text-brand-100 font-medium flex items-center gap-1.5 opacity-90 mb-4">
              <Briefcase size={14} /> {userProfile.profession}
            </p>

            <div className="flex gap-4 text-sm text-brand-100 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Phone size={12} /> {userProfile.phone}
              </div>
              <div className="w-px bg-white/20 h-4"></div>
              <div className="flex items-center gap-1">
                <Mail size={12} /> {userProfile.email}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SEGURANÇA OPÇÕES */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="text-brand-600" />
          <h2 className="text-lg font-bold text-gray-800">Segurança</h2>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isLockEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
              {isLockEnabled ? <Lock size={20} /> : <Unlock size={20} />}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">Bloqueio de Tela</h4>
              <p className="text-xs text-gray-500">{isLockEnabled ? 'Ativado' : 'Proteger com PIN'}</p>
            </div>
          </div>
          <button
            onClick={handleToggleLock}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isLockEnabled
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
          >
            {isLockEnabled ? 'Desativar' : 'Ativar'}
          </button>
        </div>
      </div>

      {/* Company Branding Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-gray-600" />
          <h3 className="font-bold text-gray-800">Marca para Documentos</h3>
        </div>

        <div className="space-y-4">
          {/* Company Name */}
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

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase block mb-2">Logotipo</label>

            {formData.logo ? (
              <div className="relative inline-block">
                <img
                  src={formData.logo}
                  alt="Logo"
                  className="h-20 object-contain rounded-xl border border-gray-200 p-2 bg-gray-50"
                />
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 hover:border-brand-300 transition-all flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="text-brand-500 animate-spin" />
                    <span className="text-sm font-medium">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-sm font-medium">Clique para enviar logo</span>
                    <span className="text-xs text-gray-400">PNG, JPG até 500KB</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>

          {/* Save Button for branding */}
          <button
            type="button"
            onClick={handleSubmit as any}
            className="w-full py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Salvar Configurações
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3 text-center">
          Estas informações aparecerão nos seus orçamentos e recibos em PDF
        </p>
      </div>

      {/* SEGURANÇA E DADOS (BACKUP) */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Download className="text-brand-600" />
          <h2 className="text-lg font-bold text-gray-800">Backup e Dados</h2>
        </div>

        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
          <p className="text-sm text-blue-800 mb-2">
            Seus dados ficam salvos apenas neste dispositivo. Faça backups regulares para não perder nada.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-white border border-gray-300 text-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            {isExporting ? <Loader2 className="animate-spin text-brand-600" /> : <Download className="text-brand-600" />}
            <span className="font-bold text-sm">Fazer Backup</span>
            <span className="text-[10px] text-gray-400">Exportar arquivo .json</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRestoreModal(true)}
            className="bg-white border border-gray-300 text-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <Upload className="text-brand-600" />
            <span className="font-bold text-sm">Restaurar Dados</span>
            <span className="text-[10px] text-gray-400">Importar arquivo .json</span>
          </button>
        </div>
      </div>

      {/* KPIs Section */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1 flex items-center gap-2">
          <TrendingUp size={16} /> Indicadores de Sucesso (Vitalício)
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Total Earnings */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                <DollarSign size={18} />
              </div>
              <span className="text-xs font-bold text-gray-400">Faturamento Total</span>
            </div>
            <p className="text-xl font-bold text-gray-800">R$ {stats.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Average Ticket */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <Award size={18} />
              </div>
              <span className="text-xs font-bold text-gray-400">Ticket Médio</span>
            </div>
            <p className="text-xl font-bold text-gray-800">R$ {stats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          {/* Completed Services */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-100 rounded-lg text-purple-600">
                <CalendarCheck size={18} />
              </div>
              <span className="text-xs font-bold text-gray-400">Serviços Feitos</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.totalAppointments}</p>
            <p className="text-[10px] text-green-600 font-medium mt-1">Taxa de conclusão: {stats.completionRate}%</p>
          </div>

          {/* Total Clients */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                <Users size={18} />
              </div>
              <span className="text-xs font-bold text-gray-400">Base de Clientes</span>
            </div>
            <p className="text-xl font-bold text-gray-800">{stats.totalClients}</p>
          </div>
        </div>
      </div>

      {/* Subscription Banner */}
      <div className="bg-gray-900 text-white p-5 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 rounded-full blur-3xl opacity-20 -translate-y-10 translate-x-10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-lg">Plano Profissional</h4>
              <p className="text-gray-400 text-sm">Assinatura Ativa • Renovação em 15 dias</p>
            </div>
            <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-md border border-yellow-500/30">PREMIUM</span>
          </div>
          <div className="w-full bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-yellow-500 h-full w-3/4"></div>
          </div>
        </div>
      </div>

      <div className="text-center pt-4">
        <button className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
          Sair da conta
        </button>
        <p className="text-xs text-gray-300 mt-2">Versão 1.0.2</p>
      </div>

      {/* RESTORE MODAL */}
      {showRestoreModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 space-y-4">
            <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-red-500 mb-2">
              <AlertTriangle size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">Atenção!</h3>
              <p className="text-gray-500 text-sm mt-2">
                Ao restaurar um backup, <strong>todos os dados atuais serão substituídos</strong>. Essa ação não pode ser desfeita.
              </p>
            </div>

            <label className={`w-full py-3.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 cursor-pointer ${isImporting ? 'opacity-70 pointer-events-none' : ''}`}>
              {isImporting ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>Selecionar Arquivo de Backup</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
                disabled={isImporting}
              />
            </label>

            <button
              onClick={() => setShowRestoreModal(false)}
              disabled={isImporting}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;