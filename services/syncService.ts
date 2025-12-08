import { supabase, isSupabaseConfigured, getCurrentUser } from './supabaseClient';
import { Client, Appointment, UserProfile } from '../types';

// Storage keys
const STORAGE_KEYS = {
    clients: 'gerente_bolso_clients',
    appointments: 'gerente_bolso_appointments',
    profile: 'gerente_bolso_profile',
    documents: 'gerente_bolso_documents',
    expenses: 'gerente_bolso_expenses',
    goals: 'gerente_bolso_goals',
    syncQueue: 'profissa_sync_queue',
    lastSync: 'profissa_last_sync'
};

// Sync status
export interface SyncStatus {
    isSyncing: boolean;
    lastSyncAt: string | null;
    pendingChanges: number;
    error: string | null;
}

// Sync queue item for offline changes
interface SyncQueueItem {
    id: string;
    table: string;
    operation: 'insert' | 'update' | 'delete';
    data: any;
    timestamp: string;
}

// Get sync queue from localStorage
const getSyncQueue = (): SyncQueueItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.syncQueue);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Save sync queue to localStorage
const saveSyncQueue = (queue: SyncQueueItem[]): void => {
    localStorage.setItem(STORAGE_KEYS.syncQueue, JSON.stringify(queue));
};

// Add item to sync queue (for offline changes)
export const addToSyncQueue = (table: string, operation: 'insert' | 'update' | 'delete', data: any): void => {
    const queue = getSyncQueue();
    queue.push({
        id: crypto.randomUUID(),
        table,
        operation,
        data,
        timestamp: new Date().toISOString()
    });
    saveSyncQueue(queue);
};

// Clear processed items from queue
const removeFromSyncQueue = (id: string): void => {
    const queue = getSyncQueue().filter(item => item.id !== id);
    saveSyncQueue(queue);
};

// ============= CLIENTS SYNC =============

export const syncClients = async (userId: string): Promise<Client[]> => {
    if (!isSupabaseConfigured()) {
        // Return local data if Supabase not configured
        const localData = localStorage.getItem(STORAGE_KEYS.clients);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        // Fetch from Supabase
        const { data: remoteClients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        // Transform to local format
        const clients: Client[] = (remoteClients || []).map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email || '',
            address: c.address || '',
            notes: c.notes || '',
            tags: c.tags || [],
            birthday: c.birthday || ''
        }));

        // Save to localStorage for offline access
        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));

        return clients;
    } catch (error) {
        console.error('Error syncing clients:', error);
        // Return local data on error
        const localData = localStorage.getItem(STORAGE_KEYS.clients);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveClientToSupabase = async (userId: string, client: Client): Promise<void> => {
    console.log('[Sync] saveClientToSupabase called', {
        userId,
        clientId: client.id,
        isConfigured: isSupabaseConfigured()
    });

    if (!isSupabaseConfigured()) {
        console.warn('[Sync] Supabase not configured, adding to sync queue');
        addToSyncQueue('clients', 'insert', { userId, client });
        return;
    }

    try {
        console.log('[Sync] Sending client to Supabase...');
        const { data, error } = await supabase.from('clients').upsert({
            id: client.id,
            user_id: userId,
            name: client.name,
            phone: client.phone,
            email: client.email || null,
            address: client.address || null,
            notes: client.notes || null,
            tags: client.tags || [],
            birthday: client.birthday || null
        }).select();

        if (error) {
            console.error('[Sync] Supabase error:', error);
            throw error;
        }

        console.log('[Sync] Client saved successfully:', data);
    } catch (error) {
        console.error('[Sync] Error saving client to Supabase:', error);
        addToSyncQueue('clients', 'insert', { userId, client });
    }
};

export const deleteClientFromSupabase = async (clientId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('clients', 'delete', { clientId });
        return;
    }

    try {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting client from Supabase:', error);
        addToSyncQueue('clients', 'delete', { clientId });
    }
};

