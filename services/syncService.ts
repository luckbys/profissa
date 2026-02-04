import { supabase, isSupabaseConfigured, getCurrentUser } from './supabaseClient';
import { Client, Appointment, UserProfile, ServiceTemplate } from '../types';

// Storage keys
const STORAGE_KEYS = {
    clients: 'gerente_bolso_clients',
    appointments: 'gerente_bolso_appointments',
    profile: 'gerente_bolso_profile',
    documents: 'gerente_bolso_documents',
    expenses: 'gerente_bolso_expenses',
    goals: 'gerente_bolso_goals',
    templates: 'gerente_bolso_service_templates',
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
        const localData = localStorage.getItem(STORAGE_KEYS.clients);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        const { data: remoteClients, error } = await supabase
            .from('clients')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

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

        localStorage.setItem(STORAGE_KEYS.clients, JSON.stringify(clients));
        return clients;
    } catch (error) {
        console.error('Error syncing clients:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.clients);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveClientToSupabase = async (userId: string, client: Client): Promise<void> => {
    // Ensure we have a valid UUID
    let clientToSave = { ...client };
    if (!isValidUUID(clientToSave.id)) {
        console.warn('Invalid UUID detected for client, generating new one for sync:', clientToSave.id);
        clientToSave.id = crypto.randomUUID();
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('clients', 'insert', { userId, client: clientToSave });
        return;
    }

    try {
        const { error } = await supabase.from('clients').upsert({
            id: clientToSave.id,
            user_id: userId,
            name: clientToSave.name,
            phone: clientToSave.phone,
            email: clientToSave.email || null,
            address: clientToSave.address || null,
            notes: clientToSave.notes || null,
            tags: clientToSave.tags || [],
            birthday: clientToSave.birthday || null
        }).select();

        if (error) throw error;
    } catch (error) {
        console.error('Error saving client to Supabase:', error);
        addToSyncQueue('clients', 'insert', { userId, client: clientToSave });
    }
};

export const deleteClientFromSupabase = async (clientId: string): Promise<void> => {
    if (!isValidUUID(clientId)) {
        console.warn('Skipping deletion of non-UUID client:', clientId);
        return;
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('clients', 'delete', { clientId });
        return;
    }

    try {
        const { error } = await supabase.from('clients').delete().eq('id', clientId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting client:', error);
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
            date: a.date,
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
    // Ensure we have a valid UUID
    let appointmentToSave = { ...appointment };
    if (!isValidUUID(appointmentToSave.id)) {
        console.warn('Invalid UUID detected for appointment, generating new one for sync:', appointmentToSave.id);
        appointmentToSave.id = crypto.randomUUID();
    }

    // Also validate clientId if present
    if (appointmentToSave.clientId && !isValidUUID(appointmentToSave.clientId)) {
        console.warn('Invalid Client UUID in appointment, stripping it:', appointmentToSave.clientId);
        appointmentToSave.clientId = '';
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('appointments', 'insert', { userId, appointment: appointmentToSave });
        return;
    }

    try {
        const { error } = await supabase.from('appointments').upsert({
            id: appointmentToSave.id,
            user_id: userId,
            client_id: appointmentToSave.clientId || null,
            date: appointmentToSave.date,
            service: appointmentToSave.service,
            price: appointmentToSave.price,
            status: appointmentToSave.status
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving appointment to Supabase:', error);
        addToSyncQueue('appointments', 'insert', { userId, appointment: appointmentToSave });
    }
};

export const deleteAppointmentFromSupabase = async (appointmentId: string): Promise<void> => {
    if (!isValidUUID(appointmentId)) {
        console.warn('Skipping deletion of non-UUID appointment:', appointmentId);
        return;
    }

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
                id: profile.id,
                userId: profile.user_id,
                name: profile.name || '',
                profession: profile.profession || '',
                phone: profile.phone || '',
                email: profile.email || '',
                logo: profile.logo || '',
                companyName: profile.company_name || '',
                isPro: profile.is_pro || false,
                subscriptionStatus: profile.is_pro ? 'pro' : 'free',
                credits: profile.credits || 0
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
                // is_pro is managed by server (webhooks) ONLY
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
                // is_pro defaults to false in DB
                updated_at: new Date().toISOString()
            });

            if (error) throw error;
        }
    } catch (error) {
        console.error('Error saving profile to Supabase:', error);
        addToSyncQueue('profiles', 'update', { userId, profile });
    }
};

export const consumeDocumentCredit = async (userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured()) {
        return true;
    }

    try {
        const { data, error } = await supabase.rpc('consume_document_credit', { user_id: userId });
        if (error) throw error;
        return data as boolean;
    } catch (error) {
        console.error('Error consuming credit in Supabase:', error);
        return false;
    }
};

// ============= SERVICE TEMPLATES SYNC =============

