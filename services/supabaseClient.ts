import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Using localStorage fallback.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Database types
export interface DbProfile {
    id: string;
    user_id: string;
    name: string | null;
    profession: string | null;
    phone: string | null;
    email: string | null;
    logo: string | null;
    company_name: string | null;
    is_pro: boolean;
    created_at: string;
    updated_at: string;
}

export interface DbClient {
    id: string;
    user_id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    notes: string | null;
    tags: string[] | null;
    birthday: string | null;
    created_at: string;
}

export interface DbAppointment {
    id: string;
    user_id: string;
    client_id: string | null;
    date: string;
    time: string;
    service: string;
    price: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
}

export interface DbDocument {
    id: string;
    user_id: string;
    type: 'quote' | 'receipt';
    number: string;
    client_name: string;
    client_phone: string | null;
    items: { description: string; quantity: number; price: number }[];
    total: number;
    status: 'pending' | 'paid' | 'cancelled';
    notes: string | null;
    template_style: string;
    created_at: string;
}

export interface DbExpense {
    id: string;
    user_id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    created_at: string;
}

export interface DbGoal {
    id: string;
    user_id: string;
    month: number;
    year: number;
    target_revenue: number;
    target_appointments: number;
    target_clients: number;
    created_at: string;
}

// Auth helper functions
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey);
};

export default supabase;
