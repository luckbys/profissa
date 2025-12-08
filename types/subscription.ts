// Credits and Subscription Types

export type PlanType = 'free' | 'pro';

export interface Subscription {
    plan: PlanType;
    credits: number;
    maxCredits: number;
    lastResetDate: string; // ISO date - for monthly reset
    documentsGenerated: number; // total documents generated ever
    aiCredits: number; // credits for AI features
    maxAiCredits: number;
}

// Feature flags for each plan
export const PLAN_FEATURES = {
    free: {
        // Document Features
        documentsPerMonth: 10,
        templateAccess: ['modern'], // Only modern template
        customColors: false,
        customNotes: false,
        pixQrCode: false,
        // AI Features
        aiCreditsPerMonth: 5,
        aiDescriptionImprove: true, // limited by credits
        aiPriceSuggestion: true, // limited by credits
        // Other Features
        exportToExcel: false,
        prioritySupport: false,
        noWatermark: false,
        cloudBackup: false,
    },
    pro: {
        // Document Features
        documentsPerMonth: 'unlimited',
        templateAccess: ['modern', 'classic', 'minimal', 'elegant', 'bold'],
        customColors: true,
        customNotes: true,
        pixQrCode: true,
        // AI Features
        aiCreditsPerMonth: 100,
        aiDescriptionImprove: true,
        aiPriceSuggestion: true,
        // Other Features
        exportToExcel: true,
        prioritySupport: true,
        noWatermark: true,
        cloudBackup: true,
    }
} as const;

export const PLAN_LIMITS = {
    free: {
        maxCredits: 10, // documents
        maxAiCredits: 5,
        name: 'Plano Gratuito',
        price: 0,
        features: [
            '10 documentos por mês',
            '5 usos de IA por mês',
            '1 template de documento',
            'Orçamentos e Recibos',
            'Compartilhar via WhatsApp',
            'Download em PDF'
        ],
        limitations: [
            'Templates premium bloqueados',
            'Sem personalização de cores',
            'Sem QR Code PIX',
            'Sem backup na nuvem'
        ]
    },
    pro: {
        maxCredits: -1, // unlimited
        maxAiCredits: 100,
        name: 'Plano Pro',
        price: 19.90,
        features: [
            '📄 Documentos ILIMITADOS',
            '🤖 100 usos de IA por mês',
            '🎨 5 templates premium',
            '🎯 Cores personalizadas',
            '📝 Observações customizadas',
            '📱 QR Code PIX no documento',
            '📊 Exportar para Excel',
            '☁️ Backup na nuvem',
            '🏆 Suporte prioritário',
            '✨ Sem marca d\'água'
        ],
        limitations: []
    }
} as const;

export const DEFAULT_SUBSCRIPTION: Subscription = {
    plan: 'free',
    credits: 10,
    maxCredits: 10,
    lastResetDate: new Date().toISOString(),
    documentsGenerated: 0,
    aiCredits: 5,
    maxAiCredits: 5
};
