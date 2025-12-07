// Work Schedule Types and Utilities

import { Appointment } from '../types';

export interface WorkSchedule {
    startHour: number; // e.g., 8 for 8:00
    endHour: number;   // e.g., 18 for 18:00
    slotDuration: number; // in minutes, e.g., 60
    workDays: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export const DEFAULT_WORK_SCHEDULE: WorkSchedule = {
    startHour: 8,
    endHour: 18,
    slotDuration: 60,
    workDays: [1, 2, 3, 4, 5, 6] // Monday to Saturday
};

const SCHEDULE_KEY = 'gerente_bolso_schedule';

// Get work schedule from localStorage
export const getWorkSchedule = (): WorkSchedule => {
    try {
        const data = localStorage.getItem(SCHEDULE_KEY);
        return data ? JSON.parse(data) : DEFAULT_WORK_SCHEDULE;
    } catch {
        return DEFAULT_WORK_SCHEDULE;
    }
};

// Save work schedule
export const saveWorkSchedule = (schedule: WorkSchedule): void => {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
};

// Generate time slots for a given date
export const generateTimeSlots = (date: Date, schedule: WorkSchedule): string[] => {
    const slots: string[] = [];

    for (let hour = schedule.startHour; hour < schedule.endHour; hour++) {
        for (let minute = 0; minute < 60; minute += schedule.slotDuration) {
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeStr);
        }
    }

    return slots;
};

// Check if a time slot is busy
export const isSlotBusy = (
    date: string,
    time: string,
    appointments: Appointment[],
    durationMinutes: number = 60
): boolean => {
    const slotStart = new Date(`${date}T${time}`);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

    return appointments.some(apt => {
        if (apt.status === 'cancelled') return false;

        const aptStart = new Date(apt.date);
        const aptEnd = new Date(aptStart.getTime() + durationMinutes * 60 * 1000);

        // Check for overlap
        return (slotStart < aptEnd && slotEnd > aptStart);
    });
};

// Get available time slots for a date
export const getAvailableSlots = (
    date: string,
    appointments: Appointment[],
    schedule: WorkSchedule = DEFAULT_WORK_SCHEDULE
): string[] => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    // Check if it's a work day
    if (!schedule.workDays.includes(dayOfWeek)) {
        return [];
    }

    const allSlots = generateTimeSlots(dateObj, schedule);

    // Filter out busy slots and past times
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    return allSlots.filter(time => {
        // If it's today, filter out past times
        if (date === today) {
            const slotTime = new Date(`${date}T${time}`);
            if (slotTime <= now) return false;
        }

        return !isSlotBusy(date, time, appointments, schedule.slotDuration);
    });
};

// Get suggested time slots (next 3 available)
export const getSuggestedSlots = (
    appointments: Appointment[],
    schedule: WorkSchedule = DEFAULT_WORK_SCHEDULE,
    count: number = 3
): { date: string; time: string; label: string }[] => {
    const suggestions: { date: string; time: string; label: string }[] = [];
    let currentDate = new Date();
    let daysChecked = 0;
    const maxDays = 14; // Look up to 2 weeks ahead

    while (suggestions.length < count && daysChecked < maxDays) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const availableSlots = getAvailableSlots(dateStr, appointments, schedule);

        for (const time of availableSlots) {
            if (suggestions.length >= count) break;

            const dateLabel = getDateLabel(currentDate);
            suggestions.push({
                date: dateStr,
                time,
                label: `${dateLabel} às ${time}`
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
        daysChecked++;
    }

    return suggestions;
};

// Get human-readable date label
const getDateLabel = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dateStr = date.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Hoje';
    if (dateStr === tomorrowStr) return 'Amanhã';

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Check if day is a work day
export const isWorkDay = (date: Date, schedule: WorkSchedule = DEFAULT_WORK_SCHEDULE): boolean => {
    return schedule.workDays.includes(date.getDay());
};

// Get busy slots for a date (for visualization)
export const getBusySlots = (
    date: string,
    appointments: Appointment[],
    schedule: WorkSchedule = DEFAULT_WORK_SCHEDULE
): { time: string; service: string; clientName?: string }[] => {
    return appointments
        .filter(apt => {
            if (apt.status === 'cancelled') return false;
            const aptDate = new Date(apt.date).toISOString().split('T')[0];
            return aptDate === date;
        })
        .map(apt => ({
            time: new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            service: apt.service
        }))
        .sort((a, b) => a.time.localeCompare(b.time));
};
