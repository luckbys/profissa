// Booking Service - Handles public booking page and link generation

import { getWorkSchedule, WorkSchedule, DEFAULT_WORK_SCHEDULE, getAvailableSlots } from '../utils/scheduleUtils';
import { Appointment } from '../types';

const BOOKING_CONFIG_KEY = 'gerente_bolso_booking_config';

export interface BookingConfig {
    isEnabled: boolean;
    professionalName: string;
    profession: string;
    phone: string; // WhatsApp number
    services: { name: string; duration: number; price: number }[];
    welcomeMessage?: string;
}

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
    isEnabled: false,
    professionalName: '',
    profession: '',
    phone: '',
    services: [],
    welcomeMessage: 'Olá! Gostaria de agendar um horário.'
};

// Get booking config from localStorage
export const getBookingConfig = (): BookingConfig => {
    try {
        const data = localStorage.getItem(BOOKING_CONFIG_KEY);
        return data ? { ...DEFAULT_BOOKING_CONFIG, ...JSON.parse(data) } : DEFAULT_BOOKING_CONFIG;
    } catch {
        return DEFAULT_BOOKING_CONFIG;
    }
};

// Save booking config
export const saveBookingConfig = (config: BookingConfig): void => {
    localStorage.setItem(BOOKING_CONFIG_KEY, JSON.stringify(config));
};

// Generate shareable booking link
// Since this is client-side only, we encode the config in the URL
export const generateBookingLink = (): string => {
    const config = getBookingConfig();
    const schedule = getWorkSchedule();

    const payload = {
        n: config.professionalName,
        p: config.profession,
        ph: config.phone,
        s: config.services.map(s => ({ n: s.name, d: s.duration, p: s.price })),
        w: schedule.workDays,
        sh: schedule.startHour,
        eh: schedule.endHour,
        sd: schedule.slotDuration
    };

    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?booking=${encoded}`;
};

// Parse booking link data
export const parseBookingLink = (encodedData: string): { config: BookingConfig; schedule: WorkSchedule } | null => {
    try {
        const decoded = JSON.parse(decodeURIComponent(atob(encodedData)));
        return {
            config: {
                isEnabled: true,
                professionalName: decoded.n || '',
                profession: decoded.p || '',
                phone: decoded.ph || '',
                services: (decoded.s || []).map((s: any) => ({
                    name: s.n,
                    duration: s.d,
                    price: s.p
                })),
                welcomeMessage: ''
            },
            schedule: {
                workDays: decoded.w || DEFAULT_WORK_SCHEDULE.workDays,
                startHour: decoded.sh || DEFAULT_WORK_SCHEDULE.startHour,
                endHour: decoded.eh || DEFAULT_WORK_SCHEDULE.endHour,
                slotDuration: decoded.sd || DEFAULT_WORK_SCHEDULE.slotDuration
            }
        };
    } catch {
        return null;
    }
};

// Generate WhatsApp booking request message
export const generateBookingMessage = (
    professionalName: string,
    service: string,
    date: string,
    time: string,
    clientName: string
): string => {
    const dateFormatted = new Date(date).toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return `Olá ${professionalName}! 👋

Gostaria de agendar um horário:

📋 *Serviço*: ${service}
📅 *Data*: ${dateFormatted}
⏰ *Horário*: ${time}
👤 *Meu nome*: ${clientName}

Aguardo confirmação! 🙏`;
};

// Open WhatsApp with booking request
export const sendBookingRequest = (
    phone: string,
    message: string
): void => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
};
