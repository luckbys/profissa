import { Subscription, PlanType, PLAN_LIMITS, DEFAULT_SUBSCRIPTION } from '../types/subscription';

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

        const subscription: Subscription = JSON.parse(data);

        // Check if we need to reset credits (new month)
        const lastReset = new Date(subscription.lastResetDate);
        const now = new Date();

        if (lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()) {
            // New month - reset credits
            const resetSubscription: Subscription = {
                ...subscription,
                credits: PLAN_LIMITS[subscription.plan].maxCredits,
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

// Use a credit (returns true if successful, false if no credits left)
export const useCredit = (): boolean => {
    const subscription = getSubscription();

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

// Check if user has credits available
export const hasCredits = (): boolean => {
    const subscription = getSubscription();
    return subscription.credits > 0;
};

// Get remaining credits
export const getRemainingCredits = (): number => {
    return getSubscription().credits;
};

// Upgrade to Pro plan
export const upgradeToPro = (): Subscription => {
    const subscription = getSubscription();

    const upgraded: Subscription = {
        ...subscription,
        plan: 'pro',
        credits: PLAN_LIMITS.pro.maxCredits,
        maxCredits: PLAN_LIMITS.pro.maxCredits,
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
        credits: Math.min(subscription.credits, PLAN_LIMITS.free.maxCredits),
        maxCredits: PLAN_LIMITS.free.maxCredits
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
