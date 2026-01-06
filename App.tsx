import React, { useState } from 'react';
import { ViewState, Client, Appointment } from './types';
import { useSupabaseData } from './hooks/useSupabaseData';
import { useNotifications } from './hooks/useNotifications';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import CalendarView from './components/CalendarView';
import Finance from './components/Finance';
import Profile from './components/Profile';
import SyncIndicator from './components/SyncIndicator';
import NotificationCenter from './components/NotificationCenter';
import DocumentHistory from './components/DocumentHistory';
import AICoach from './components/AICoach';
import DocumentGenerator from './components/DocumentGenerator';
import LockScreen from './components/LockScreen';
import BookingPage from './components/BookingPage';
import AuthScreen from './components/AuthScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { isAppLocked, unlockApp } from './services/authService';
import { getDocuments } from './services/documentService';
import {
  LayoutDashboard, Users, CalendarDays, ReceiptText, UserCircle, Loader2, FileText,
  Plus, X, FilePlus, Bot, DollarSign
} from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Supabase Auth State
  const {
    user,
    isLoading: isAuthLoading,
    isAuthenticated,
    needsOnboarding,
    completeOnboarding,
    signOut,
    isConfigured: isSupabaseConfigured
  } = useAuth();

  // Check Lock Screen on Mount
  React.useEffect(() => {
    if (isAppLocked()) {
      setIsLocked(true);
    }
  }, []);

  // Check for booking mode on mount
  const [bookingData, setBookingData] = useState<string | null>(null);
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const booking = params.get('booking');
    if (booking) {
      setBookingData(booking);
    }
  }, []);

  const handleUnlock = () => {
    unlockApp();
    setIsLocked(false);
  };

  // Navigation State for FAB actions
  const [financeInitialTab, setFinanceInitialTab] = useState<'overview' | 'expenses'>('overview');
  const [financeInitialType, setFinanceInitialType] = useState<'quote' | 'receipt' | 'nfse'>('quote');
  const [financeInitialClientId, setFinanceInitialClientId] = useState<string>('');
  const [calendarInitialOpenModal, setCalendarInitialOpenModal] = useState(false);

  const {
    clients,
    appointments,
    userProfile,
    isLoading,
    isOnline,
    syncStatus,
    addClient,
    updateClient,
    removeClient,
    addAppointment,
    toggleAppointmentStatus,
    setUserProfile,
    forceSync
  } = useSupabaseData();

  // Check for Stripe Success
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      // Simulate enabling pro mode
      // In a real app, this would verify with backend
      const enablePro = async () => {
        if (!userProfile.isPro) {
          await setUserProfile({ ...userProfile, isPro: true, subscriptionStatus: 'pro' });
          alert('Parabéns! Sua assinatura Pro foi ativada com sucesso.');

          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        }
      };
      enablePro();
    }
  }, [userProfile, setUserProfile]);

  const {
    notifications,
    unreadCount,
    settings: notificationSettings,
    permission: notificationPermission,
    isSupported: notificationSupported,
    requestPermission,
    updateSettings: updateNotificationSettings,
    markAsRead,
    clearAll: clearAllNotifications
  } = useNotifications();

  const handleAddClient = async (client: Client) => {
    await addClient(client);
  };

  const handleAddAppointment = async (appointment: Appointment) => {
    await addAppointment(appointment);
  };

  const handleToggleStatus = async (id: string) => {
    await toggleAppointmentStatus(id);
  };

  const handleFabAction = (type: 'quote' | 'receipt' | 'nfse') => {
    setFinanceInitialType(type);
    setCurrentView('documents');
    setIsFabOpen(false);
  };

  const handleFabAgenda = () => {
    setCurrentView('calendar');
    setCalendarInitialOpenModal(true);
    setIsFabOpen(false);
  };

  const handleGenerateDocument = (clientId: string, type: 'quote' | 'receipt') => {
    setFinanceInitialType(type);
    setFinanceInitialClientId(clientId);
    setCurrentView('documents');
  };

  // Reset finance props when navigating manually
  const handleNavigation = (view: ViewState) => {
    if (view === 'finance') {
      setFinanceInitialTab('overview'); // Default view
      setFinanceInitialClientId('');
    }
    if (view === 'calendar') {
      setCalendarInitialOpenModal(false);
    }
    setCurrentView(view);
    setIsFabOpen(false);
  };

  // Auth Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-600 via-indigo-600 to-purple-700 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white/70 text-sm">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Auth Screen (Login/Register) - always show if not authenticated
  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={() => window.location.reload()} />;
  }

  // Onboarding Screen - for new users (only if using Supabase)
  if (isSupabaseConfigured && needsOnboarding && user) {
    return (
      <OnboardingScreen
        userId={user.id}
        userEmail={user.email || ''}
        userName={user.user_metadata?.name}
        onComplete={completeOnboarding}
      />
    );
  }

  // Data Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
          <p className="text-gray-500 text-sm">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Lock Screen Block
  if (isLocked) {
    return <LockScreen onUnlock={handleUnlock} />;
  }

  // Booking Page (Public View)
  if (bookingData) {
    return (
      <BookingPage
        encodedData={bookingData}
        onBack={() => {
          setBookingData(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} clients={clients} documentsCount={getDocuments().length} userProfile={userProfile} />;
      case 'clients':
        return (
          <Clients
            clients={clients}
            appointments={appointments}
            onAddClient={handleAddClient}
            onUpdateClient={async (c) => await updateClient(c)}
            onDeleteClient={async (id) => await removeClient(id)}
            onGenerateDocument={handleGenerateDocument}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            appointments={appointments}
            clients={clients}
            onAddAppointment={handleAddAppointment}
            onToggleStatus={handleToggleStatus}
            initialOpenModal={calendarInitialOpenModal}
          />
        );
      case 'finance':
        return (
          <Finance
            clients={clients}
            userProfile={userProfile}
            onViewHistory={() => setCurrentView('history')}
            onNewDocument={() => setCurrentView('documents')}
            initialTab={financeInitialTab}
            appointments={appointments}
          />
        );
      case 'documents':
        return (
          <DocumentGenerator
            clients={clients}
            userProfile={userProfile}
            initialType={financeInitialType}
            initialClientId={financeInitialClientId}
            onNavigateToHistory={() => setCurrentView('history')}
          />
        );
      case 'profile':
        return (
          <Profile
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            appointments={appointments}
            clients={clients}
            onSignOut={signOut}
            onViewFinance={() => setCurrentView('finance')}
          />
        );
      case 'coach':
        return <AICoach />;
      case 'history':
        return <DocumentHistory />;
      default:
        return <Dashboard appointments={appointments} clients={clients} documentsCount={getDocuments().length} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">

      {/* Top Header Bar with Network Status and Notification Bell */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigation('profile')}
            className={`flex items-center justify-center p-1 rounded-full transition-all border-2 ${currentView === 'profile' ? 'border-brand-600' : 'border-gray-100'}`}
          >
            {userProfile?.logo ? (
              <img src={userProfile.logo} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <UserCircle size={20} />
              </div>
            )}
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">Profissa</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Sync Status Indicator */}
          <SyncIndicator
            isOnline={isOnline}
            syncStatus={syncStatus}
            onForceSync={forceSync}
          />
          <NotificationCenter
            notifications={notifications}
            unreadCount={unreadCount}
            settings={notificationSettings}
            permission={notificationPermission}
            isSupported={notificationSupported}
            onRequestPermission={requestPermission}
            onUpdateSettings={updateNotificationSettings}
            onMarkAsRead={markAsRead}
            onClearAll={clearAllNotifications}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-5 overflow-y-auto pb-24">
        {renderView()}
      </main>

      {/* FAB Overlay (Dimmed Background) */}
      {isFabOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 animate-in fade-in duration-200"
          onClick={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB Menu Items */}
      <div className={`fixed bottom-28 left-0 right-0 flex justify-center items-end gap-6 z-50 transition-all duration-300 ${isFabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>

        {/* Quote Button */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => handleFabAction('quote')}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <FilePlus size={24} />
          </button>
          <span className="text-white text-xs font-bold bg-gray-900/80 px-2 py-1 rounded-md">Orçamento</span>
        </div>

        {/* Nota Fiscal Button (Center/Highlight) */}
        <div className="flex flex-col items-center gap-2 -translate-y-4">
          <button
            onClick={() => handleFabAction('nfse')}
            className="w-16 h-16 bg-purple-600 text-white rounded-full shadow-xl shadow-purple-500/30 flex items-center justify-center hover:bg-purple-700 transition-colors border-4 border-gray-50"
          >
            <ReceiptText size={32} />
          </button>
          <span className="text-white text-xs font-bold bg-purple-900/80 px-2 py-1 rounded-md">Nota Fiscal</span>
        </div>

        {/* Agenda Button (Changed from Receipt) */}
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleFabAgenda}
            className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
          >
            <CalendarDays size={24} />
          </button>
          <span className="text-white text-xs font-bold bg-gray-900/80 px-2 py-1 rounded-md">Agenda</span>
        </div>

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-3 px-2 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => handleNavigation('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={() => handleNavigation('clients')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'clients' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={24} strokeWidth={currentView === 'clients' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Clientes</span>
        </button>

        {/* FAB Main Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`relative -top-6 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 hover:scale-105 transition-all ${isFabOpen ? 'bg-gray-800 rotate-45' : 'bg-brand-600'}`}
        >
          <Plus size={28} />
        </button>

        <button
          onClick={() => handleNavigation('calendar')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'calendar' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <CalendarDays size={24} strokeWidth={currentView === 'calendar' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button
          onClick={() => handleNavigation('finance')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'finance' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <DollarSign size={24} strokeWidth={currentView === 'finance' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Finanças</span>
        </button>
      </nav>
    </div>
  );
};

export default App;