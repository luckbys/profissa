import { NotificationSettings, AppNotification, DEFAULT_NOTIFICATION_SETTINGS } from '../types/notifications';

const SETTINGS_KEY = 'gerente_bolso_notification_settings';
const NOTIFICATIONS_KEY = 'gerente_bolso_notifications';

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
    return 'Notification' in window && 'serviceWorker' in navigator;
};

// Get current permission status
export const getNotificationPermission = (): NotificationPermission => {
    if (!isNotificationSupported()) return 'denied';
    return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) {
        console.warn('Notifications not supported in this browser');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

// Send a browser notification
export const sendNotification = (
    title: string,
    options?: NotificationOptions
): Notification | null => {
    if (getNotificationPermission() !== 'granted') {
        console.warn('Notification permission not granted');
        return null;
    }

    try {
        const notification = new Notification(title, {
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            vibrate: [200, 100, 200],
            ...options
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        return notification;
    } catch (error) {
        console.error('Error sending notification:', error);
        return null;
    }
};

// Notification Settings management
export const getNotificationSettings = (): NotificationSettings => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (!data) {
            saveNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
            return DEFAULT_NOTIFICATION_SETTINGS;
        }
        return JSON.parse(data);
    } catch {
        return DEFAULT_NOTIFICATION_SETTINGS;
    }
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save notification settings:', error);
    }
};

// In-app notifications storage
export const getStoredNotifications = (): AppNotification[] => {
    try {
        const data = localStorage.getItem(NOTIFICATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

export const saveNotification = (notification: AppNotification): void => {
    try {
        const existing = getStoredNotifications();
        const updated = [notification, ...existing].slice(0, 50); // Keep last 50
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to save notification:', error);
    }
};

export const markNotificationAsRead = (id: string): void => {
    try {
        const notifications = getStoredNotifications();
        const updated = notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        );
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
};

export const clearAllNotifications = (): void => {
    try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    } catch (error) {
        console.error('Failed to clear notifications:', error);
    }
};

// Specific notification types
export const sendAppointmentReminder = (
    clientName: string,
    service: string,
    time: string
): void => {
    const title = '📅 Lembrete de Agendamento';
    const body = `${clientName} - ${service} às ${time}`;

    sendNotification(title, { body, tag: 'appointment-reminder' });

    saveNotification({
        id: Date.now().toString(),
        type: 'appointment',
        title,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        data: { clientName, service, time }
    });
};

export const sendLowCreditsAlert = (remaining: number): void => {
    const title = '⚠️ Créditos Baixos';
    const body = `Você tem apenas ${remaining} crédito${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}. Faça upgrade para Pro!`;

    sendNotification(title, { body, tag: 'low-credits' });

    saveNotification({
        id: Date.now().toString(),
        type: 'credits',
        title,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        data: { remaining }
    });
};

export const sendServiceConfirmation = (
    clientName: string,
    service: string,
    total: number
): void => {
    const title = '✅ Serviço Registrado';
    const body = `${service} para ${clientName} - R$ ${total.toFixed(2)}`;

    sendNotification(title, { body, tag: 'service-confirmation' });

    saveNotification({
        id: Date.now().toString(),
        type: 'confirmation',
        title,
        body,
        timestamp: new Date().toISOString(),
        read: false,
        data: { clientName, service, total }
    });
};

// Check and send daily appointment reminders
export const checkDailyAppointments = (
    appointments: Array<{ clientName: string; service: string; date: string }>
): void => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !settings.appointmentReminders) return;

    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(
        apt => new Date(apt.date).toDateString() === today
    );

    todayAppointments.forEach(apt => {
        const time = new Date(apt.date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        sendAppointmentReminder(apt.clientName, apt.service, time);
    });
};

// Check and alert low credits
export const checkLowCredits = (credits: number): void => {
    const settings = getNotificationSettings();
    if (!settings.enabled || !settings.lowCreditsAlert) return;

    if (credits <= 2 && credits > 0) {
        sendLowCreditsAlert(credits);
    }
};
