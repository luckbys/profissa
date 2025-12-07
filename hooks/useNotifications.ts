import { useState, useEffect, useCallback } from 'react';
import { NotificationSettings, AppNotification, DEFAULT_NOTIFICATION_SETTINGS } from '../types/notifications';
import {
    isNotificationSupported,
    getNotificationPermission,
    requestNotificationPermission,
    getNotificationSettings,
    saveNotificationSettings,
    getStoredNotifications,
    markNotificationAsRead,
    clearAllNotifications,
    sendAppointmentReminder,
    sendLowCreditsAlert,
    sendServiceConfirmation
} from '../services/notificationService';

interface UseNotificationsReturn {
    isSupported: boolean;
    permission: NotificationPermission;
    settings: NotificationSettings;
    notifications: AppNotification[];
    unreadCount: number;
    requestPermission: () => Promise<boolean>;
    updateSettings: (settings: Partial<NotificationSettings>) => void;
    markAsRead: (id: string) => void;
    clearAll: () => void;
    sendAppointmentReminder: (clientName: string, service: string, time: string) => void;
    sendLowCreditsAlert: (remaining: number) => void;
    sendServiceConfirmation: (clientName: string, service: string, total: number) => void;
}

export const useNotifications = (): UseNotificationsReturn => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    const isSupported = isNotificationSupported();

    // Load initial state
    useEffect(() => {
        setPermission(getNotificationPermission());
        setSettings(getNotificationSettings());
        setNotifications(getStoredNotifications());
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const requestPermission = useCallback(async (): Promise<boolean> => {
        const granted = await requestNotificationPermission();
        setPermission(getNotificationPermission());

        if (granted) {
            const updatedSettings = { ...settings, enabled: true };
            saveNotificationSettings(updatedSettings);
            setSettings(updatedSettings);
        }

        return granted;
    }, [settings]);

    const updateSettings = useCallback((updates: Partial<NotificationSettings>) => {
        const updated = { ...settings, ...updates };
        saveNotificationSettings(updated);
        setSettings(updated);
    }, [settings]);

    const markAsRead = useCallback((id: string) => {
        markNotificationAsRead(id);
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    }, []);

    const clearAll = useCallback(() => {
        clearAllNotifications();
        setNotifications([]);
    }, []);

    const handleSendAppointmentReminder = useCallback((
        clientName: string,
        service: string,
        time: string
    ) => {
        if (settings.enabled && settings.appointmentReminders) {
            sendAppointmentReminder(clientName, service, time);
            setNotifications(getStoredNotifications());
        }
    }, [settings]);

    const handleSendLowCreditsAlert = useCallback((remaining: number) => {
        if (settings.enabled && settings.lowCreditsAlert) {
            sendLowCreditsAlert(remaining);
            setNotifications(getStoredNotifications());
        }
    }, [settings]);

    const handleSendServiceConfirmation = useCallback((
        clientName: string,
        service: string,
        total: number
    ) => {
        if (settings.enabled && settings.serviceConfirmation) {
            sendServiceConfirmation(clientName, service, total);
            setNotifications(getStoredNotifications());
        }
    }, [settings]);

    return {
        isSupported,
        permission,
        settings,
        notifications,
        unreadCount,
        requestPermission,
        updateSettings,
        markAsRead,
        clearAll,
        sendAppointmentReminder: handleSendAppointmentReminder,
        sendLowCreditsAlert: handleSendLowCreditsAlert,
        sendServiceConfirmation: handleSendServiceConfirmation
    };
};
