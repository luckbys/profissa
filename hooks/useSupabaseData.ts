import { useState, useEffect, useCallback, useRef } from 'react';
import { Client, Appointment, UserProfile } from '../types';
import { useAuth } from './useAuth';
import {
    syncClients,
    syncAppointments,
    syncProfile,
    syncExpenses,
    saveClientToSupabase,
    deleteClientFromSupabase,
    saveAppointmentToSupabase,
    deleteAppointmentFromSupabase,
    saveProfileToSupabase,
    saveExpenseToSupabase,
    deleteExpenseFromSupabase,
    performFullSync,
    getSyncStatus,
    setupRealtimeSync,
    cleanupRealtimeSync,
    SyncStatus,
    Expense
} from '../services/syncService';
import { isSupabaseConfigured } from '../services/supabaseClient';

// Storage keys for fallback
const STORAGE_KEYS = {
    clients: 'gerente_bolso_clients',
    appointments: 'gerente_bolso_appointments',
    profile: 'gerente_bolso_profile',
    expenses: 'gerente_bolso_expenses'
};

// Default profile
const DEFAULT_PROFILE: UserProfile = {
    name: '',
    profession: '',
    phone: '',
    email: '',
    logo: '',
    companyName: '',
    isPro: false,
    subscriptionStatus: 'free'
};

