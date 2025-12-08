import React, { useState } from 'react';
import { AppNotification, NotificationSettings } from '../types/notifications';
import {
    Bell, BellOff, X, Check, Calendar, Coins, CheckCircle,
    Settings, ChevronRight, Trash2, Clock
} from 'lucide-react';

interface NotificationCenterProps {
    notifications: AppNotification[];
    unreadCount: number;
    settings: NotificationSettings;
    permission: NotificationPermission;
    isSupported: boolean;
    onRequestPermission: () => Promise<boolean>;
    onUpdateSettings: (settings: Partial<NotificationSettings>) => void;
    onMarkAsRead: (id: string) => void;
    onClearAll: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
    notifications,
    unreadCount,
    settings,
    permission,
    isSupported,
    onRequestPermission,
    onUpdateSettings,
    onMarkAsRead,
    onClearAll
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const getNotificationIcon = (type: AppNotification['type']) => {
        switch (type) {
            case 'appointment':
                return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'credits':
                return <Coins className="w-4 h-4 text-amber-500" />;
            case 'confirmation':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}min`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    return (
        <>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Panel - Uses fixed positioning relative to viewport */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex justify-center" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                    <div className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">

                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 text-lg">Notificações</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-brand-100 text-brand-600' : 'text-gray-500 hover:bg-gray-100'
                                        }`}
                                >
                                    <Settings size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Settings Panel */}
                        {showSettings && (
                            <div className="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
                                {!isSupported ? (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
                                        <BellOff className="inline w-4 h-4 mr-2" />
                                        Notificações não suportadas neste navegador
                                    </div>
                                ) : permission !== 'granted' ? (
                                    <button
                                        onClick={async () => {
                                            await onRequestPermission();
                                        }}
                                        className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-700 transition-colors"
                                    >
                                        <Bell size={18} />
                                        Ativar Notificações
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Notificações ativas</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={settings.enabled}
                                                    onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                                            </label>
                                        </div>

                                        {settings.enabled && (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">📅 Lembretes de agendamento</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.appointmentReminders}
                                                            onChange={(e) => onUpdateSettings({ appointmentReminders: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">⚠️ Alerta de créditos baixos</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.lowCreditsAlert}
                                                            onChange={(e) => onUpdateSettings({ lowCreditsAlert: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                                                    </label>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">✅ Confirmação de serviço</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.serviceConfirmation}
                                                            onChange={(e) => onUpdateSettings({ serviceConfirmation: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-600"></div>
                                                    </label>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                                    <Bell className="w-12 h-12 mb-4 opacity-30" />
                                    <p className="text-sm">Nenhuma notificação</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification.id}
                                            onClick={() => onMarkAsRead(notification.id)}
                                            className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50/50'
                                                } hover:bg-gray-50`}
                                        >
                                            <div className="mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {notification.body}
                                                </p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {formatTime(notification.timestamp)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-4 border-t border-gray-100">
                                <button
                                    onClick={onClearAll}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-red-500 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    Limpar todas
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationCenter;
