// Booking Service - Handles public booking page and link generation

import { getWorkSchedule, WorkSchedule, DEFAULT_WORK_SCHEDULE, getAvailableSlots } from '../utils/scheduleUtils';
import { Appointment } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const BOOKING_CONFIG_KEY = 'gerente_bolso_booking_config';

export interface BookingConfig {
    isEnabled: boolean;
    professionalName: string;
    profession: string;
    phone: string; // WhatsApp number
    services: { name: string; duration: number; price: number }[];
    welcomeMessage?: string;
    slug?: string;
}

export const DEFAULT_BOOKING_CONFIG: BookingConfig = {
    isEnabled: false,
    professionalName: '',
    profession: '',
    phone: '',
    services: [],
    welcomeMessage: 'Olá! Gostaria de agendar um horário.',
    slug: ''
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

// Save booking config locally
export const saveBookingConfig = (config: BookingConfig): void => {
    localStorage.setItem(BOOKING_CONFIG_KEY, JSON.stringify(config));
};

// Save booking config to Supabase for friendly URL
export const publishBookingConfig = async (userId: string, config: BookingConfig): Promise<string | null> => {
    if (!isSupabaseConfigured() || !config.slug) return null;

    const schedule = getWorkSchedule();
    
    try {
        const { error } = await supabase
            .from('public_booking_configs')
            .upsert({
                user_id: userId,
                slug: config.slug.toLowerCase().trim(),
                config: config,
                schedule: schedule,
                is_enabled: config.isEnabled,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        
        const baseUrl = window.location.origin;
        return `${baseUrl}/b/${config.slug.toLowerCase().trim()}`;
    } catch (error) {
        console.error('Error publishing booking config:', error);
        return null;
    }
};

// Fetch booking config by slug
export const fetchBookingBySlug = async (slug: string): Promise<{ config: BookingConfig; schedule: WorkSchedule } | null> => {
    if (!isSupabaseConfigured()) return null;

    try {
        const { data, error } = await supabase
            .from('public_booking_configs')
            .select('config, schedule')
            .eq('slug', slug.toLowerCase().trim())
            .eq('is_enabled', true)
            .single();

        if (error) throw error;
        if (!data) return null;

        return {
            config: data.config,
            schedule: data.schedule
        };
    } catch (error) {
        console.error('Error fetching booking by slug:', error);
        return null;
    }
};

// Generate shareable booking link
export const generateBookingLink = (config: BookingConfig): string => {
    const baseUrl = window.location.origin;
    if (config.slug) {
        return `${baseUrl}/b/${config.slug.toLowerCase().trim()}`;
    }
    
    // Fallback to legacy encoded link
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
