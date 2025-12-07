import { useState, useEffect, useCallback } from 'react';
import { Client, Appointment, UserProfile } from '../types';
import {
    initDB,
    getAll,
    addItem,
    updateItem,
    deleteItem,
    getProfile,
    saveProfile,
    bulkInsert
} from '../services/storageService';

const DEFAULT_PROFILE: UserProfile = {
    name: 'Meu Nome',
    profession: 'Minha Profissão',
    phone: '(00) 00000-0000',
    email: 'email@exemplo.com'
};

interface UseLocalDataReturn {
    clients: Client[];
    appointments: Appointment[];
    userProfile: UserProfile;
    isLoading: boolean;
    isOnline: boolean;
    // Client operations
    addClient: (client: Client) => Promise<void>;
    updateClient: (client: Client) => Promise<void>;
    removeClient: (id: string) => Promise<void>;
    // Appointment operations
    addAppointment: (appointment: Appointment) => Promise<void>;
    updateAppointment: (appointment: Appointment) => Promise<void>;
    removeAppointment: (id: string) => Promise<void>;
    toggleAppointmentStatus: (id: string) => Promise<void>;
    // Profile operations
    setUserProfile: (profile: UserProfile) => void;
}

export const useLocalData = (): UseLocalDataReturn => {
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [userProfile, setUserProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Load data from IndexedDB on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                await initDB();

                const [loadedClients, loadedAppointments] = await Promise.all([
                    getAll('clients'),
                    getAll('appointments')
                ]);

                setClients(loadedClients);
                setAppointments(loadedAppointments);

                // Load profile from localStorage
                const savedProfile = getProfile();
                if (savedProfile) {
                    setUserProfileState(savedProfile);
                }
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Client operations
    const addClient = useCallback(async (client: Client) => {
        await addItem('clients', client);
        setClients(prev => [...prev, client]);
    }, []);

    const updateClient = useCallback(async (client: Client) => {
        await updateItem('clients', client);
        setClients(prev => prev.map(c => c.id === client.id ? client : c));
    }, []);

    const removeClient = useCallback(async (id: string) => {
        await deleteItem('clients', id);
        setClients(prev => prev.filter(c => c.id !== id));
    }, []);

    // Appointment operations
    const addAppointment = useCallback(async (appointment: Appointment) => {
        await addItem('appointments', appointment);
        setAppointments(prev => [...prev, appointment]);
    }, []);

    const updateAppointment = useCallback(async (appointment: Appointment) => {
        await updateItem('appointments', appointment);
        setAppointments(prev => prev.map(a => a.id === appointment.id ? appointment : a));
    }, []);

    const removeAppointment = useCallback(async (id: string) => {
        await deleteItem('appointments', id);
        setAppointments(prev => prev.filter(a => a.id !== id));
    }, []);

    const toggleAppointmentStatus = useCallback(async (id: string) => {
        const appointment = appointments.find(a => a.id === id);
        if (appointment) {
            const updated: Appointment = {
                ...appointment,
                status: appointment.status === 'pending' ? 'completed' : 'pending'
            };
            await updateItem('appointments', updated);
            setAppointments(prev => prev.map(a => a.id === id ? updated : a));
        }
    }, [appointments]);

    // Profile operations
    const setUserProfile = useCallback((profile: UserProfile) => {
        saveProfile(profile);
        setUserProfileState(profile);
    }, []);

    return {
        clients,
        appointments,
        userProfile,
        isLoading,
        isOnline,
        addClient,
        updateClient,
        removeClient,
        addAppointment,
        updateAppointment,
        removeAppointment,
        toggleAppointmentStatus,
        setUserProfile
    };
};
