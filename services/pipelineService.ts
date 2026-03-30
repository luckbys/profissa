import { supabase } from './supabaseClient';

export type PipelineStage = 'lead' | 'contato' | 'orcamento' | 'negociando' | 'ganho' | 'perdido';

export interface PipelineLead {
    id: string;
    user_id: string;
    client_id: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    service_interest: string | null;
    estimated_value: number;
    stage: PipelineStage;
    stage_order: number;
    notes: string | null;
    lost_reason: string | null;
    created_at: string;
    updated_at: string;
    // joined from clients
    clients?: { name: string; phone: string; email: string | null } | null;
}

export interface CreateLeadInput {
    name: string;
    phone?: string;
    email?: string;
    service_interest?: string;
    estimated_value?: number;
    stage?: PipelineStage;
    notes?: string;
    client_id?: string | null;
}

export const STAGE_CONFIG: Record<PipelineStage, { label: string; color: string; bg: string; border: string; dot: string }> = {
    lead:        { label: 'Novo Lead',      color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-500'   },
    contato:     { label: 'Contato Feito',  color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200',dot: 'bg-indigo-500' },
    orcamento:   { label: 'Orçamento',      color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-500'  },
    negociando:  { label: 'Negociando',     color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200',dot: 'bg-orange-500' },
    ganho:       { label: 'Ganho ✅',       color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200', dot: 'bg-green-500'  },
    perdido:     { label: 'Perdido ❌',     color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500'    },
};

export const STAGE_ORDER: PipelineStage[] = ['lead', 'contato', 'orcamento', 'negociando', 'ganho', 'perdido'];

const LS_KEY = 'profissa_pipeline_leads';

// ─── Local Storage Fallback ────────────────────────────────────────────────────
function getLocalLeads(): PipelineLead[] {
    try {
        const data = localStorage.getItem(LS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveLocalLeads(leads: PipelineLead[]): void {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(leads));
    } catch { /* ignore */ }
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const pipelineService = {

    async getLeads(userId: string): Promise<PipelineLead[]> {
        try {
            const { data, error } = await supabase
                .from('pipeline_leads')
                .select('*, clients(name, phone, email)')
                .eq('user_id', userId)
                .order('stage_order', { ascending: true })
                .order('created_at', { ascending: false });

            if (error) {
                // Table may not exist yet — fall back to localStorage
                if (error.code === '42P01') {
                    return getLocalLeads().filter(l => l.user_id === userId);
                }
                throw error;
            }
            return data as PipelineLead[];
        } catch {
            return getLocalLeads().filter(l => l.user_id === userId);
        }
    },

    async createLead(userId: string, input: CreateLeadInput): Promise<PipelineLead> {
        const newLead: PipelineLead = {
            id: crypto.randomUUID(),
            user_id: userId,
            client_id: input.client_id || null,
            name: input.name,
            phone: input.phone || null,
            email: input.email || null,
            service_interest: input.service_interest || null,
            estimated_value: input.estimated_value || 0,
            stage: input.stage || 'lead',
            stage_order: 0,
            notes: input.notes || null,
            lost_reason: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            const { data, error } = await supabase
                .from('pipeline_leads')
                .insert({
                    user_id: userId,
                    client_id: input.client_id || null,
                    name: input.name,
                    phone: input.phone || null,
                    email: input.email || null,
                    service_interest: input.service_interest || null,
                    estimated_value: input.estimated_value || 0,
                    stage: input.stage || 'lead',
                    notes: input.notes || null,
                })
                .select('*, clients(name, phone, email)')
                .single();

            if (error) throw error;
            return data as PipelineLead;
        } catch {
            // Persist locally
            const locals = getLocalLeads();
            saveLocalLeads([newLead, ...locals]);
            return newLead;
        }
    },

    async updateStage(leadId: string, stage: PipelineStage, lostReason?: string): Promise<void> {
        const update: Partial<PipelineLead> = { stage, updated_at: new Date().toISOString() };
        if (stage === 'perdido' && lostReason) update.lost_reason = lostReason;

        try {
            const { error } = await supabase
                .from('pipeline_leads')
                .update(update)
                .eq('id', leadId);
            if (error) throw error;
        } catch {
            const locals = getLocalLeads();
            saveLocalLeads(locals.map(l => l.id === leadId ? { ...l, ...update } : l));
        }
    },

    async updateLead(leadId: string, input: Partial<CreateLeadInput>): Promise<void> {
        const update = { ...input, updated_at: new Date().toISOString() };
        try {
            const { error } = await supabase
                .from('pipeline_leads')
                .update(update)
                .eq('id', leadId);
            if (error) throw error;
        } catch {
            const locals = getLocalLeads();
            saveLocalLeads(locals.map(l => l.id === leadId ? { ...l, ...update } : l));
        }
    },

    async deleteLead(leadId: string): Promise<void> {
        try {
            const { error } = await supabase
                .from('pipeline_leads')
                .delete()
                .eq('id', leadId);
            if (error) throw error;
        } catch {
            const locals = getLocalLeads();
            saveLocalLeads(locals.filter(l => l.id !== leadId));
        }
    },
};
