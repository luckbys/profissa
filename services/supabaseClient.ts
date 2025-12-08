import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
const hasCredentials = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http');

if (!hasCredentials) {
    console.warn('Supabase credentials not configured. Using localStorage fallback.');
}

// Create Supabase client only if credentials exist
// Using a placeholder URL/key to prevent errors, but isSupabaseConfigured() will return false
const placeholderUrl = 'https://placeholder.supabase.co';
const placeholderKey = 'placeholder-key';

export const supabase: SupabaseClient = createClient(
    hasCredentials ? supabaseUrl : placeholderUrl,
    hasCredentials ? supabaseAnonKey : placeholderKey,
    {
        auth: {
            persistSession: hasCredentials,
            autoRefreshToken: hasCredentials,
            detectSessionInUrl: hasCredentials
        }
    }
);

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
    return hasCredentials;
};

export default supabase;
