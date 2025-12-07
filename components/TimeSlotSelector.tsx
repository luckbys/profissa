import React, { useMemo } from 'react';
import { Appointment } from '../types';
import {
    getSuggestedSlots,
    getAvailableSlots,
    getBusySlots,
    getWorkSchedule
} from '../utils/scheduleUtils';
import { Clock, Zap, Calendar, Check, X } from 'lucide-react';

interface TimeSlotSelectorProps {
    date: string;
    selectedTime: string;
    appointments: Appointment[];
    onSelectTime: (time: string) => void;
    showSuggestions?: boolean;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    date,
    selectedTime,
    appointments,
    onSelectTime,
    showSuggestions = true
}) => {
    const schedule = getWorkSchedule();

    // Get available and busy slots for selected date
    const { availableSlots, busySlots } = useMemo(() => {
        if (!date) {
            return { availableSlots: [], busySlots: [] };
        }
        return {
            availableSlots: getAvailableSlots(date, appointments, schedule),
            busySlots: getBusySlots(date, appointments, schedule)
        };
    }, [date, appointments, schedule]);

    // Get smart suggestions (next available slots)
    const suggestions = useMemo(() => {
        return getSuggestedSlots(appointments, schedule, 3);
    }, [appointments, schedule]);

    if (!date) {
        return (
            <div className="space-y-3">
                {/* Smart Suggestions when no date selected */}
                {showSuggestions && suggestions.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-amber-500" />
                            <span className="text-xs font-bold text-gray-500 uppercase">Sugestões Inteligentes</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => onSelectTime(suggestion.time)}
                                    className="px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                                >
                                    {suggestion.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Quick Time Selection */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-brand-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Horários Disponíveis</span>
                    </div>
                    <span className="text-xs text-gray-400">
                        {availableSlots.length} vagas
                    </span>
                </div>

                {availableSlots.length === 0 ? (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center">
                        <X size={16} className="inline mr-1" />
                        Sem horários disponíveis nesta data
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2">
                        {availableSlots.slice(0, 12).map(time => (
                            <button
                                key={time}
                                type="button"
                                onClick={() => onSelectTime(time)}
                                className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${selectedTime === time
                                        ? 'bg-brand-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-600'
                                    }`}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                )}

                {availableSlots.length > 12 && (
                    <p className="text-xs text-gray-400 text-center mt-2">
                        +{availableSlots.length - 12} horários disponíveis
                    </p>
                )}
            </div>

            {/* Busy Slots Indicator */}
            {busySlots.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={14} className="text-red-500" />
                        <span className="text-xs font-bold text-gray-500 uppercase">Horários Ocupados</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {busySlots.map((slot, idx) => (
                            <div
                                key={idx}
                                className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-xs flex items-center gap-1"
                            >
                                <span className="font-semibold">{slot.time}</span>
                                <span className="text-red-400">• {slot.service}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-400 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-100 rounded" />
                    <span>Disponível</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-brand-600 rounded" />
                    <span>Selecionado</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 rounded" />
                    <span>Ocupado</span>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotSelector;