export const useSupabaseData = () => {
    const { user, isAuthenticated, isConfigured } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [userProfile, setUserProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>(getSyncStatus());
    const realtimeChannel = useRef<any>(null);

    // Monitor online status
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Trigger sync when coming back online
            if (user?.id) {
                performFullSync().then(setSyncStatus);
            }
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [user?.id]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);

            try {
                if (isConfigured && user?.id) {
                    // Load from Supabase
                    const [clientsData, appointmentsData, profileData, expensesData] = await Promise.all([
                        syncClients(user.id),
                        syncAppointments(user.id),
                        syncProfile(user.id),
                        syncExpenses(user.id)
                    ]);

                    setClients(clientsData);
                    setAppointments(appointmentsData);
                    setUserProfileState(profileData || DEFAULT_PROFILE);
                    setExpenses(expensesData);
                } else {
                    // Load from localStorage (offline mode)
                    const localClients = localStorage.getItem(STORAGE_KEYS.clients);
                    const localAppointments = localStorage.getItem(STORAGE_KEYS.appointments);
                    const localProfile = localStorage.getItem(STORAGE_KEYS.profile);
                    const localExpenses = localStorage.getItem(STORAGE_KEYS.expenses);

                    setClients(localClients ? JSON.parse(localClients) : []);
                    setAppointments(localAppointments ? JSON.parse(localAppointments) : []);
                    setUserProfileState(localProfile ? JSON.parse(localProfile) : DEFAULT_PROFILE);
                    setExpenses(localExpenses ? JSON.parse(localExpenses) : []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                // Fallback to localStorage
                const localClients = localStorage.getItem(STORAGE_KEYS.clients);
                const localAppointments = localStorage.getItem(STORAGE_KEYS.appointments);
                const localProfile = localStorage.getItem(STORAGE_KEYS.profile);

                setClients(localClients ? JSON.parse(localClients) : []);
                setAppointments(localAppointments ? JSON.parse(localAppointments) : []);
                setUserProfileState(localProfile ? JSON.parse(localProfile) : DEFAULT_PROFILE);
            } finally {
                setIsLoading(false);
            }
        };

        if (!isConfigured || isAuthenticated) {
            loadData();
        }
    }, [user?.id, isAuthenticated, isConfigured]);

    // Setup realtime sync
    useEffect(() => {
        if (isConfigured && user?.id && isOnline) {
            const handleDataChange = async () => {
                // Refetch data on remote changes
                const [clientsData, appointmentsData] = await Promise.all([
                    syncClients(user.id),
                    syncAppointments(user.id)
                ]);
                setClients(clientsData);
                setAppointments(appointmentsData);
            };

            realtimeChannel.current = setupRealtimeSync(user.id, handleDataChange);
        }

        return () => {
            if (realtimeChannel.current) {
                cleanupRealtimeSync(realtimeChannel.current);
            }
        };
    }, [user?.id, isConfigured, isOnline]);

    // ============= CLIENT OPERATIONS =============

    const addClient = useCallback(async (client: Client) => {
        console.log('[useSupabaseData] addClient called', {
            clientName: client.name,
            userId: user?.id,
            isConfigured,
            isAuthenticated
        });

        // Optimistic update
        setClients(prev => [...prev, client]);
        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify([...clients, client]));

        // Sync to Supabase
        if (user?.id) {
            await saveClientToSupabase(user.id, client);
        } else {
            console.warn('[useSupabaseData] No user.id available, data saved to localStorage only');
        }
    }, [clients, user?.id, isConfigured, isAuthenticated]);

    const updateClient = useCallback(async (updatedClient: Client) => {
        const newClients = clients.map(c => c.id === updatedClient.id ? updatedClient : c);
        setClients(newClients);
        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(newClients));

        if (user?.id) {
            await saveClientToSupabase(user.id, updatedClient);
        }
    }, [clients, user?.id]);

    const removeClient = useCallback(async (clientId: string) => {
        const newClients = clients.filter(c => c.id !== clientId);
        setClients(newClients);
        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(newClients));

        await deleteClientFromSupabase(clientId);
    }, [clients]);

    // ============= APPOINTMENT OPERATIONS =============

    const addAppointment = useCallback(async (appointment: Appointment) => {
        setAppointments(prev => [...prev, appointment]);
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify([...appointments, appointment]));

        if (user?.id) {
            await saveAppointmentToSupabase(user.id, appointment);
        }
    }, [appointments, user?.id]);

    const updateAppointment = useCallback(async (updatedAppointment: Appointment) => {
        const newAppointments = appointments.map(a => a.id === updatedAppointment.id ? updatedAppointment : a);
        setAppointments(newAppointments);
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(newAppointments));

        if (user?.id) {
            await saveAppointmentToSupabase(user.id, updatedAppointment);
        }
    }, [appointments, user?.id]);

    const toggleAppointmentStatus = useCallback(async (appointmentId: string) => {
        const appointment = appointments.find(a => a.id === appointmentId);
        if (!appointment) return;

        const newStatus = appointment.status === 'completed' ? 'pending' : 'completed';
        const updatedAppointment = { ...appointment, status: newStatus as 'pending' | 'completed' };

        await updateAppointment(updatedAppointment);
    }, [appointments, updateAppointment]);

    const removeAppointment = useCallback(async (appointmentId: string) => {
        const newAppointments = appointments.filter(a => a.id !== appointmentId);
        setAppointments(newAppointments);
        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(newAppointments));

        await deleteAppointmentFromSupabase(appointmentId);
    }, [appointments]);

    // ============= PROFILE OPERATIONS =============

    const setUserProfile = useCallback(async (profile: UserProfile) => {
        setUserProfileState(profile);
        localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));

        if (user?.id) {
            await saveProfileToSupabase(user.id, profile);
        }
    }, [user?.id]);

    // ============= EXPENSE OPERATIONS =============

    const addExpense = useCallback(async (expense: Expense) => {
        setExpenses(prev => [...prev, expense]);
        localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify([...expenses, expense]));

        if (user?.id) {
            await saveExpenseToSupabase(user.id, expense);
        }
    }, [expenses, user?.id]);

    const removeExpense = useCallback(async (expenseId: string) => {
        const newExpenses = expenses.filter(e => e.id !== expenseId);
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(newExpenses));

        await deleteExpenseFromSupabase(expenseId);
    }, [expenses]);

    // ============= SYNC OPERATIONS =============

    const forceSync = useCallback(async () => {
        if (!user?.id) return;

        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
        const status = await performFullSync();
        setSyncStatus(status);

        // Reload data
        const [clientsData, appointmentsData, profileData, expensesData] = await Promise.all([
            syncClients(user.id),
            syncAppointments(user.id),
            syncProfile(user.id),
            syncExpenses(user.id)
        ]);

        setClients(clientsData);
        setAppointments(appointmentsData);
        setUserProfileState(profileData || DEFAULT_PROFILE);
        setExpenses(expensesData);
    }, [user?.id]);

    return {
        // Data
        clients,
        appointments,
        userProfile,
        expenses,

        // State
        isLoading,
        isOnline,
        syncStatus,

        // Client operations
        addClient,
        updateClient,
        removeClient,

        // Appointment operations
        addAppointment,
        updateAppointment,
        toggleAppointmentStatus,
        removeAppointment,

        // Profile operations
        setUserProfile,

        // Expense operations
        addExpense,
        removeExpense,

        // Sync operations
        forceSync
    };
};
