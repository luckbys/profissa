import { Subscription, PlanType, PLAN_LIMITS, DEFAULT_SUBSCRIPTION, PLAN_FEATURES } from '../types/subscription';

const SUBSCRIPTION_KEY = 'gerente_bolso_subscription';

// Get subscription from localStorage
export const getSubscription = (): Subscription => {
    try {
        const data = localStorage.getItem(SUBSCRIPTION_KEY);
        if (!data) {
            // Initialize with default subscription
            saveSubscription(DEFAULT_SUBSCRIPTION);
            return DEFAULT_SUBSCRIPTION;
        }

        let subscription: Subscription = JSON.parse(data);

        // Migration: Add AI credits if missing
        if (subscription.aiCredits === undefined) {
            subscription.aiCredits = PLAN_LIMITS[subscription.plan].maxAiCredits;
            subscription.maxAiCredits = PLAN_LIMITS[subscription.plan].maxAiCredits;
        }

        // Check if we need to reset credits (new month)
        const lastReset = new Date(subscription.lastResetDate);
        const now = new Date();

        if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
            // New month - reset credits
            const maxCredits = PLAN_LIMITS[subscription.plan].maxCredits;
            const maxAiCredits = PLAN_LIMITS[subscription.plan].maxAiCredits;

            const resetSubscription: Subscription = {
                ...subscription,
                credits: maxCredits === -1 ? 999999 : maxCredits, // -1 = unlimited
                maxCredits: maxCredits,
                aiCredits: maxAiCredits,
                maxAiCredits: maxAiCredits,
                lastResetDate: now.toISOString()
            };
            saveSubscription(resetSubscription);
            return resetSubscription;
        }

        return subscription;
    } catch {
        saveSubscription(DEFAULT_SUBSCRIPTION);
        return DEFAULT_SUBSCRIPTION;
    }
};

// Save subscription to localStorage
export const saveSubscription = (subscription: Subscription): void => {
    try {
        localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscription));
    } catch (error) {
        console.error('Failed to save subscription:', error);
    }
};

// Use a document credit (returns true if successful, false if no credits left)
export const useCredit = (): boolean => {
    const subscription = getSubscription();

    // Pro users have unlimited documents
    if (subscription.plan === 'pro') {
        const updated: Subscription = {
            ...subscription,
            documentsGenerated: subscription.documentsGenerated + 1
        };
        saveSubscription(updated);
        return true;
    }

    if (subscription.credits <= 0) {
        return false;
    }

    const updated: Subscription = {
        ...subscription,
        credits: subscription.credits - 1,
        documentsGenerated: subscription.documentsGenerated + 1
    };

    saveSubscription(updated);
    return true;
};

// Use an AI credit (returns true if successful)
export const useAiCredit = (): boolean => {
    const subscription = getSubscription();

    if (subscription.aiCredits <= 0) {
        return false;
    }

    const updated: Subscription = {
        ...subscription,
        aiCredits: subscription.aiCredits - 1
    };

    saveSubscription(updated);
    return true;
};

// Check if user has document credits available
export const hasCredits = (): boolean => {
    const subscription = getSubscription();
    // Pro users always have credits (unlimited)
    if (subscription.plan === 'pro') return true;
    return subscription.credits > 0;
};

// Check if user has AI credits available
export const hasAiCredits = (): boolean => {
    const subscription = getSubscription();
    return subscription.aiCredits > 0;
};

// Get remaining document credits
export const getRemainingCredits = (): number => {
    const subscription = getSubscription();
    // Pro users have unlimited
    if (subscription.plan === 'pro') return 999999;
    return subscription.credits;
};

// Get remaining AI credits
export const getRemainingAiCredits = (): number => {
    return getSubscription().aiCredits;
};

// Upgrade to Pro plan
export const upgradeToPro = (): Subscription => {
    const subscription = getSubscription();

    const upgraded: Subscription = {
        ...subscription,
        plan: 'pro',
        credits: 999999, // unlimited
        maxCredits: -1,
        aiCredits: PLAN_LIMITS.pro.maxAiCredits,
        maxAiCredits: PLAN_LIMITS.pro.maxAiCredits,
        lastResetDate: new Date().toISOString()
    };

    saveSubscription(upgraded);
    return upgraded;
};

// Downgrade to Free plan
export const downgradeToFree = (): Subscription => {
    const subscription = getSubscription();

    const downgraded: Subscription = {
        ...subscription,
        plan: 'free',
        credits: PLAN_LIMITS.free.maxCredits,
        maxCredits: PLAN_LIMITS.free.maxCredits,
        aiCredits: Math.min(subscription.aiCredits, PLAN_LIMITS.free.maxAiCredits),
        maxAiCredits: PLAN_LIMITS.free.maxAiCredits
    };

    saveSubscription(downgraded);
    return downgraded;
};

// Add bonus credits (for promotions, etc.)
export const addBonusCredits = (amount: number): Subscription => {
    const subscription = getSubscription();

    const updated: Subscription = {
        ...subscription,
        credits: subscription.credits + amount
    };

    saveSubscription(updated);
    return updated;
};

// Add bonus AI credits
export const addBonusAiCredits = (amount: number): Subscription => {
    const subscription = getSubscription();

    const updated: Subscription = {
        ...subscription,
        aiCredits: subscription.aiCredits + amount
    };

    saveSubscription(updated);
    return updated;
};

// Check if a specific feature is available for the current plan
export const hasFeature = (feature: keyof typeof PLAN_FEATURES.free): boolean => {
    const subscription = getSubscription();
    return !!PLAN_FEATURES[subscription.plan][feature];
};

// Check if user is Pro
export const isPro = (): boolean => {
    return getSubscription().plan === 'pro';
};