// ============= APPOINTMENTS SYNC =============

export const syncAppointments = async (userId: string): Promise<Appointment[]> => {
    if (!isSupabaseConfigured()) {
        const localData = localStorage.getItem(STORAGE_KEYS.appointments);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        const { data: remoteAppointments, error } = await supabase
            .from('appointments')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const appointments: Appointment[] = (remoteAppointments || []).map(a => ({
            id: a.id,
            clientId: a.client_id || '',
            date: a.date, // Full datetime stored in date column
            service: a.service,
            price: Number(a.price) || 0,
            status: a.status as 'pending' | 'completed' | 'cancelled'
        }));

        localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));

        return appointments;
    } catch (error) {
        console.error('Error syncing appointments:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.appointments);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveAppointmentToSupabase = async (userId: string, appointment: Appointment): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('appointments', 'insert', { userId, appointment });
        return;
    }

    try {
        const { error } = await supabase.from('appointments').upsert({
            id: appointment.id,
            user_id: userId,
            client_id: appointment.clientId || null,
            date: appointment.date, // Full datetime stored in date column
            service: appointment.service,
            price: appointment.price,
            status: appointment.status
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving appointment to Supabase:', error);
        addToSyncQueue('appointments', 'insert', { userId, appointment });
    }
};

export const deleteAppointmentFromSupabase = async (appointmentId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('appointments', 'delete', { appointmentId });
        return;
    }

    try {
        const { error } = await supabase.from('appointments').delete().eq('id', appointmentId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting appointment:', error);
        addToSyncQueue('appointments', 'delete', { appointmentId });
    }
};

// ============= PROFILE SYNC =============

export const syncProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured()) {
        const localData = localStorage.getItem(STORAGE_KEYS.profile);
        return localData ? JSON.parse(localData) : null;
    }

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (profile) {
            const userProfile: UserProfile = {
                name: profile.name || '',
                profession: profile.profession || '',
                phone: profile.phone || '',
                email: profile.email || '',
                logo: profile.logo || '',
                companyName: profile.company_name || '',
                isPro: profile.is_pro || false,
                subscriptionStatus: profile.subscription_status || 'free'
            };

            localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile));
            return userProfile;
        }

        return null;
    } catch (error) {
        console.error('Error syncing profile:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.profile);
        return localData ? JSON.parse(localData) : null;
    }
};

export const saveProfileToSupabase = async (userId: string, profile: UserProfile): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('profiles', 'update', { userId, profile });
        return;
    }

    try {
        // Check if profile exists first
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (existingProfile) {
            const { error } = await supabase.from('profiles').update({
                name: profile.name,
                profession: profile.profession,
                phone: profile.phone,
                email: profile.email,
                logo: profile.logo,
                company_name: profile.companyName,
                is_pro: profile.isPro,
                subscription_status: profile.subscriptionStatus,
                updated_at: new Date().toISOString()
            }).eq('user_id', userId);
            
            if (error) throw error;
        } else {
            const { error } = await supabase.from('profiles').insert({
                user_id: userId,
                name: profile.name,
                profession: profile.profession,
                phone: profile.phone,
                email: profile.email,
                logo: profile.logo,
                company_name: profile.companyName,
                is_pro: profile.isPro,
                subscription_status: profile.subscriptionStatus,
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
        }

        if (error) throw error;
    } catch (error) {
        console.error('Error saving profile to Supabase:', error);
        addToSyncQueue('profiles', 'update', { userId, profile });
    }
};

// ============= EXPENSES SYNC =============

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
}

