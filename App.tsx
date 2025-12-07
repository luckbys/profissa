import React from 'react';
import { ViewState, Client, Appointment } from './types';
import { useLocalData } from './hooks/useLocalData';
import { useNotifications } from './hooks/useNotifications';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import CalendarView from './components/CalendarView';
import Finance from './components/Finance';
import Profile from './components/Profile';
import NetworkStatus from './components/NetworkStatus';
import NotificationCenter from './components/NotificationCenter';
import DocumentHistory from './components/DocumentHistory';
import { LayoutDashboard, Users, CalendarDays, ReceiptText, UserCircle, Loader2, FileText } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = React.useState<ViewState>('dashboard');

  const {
    clients,
    appointments,
    userProfile,
    isLoading,
    isOnline,
    addClient,
    updateClient,
    removeClient,
    addAppointment,
    toggleAppointmentStatus,
    setUserProfile
  } = useLocalData();

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

  // Loading state
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

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard appointments={appointments} />;
      case 'clients':
        return (
          <Clients
            clients={clients}
            appointments={appointments}
            onAddClient={handleAddClient}
            onUpdateClient={async (c) => await updateClient(c)}
            onDeleteClient={async (id) => await removeClient(id)}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            appointments={appointments}
            clients={clients}
            onAddAppointment={handleAddAppointment}
            onToggleStatus={handleToggleStatus}
          />
        );
      case 'finance':
        return <Finance clients={clients} userProfile={userProfile} onViewHistory={() => setCurrentView('history')} />;
      case 'profile':
        return (
          <Profile
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            appointments={appointments}
            clients={clients}
          />
        );
      case 'history':
        return <DocumentHistory />;
      default:
        return <Dashboard appointments={appointments} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200">

      {/* Network Status Indicator */}
      <NetworkStatus isOnline={isOnline} />

      {/* Notification Center */}
      <div className="fixed top-4 left-4 z-50">
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

      {/* Main Content Area */}
      <main className="p-5 h-full overflow-y-auto min-h-screen">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-100 flex justify-around py-3 px-2 pb-6 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'dashboard' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button
          onClick={() => setCurrentView('clients')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'clients' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={24} strokeWidth={currentView === 'clients' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Clientes</span>
        </button>

        <button
          onClick={() => setCurrentView('finance')}
          className={`relative -top-6 bg-brand-600 text-white p-4 rounded-full shadow-lg border-4 border-gray-50 hover:bg-brand-700 transition-transform hover:scale-105 ${currentView === 'finance' ? 'ring-2 ring-brand-200' : ''}`}
        >
          <ReceiptText size={28} />
        </button>

        <button
          onClick={() => setCurrentView('calendar')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'calendar' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <CalendarDays size={24} strokeWidth={currentView === 'calendar' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Agenda</span>
        </button>

        <button
          onClick={() => setCurrentView('profile')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${currentView === 'profile' ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <UserCircle size={24} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

export default App;