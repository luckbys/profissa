// Credits and Subscription Types

export type PlanType = 'free' | 'pro';

export interface Subscription {
    plan: PlanType;
    credits: number;
    maxCredits: number;
    lastResetDate: string; // ISO date - for monthly reset
    documentsGenerated: number; // total documents generated ever
}

export const PLAN_LIMITS = {
    free: {
        maxCredits: 5,
        name: 'Plano Gratuito',
        price: 0,
        features: [
            '5 documentos por mês',
            'Orçamentos e Recibos',
            'Compartilhar via WhatsApp',
            'Download em PDF'
        ]
    },
    pro: {
        maxCredits: 100,
        name: 'Plano Pro',
        price: 19.90,
        features: [
            '100 documentos por mês',
            'Orçamentos e Recibos',
            'Compartilhar via WhatsApp',
            'Download em PDF',
            'Suporte prioritário',
            'Sem marca d\'água'
        ]
    }
} as const;

export const DEFAULT_SUBSCRIPTION: Subscription = {
    plan: 'free',
    credits: 5,
    maxCredits: 5,
    lastResetDate: new Date().toISOString(),
    documentsGenerated: 0
};