export const syncTemplates = async (userId: string): Promise<ServiceTemplate[]> => {
    if (!isSupabaseConfigured()) {
        const localData = localStorage.getItem(STORAGE_KEYS.templates);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        const { data: remoteTemplates, error } = await supabase
            .from('service_templates')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const templates: ServiceTemplate[] = (remoteTemplates || []).map(t => ({
            id: t.id,
            name: t.name,
            description: t.description || '',
            price: Number(t.price) || 0,
            category: t.category,
            isDefault: t.is_default,
            createdAt: t.created_at || new Date().toISOString()
        }));

        localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
        return templates;
    } catch (error) {
        console.error('Error syncing templates:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.templates);
        return localData ? JSON.parse(localData) : [];
    }
};

// Helper to check UUID validity
const isValidUUID = (uuid: string) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

export const saveTemplateToSupabase = async (userId: string, template: ServiceTemplate): Promise<void> => {
    // Ensure we have a valid UUID
    let templateToSave = { ...template };
    if (!isValidUUID(templateToSave.id)) {
        console.warn('Invalid UUID detected, generating new one for sync:', templateToSave.id);
        templateToSave.id = crypto.randomUUID();
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('service_templates', 'insert', { userId, template: templateToSave });
        return;
    }

    try {
        const { error } = await supabase.from('service_templates').upsert({
            id: templateToSave.id,
            user_id: userId,
            name: templateToSave.name,
            description: templateToSave.description,
            price: templateToSave.price,
            category: templateToSave.category,
            is_default: templateToSave.isDefault,
            updated_at: new Date().toISOString()
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving template to Supabase:', error);
        addToSyncQueue('service_templates', 'insert', { userId, template: templateToSave });
    }
};

export const deleteTemplateFromSupabase = async (templateId: string): Promise<void> => {
    if (!isValidUUID(templateId)) {
        console.warn('Skipping deletion of non-UUID template:', templateId);
        return;
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('service_templates', 'delete', { templateId });
        return;
    }

    try {
        const { error } = await supabase.from('service_templates').delete().eq('id', templateId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting template:', error);
        addToSyncQueue('service_templates', 'delete', { templateId });
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

// ============= DOCUMENTS SYNC =============

import { SavedDocument } from '../types/documents';

export const syncDocuments = async (userId: string): Promise<SavedDocument[]> => {
    if (!isSupabaseConfigured()) {
        const localData = localStorage.getItem(STORAGE_KEYS.documents);
        return localData ? JSON.parse(localData) : [];
    }

    try {
        const { data: remoteDocs, error } = await supabase
            .from('documents')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;

        const documents: SavedDocument[] = (remoteDocs || []).map(d => ({
            id: d.id,
            type: d.type as 'quote' | 'receipt',
            clientId: d.client_id || '',
            clientName: d.client_name,
            clientPhone: d.client_phone || '',
            documentNumber: d.number,
            createdAt: d.created_at,
            total: Number(d.total),
            items: d.items || [],
            status: d.status as 'pending' | 'paid' | 'overdue',
            note: d.notes || ''
        }));

        localStorage.setItem(STORAGE_KEYS.documents, JSON.stringify(documents));
        return documents;
    } catch (error) {
        console.error('Error syncing documents:', error);
        const localData = localStorage.getItem(STORAGE_KEYS.documents);
        return localData ? JSON.parse(localData) : [];
    }
};

export const saveDocumentToSupabase = async (userId: string, doc: SavedDocument): Promise<void> => {
    // Ensure we have a valid UUID for DB
    let docId = doc.id;
    if (!isValidUUID(docId)) {
        docId = crypto.randomUUID();
    }

    if (!isSupabaseConfigured()) {
        addToSyncQueue('documents', 'insert', { userId, document: { ...doc, id: docId } });
        return;
    }

    try {
        const { error } = await supabase.from('documents').upsert({
            id: docId,
            user_id: userId,
            type: doc.type,
            number: doc.documentNumber,
            client_name: doc.clientName,
            client_phone: doc.clientPhone,
            items: doc.items,
            total: doc.total,
            status: doc.status === 'paid' ? 'paid' : 'pending',
            notes: doc.note || null,
            created_at: doc.createdAt
        });

        if (error) throw error;
    } catch (error) {
        console.error('Error saving document to Supabase:', error);
        addToSyncQueue('documents', 'insert', { userId, document: { ...doc, id: docId } });
    }
};

export const deleteDocumentFromSupabase = async (docId: string): Promise<void> => {
    if (!isValidUUID(docId)) return;

    if (!isSupabaseConfigured()) {
        addToSyncQueue('documents', 'delete', { docId });
        return;
    }

    try {
        const { error } = await supabase.from('documents').delete().eq('id', docId);
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting document:', error);
        addToSyncQueue('documents', 'delete', { docId });
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
            syncExpenses(user.id),
            syncTemplates(user.id),
            syncDocuments(user.id)
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
                case 'service_templates':
                    if (item.operation === 'delete') {
                        await deleteTemplateFromSupabase(item.data.templateId);
                    } else {
                        await saveTemplateToSupabase(userId, item.data.template);
                    }
                    break;
                case 'documents':
                    if (item.operation === 'delete') {
                        await deleteDocumentFromSupabase(item.data.docId);
                    } else {
                        await saveDocumentToSupabase(userId, item.data.document);
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_templates', filter: `user_id=eq.${userId}` }, onDataChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `user_id=eq.${userId}` }, onDataChange)
        .subscribe();

    return channel;
};

export const cleanupRealtimeSync = (channel: any) => {
    if (channel) {
        supabase.removeChannel(channel);
    }
};