export const syncExpenses = async (userId: string): Promise<Expense[]> => {
    if (!isSupabaseConfigured()) {
        const localData = localStorage.getItem(STORAGE_KEYS.expenses);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        const { data: remoteExpenses, error } = await supabase
            .from('expenses')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const expenses: Expense[] = (remoteExpenses || []).map(e => ({
            id: e.id,
            description: e.description,
            amount: Number(e.amount),
            date: e.date,
            category: e.category
        }));

        localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses));
        return expenses;
    } catch (error) {
        console.error('Error syncing expenses:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.expenses);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveExpenseToSupabase = async (userId: string, expense: Expense): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('expenses', 'insert', { userId, expense });
        return;
    }

    try {
        const { error } = await supabase.from('expenses').upsert({
            id: expense.id,
            user_id: userId,
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
            category: expense.category
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving expense to Supabase:', error);
        addToSyncQueue('expenses', 'insert', { userId, expense });
    }
};

export const deleteExpenseFromSupabase = async (expenseId: string): Promise<void> => {
    if (!isSupabaseConfigured()) {
        addToSyncQueue('expenses', 'delete', { expenseId });
        return;
    }

    try {
        const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting expense:', error);
        addToSyncQueue('expenses', 'delete', { expenseId });
    }
};

// ============= FULL SYNC =============

export const performFullSync = async (): Promise<SyncStatus> => {
    const status: SyncStatus = {
        isSyncing: true,
        lastSyncAt: null,
        pendingChanges: getSyncQueue().length,
        error: null
    };

    try {
        const user = await getCurrentUser();
        if (!user) {
            return { ...status, isSyncing: false, error: 'Not authenticated' };
        }

        // Process sync queue first (offline changes)
        await processSyncQueue(user.id);

        // Then sync all data
        await Promise.all([
            syncClients(user.id),
            syncAppointments(user.id),
            syncProfile(user.id),
            syncExpenses(user.id)
        ]);

        const lastSyncAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.lastSync, lastSyncAt);

        return {
            isSyncing: false,
            lastSyncAt,
            pendingChanges: 0,
            error: null
        };
    } catch (error: any) {
        console.error('Full sync error:', error);
        return {
            ...status,
            isSyncing: false,
            error: error.message || 'Sync failed'
        };
    }
};

// Process offline changes queue
const processSyncQueue = async (userId: string): Promise<void> => {
    const queue = getSyncQueue();

    for (const item of queue) {
        try {
            switch (item.table) {
                case 'clients':
                    if (item.operation === 'delete') {
                        await deleteClientFromSupabase(item.data.clientId);
                    } else {
                        await saveClientToSupabase(userId, item.data.client);
                    }
                    break;
                case 'appointments':
                    if (item.operation === 'delete') {
                        await deleteAppointmentFromSupabase(item.data.appointmentId);
                    } else {
                        await saveAppointmentToSupabase(userId, item.data.appointment);
                    }
                    break;
                case 'profiles':
                    await saveProfileToSupabase(userId, item.data.profile);
                    break;
                case 'expenses':
                    if (item.operation === 'delete') {
                        await deleteExpenseFromSupabase(item.data.expenseId);
                    } else {
                        await saveExpenseToSupabase(userId, item.data.expense);
                    }
                    break;
            }
            removeFromSyncQueue(item.id);
        } catch (error) {
            console.error('Error processing sync queue item:', error);
            // Leave item in queue to retry later
        }
    }
};

// Get current sync status
export const getSyncStatus = (): SyncStatus => {
    const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
    const queue = getSyncQueue();

    return {
        isSyncing: false,
        lastSyncAt: lastSync,
        pendingChanges: queue.length,
        error: null
    };
};

// Setup real-time subscription for changes
export const setupRealtimeSync = (userId: string, onDataChange: () => void) => {
    if (!isSupabaseConfigured()) return null;

    const channel = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'clients', filter: `user_id=eq.${userId}` }, onDataChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `user_id=eq.${userId}` }, onDataChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${userId}` }, onDataChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${userId}` }, onDataChange)
        .subscribe();

    return channel;
};

export const cleanupRealtimeSync = (channel: any) => {
    if (channel) {
        supabase.removeChannel(channel);
    }
};
