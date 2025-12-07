// Notification Types

export interface NotificationSettings {
    enabled: boolean;
    appointmentReminders: boolean;
    lowCreditsAlert: boolean;
    serviceConfirmation: boolean;
    reminderTime: string; // HH:mm format
}

export interface AppNotification {
    id: string;
    type: 'appointment' | 'credits' | 'confirmation' | 'general';
    title: string;
    body: string;
    timestamp: string;
    read: boolean;
    data?: Record<string, unknown>;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    enabled: false,
    appointmentReminders: true,
    lowCreditsAlert: true,
    serviceConfirmation: true,
    reminderTime: '08:00'
};
