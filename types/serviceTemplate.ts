// Service Template Types

export interface ServiceTemplate {
    id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    isDefault?: boolean;
    createdAt: string;
}

export const DEFAULT_CATEGORIES = [
    'Geral',
    'Consultoria',
    'Manutenção',
    'Instalação',
    'Design',
    'Desenvolvimento',
    'Marketing',
    'Outros'
] as const;
