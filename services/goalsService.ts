// Goals and Gamification Service

export interface MonthlyGoal {
    id: string;
    month: number; // 0-11
    year: number;
    targetRevenue: number;
    targetAppointments: number;
    targetClients: number;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string; // emoji or icon name
    unlockedAt?: string; // ISO date when unlocked
    condition: {
        type: 'revenue' | 'appointments' | 'clients' | 'streak' | 'documents';
        threshold: number;
    };
}

export interface GoalsData {
    currentGoal: MonthlyGoal | null;
    achievements: Achievement[];
    stats: {
        totalRevenue: number;
        totalAppointments: number;
        totalClients: number;
        currentStreak: number; // days with completed appointments
        documentsGenerated: number;
    };
}

const GOALS_KEY = 'gerente_bolso_goals';
const ACHIEVEMENTS_KEY = 'gerente_bolso_achievements';

// Default achievements
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_client',
        name: 'Primeiro Cliente',
        description: 'Cadastre seu primeiro cliente',
        icon: '👤',
        condition: { type: 'clients', threshold: 1 }
    },
    {
        id: 'ten_clients',
        name: 'Carteira Crescendo',
        description: 'Alcance 10 clientes cadastrados',
        icon: '👥',
        condition: { type: 'clients', threshold: 10 }
    },
    {
        id: 'fifty_clients',
        name: 'Networking Master',
        description: 'Alcance 50 clientes cadastrados',
        icon: '🌟',
        condition: { type: 'clients', threshold: 50 }
    },
    {
        id: 'first_appointment',
        name: 'Primeira Venda',
        description: 'Complete seu primeiro atendimento',
        icon: '🎉',
        condition: { type: 'appointments', threshold: 1 }
    },
    {
        id: 'ten_appointments',
        name: 'Empreendedor Ativo',
        description: 'Complete 10 atendimentos',
        icon: '💪',
        condition: { type: 'appointments', threshold: 10 }
    },
    {
        id: 'fifty_appointments',
        name: 'Profissional Dedicado',
        description: 'Complete 50 atendimentos',
        icon: '🏆',
        condition: { type: 'appointments', threshold: 50 }
    },
    {
        id: 'hundred_appointments',
        name: 'Expert do Mercado',
        description: 'Complete 100 atendimentos',
        icon: '👑',
        condition: { type: 'appointments', threshold: 100 }
    },
    {
        id: 'first_thousand',
        name: 'Primeiro Mil',
        description: 'Fature R$ 1.000 no total',
        icon: '💰',
        condition: { type: 'revenue', threshold: 1000 }
    },
    {
        id: 'five_thousand',
        name: 'Lucrando Bem',
        description: 'Fature R$ 5.000 no total',
        icon: '💵',
        condition: { type: 'revenue', threshold: 5000 }
    },
    {
        id: 'ten_thousand',
        name: 'Negócio Sólido',
        description: 'Fature R$ 10.000 no total',
        icon: '💎',
        condition: { type: 'revenue', threshold: 10000 }
    },
    {
        id: 'first_document',
        name: 'Organizado',
        description: 'Gere seu primeiro documento',
        icon: '📄',
        condition: { type: 'documents', threshold: 1 }
    },
    {
        id: 'ten_documents',
        name: 'Documentação Pro',
        description: 'Gere 10 documentos',
        icon: '📋',
        condition: { type: 'documents', threshold: 10 }
    }
];

// Get current month goal
export const getCurrentGoal = (): MonthlyGoal | null => {
    try {
        const data = localStorage.getItem(GOALS_KEY);
        if (!data) return null;

        const goals: MonthlyGoal[] = JSON.parse(data);
        const now = new Date();
        return goals.find(g => g.month === now.getMonth() && g.year === now.getFullYear()) || null;
    } catch {
        return null;
    }
};

// Save goal
export const saveGoal = (goal: MonthlyGoal): void => {
    try {
        const data = localStorage.getItem(GOALS_KEY);
        let goals: MonthlyGoal[] = data ? JSON.parse(data) : [];

        // Remove existing goal for same month/year
        goals = goals.filter(g => !(g.month === goal.month && g.year === goal.year));
        goals.push(goal);

        localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    } catch (error) {
        console.error('Failed to save goal:', error);
    }
};

// Get unlocked achievements
export const getUnlockedAchievements = (): Achievement[] => {
    try {
        const data = localStorage.getItem(ACHIEVEMENTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

// Check and unlock achievements
export const checkAchievements = (stats: {
    totalRevenue: number;
    totalAppointments: number;
    totalClients: number;
    documentsGenerated: number;
}): Achievement[] => {
    const unlocked = getUnlockedAchievements();
    const unlockedIds = new Set(unlocked.map(a => a.id));
    const newUnlocks: Achievement[] = [];

    for (const achievement of DEFAULT_ACHIEVEMENTS) {
        if (unlockedIds.has(achievement.id)) continue;

        let shouldUnlock = false;
        switch (achievement.condition.type) {
            case 'revenue':
                shouldUnlock = stats.totalRevenue >= achievement.condition.threshold;
                break;
            case 'appointments':
                shouldUnlock = stats.totalAppointments >= achievement.condition.threshold;
                break;
            case 'clients':
                shouldUnlock = stats.totalClients >= achievement.condition.threshold;
                break;
            case 'documents':
                shouldUnlock = stats.documentsGenerated >= achievement.condition.threshold;
                break;
        }

        if (shouldUnlock) {
            const unlockedAchievement = {
                ...achievement,
                unlockedAt: new Date().toISOString()
            };
            newUnlocks.push(unlockedAchievement);
        }
    }

    if (newUnlocks.length > 0) {
        const allUnlocked = [...unlocked, ...newUnlocks];
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(allUnlocked));
    }

    return newUnlocks;
};

// Calculate goal progress
export const calculateGoalProgress = (
    goal: MonthlyGoal,
    currentRevenue: number,
    currentAppointments: number,
    currentClients: number
): { revenue: number; appointments: number; clients: number } => {
    return {
        revenue: goal.targetRevenue > 0 ? Math.min(100, (currentRevenue / goal.targetRevenue) * 100) : 0,
        appointments: goal.targetAppointments > 0 ? Math.min(100, (currentAppointments / goal.targetAppointments) * 100) : 0,
        clients: goal.targetClients > 0 ? Math.min(100, (currentClients / goal.targetClients) * 100) : 0
    };
};

// Get all achievements with unlock status
export const getAllAchievements = (): Achievement[] => {
    const unlocked = getUnlockedAchievements();
    const unlockedMap = new Map(unlocked.map(a => [a.id, a]));

    return DEFAULT_ACHIEVEMENTS.map(a => ({
        ...a,
        unlockedAt: unlockedMap.get(a.id)?.unlockedAt
    }));
};
